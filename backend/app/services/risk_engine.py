from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from app.core.constants import RiskLevel, ModalityType, TrustStatus
from app.schemas.analysis import VerityResult, EvaluationResult, SignalBreakdown


class RiskEngine:
    """
    Weighted Multimodal Fraud Scoring Engine.
    Combines identity signals, psychological intent cues, synthetic media artifacts,
    and link heuristics into an actionable risk assessment.
    """

    # Signal weights (Sum to 1.0)
    WEIGHT_IDENTITY = 0.25
    WEIGHT_INTENT = 0.35
    WEIGHT_MEDIA = 0.20
    WEIGHT_LINK = 0.20

    @classmethod
    def calculate_verity_score(
        cls,
        modality: ModalityType,
        identity_score: float,
        intent_score: float,
        media_score: float,
        link_score: float,
        flags: List[str],
        evidence: List[str],
        evaluation_data: Dict[str, Any],
        recommended_actions: Optional[List[str]] = None
    ) -> VerityResult:
        # 1. Base Weighted Score Calculation
        weighted_score = (
            (cls.WEIGHT_IDENTITY * identity_score) +
            (cls.WEIGHT_INTENT * intent_score) +
            (cls.WEIGHT_MEDIA * media_score) +
            (cls.WEIGHT_LINK * link_score)
        )

        flags_set = set(flags)
        escalation_reasons = []

        # 2. Hard Escalation Rules (Core Domain Invariants from Slide 3 & 4)
        
        # Rule A: Bank Impersonation + OTP / PIN Request
        is_bank_impersonation = "BANK_IMPERSONATION_RISK" in flags_set
        is_otp_solicitation = "OTP_CREDENTIAL_SOLICITATION" in flags_set or "ACTIVE_OTP_THEFT_PATTERN" in flags_set
        is_ai_voice = "SYNTHETIC_VOICE_ARTIFACTS" in flags_set or media_score >= 60.0

        if is_bank_impersonation and is_otp_solicitation:
            if weighted_score < 85.0:
                weighted_score = 88.0
            escalation_reasons.append("Critical override: Combination of Bank Impersonation and OTP Solicitation.")

        # Rule B: AI Voice + Bank Impersonation (Slide 3 Example)
        if is_ai_voice and is_bank_impersonation:
            if weighted_score < 75.0:
                weighted_score = 78.0
            escalation_reasons.append("High risk override: Synthetic/AI-cloned voice combined with Bank Impersonation.")

        # Rule C: Law Enforcement / "Digital Arrest" Pretext
        if "LAW_ENFORCEMENT_DIGITAL_ARREST_PRETEXT" in flags_set or "AUTHORITY_COERCION_PRETEXT" in flags_set:
            if weighted_score < 75.0:
                weighted_score = 80.0
            escalation_reasons.append("High risk override: Coercive law enforcement or authority pretext detected.")

        # Rule D: Brand Lookalike / Typosquatting + Credential Trap
        if "BRAND_TYPOSQUATTING_SUSPICION" in flags_set and ("PHISHING_CREDENTIAL_TRAP_PATH" in flags_set or is_otp_solicitation):
            if weighted_score < 90.0:
                weighted_score = 92.0
            escalation_reasons.append("Critical override: Deceptive lookalike brand URL with credential phishing trap.")

        # Rule E: High-risk TLD or Phishing URL combined with Urgency or Utility Disconnection
        has_suspicious_link = "HIGH_RISK_TLD" in flags_set or "RAW_IP_HOST_ADDRESS" in flags_set or link_score >= 35.0
        has_coercion = "ARTIFICIAL_URGENCY_PRESSURE" in flags_set or "UTILITY_DISCONNECTION_SCAM_PATTERN" in flags_set
        if has_suspicious_link and has_coercion:
            if weighted_score < 75.0:
                weighted_score = 78.0
            escalation_reasons.append("High risk override: Ephemeral/high-risk link combined with urgency or disconnection threat.")

        # Rule F: Remote Access Software Solicitation
        if "REMOTE_ACCESS_TOOL_SOLICITATION" in flags_set:
            if weighted_score < 80.0:
                weighted_score = 85.0
            escalation_reasons.append("High risk override: Request to install remote desktop control tool.")

        # Normalize score
        final_score = round(max(0.0, min(100.0, weighted_score)), 1)

        # 3. Determine Risk Level Tier
        if final_score >= 85.0:
            risk_level = RiskLevel.CRITICAL
        elif final_score >= 60.0:
            risk_level = RiskLevel.HIGH
        elif final_score >= 30.0:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # 4. Synthesize Evidence
        combined_evidence = list(evidence)
        if escalation_reasons:
            combined_evidence.extend(escalation_reasons)

        # Deduplicate evidence while preserving order
        unique_evidence = []
        for ev in combined_evidence:
            if ev not in unique_evidence:
                unique_evidence.append(ev)

        # 5. Synthesize Recommended Actions
        actions = list(recommended_actions or [])
        if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            if "Stop sensitive action immediately and verify independently." not in actions:
                actions.insert(0, "Stop sensitive action immediately and verify independently.")
            if is_otp_solicitation and "DO NOT share OTP, UPI PIN, or passwords under any circumstances." not in actions:
                actions.append("DO NOT share OTP, UPI PIN, or passwords under any circumstances.")
            if "BRAND_TYPOSQUATTING_SUSPICION" in flags_set and "Do not input login credentials or personal data into the linked page." not in actions:
                actions.append("Do not input login credentials or personal data into the linked page.")
        elif risk_level == RiskLevel.MEDIUM:
            actions.append("Proceed with caution. Verify the caller/sender identity via official contact channels before acting.")
        else:
            if not actions:
                actions.append("No immediate threat detected. Maintain standard digital hygiene.")

        # 6. Evaluation Structure
        trust_status = TrustStatus.UNTRUSTED
        if risk_level == RiskLevel.LOW:
            trust_status = TrustStatus.TRUSTED
        elif risk_level == RiskLevel.MEDIUM:
            trust_status = TrustStatus.UNCERTAIN

        who_trusted = evaluation_data.get("who_trusted", (risk_level == RiskLevel.LOW))

        evaluation = EvaluationResult(
            who_trusted=who_trusted,
            what_communicated=evaluation_data.get("what_communicated", "General communication message"),
            requested_action=evaluation_data.get("requested_action", "No action requested"),
            overall_trust=trust_status
        )

        signal_breakdown = SignalBreakdown(
            identity_score=round(identity_score, 1),
            intent_pressure_score=round(intent_score, 1),
            media_synthetic_score=round(media_score, 1),
            link_reputation_score=round(link_score, 1)
        )

        scan_id = f"vrt_{uuid.uuid4().hex[:12]}"

        return VerityResult(
            scan_id=scan_id,
            timestamp=datetime.now(timezone.utc),
            modality=modality,
            risk_score=final_score,
            risk_level=risk_level,
            evaluation=evaluation,
            signal_breakdown=signal_breakdown,
            flags=list(flags_set),
            evidence=unique_evidence,
            recommended_actions=actions
        )


risk_engine = RiskEngine()
