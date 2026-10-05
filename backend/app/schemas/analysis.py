from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.constants import RiskLevel, ModalityType, TrustStatus


class EvaluationResult(BaseModel):
    who_trusted: bool = Field(..., description="Whether the sender identity is verified and legitimate")
    what_communicated: str = Field(..., description="Summary of the narrative, urgency, or pretext used")
    requested_action: str = Field(..., description="What sensitive action the user is being asked to perform")
    overall_trust: TrustStatus = Field(..., description="High-level trust classification")


class SignalBreakdown(BaseModel):
    identity_score: float = Field(..., ge=0.0, le=100.0, description="Risk attributed to spoofed/unverified identity")
    intent_pressure_score: float = Field(..., ge=0.0, le=100.0, description="Risk attributed to urgency, threats, or OTP requests")
    media_synthetic_score: float = Field(..., ge=0.0, le=100.0, description="Risk of AI voice clone or manipulated media")
    link_reputation_score: float = Field(..., ge=0.0, le=100.0, description="Risk of phishing, lookalike, or malicious URL")


class VerityResult(BaseModel):
    scan_id: str
    timestamp: datetime
    modality: ModalityType
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    evaluation: EvaluationResult
    signal_breakdown: SignalBreakdown
    flags: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    raw_telemetry: Optional[Dict[str, Any]] = None


class TextAnalysisRequest(BaseModel):
    content: str = Field(..., min_length=2, description="The message or transcript text to analyze")
    sender_identity: Optional[str] = Field(None, description="Sender header, phone number, or handle (e.g. +919876543210, HDFC-ALERT)")
    sender_channel: Optional[str] = Field("SMS", description="Channel e.g. SMS, WhatsApp, Email, Telegram, Phone")
    claimed_organization: Optional[str] = Field(None, description="Claimed organization e.g. SBI, HDFC, Police, FedEx")


class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, description="The full URL to check")
    target_brand: Optional[str] = Field(None, description="Optional brand the user believes this link belongs to")
