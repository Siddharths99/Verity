from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.incident import IncidentSummary, IncidentDetail, FeedbackRequest, DashboardStats

router = APIRouter()

# Maximum scan_id length to guard against injection via path params
_SCAN_ID_MAX_LEN = 64


@router.get("", response_model=List[IncidentSummary], summary="List scan and incident history")
async def list_incidents(
    risk_level: Optional[str] = Query(None, description="Filter by risk tier: LOW, MEDIUM, HIGH, CRITICAL"),
    modality: Optional[str] = Query(None, description="Filter by modality: TEXT, AUDIO, IMAGE, URL, MULTIMODAL"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = select(ScanRecord).order_by(desc(ScanRecord.created_at))

    if risk_level:
        query = query.where(ScanRecord.risk_level == risk_level.upper())
    if modality:
        query = query.where(ScanRecord.modality == modality.upper())

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    records = result.scalars().all()
    return records


@router.get("/stats", response_model=DashboardStats, summary="Dashboard metrics and incident statistics")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Uses SQL aggregation queries instead of loading all records into memory
    to avoid memory exhaustion as scan history grows.
    """
    # Total count via SQL COUNT — O(1) memory
    total_result = await db.execute(select(func.count()).select_from(ScanRecord))
    total = total_result.scalar() or 0

    if total == 0:
        return DashboardStats(
            total_scans=0,
            critical_count=0,
            high_count=0,
            medium_count=0,
            low_count=0,
            average_risk_score=0.0,
            top_flags={},
            scans_by_modality={}
        )

    # Per-tier counts using SQL conditional aggregation
    counts_result = await db.execute(
        select(
            func.count().filter(ScanRecord.risk_level == "CRITICAL").label("critical"),
            func.count().filter(ScanRecord.risk_level == "HIGH").label("high"),
            func.count().filter(ScanRecord.risk_level == "MEDIUM").label("medium"),
            func.count().filter(ScanRecord.risk_level == "LOW").label("low"),
            func.avg(ScanRecord.risk_score).label("avg_score"),
        )
    )
    row = counts_result.one()
    critical_count = row.critical or 0
    high_count = row.high or 0
    medium_count = row.medium or 0
    low_count = row.low or 0
    avg_score = round(float(row.avg_score or 0.0), 1)

    # Modality breakdown — SQL GROUP BY
    modality_result = await db.execute(
        select(ScanRecord.modality, func.count().label("cnt"))
        .group_by(ScanRecord.modality)
    )
    scans_by_modality: Dict[str, int] = {r.modality: r.cnt for r in modality_result}

    # Flag frequency — still requires fetching flags column, but limited to recent 500 records
    flags_result = await db.execute(
        select(ScanRecord.flags)
        .order_by(desc(ScanRecord.created_at))
        .limit(500)
    )
    top_flags: Dict[str, int] = {}
    for (flags_val,) in flags_result:
        if flags_val and isinstance(flags_val, list):
            for flag in flags_val:
                top_flags[flag] = top_flags.get(flag, 0) + 1
    sorted_flags = dict(sorted(top_flags.items(), key=lambda item: item[1], reverse=True)[:8])

    return DashboardStats(
        total_scans=total,
        critical_count=critical_count,
        high_count=high_count,
        medium_count=medium_count,
        low_count=low_count,
        average_risk_score=avg_score,
        top_flags=sorted_flags,
        scans_by_modality=scans_by_modality
    )


@router.get("/{scan_id}", response_model=IncidentDetail, summary="Get full incident detail by ID")
async def get_incident(
    scan_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Validate scan_id to prevent unexpected injection via path parameter
    if not scan_id or len(scan_id) > _SCAN_ID_MAX_LEN:
        raise HTTPException(status_code=400, detail="Invalid scan ID.")

    query = select(ScanRecord).where(ScanRecord.id == scan_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    return record


@router.post("/{scan_id}/feedback", summary="Submit human feedback or validation for a scan")
async def submit_feedback(
    scan_id: str,
    feedback_data: FeedbackRequest,
    db: AsyncSession = Depends(get_db)
):
    if not scan_id or len(scan_id) > _SCAN_ID_MAX_LEN:
        raise HTTPException(status_code=400, detail="Invalid scan ID.")

    query = select(ScanRecord).where(ScanRecord.id == scan_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    record.feedback = feedback_data.feedback
    if feedback_data.notes:
        record.notes = feedback_data.notes

    await db.commit()
    await db.refresh(record)

    return {"message": "Feedback submitted successfully", "scan_id": scan_id, "feedback": record.feedback}
