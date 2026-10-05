from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.constants import RiskLevel, ModalityType


class IncidentSummary(BaseModel):
    id: str
    created_at: datetime
    modality: ModalityType
    sender_info: Optional[str] = None
    input_summary: Optional[str] = None
    risk_score: float
    risk_level: RiskLevel
    flags: List[str] = Field(default_factory=list)
    feedback: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IncidentDetail(IncidentSummary):
    who_trusted: bool
    what_communicated: Optional[str] = None
    requested_action: Optional[str] = None
    overall_trust: str
    signal_breakdown: Optional[Dict[str, float]] = None
    evidence: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class FeedbackRequest(BaseModel):
    feedback: str = Field(..., description="CONFIRMED_SCAM, FALSE_ALARM, or USER_IGNORED")
    notes: Optional[str] = None


class DashboardStats(BaseModel):
    total_scans: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    average_risk_score: float
    top_flags: Dict[str, int]
    scans_by_modality: Dict[str, int]
