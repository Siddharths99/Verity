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
    verdict: Optional[str] = None
    confidence: Optional[float] = None
    threat_level: Optional[str] = None
    manipulation_type: Optional[str] = None


class TextAnalysisRequest(BaseModel):
    content: str = Field(..., min_length=2, max_length=10000, description="The message or transcript text to analyze")
    sender_identity: Optional[str] = Field(None, max_length=255, description="Sender header, phone number, or handle (e.g. +919876543210, HDFC-ALERT)")
    sender_channel: Optional[str] = Field("SMS", max_length=50, description="Channel e.g. SMS, WhatsApp, Email, Telegram, Phone")
    claimed_organization: Optional[str] = Field(None, max_length=255, description="Claimed organization e.g. SBI, HDFC, Police, FedEx")


class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="The full URL to check")
    target_brand: Optional[str] = Field(None, max_length=100, description="Optional brand the user believes this link belongs to")


class SignalScoringRequest(BaseModel):
    caller_identity_anomaly: float = Field(0.0, ge=0.0, le=100.0, description="Risk score for unverified caller or spoofing")
    audio_synthetic_score: float = Field(0.0, ge=0.0, le=100.0, description="Synthetic voice or cloning confidence")
    semantic_urgency_score: float = Field(0.0, ge=0.0, le=100.0, description="Psychological urgency or coercion score")
    url_threat_score: float = Field(0.0, ge=0.0, le=100.0, description="URL phishing or domain reputation risk")
    requests_otp_or_credentials: bool = Field(False, description="Whether the interaction requests OTP, PIN, or passwords")
    claims_bank_or_authority: bool = Field(False, description="Whether the sender claims bank, police, or government authority")

