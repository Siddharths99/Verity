import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import ModalityType
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
    file: UploadFile = File(..., description="Audio file (.wav, .mp3, .m4a, .ogg)"),
    caller_info: Optional[str] = Form(None, description="Caller ID or phone number"),
    claimed_organization: Optional[str] = Form(None, description="Organization claimed by the caller"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes an audio recording of a phone call or voice message for:
    - Synthetic / AI-cloned voice characteristics
    - Spoken text transcription via Speech-to-Text
    - Impersonation and urgency pretexts in the call
    - Demands for OTP, PIN, or financial transfers
    """
    file_ext = os.path.splitext(file.filename or "")[1].lower() or ".wav"
    temp_filename = f"audio_{uuid.uuid4().hex}{file_ext}"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Speech-to-Text and voice forensics
        stt_result = await stt_service.process_audio(
            audio_path=temp_path,
            mime_type=file.content_type or "audio/wav",
            caller_identity=caller_info
        )

        transcript = stt_result.get("transcript", "")
        media_score = float(stt_result.get("voice_synthetic_score", 15.0))
        voice_indicators = stt_result.get("voice_indicators", [])

        # 2. Run rule-based fraud detection on transcript
        rules_result = RulesEngine.analyze_text(text=transcript, claimed_org=claimed_organization)

        all_flags = list(rules_result["flags"])
        all_evidence = list(rules_result["evidence"])

        if media_score >= 50.0:
            all_flags.append("SYNTHETIC_VOICE_ARTIFACTS")
            all_evidence.append(f"Acoustic analysis flagged potential synthetic/AI-cloned voice patterns ({', '.join(voice_indicators)}).")

        # 3. Gemini Semantic Context Evaluation
        ai_result = await gemini_service.analyze_interaction(
            content=transcript,
            sender_identity=caller_info or claimed_organization,
            modality="AUDIO",
            extracted_signals=rules_result
        )

        all_flags.extend(ai_result.get("flags", []))
        all_evidence.extend(ai_result.get("evidence", []))

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
                "who_trusted": ai_result.get("who_trusted", False),
                "what_communicated": ai_result.get("what_communicated", f"Call Transcript: {transcript[:100]}..."),
                "requested_action": ai_result.get("requested_action", "Voice instruction"),
            },
            recommended_actions=ai_result.get("recommended_actions")
        )

        # 5. Persist to SQLite
        record = ScanRecord(
            id=verity_result.scan_id,
            created_at=verity_result.timestamp,
            modality=ModalityType.AUDIO.value,
            sender_info=caller_info,
            input_summary=f"Transcript: {transcript[:250]}...",
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

    finally:
        # Clean up temporary upload
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
