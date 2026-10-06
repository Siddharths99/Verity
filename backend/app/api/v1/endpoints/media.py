import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import ModalityType, RiskLevel, TrustStatus
from app.core.file_security import (
    save_upload_file_securely,
    cleanup_temp_file,
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_VIDEO_EXTENSIONS,
    ALLOWED_DOCUMENT_EXTENSIONS,
)
from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import VerityResult, EvaluationResult, SignalBreakdown
from app.services.gemini_service import gemini_service

logger = logging.getLogger("verity.media")
router = APIRouter()

# Combined allowlist for all media types accepted by this endpoint
ALLOWED_MEDIA_EXTENSIONS = (
    ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS
)


@router.post("/media", response_model=VerityResult, summary="Analyze image, document screenshot, or video")
async def analyze_media(
    file: UploadFile = File(..., description="Image, document, or video file (.png, .jpg, .jpeg, .webp, .pdf, .mp4, .mov, .webm)"),
    caption: Optional[str] = Form(None, description="Accompanying message or caption", max_length=1000),
    claimed_source: Optional[str] = Form(None, description="Claimed source (e.g. Bank slip, Police warrant, ID card)", max_length=255),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes visual media for:
    - Deepfake / AI-generated imagery or faces
    - Forged documents (fake bank payment receipts, fake police arrest orders, altered IDs)
    - Digital tampering, manipulation artifacts, and synthetic video sequences
    """
    temp_path: Optional[str] = None
    try:
        # Secure upload: validates extension against allowlist and enforces 25MB cap
        temp_path = await save_upload_file_securely(
            upload_file=file,
            allowed_extensions=ALLOWED_MEDIA_EXTENSIONS,
            destination_dir=settings.UPLOAD_DIR,
            prefix="media",
        )

        # Determine safe MIME type: prioritize file.content_type if specific, otherwise derive from extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        ext_to_mime = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
            ".mp4": "video/mp4",
            ".mov": "video/quicktime",
            ".webm": "video/webm",
            ".avi": "video/x-msvideo",
            ".mkv": "video/x-matroska",
            ".pdf": "application/pdf"
        }
        content_type = file.content_type or ""
        if not content_type or content_type == "application/octet-stream" or not any(t in content_type for t in ("image/", "video/", "audio/", "application/pdf")):
            if ext in ext_to_mime:
                content_type = ext_to_mime[ext]
            else:
                content_type = "image/png" if ext in ALLOWED_IMAGE_EXTENSIONS else ("video/mp4" if ext in ALLOWED_VIDEO_EXTENSIONS else "image/png")

        # Multimodal AI media evaluation using actual uploaded file bytes
        media_eval = await gemini_service.analyze_media_file(
            file_path=temp_path,
            mime_type=content_type,
            context_prompt=f"Claimed source: {claimed_source}. Caption: {caption}" if (claimed_source or caption) else None
        )

        verdict = media_eval.get("verdict", "UNCERTAIN")
        confidence = float(media_eval.get("confidence", 0.75))
        threat_level = media_eval.get("threat_level", "MEDIUM")
        manipulation_type = media_eval.get("manipulation_type", "None (Authentic Capture)")
        all_evidence = list(media_eval.get("evidence", []))
        recommended_action = media_eval.get("recommended_action", "Verify media authenticity.")
        what_communicated = media_eval.get("what_communicated", "Visual media submitted for forensic inspection")
        media_score = float(media_eval.get("media_synthetic_score", 0.0))
        all_flags = list(media_eval.get("flags", []))

        media_modality = ModalityType.VIDEO if "video/" in content_type else ModalityType.IMAGE

        risk_level_map = {
            "LOW": RiskLevel.LOW,
            "MEDIUM": RiskLevel.MEDIUM,
            "HIGH": RiskLevel.HIGH,
            "CRITICAL": RiskLevel.CRITICAL
        }
        assigned_risk_level = risk_level_map.get(threat_level, RiskLevel.MEDIUM)

        if assigned_risk_level == RiskLevel.LOW:
            risk_score = round(max(5.0, (1.0 - confidence) * 15.0), 1)
            trust_status = TrustStatus.TRUSTED
            who_trusted = True
        elif assigned_risk_level == RiskLevel.MEDIUM:
            risk_score = round(45.0 + (confidence * 10.0), 1)
            trust_status = TrustStatus.UNCERTAIN
            who_trusted = False
        elif assigned_risk_level == RiskLevel.HIGH:
            risk_score = round(max(65.0, min(84.0, confidence * 90.0)), 1)
            trust_status = TrustStatus.UNTRUSTED
            who_trusted = False
        else: # CRITICAL
            risk_score = round(max(85.0, min(98.0, confidence * 100.0)), 1)
            trust_status = TrustStatus.UNTRUSTED
            who_trusted = False

        scan_id = f"vrt_{uuid.uuid4().hex[:12]}"
        
        raw_telemetry = {
            "verdict": verdict,
            "confidence": confidence,
            "threat_level": threat_level,
            "manipulation_type": manipulation_type,
            "evidence": all_evidence,
            "recommended_action": recommended_action,
        }

        verity_result = VerityResult(
            scan_id=scan_id,
            timestamp=datetime.now(timezone.utc),
            modality=media_modality,
            risk_score=risk_score,
            risk_level=assigned_risk_level,
            evaluation=EvaluationResult(
                who_trusted=who_trusted,
                what_communicated=what_communicated,
                requested_action="Verify media authenticity",
                overall_trust=trust_status
            ),
            signal_breakdown=SignalBreakdown(
                identity_score=20.0 if not who_trusted else 5.0,
                intent_pressure_score=35.0 if assigned_risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL) else (15.0 if assigned_risk_level == RiskLevel.MEDIUM else 5.0),
                media_synthetic_score=media_score,
                link_reputation_score=0.0
            ),
            flags=all_flags,
            evidence=all_evidence,
            recommended_actions=[recommended_action],
            raw_telemetry=raw_telemetry,
            verdict=verdict,
            confidence=confidence,
            threat_level=threat_level,
            manipulation_type=manipulation_type
        )

        # Sanitize filename for storage — never store raw user-supplied filenames directly
        safe_filename = os.path.basename(file.filename or "unnamed_file")[:128]

        # Persist record
        record = ScanRecord(
            id=verity_result.scan_id,
            created_at=verity_result.timestamp,
            modality=media_modality.value,
            sender_info=claimed_source or safe_filename,
            input_summary=f"File: {safe_filename}, Caption: {caption or 'None'}, Verdict: {verdict}",
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
        logger.error(f"Multimodal media analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Multimodal media forensic analysis failed: {str(e)}")
    finally:
        cleanup_temp_file(temp_path)

