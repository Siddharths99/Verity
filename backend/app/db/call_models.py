import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_session_id() -> str:
    return f"call_sess_{uuid.uuid4().hex[:12]}"


def generate_event_id() -> str:
    return f"call_evt_{uuid.uuid4().hex[:12]}"


class CallProtectionSession(Base):
    __tablename__ = "call_protection_sessions"

    id = Column(String(36), primary_key=True, default=generate_session_id)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    ended_at = Column(DateTime, nullable=True)
    phone_number = Column(String(32), nullable=False, index=True)
    claimed_identity = Column(String(255), nullable=True)
    
    # Session lifecycle: ACTIVE, ENDED, BLOCKED, REPORTED
    status = Column(String(20), default="ACTIVE", index=True)
    
    # Verification State: VERIFIED, SUSPICIOUS, UNVERIFIED, HIGH RISK, UNKNOWN
    verification_state = Column(String(20), default="UNKNOWN", index=True)
    
    # Carrier and Telecom Metadata (Dict with operator, circle, country, line_type, etc.)
    carrier_info = Column(JSON, nullable=True)
    
    # STIR/SHAKEN and caller-ID attestation details (Dict with level: A/B/C/NONE, status)
    attestation = Column(JSON, nullable=True)
    
    # Number reputation and spam reports (Dict with score, reports_count, categories)
    reputation = Column(JSON, nullable=True)
    
    # Continuous Threat Scoring
    threat_score = Column(Float, default=0.0)  # 0 - 100
    threat_level = Column(String(20), default="TRUSTED")  # TRUSTED, CAUTION, SUSPICIOUS, HIGH RISK
    confidence = Column(Float, nullable=True)  # Only populated when supported by actual evidence
    
    # Media & Voice Telemetry Status: UNAVAILABLE, IN_PROGRESS, COMPLETED, FAILED
    audio_analysis_status = Column(String(30), default="UNAVAILABLE")
    
    # Flags and signals list (Dict / List of signal records)
    signals = Column(JSON, default=list)
    
    # Quadrant state (WHO, WHAT, VOICE, REQUEST)
    quadrants = Column(JSON, nullable=True)
    
    # Actions taken on this session (e.g. ["BLOCKED", "REPORTED_1930", "ENDED_BY_USER"])
    actions_taken = Column(JSON, default=list)
    
    # Demo / Simulation indicator (Never present simulated detection as real)
    is_demo = Column(Boolean, default=False, index=True)
    
    # Linked scan ID in scan_records table once finalized
    linked_scan_id = Column(String(32), nullable=True)
    
    # Notes or review feedback
    notes = Column(Text, nullable=True)

    # Relationships
    events = relationship("CallProtectionEvent", back_populates="session", cascade="all, delete-orphan", order_by="CallProtectionEvent.timestamp")


class CallProtectionEvent(Base):
    __tablename__ = "call_protection_events"

    id = Column(String(36), primary_key=True, default=generate_event_id)
    session_id = Column(String(36), ForeignKey("call_protection_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Event Types:
    # CALL_INITIATED, CALLER_VERIFIED, TELECOM_METADATA_LOADED, AUDIO_TELEMETRY_UPDATED,
    # TRANSCRIPT_ANALYZED, THREAT_SCORE_UPDATED, WARNING_TRIGGERED, USER_ACTION_TAKEN, CALL_ENDED
    event_type = Column(String(50), nullable=False, index=True)
    
    # Event payload data
    payload = Column(JSON, nullable=False, default=dict)
    
    # Risk score snapshot at this event
    risk_score = Column(Float, nullable=True)
    
    # Whether this event originated from a demo / simulated stream
    is_simulated = Column(Boolean, default=False)

    session = relationship("CallProtectionSession", back_populates="events")


class BlockedCaller(Base):
    __tablename__ = "blocked_callers"

    id = Column(String(36), primary_key=True, default=lambda: f"blk_{uuid.uuid4().hex[:12]}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    phone_number = Column(String(32), nullable=False, unique=True, index=True)
    reason = Column(String(255), nullable=True)
    source_session_id = Column(String(36), nullable=True)
