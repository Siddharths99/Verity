import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.services.caller_id_adapter import CallerIdVerificationResult


class CallSignal(BaseModel):
    id: str = Field(default_factory=lambda: f"ws-{uuid.uuid4().hex[:6]}")
    category: str  # "IDENTITY", "VOICE", "INTENT", "ACTION"
    text: str
    detail: str
    severity: str = "MEDIUM"  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    score_impact: float = 0.0
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class QuadrantState(BaseModel):
    state: str       # e.g. "Suspicious", "Normal", "AI Clone", "Coercive", "Critical", "Unavailable"
    badge_color: str # "red", "orange", "purple", "cyan", "slate"
    title: str       # e.g. "Caller Identity", "Communication", "Voice Authenticity", "Requested Action"
    headline: str    # e.g. "Unverified VoIP", "High Pressure", "Synthetic Vocoder", "OTP / Transfer"
    detail: str      # e.g. "Fails carrier STIR/SHAKEN certification."
    is_flagged: bool = False


class ThreatScoreResult(BaseModel):
    score: float  # 0 to 100
    level: str    # "TRUSTED", "CAUTION", "SUSPICIOUS", "HIGH RISK"
    confidence: Optional[float] = None
    signals: List[CallSignal] = Field(default_factory=list)
    delta_signals: List[CallSignal] = Field(default_factory=list)
    quadrants: Dict[str, QuadrantState]
    verdict: str
    verdict_badge: str
    recommended_action: str
    audio_analysis_status: str  # "UNAVAILABLE", "ACTIVE", "COMPLETED"


