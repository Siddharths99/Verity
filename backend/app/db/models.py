import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Boolean
from app.db.database import Base


def generate_scan_id() -> str:
    return f"vrt_{uuid.uuid4().hex[:12]}"


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String(32), primary_key=True, default=generate_scan_id)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    modality = Column(String(20), nullable=False, index=True)  # TEXT, AUDIO, IMAGE, URL, MULTIMODAL
    sender_info = Column(String(255), nullable=True)
    input_summary = Column(Text, nullable=True)

    # Risk Engine Verdict
    risk_score = Column(Float, nullable=False, index=True)  # 0.0 - 100.0
    risk_level = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL

    # Core 4 Questions (from Slide 5)
    who_trusted = Column(Boolean, default=False)
    what_communicated = Column(Text, nullable=True)
    requested_action = Column(Text, nullable=True)
    overall_trust = Column(String(20), default="UNTRUSTED")  # TRUSTED, UNCERTAIN, UNTRUSTED

    # Detailed signals & telemetry
    signal_breakdown = Column(JSON, nullable=True)
    flags = Column(JSON, nullable=True)
    evidence = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)

    # Human feedback / review
    feedback = Column(String(50), nullable=True)  # CONFIRMED_SCAM, FALSE_ALARM, PENDING
    notes = Column(Text, nullable=True)
