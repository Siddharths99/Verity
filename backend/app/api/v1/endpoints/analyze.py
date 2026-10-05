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
from app.services.rules_engine import RulesEngine
from app.services.link_checker import LinkChecker
from app.services.stt_service import stt_service
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/multimodal", response_model=VerityResult, summary="Unified multimodal fraud analysis")
async def analyze_multimodal(
    message_text: Optional[str] = Form(None, description="Message body or call transcript"),
    sender_identity: Optional[str] = Form(None, description="Sender name, phone, or caller ID"),
    claimed_organization: Optional[str] = Form(None, description="Claimed bank, agency, or company"),
    url: Optional[str] = Form(None, description="Any linked URL provided in the interaction"),
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
    temp_path = None
    if media_file:
        file_ext = os.path.splitext(media_file.filename or "")[1].lower()
        temp_filename = f"multi_{uuid.uuid4().hex}{file_ext}"
        temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(media_file.file, buffer)

        content_type = media_file.content_type or ""
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
                mime_type=content_type or "image/png",
                context_prompt=f"Sender: {sender_identity}, Claim: {claimed_organization}"
            )
            media_score = max(media_score, float(media_res.get("media_synthetic_score", 20.0)))
            all_flags.extend(media_res.get("flags", []))
            all_evidence.extend(media_res.get("findings", []))

    # 4. Context & Cognitive Reasoning via Gemini
    ai_eval = await gemini_service.analyze_interaction(
        content=extracted_text or f"URL inspection for: {url}",
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

    # 6. Clean up temporary media
    if temp_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass

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
