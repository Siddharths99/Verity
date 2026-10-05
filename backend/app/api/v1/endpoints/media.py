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
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/media", response_model=VerityResult, summary="Analyze image, document screenshot, or video")
async def analyze_media(
    file: UploadFile = File(..., description="Image or video file (.png, .jpg, .jpeg, .mp4)"),
    caption: Optional[str] = Form(None, description="Accompanying message or caption"),
    claimed_source: Optional[str] = Form(None, description="Claimed source (e.g. Bank slip, Police warrant, ID card)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes visual media for:
    - Deepfake / AI-generated imagery or faces
    - Forged documents (fake bank payment receipts, fake police arrest orders, altered IDs)
    - Deceptive QR codes and social engineering text in screenshots
    """
    file_ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
    temp_filename = f"media_{uuid.uuid4().hex}{file_ext}"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Multimodal AI media evaluation
        media_eval = await gemini_service.analyze_media_file(
            file_path=temp_path,
            mime_type=file.content_type or "image/png",
            context_prompt=f"Claimed source: {claimed_source}. Caption: {caption}"
        )

        media_score = float(media_eval.get("media_synthetic_score", 20.0))
        all_flags = list(media_eval.get("flags", []))
        all_evidence = list(media_eval.get("findings", []))

        # Basic identity & intent scores deduced from media analysis
        identity_score = 40.0 if "FORGED_DOCUMENT" in all_flags or "IMPERSONATION" in str(all_flags) else 15.0
        intent_score = 40.0 if "URGENCY" in str(all_flags) or "FINANCIAL_DEMAND" in str(all_flags) else 15.0

        verity_result = risk_engine.calculate_verity_score(
            modality=ModalityType.IMAGE,
            identity_score=identity_score,
            intent_score=intent_score,
            media_score=media_score,
            link_score=0.0,
            flags=all_flags,
            evidence=all_evidence,
            evaluation_data={
                "who_trusted": media_score < 40.0,
                "what_communicated": media_eval.get("what_communicated", f"Visual media ({file.filename})"),
                "requested_action": "Verify media authenticity",
            }
        )

        # Persist record
        record = ScanRecord(
            id=verity_result.scan_id,
            created_at=verity_result.timestamp,
            modality=ModalityType.IMAGE.value,
            sender_info=claimed_source,
            input_summary=f"File: {file.filename}, Caption: {caption or 'None'}",
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
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