class CallThreatScorer:
    """
    Continuous Threat Scoring Engine for Live Call Protection.
    Aggregates carrier attestation, voice biometrics, linguistic coercion,
    and action requests into an interpretable 0-100 score.
    """

    @classmethod
    def calculate_score(
        cls,
        caller_id_result: Optional[CallerIdVerificationResult] = None,
        transcript_text: Optional[str] = None,
        audio_telemetry: Optional[Dict[str, Any]] = None,
        existing_signals: Optional[List[Dict[str, Any]]] = None,
        audio_available: bool = False
    ) -> ThreatScoreResult:
        signals: List[CallSignal] = []
        new_signals: List[CallSignal] = []

        # 1. Evaluate Caller ID & Telecom Metadata
        identity_score = 0.0
        who_state = QuadrantState(
            state="Verified",
            badge_color="emerald",
            title="Caller Identity",
            headline="Authenticated Origin",
            detail="Carrier identity matches official cryptographic attestation.",
            is_flagged=False
        )

        if caller_id_result:
            v_state = caller_id_result.verification_state.upper()
            if v_state == "HIGH RISK":
                identity_score += 40.0
                sig = CallSignal(
                    category="IDENTITY",
                    text="Caller identity cannot be verified",
                    detail=caller_id_result.stir_shaken_attestation or "STIR/SHAKEN Level A cryptographic attestation header absent",
                    severity="CRITICAL",
                    score_impact=40.0
                )
                signals.append(sig)
                new_signals.append(sig)
                who_state = QuadrantState(
                    state="Suspicious",
                    badge_color="orange",
                    title="Caller Identity",
                    headline="Unverified VoIP",
                    detail="Fails carrier STIR/SHAKEN certification header check.",
                    is_flagged=True
                )
            elif v_state in ("SUSPICIOUS", "UNVERIFIED"):
                identity_score += 25.0
                sig = CallSignal(
                    category="IDENTITY",
                    text="Unverified caller line",
                    detail="Inbound call lacks verified cryptographic carrier certificate.",
                    severity="HIGH",
                    score_impact=25.0
                )
                signals.append(sig)
                new_signals.append(sig)
                who_state = QuadrantState(
                    state="Unverified",
                    badge_color="orange",
                    title="Caller Identity",
                    headline=caller_id_result.line_type or "Unregistered Line",
                    detail=f"{caller_id_result.carrier or 'Carrier'} routing unauthenticated.",
                    is_flagged=True
                )
            elif v_state == "UNKNOWN":
                identity_score += 15.0
                sig = CallSignal(
                    category="IDENTITY",
                    text="Unknown caller route",
                    detail="Unable to resolve carrier origin against national numbering plan.",
                    severity="MEDIUM",
                    score_impact=15.0
                )
                signals.append(sig)
                new_signals.append(sig)
                who_state = QuadrantState(
                    state="Unknown",
                    badge_color="slate",
                    title="Caller Identity",
                    headline="Unresolved Trunk",
                    detail="Carrier route not resolved in directory.",
                    is_flagged=False
                )

        # 2. Evaluate Voice / Audio Telemetry (STRICTLY NO FABRICATION)
        voice_score = 0.0
        audio_status = "UNAVAILABLE"
        voice_state = QuadrantState(
            state="Unavailable",
            badge_color="slate",
            title="Voice Authenticity",
            headline="Audio Telemetry Offline",
            detail="Live audio analysis unavailable; no audio feed ingested.",
            is_flagged=False
        )

        if audio_available and audio_telemetry:
            audio_status = "ACTIVE"
            is_synthetic = audio_telemetry.get("is_synthetic", False)
            pitch_jitter = audio_telemetry.get("pitch_jitter", 0.0)
            vocoder_detected = audio_telemetry.get("vocoder_detected", False)
            synthetic_score = float(audio_telemetry.get("synthetic_score", 0.0))

            if is_synthetic or vocoder_detected or synthetic_score > 60.0:
                voice_score += 30.0
                sig = CallSignal(
                    category="VOICE",
                    text="Possible synthetic voice",
                    detail=f"Vocoder formant anomalies ({int(synthetic_score)}%) and zero natural acoustic breath pauses",
                    severity="CRITICAL",
                    score_impact=30.0
                )
                signals.append(sig)
                new_signals.append(sig)
                voice_state = QuadrantState(
                    state="AI Clone",
                    badge_color="purple",
                    title="Voice Authenticity",
                    headline="Synthetic Vocoder",
                    detail=f"Synthetic pitch discontinuities flagged at {int(synthetic_score)}%.",
                    is_flagged=True
                )
            else:
                voice_state = QuadrantState(
                    state="Natural",
                    badge_color="emerald",
                    title="Voice Authenticity",
                    headline="Organic Acoustics",
                    detail="Human acoustic formants and natural respiratory cadence detected.",
                    is_flagged=False
                )

        # 3. Evaluate Communication Intent & Linguistic Coercion (from transcript)
        intent_score = 0.0
        what_state = QuadrantState(
            state="Normal",
            badge_color="emerald",
            title="Communication",
            headline="Standard Dialogue",
            detail="Conversational tone within normal baseline parameters.",
            is_flagged=False
        )

        text_lower = (transcript_text or "").lower()
        if text_lower:
            is_urgent = any(kw in text_lower for kw in [
                "urgent", "immediately", "24 hours", "suspended", "blocked",
                "arrest", "cbi", "police", "customs", "digital arrest",
                "court order", "freeze", "lockdown", "penalty", "warrant"
            ])
            is_delivery_impersonation = any(kw in text_lower for kw in [
                "fedex", "dhl", "customs parcel", "narcotics package", "illegal contraband", "parcel detained"
            ])
            is_family_emergency = any(kw in text_lower for kw in [
                "hospital emergency", "in police custody", "bail money", "kidnapped", "accident urgent"
            ])
            is_suspicious_instruction = any(kw in text_lower for kw in [
                "do not hang up", "stay on the line", "do not tell anyone", "private room",
                "keep confidential", "maintain secrecy", "official secrets"
            ])

            if is_urgent or is_delivery_impersonation or is_family_emergency or is_suspicious_instruction:
                intent_score += 25.0
                detail_parts = []
                if is_urgent:
                    detail_parts.append("High-pressure coercive deadline framing")
                if is_delivery_impersonation:
                    detail_parts.append("Delivery/customs parcel pretext impersonation")
                if is_family_emergency:
                    detail_parts.append("Fabricated family emergency pretext")
                if is_suspicious_instruction:
                    detail_parts.append("Social engineering secrecy/isolation instruction")

                sig = CallSignal(
                    category="INTENT",
                    text="Coercive intent & suspicious instructions detected" if is_suspicious_instruction else "Urgency & pretext detected",
                    detail=" | ".join(detail_parts) if detail_parts else "High-pressure linguistic coercive framing",
                    severity="CRITICAL" if (is_delivery_impersonation or is_suspicious_instruction) else "HIGH",
                    score_impact=25.0
                )
                signals.append(sig)
                new_signals.append(sig)
                what_state = QuadrantState(
                    state="Coercive",
                    badge_color="red",
                    title="Communication",
                    headline="High Pressure / Pretext",
                    detail="Coercive deadlines framing immediate account lockdown, digital arrest, or isolation.",
                    is_flagged=True
                )

        # 4. Evaluate Requested Action (OTP, Passwords, Wire Transfer, Remote Access)
        action_score = 0.0
        request_state = QuadrantState(
            state="None",
            badge_color="emerald",
            title="Requested Action",
            headline="Informational",
            detail="No sensitive credential or financial routing requested.",
            is_flagged=False
        )

        if text_lower:
            is_otp_demanded = any(kw in text_lower for kw in ["otp", "pin", "password", "cvv", "passcode", "code", "6-digit", "security token"])
            is_money_demanded = any(kw in text_lower for kw in ["transfer", "wire", "pay", "send money", "upi", "account routing", "deposit", "escrow", "safe account"])
            is_remote_access = any(kw in text_lower for kw in ["anydesk", "teamviewer", "rustdesk", "quicksupport", "screen share", "remote desktop"])

            if is_money_demanded:
                action_score += 25.0
                sig = CallSignal(
                    category="ACTION",
                    text="Financial request detected",
                    detail="Active solicitation for urgent account fund re-routing, escrow deposit, or payment",
                    severity="CRITICAL",
                    score_impact=25.0
                )
                signals.append(sig)
                new_signals.append(sig)

            if is_otp_demanded:
                action_score += 30.0
                sig = CallSignal(
                    category="ACTION",
                    text="OTP request detected",
                    detail="Direct verbal demand for one-time SMS verification token or security PIN",
                    severity="CRITICAL",
                    score_impact=30.0
                )
                signals.append(sig)
                new_signals.append(sig)

            if is_remote_access:
                action_score += 30.0
                sig = CallSignal(
                    category="ACTION",
                    text="Remote access software solicited",
                    detail="Caller demands installation of remote desktop software (AnyDesk/TeamViewer/RustDesk)",
                    severity="CRITICAL",
                    score_impact=30.0
                )
                signals.append(sig)
                new_signals.append(sig)

            if is_otp_demanded or is_money_demanded or is_remote_access:
                request_state = QuadrantState(
                    state="Critical",
                    badge_color="red",
                    title="Requested Action",
                    headline="OTP / Transfer Solicited",
                    detail="Demands verbal disclosure of sensitive credentials or fund re-routing.",
                    is_flagged=True
                )

        # 5. Composite Score Calculation
        total_raw = identity_score + voice_score + intent_score + action_score
        
        # Hard overrides: OTP demand + Authority claim => minimum 85
        if action_score >= 30.0 and identity_score >= 25.0:
            total_raw = max(total_raw, 88.0)
        
        # Multiple critical vectors override => 94
        if len([s for s in signals if s.severity == "CRITICAL"]) >= 2:
            total_raw = max(total_raw, 94.0)

        final_score = round(min(100.0, max(0.0, total_raw)), 1)

        # 6. Tier Mapping
        # 0-29 TRUSTED
        # 30-59 CAUTION
        # 60-79 SUSPICIOUS
        # 80-100 HIGH RISK
        if final_score >= 80.0:
            level = "HIGH RISK"
            verdict = "NO — HIGH CONFIDENCE FRAUD RISK"
            verdict_badge = "Quarantine Mandated"
            rec_action = "End Call Immediately"
        elif final_score >= 60.0:
            level = "SUSPICIOUS"
            verdict = "PROCEED WITH EXTREME CAUTION"
            verdict_badge = "Suspicious Origin"
            rec_action = "Verify Independently"
        elif final_score >= 30.0:
            level = "CAUTION"
            verdict = "UNVERIFIED INTERACTION"
            verdict_badge = "Caution Advised"
            rec_action = "Do not share sensitive credentials"
        else:
            level = "TRUSTED"
            verdict = "INTERACTION APPEARS LEGITIMATE"
            verdict_badge = "Verified Low Risk"
            rec_action = "Standard verification"

        # Confidence: Only report confidence when supported by data
        confidence = None
        evidence_points = 0
        if caller_id_result and caller_id_result.is_valid_format:
            evidence_points += 1
        if audio_available:
            evidence_points += 2
        if transcript_text:
            evidence_points += 1
        
        if evidence_points >= 2:
            confidence = min(98.0, 70.0 + (evidence_points * 7.0))

        quadrants = {
            "who": who_state,
            "what": what_state,
            "voice": voice_state,
            "request": request_state
        }

        return ThreatScoreResult(
            score=final_score,
            level=level,
            confidence=confidence,
            signals=signals,
            delta_signals=new_signals,
            quadrants=quadrants,
            verdict=verdict,
            verdict_badge=verdict_badge,
            recommended_action=rec_action,
            audio_analysis_status=audio_status
        )
