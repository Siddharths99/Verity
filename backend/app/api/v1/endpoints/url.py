from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.analysis import URLAnalysisRequest, VerityResult
from app.core.constants import ModalityType
from app.services.link_checker import LinkChecker
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/url", response_model=VerityResult, summary="Analyze suspicious URL or domain")
async def analyze_url(
    payload: URLAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes a suspicious URL for:
    - Lookalike domains & brand typosquatting (e.g. fake banking portals)
    - High-risk TLDs and ephemeral phishing infrastructure
    - Protocol anomalies and direct IP addressing
    - Credential harvesting login paths
    """
    link_eval = LinkChecker.analyze_url(payload.url, target_brand=payload.target_brand)
    link_score = link_eval["risk_score"]
    flags = link_eval["flags"]
    evidence = link_eval["evidence"]

    identity_score = 65.0 if "BRAND_TYPOSQUATTING_SUSPICION" in flags or "CLAIMED_BRAND_MISMATCH" in flags else 15.0
    intent_score = 60.0 if "PHISHING_CREDENTIAL_TRAP_PATH" in flags else 15.0

    verity_result = risk_engine.calculate_verity_score(
        modality=ModalityType.URL,
        identity_score=identity_score,
        intent_score=intent_score,
        media_score=0.0,
        link_score=link_score,
        flags=flags,
        evidence=evidence,
        evaluation_data={
            "who_trusted": "BRAND_TYPOSQUATTING_SUSPICION" not in flags and link_score < 40.0,
            "what_communicated": f"Web address: {link_eval['registered_domain']}",
            "requested_action": "Navigate to external website and input credentials/data",
        }
    )

    record = ScanRecord(
        id=verity_result.scan_id,
        created_at=verity_result.timestamp,
        modality=ModalityType.URL.value,
        sender_info=link_eval.get("registered_domain"),
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
