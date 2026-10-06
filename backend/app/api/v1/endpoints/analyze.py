import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import ModalityType
from app.core.file_security import (
    save_upload_file_securely,
    cleanup_temp_file,
    ALLOWED_MULTIMODAL_EXTENSIONS,
)
from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import VerityResult, SignalScoringRequest
from app.services.rules_engine import RulesEngine
from app.services.link_checker import LinkChecker
from app.services.stt_service import stt_service
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/multimodal", response_model=VerityResult, summary="Unified multimodal fraud analysis")
async def analyze_multimodal(
    message_text: Optional[str] = Form(None, description="Message body or call transcript", max_length=10000),
    sender_identity: Optional[str] = Form(None, description="Sender name, phone, or caller ID", max_length=255),
    claimed_organization: Optional[str] = Form(None, description="Claimed bank, agency, or company", max_length=255),
    url: Optional[str] = Form(None, description="Any linked URL provided in the interaction", max_length=2048),
    media_file: Optional[UploadFile] = File(None, description="Optional attached audio, image, or screenshot"),
    db: AsyncSession = Depends(get_db)
):
    """
    Master unified endpoint evaluating all 4 dimensions of the interaction:
    1. WHO: Claimed sender & identity authentication
    2. WHAT: Pretext, urgency, pressure narrative
    3. ACTION: Solicited sensitive action (OTP, money transfer, app installation)
    4. TRUST: Synthesized weighted score + concrete defensive actions
    """
    if not message_text and not media_file and not url:
        raise HTTPException(status_code=400, detail="Must provide at least one input: message_text, media_file, or url.")

    all_flags = []
    all_evidence = []
    identity_score = 10.0
    intent_score = 10.0
    media_score = 10.0
    link_score = 0.0
    temp_path: Optional[str] = None
    verity_result = None  # Guard against UnboundLocalError in finally/after try

    # 1. URL Analysis
    if url:
        url_res = LinkChecker.analyze_url(url, target_brand=claimed_organization)
        link_score = url_res["risk_score"]
        all_flags.extend(url_res["flags"])
        all_evidence.extend(url_res["evidence"])

    # 2. Text Analysis & Pre-extracted Signals
    extracted_text = message_text or ""
    if message_text:
        rules_res = RulesEngine.analyze_text(message_text, claimed_org=claimed_organization)
        all_flags.extend(rules_res["flags"])
        all_evidence.extend(rules_res["evidence"])
        intent_score = max(intent_score, rules_res["intent_score"])
        identity_score = max(identity_score, rules_res["identity_score"])

        # Check for any inline URLs in message text
        for extracted_url in rules_res.get("extracted_urls", []):
            url_res = LinkChecker.analyze_url(extracted_url, target_brand=claimed_organization)
            link_score = max(link_score, url_res["risk_score"])
            all_flags.extend(url_res["flags"])
            all_evidence.extend(url_res["evidence"])

    # 3. Media Processing (Audio or Image)
    try:
        if media_file:
            # Secure upload: validates extension against allowlist and enforces 25MB cap
            temp_path = await save_upload_file_securely(
                upload_file=media_file,
                allowed_extensions=ALLOWED_MULTIMODAL_EXTENSIONS,
                destination_dir=settings.UPLOAD_DIR,
                prefix="multi",
            )

            content_type = media_file.content_type or ""
            ext = os.path.splitext(media_file.filename or "")[1].lower()
            ext_to_mime = {
                ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime",
                ".webm": "video/webm", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".pdf": "application/pdf"
            }
            if not content_type or content_type == "application/octet-stream":
                content_type = ext_to_mime.get(ext, "image/png")

            if "audio" in content_type:
                stt_res = await stt_service.process_audio(temp_path, mime_type=content_type, caller_identity=sender_identity)
                audio_transcript = stt_res.get("transcript", "")
                media_score = max(media_score, float(stt_res.get("voice_synthetic_score", 15.0)))
                extracted_text = f"{extracted_text}\n[Spoken Transcript]: {audio_transcript}"
                if media_score >= 50.0:
                    all_flags.append("SYNTHETIC_VOICE_ARTIFACTS")
                    all_evidence.append("Voice exhibits synthetic cloning characteristics.")
            else:
                media_res = await gemini_service.analyze_media_file(
                    temp_path,
                    mime_type=content_type,
                    context_prompt=f"Sender: {sender_identity}, Claim: {claimed_organization}"
                )
                media_score = max(media_score, float(media_res.get("media_synthetic_score", 20.0)))
                all_flags.extend(media_res.get("flags", []))
                all_evidence.extend(media_res.get("findings", []))

        # 4. Context & Cognitive Reasoning via Gemini
        ai_eval = await gemini_service.analyze_interaction(
            content=(extracted_text or f"URL inspection for: {url}")[:10000],
            sender_identity=sender_identity or claimed_organization,
            modality="MULTIMODAL",
            extracted_signals={"flags": all_flags, "evidence": all_evidence, "link_score": link_score}
        )

        all_flags.extend(ai_eval.get("flags", []))
        all_evidence.extend(ai_eval.get("evidence", []))
        identity_score = max(identity_score, float(ai_eval.get("identity_risk_score", 0.0)))
        intent_score = max(intent_score, float(ai_eval.get("intent_risk_score", 0.0)))

        # 5. Weighted Risk Calculation
        verity_result = risk_engine.calculate_verity_score(
            modality=ModalityType.MULTIMODAL,
            identity_score=identity_score,
            intent_score=intent_score,
            media_score=media_score,
            link_score=link_score,
            flags=all_flags,
            evidence=all_evidence,
            evaluation_data={
                "who_trusted": ai_eval.get("who_trusted", False),
                "what_communicated": ai_eval.get("what_communicated", "Multimodal interaction"),
                "requested_action": ai_eval.get("requested_action", "Action evaluation"),
            },
            recommended_actions=ai_eval.get("recommended_actions")
        )

        if media_file and 'media_res' in locals() and media_res:
            verity_result.verdict = media_res.get("verdict")
            verity_result.confidence = media_res.get("confidence")
            verity_result.threat_level = media_res.get("threat_level")
            verity_result.manipulation_type = media_res.get("manipulation_type")
            verity_result.raw_telemetry = {
                "verdict": media_res.get("verdict"),
                "confidence": media_res.get("confidence"),
                "threat_level": media_res.get("threat_level"),
                "manipulation_type": media_res.get("manipulation_type"),
                "evidence": media_res.get("evidence", []),
                "recommended_action": media_res.get("recommended_action"),
            }
    finally:
        # Clean up temporary media — always runs, even on exception
        cleanup_temp_file(temp_path)

    # If analysis failed before producing a result, raise a clean error
    if verity_result is None:
        raise HTTPException(status_code=500, detail="Analysis pipeline did not produce a result. Please try again.")

    # 7. Record to SQLite
    record = ScanRecord(
        id=verity_result.scan_id,
        created_at=verity_result.timestamp,
        modality=ModalityType.MULTIMODAL.value,
        sender_info=sender_identity or claimed_organization,
        input_summary=extracted_text[:250] if extracted_text else (url or "Media input"),
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


@router.post("/signals", response_model=VerityResult, summary="Analyze pre-computed signals and anomaly telemetry")
async def analyze_signals(
    payload: SignalScoringRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Direct signal scoring endpoint for automated pipelines, telemetry probes, and benchmark evaluation.
    Evaluates:
    - caller_identity_anomaly
    - audio_synthetic_score
    - semantic_urgency_score
    - url_threat_score
    - requests_otp_or_credentials
    - claims_bank_or_authority
    """
    all_flags = []
    all_evidence = []

    identity_score = float(payload.caller_identity_anomaly)
    media_score = float(payload.audio_synthetic_score)
    intent_score = float(payload.semantic_urgency_score)
    link_score = float(payload.url_threat_score)

    if payload.requests_otp_or_credentials:
        all_flags.append("OTP_CREDENTIAL_SOLICITATION")
        all_flags.append("ACTIVE_OTP_THEFT_PATTERN")
        all_evidence.append("Interaction explicitly solicits OTP, PIN, or confidential credentials.")

    if payload.claims_bank_or_authority:
        all_flags.append("BANK_IMPERSONATION_RISK")
        all_flags.append("AUTHORITY_COERCION_PRETEXT")
        all_evidence.append("Sender claims banking institution or legal/government authority.")

    if media_score >= 60.0:
        all_flags.append("SYNTHETIC_VOICE_ARTIFACTS")
        all_evidence.append(f"High synthetic speech / cloned voice probability ({media_score}%).")

    if intent_score >= 60.0:
        all_flags.append("ARTIFICIAL_URGENCY_PRESSURE")
        all_evidence.append(f"High urgency and psychological coercion pressure score ({intent_score}%).")

    if link_score >= 50.0:
        all_flags.append("PHISHING_URL_RISK")
        all_evidence.append(f"Elevated malicious URL threat score ({link_score}%).")

    who_trusted = not (payload.claims_bank_or_authority or identity_score >= 40.0)
    who_evaluation = "Unverified sender claiming banking or official authority." if not who_trusted else "Sender identity within standard confidence thresholds."
    what_communicated = "Urgent high-stakes demand with authority or financial pretext." if (payload.claims_bank_or_authority or intent_score >= 50.0) else "Standard interaction."
    requested_action = "Provide OTP or confidential account credentials." if payload.requests_otp_or_credentials else "No sensitive credentials requested."

    recommended_actions = []
    if payload.requests_otp_or_credentials:
        recommended_actions.append("HALT: Never share OTP, CVV, or banking PINs with any caller or message.")
    if payload.claims_bank_or_authority:
        recommended_actions.append("Verify sender identity independently through official banking support channels.")
    if media_score >= 60.0:
        recommended_actions.append("Be alert for AI voice cloning; establish a secondary verification channel.")
    if not recommended_actions:
        recommended_actions.append("Maintain routine caution.")

    verity_result = risk_engine.calculate_verity_score(
        modality=ModalityType.MULTIMODAL,
        identity_score=identity_score,
        intent_score=intent_score,
        media_score=media_score,
        link_score=link_score,
        flags=all_flags,
        evidence=all_evidence,
        evaluation_data={
            "who_trusted": who_trusted,
            "who_evaluation": who_evaluation,
            "what_communicated": what_communicated,
            "requested_action": requested_action,
        },
        recommended_actions=recommended_actions
    )

    verity_result.raw_telemetry = payload.model_dump()

    record = ScanRecord(
        id=verity_result.scan_id,
        created_at=verity_result.timestamp,
        modality=ModalityType.MULTIMODAL.value,
        sender_info="Telemetry Signal Probe",
        input_summary=f"Signal Vector (Identity: {identity_score}, Audio: {media_score}, Urgency: {intent_score})",
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

