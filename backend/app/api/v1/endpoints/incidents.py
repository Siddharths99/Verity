from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.db.database import get_db
from app.db.models import ScanRecord
from app.schemas.incident import IncidentSummary, IncidentDetail, FeedbackRequest, DashboardStats

router = APIRouter()


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
    result = await db.execute(select(ScanRecord))
    all_records = result.scalars().all()

    total = len(all_records)
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

    critical_count = sum(1 for r in all_records if r.risk_level == "CRITICAL")
    high_count = sum(1 for r in all_records if r.risk_level == "HIGH")
    medium_count = sum(1 for r in all_records if r.risk_level == "MEDIUM")
    low_count = sum(1 for r in all_records if r.risk_level == "LOW")
    avg_score = round(sum(r.risk_score for r in all_records) / total, 1)

    top_flags: Dict[str, int] = {}
    for r in all_records:
        if r.flags and isinstance(r.flags, list):
            for flag in r.flags:
                top_flags[flag] = top_flags.get(flag, 0) + 1

    sorted_flags = dict(sorted(top_flags.items(), key=lambda item: item[1], reverse=True)[:8])

    scans_by_modality: Dict[str, int] = {}
    for r in all_records:
        scans_by_modality[r.modality] = scans_by_modality.get(r.modality, 0) + 1

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
