from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import TextAnalysisRequest, VerityResult
from app.core.constants import ModalityType
from app.services.rules_engine import RulesEngine
from app.services.link_checker import LinkChecker
from app.services.gemini_service import gemini_service
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/text", response_model=VerityResult, summary="Analyze text message, SMS, or transcript")
async def analyze_text(
    payload: TextAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes a text communication (SMS, WhatsApp, email, chat message) for:
    - Urgency and pressure triggers
    - OTP and credential solicitation patterns
    - Impersonation of financial or governmental entities
    - Embedded phishing or lookalike URLs
    """
    # 1. Deterministic rules & pattern matching
    rules_result = RulesEngine.analyze_text(
        text=payload.content,
        claimed_org=payload.claimed_organization
    )

    all_flags = list(rules_result["flags"])
    all_evidence = list(rules_result["evidence"])
    link_risk_score = 0.0

    # 2. Check any embedded links found in the text
    for url in rules_result["extracted_urls"]:
        link_analysis = LinkChecker.analyze_url(url, target_brand=payload.claimed_organization)
        link_risk_score = max(link_risk_score, link_analysis["risk_score"])
        all_flags.extend(link_analysis["flags"])
        all_evidence.extend(link_analysis["evidence"])

    # 3. Gemini AI Context & Social Engineering Evaluation
    ai_result = await gemini_service.analyze_interaction(
        content=payload.content,
        sender_identity=payload.sender_identity,
        modality="TEXT",
        extracted_signals=rules_result
    )

    all_flags.extend(ai_result.get("flags", []))
    all_evidence.extend(ai_result.get("evidence", []))

    # Blend rule-based scores with AI insights
    identity_score = max(rules_result["identity_score"], float(ai_result.get("identity_risk_score", 0.0)))
    intent_score = max(rules_result["intent_score"], float(ai_result.get("intent_risk_score", 0.0)))
    media_score = float(ai_result.get("synthetic_risk_score", 0.0))

    # 4. Calculate Verity Risk Verdict
    verity_result = risk_engine.calculate_verity_score(
        modality=ModalityType.TEXT,
        identity_score=identity_score,
        intent_score=intent_score,
        media_score=media_score,
        link_score=link_risk_score,
        flags=all_flags,
        evidence=all_evidence,
        evaluation_data={
            "who_trusted": ai_result.get("who_trusted", False),
            "what_communicated": ai_result.get("what_communicated", "Text communication"),
            "requested_action": ai_result.get("requested_action", "No action specified"),
        },
        recommended_actions=ai_result.get("recommended_actions")
    )

    # 5. Persist to SQLite
    record = ScanRecord(
        id=verity_result.scan_id,
        created_at=verity_result.timestamp,
        modality=ModalityType.TEXT.value,
        sender_info=payload.sender_identity or payload.sender_channel,
        input_summary=payload.content[:300] + ("..." if len(payload.content) > 300 else ""),
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
