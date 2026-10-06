import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("verity.audio")

from app.core.config import settings
from app.core.constants import ModalityType
from app.core.file_security import (
    save_upload_file_securely,
    cleanup_temp_file,
    ALLOWED_AUDIO_EXTENSIONS,
)
from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import VerityResult
from app.services.stt_service import stt_service
from app.services.rules_engine import RulesEngine
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/audio", response_model=VerityResult, summary="Analyze call recording or voice message")
async def analyze_audio(
    file: UploadFile = File(..., description="Audio file (.wav, .mp3, .m4a, .ogg, .flac, .aac)"),
    caller_info: Optional[str] = Form(None, description="Caller ID or phone number", max_length=255),
    claimed_organization: Optional[str] = Form(None, description="Organization claimed by the caller", max_length=255),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes an audio recording of a phone call or voice message for:
    - Synthetic / AI-cloned voice characteristics
    - Spoken text transcription via Speech-to-Text
    - Impersonation and urgency pretexts in the call
    - Demands for OTP, PIN, or financial transfers
    """
    temp_path: Optional[str] = None
    try:
        # Secure upload: validates extension against allowlist and enforces 25MB cap
        temp_path = await save_upload_file_securely(
            upload_file=file,
            allowed_extensions=ALLOWED_AUDIO_EXTENSIONS,
            destination_dir=settings.UPLOAD_DIR,
            prefix="audio",
        )

        # Determine correct audio MIME type
        ext = os.path.splitext(file.filename or "")[1].lower()
        ext_to_mime = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
            ".ogg": "audio/ogg",
            ".flac": "audio/flac",
            ".webm": "audio/webm",
        }
        content_type = file.content_type or ""
        if not content_type or content_type == "application/octet-stream" or not content_type.startswith("audio/"):
            content_type = ext_to_mime.get(ext, "audio/wav")

        # 1. Speech-to-Text and voice forensics on actual uploaded audio bytes
        stt_result = await stt_service.process_audio(
            audio_path=temp_path,
            mime_type=content_type,
            caller_identity=caller_info
        )

        transcript = stt_result.get("transcript", "")
        media_score = float(stt_result.get("voice_synthetic_score", 15.0))
        voice_indicators = list(stt_result.get("indicators", []))
        verdict = stt_result.get("verdict", "UNCERTAIN")
        confidence = float(stt_result.get("confidence", 0.75))
        threat_level = stt_result.get("threat_level", "MEDIUM")
        rec_action = stt_result.get("recommended_action")

        # 2. Run rule-based fraud detection on transcript if intelligible speech was found
        rules_result = {"flags": [], "evidence": [], "identity_score": 10.0, "intent_score": 10.0}
        if transcript and len(transcript.strip()) > 3:
            rules_result = RulesEngine.analyze_text(text=transcript, claimed_org=claimed_organization)

        all_flags = list(rules_result["flags"])
        all_evidence = list(voice_indicators)
        for ev in rules_result["evidence"]:
            if ev not in all_evidence:
                all_evidence.append(ev)

        if verdict in ("AI_GENERATED", "SUSPICIOUS") and "SYNTHETIC_VOICE_ARTIFACTS" not in all_flags:
            all_flags.append("SYNTHETIC_VOICE_ARTIFACTS")

        # 3. Gemini Semantic Context Evaluation if transcript is present
        ai_result = {}
        if transcript and len(transcript.strip()) > 3 and gemini_service.is_available():
            try:
                ai_result = await gemini_service.analyze_interaction(
                    content=transcript,
                    sender_identity=caller_info or claimed_organization,
                    modality="AUDIO",
                    extracted_signals=rules_result
                )
                for f in ai_result.get("flags", []):
                    if f not in all_flags:
                        all_flags.append(f)
                for e in ai_result.get("evidence", []):
                    if e not in all_evidence:
                        all_evidence.append(e)
            except Exception as e:
                logger.warning(f"Semantic context pass warning: {e}")

        identity_score = max(rules_result["identity_score"], float(ai_result.get("identity_risk_score", 0.0)))
        intent_score = max(rules_result["intent_score"], float(ai_result.get("intent_risk_score", 0.0)))

        # 4. Weighted Risk Engine Computation
        verity_result = risk_engine.calculate_verity_score(
            modality=ModalityType.AUDIO,
            identity_score=identity_score,
            intent_score=intent_score,
            media_score=media_score,
            link_score=0.0,
            flags=all_flags,
            evidence=all_evidence,
            evaluation_data={
                "who_trusted": ai_result.get("who_trusted", (verdict == "REAL")),
                "what_communicated": ai_result.get("what_communicated", (f"Call Transcript: {transcript[:120]}..." if transcript else "Audio recording inspection")),
                "requested_action": ai_result.get("requested_action", "Voice instruction"),
            },
            recommended_actions=[rec_action] if rec_action else ai_result.get("recommended_actions")
        )

        # Enforce model verdict and threat level
        from app.core.constants import RiskLevel
        risk_level_map = {
            "LOW": RiskLevel.LOW,
            "MEDIUM": RiskLevel.MEDIUM,
            "HIGH": RiskLevel.HIGH,
            "CRITICAL": RiskLevel.CRITICAL
        }
        verity_result.verdict = verdict
        verity_result.confidence = confidence
        verity_result.threat_level = threat_level
        verity_result.risk_level = risk_level_map.get(threat_level, verity_result.risk_level)

        if verdict == "REAL":
            verity_result.risk_score = round(max(5.0, (1.0 - confidence) * 15.0), 1)
        elif verdict == "UNCERTAIN":
            verity_result.risk_score = round(45.0 + (confidence * 10.0), 1)
        elif verdict == "SUSPICIOUS":
            verity_result.risk_score = round(max(65.0, confidence * 80.0), 1)
        else:  # AI_GENERATED
            verity_result.risk_score = round(max(85.0, confidence * 100.0), 1)

        manipulation_type = (
            "None (Authentic Voice)" if verdict == "REAL"
            else (
                "Inconclusive" if verdict == "UNCERTAIN"
                else ("Suspicious Acoustic Anomalies" if verdict == "SUSPICIOUS" else "Synthetic Cloned Voice")
            )
        )
        verity_result.manipulation_type = manipulation_type

        verity_result.raw_telemetry = {
            "verdict": verdict,
            "confidence": confidence,
            "threat_level": threat_level,
            "manipulation_type": manipulation_type,
            "evidence": all_evidence,
            "recommended_action": rec_action,
            "transcript": transcript,
            "voice_synthetic_score": media_score
        }

        # 5. Persist to SQLite
        record = ScanRecord(
            id=verity_result.scan_id,
            created_at=verity_result.timestamp,
            modality=ModalityType.AUDIO.value,
            sender_info=caller_info,
            input_summary=f"Transcript: {transcript[:250]}..." if transcript else "Audio scan",
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")
    finally:
        # Guarantee cleanup of temporary upload file
        cleanup_temp_file(temp_path)

