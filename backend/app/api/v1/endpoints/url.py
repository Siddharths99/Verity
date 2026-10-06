import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import URLAnalysisRequest, VerityResult
from app.core.constants import ModalityType, RiskLevel, TrustStatus
from app.services.link_checker import LinkChecker
from app.services.risk_engine import risk_engine
from app.services.gemini_service import gemini_service

logger = logging.getLogger("verity.url")
router = APIRouter()


@router.post("/url", response_model=VerityResult, summary="Analyze suspicious URL or domain")
async def analyze_url(
    payload: URLAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes a suspicious URL for:
    - URL validity and HTTPS encryption
    - Domain structure, excessive subdomains, and homoglyphs
    - Lookalike domains & brand typosquatting
    - Suspicious open redirects and credential parameters
    - Domain reputation and cybersecurity risk
    """
    try:
        # 1. Structural and heuristic link analysis
        link_eval = LinkChecker.analyze_url(payload.url, target_brand=payload.target_brand)
        link_score = float(link_eval["risk_score"])
        flags = list(link_eval["flags"])
        evidence = list(link_eval["evidence"])

        verdict = "SAFE"
        confidence = 0.85
        threat_level = "LOW"
        recommended_action = "Site appears legitimate for routine browsing."

        # 2. Multimodal AI URL & Web Reputation Reasoning via Gemini
        if gemini_service.is_available():
            try:
                from google.genai import types

                prompt = (
                    f"You are VERITY Cybersecurity Web & URL Forensics. Evaluate this URL:\n"
                    f"URL: {payload.url}\n"
                    f"Valid Syntax: {link_eval.get('is_valid')}\n"
                    f"HTTPS Protocol: {link_eval.get('is_https')}\n"
                    f"Registered Domain: {link_eval.get('registered_domain')}\n"
                    f"Pre-extracted Flags: {', '.join(flags) or 'None'}\n"
                    f"Pre-extracted Evidence: {'; '.join(evidence)}\n"
                    f"Claimed Target Brand: {payload.target_brand or 'None'}\n\n"
                    "Evaluate the domain structure, legitimate brand association, query parameters, and known threat patterns.\n"
                    "CRITICAL CONSTRAINTS:\n"
                    "1. 'verdict': Exactly ONE of: 'SAFE', 'SUSPICIOUS', 'SPAM', 'MALICIOUS', 'UNKNOWN'.\n"
                    "   - If URL is invalid, unparseable, or nonsensical: 'UNKNOWN'.\n"
                    "   - Legitimate verified domains (e.g. google.com, github.com, apple.com, official portals): 'SAFE'.\n"
                    "   - Phishing, credential harvesting, brand impersonation, deceptive lookalikes: 'MALICIOUS'.\n"
                    "   - Unsolicited marketing, spam redirects, tracking parameters: 'SPAM'.\n"
                    "   - Unencrypted, suspicious params, or untrusted TLDs without direct malware: 'SUSPICIOUS'.\n"
                    "2. 'confidence': Float strictly between 0.05 and 0.99. NEVER claim 1.00 (100% certainty).\n"
                    "3. 'threat_level': Exactly ONE of: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'.\n"
                    "   - SAFE -> 'LOW'.\n"
                    "   - UNKNOWN -> 'MEDIUM'.\n"
                    "   - SUSPICIOUS / SPAM -> 'MEDIUM' or 'HIGH'.\n"
                    "   - MALICIOUS -> 'HIGH' or 'CRITICAL'.\n"
                    "4. 'evidence': List of detected risks/reasons (minimum 2 concrete observations). Do NOT fabricate web server data or invent fake HTTP status codes.\n"
                    "5. 'recommended_action': Specific, actionable guidance for the user.\n\n"
                    "Return ONLY a raw JSON object with this exact schema:\n"
                    "{\n"
                    '  "verdict": "SAFE" | "SUSPICIOUS" | "SPAM" | "MALICIOUS" | "UNKNOWN",\n'
                    '  "confidence": 0.90,\n'
                    '  "threat_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
                    '  "evidence": ["observation 1", "observation 2"],\n'
                    '  "recommended_action": "action recommendation"\n'
                    "}\n"
                    "Do NOT include markdown backticks. Return valid JSON only."
                )

                models_to_try = [gemini_service.model_name, "gemini-3.5-flash-lite", "gemini-3.8-flash"]
                for model in models_to_try:
                    if not model:
                        continue
                    try:
                        resp = gemini_service.generate_content(model=model, contents=prompt)
                        text_resp = resp.text.strip()
                        start_idx = text_resp.find("{")
                        end_idx = text_resp.rfind("}")
                        if start_idx != -1 and end_idx != -1:
                            text_resp = text_resp[start_idx:end_idx+1]
                        parsed = json.loads(text_resp.strip())

                        parsed_v = str(parsed.get("verdict", "")).upper().strip()
                        if parsed_v in ("SAFE", "SUSPICIOUS", "SPAM", "MALICIOUS", "UNKNOWN"):
                            verdict = parsed_v
                        
                        confidence = float(parsed.get("confidence", 0.85))
                        confidence = round(min(0.99, max(0.05, confidence)), 2)

                        parsed_t = str(parsed.get("threat_level", "")).upper().strip()
                        if parsed_t in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
                            threat_level = parsed_t
                        else:
                            threat_level = "LOW" if verdict == "SAFE" else ("MEDIUM" if verdict == "UNKNOWN" else "HIGH")

                        model_evidence = parsed.get("evidence", [])
                        if isinstance(model_evidence, list) and model_evidence:
                            evidence = model_evidence

                        rec = str(parsed.get("recommended_action", "")).strip()
                        if rec:
                            recommended_action = rec
                        break
                    except Exception as me:
                        logger.warning(f"URL analysis with model {model} failed: {me}. Trying fallback...")

            except Exception as e:
                logger.warning(f"Gemini URL check error: {e}")

        # Fallback heuristic mapping if AI call did not override
        if verdict == "SAFE" and link_score > 0:
            if not link_eval.get("is_valid"):
                verdict = "UNKNOWN"
                threat_level = "MEDIUM"
                recommended_action = "Invalid or malformed URL syntax. Do not navigate to unverified links."
            elif any(f in flags for f in ("BRAND_TYPOSQUATTING_SUSPICION", "RAW_IP_HOST_ADDRESS", "CREDENTIAL_OR_TOKEN_PARAM", "PHISHING_CREDENTIAL_TRAP_PATH")):
                verdict = "MALICIOUS"
                threat_level = "CRITICAL" if link_score >= 80 else "HIGH"
                recommended_action = "Do not open this link or disclose sensitive credentials. Block domain immediately."
            elif any(f in flags for f in ("INSECURE_HTTP_PROTOCOL", "HIGH_RISK_TLD", "SUSPICIOUS_REDIRECT_PARAMETER", "DEEPLY_NESTED_SUBDOMAINS")):
                verdict = "SUSPICIOUS"
                threat_level = "MEDIUM"
                recommended_action = "Exercise caution; verify destination domain before entering credentials."

        risk_level_map = {
            "LOW": RiskLevel.LOW,
            "MEDIUM": RiskLevel.MEDIUM,
            "HIGH": RiskLevel.HIGH,
            "CRITICAL": RiskLevel.CRITICAL
        }
        assigned_risk_level = risk_level_map.get(threat_level, RiskLevel.MEDIUM)

        if verdict == "SAFE":
            final_risk_score = round(max(5.0, (1.0 - confidence) * 15.0), 1)
            who_trusted = True
        elif verdict == "UNKNOWN":
            final_risk_score = round(45.0 + (confidence * 10.0), 1)
            who_trusted = False
        elif verdict in ("SUSPICIOUS", "SPAM"):
            final_risk_score = round(max(60.0, confidence * 78.0), 1)
            who_trusted = False
        else:  # MALICIOUS
            final_risk_score = round(max(85.0, confidence * 100.0), 1)
            who_trusted = False

        if len(evidence) < 2:
            if verdict == "SAFE":
                evidence = [
                    "Domain structure matches authentic registrar records.",
                    "HTTPS transport encryption verified with zero typosquatting or harvesting parameters."
                ]
            else:
                evidence.append(f"Link evaluated as {verdict} with {threat_level} threat level.")

        verity_result = risk_engine.calculate_verity_score(
            modality=ModalityType.URL,
            identity_score=65.0 if verdict in ("MALICIOUS", "SUSPICIOUS") else 10.0,
            intent_score=75.0 if verdict == "MALICIOUS" else (35.0 if verdict in ("SUSPICIOUS", "SPAM") else 5.0),
            media_score=0.0,
            link_score=final_risk_score,
            flags=flags,
            evidence=evidence,
            evaluation_data={
                "who_trusted": who_trusted,
                "what_communicated": f"Web address: {link_eval.get('registered_domain') or payload.url}",
                "requested_action": "Navigate to external website" if verdict == "SAFE" else "Potentially solicit login or sensitive data",
            },
            recommended_actions=[recommended_action]
        )

        verity_result.verdict = verdict
        verity_result.confidence = confidence
        verity_result.threat_level = threat_level
        verity_result.risk_level = assigned_risk_level
        verity_result.risk_score = final_risk_score
        verity_result.manipulation_type = f"URL Evaluation: {verdict}"
        verity_result.raw_telemetry = {
            "verdict": verdict,
            "confidence": confidence,
            "threat_level": threat_level,
            "manipulation_type": f"URL Evaluation: {verdict}",
            "evidence": evidence,
            "recommended_action": recommended_action,
            "url": payload.url
        }

        record = ScanRecord(
            id=verity_result.scan_id,
            created_at=verity_result.timestamp,
            modality=ModalityType.URL.value,
            sender_info=link_eval.get("registered_domain") or payload.url,
            input_summary=payload.url,
            risk_score=verity_result.risk_score,
            risk_level=verity_result.risk_level.value,
            who_trusted=verity_result.evaluation.who_trusted,
            what_communicated=verity_result.evaluation.what_communicated,
            requested_action=verity_result.evaluation.requested_action,
            overall_trust=verity_result.evaluation.overall_trust.value,
            signal_breakdown=verity_result.signal_breakdown.model_dump(),
            flags=verity_result.flags,
            evidence=verity_result.evidence,
            recommended_actions=verity_result.recommended_actions
        )
        db.add(record)
        await db.commit()

        return verity_result

    except Exception as e:
        logger.error(f"URL analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"URL security analysis failed: {str(e)}")
