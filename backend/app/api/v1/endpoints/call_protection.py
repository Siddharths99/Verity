import json
import asyncio
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.database import get_db, AsyncSessionLocal
from app.db.call_models import CallProtectionSession, CallProtectionEvent, BlockedCaller
from app.db.models import ScanRecord
from app.core.constants import RiskLevel, ModalityType, TrustStatus
from app.services.caller_id_adapter import get_caller_id_adapter, CallerIdVerificationResult
from app.services.call_threat_scorer import CallThreatScorer, ThreatScoreResult
from app.services.call_demo_simulator import CallDemoSimulator

router = APIRouter()


# ==============================================================================
# WebSockets & Connection Management
# ==============================================================================
class ConnectionManager:
    def __init__(self):
        # Maps session_id -> list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_json(self, session_id: str, data: Dict[str, Any]):
        if session_id in self.active_connections:
            dead_sockets = []
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(data)
                except Exception:
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect(session_id, dead)


manager = ConnectionManager()


# ==============================================================================
# Request & Response Schemas
# ==============================================================================
class VerifyCallerRequest(BaseModel):
    phone_number: str = Field(..., min_length=3, max_length=32)
    claimed_identity: Optional[str] = Field(None, max_length=255)
    demo_mode: bool = False


class StartSessionRequest(BaseModel):
    phone_number: str = Field(..., min_length=3, max_length=32)
    claimed_identity: Optional[str] = Field(None, max_length=255)
    demo_mode: bool = False
    is_incoming: bool = True


class AudioTelemetryRequest(BaseModel):
    is_synthetic: bool = False
    synthetic_score: float = Field(0.0, ge=0.0, le=100.0)
    pitch_jitter: float = Field(0.0, ge=0.0, le=100.0)
    vocoder_detected: bool = False


class TranscriptTelemetryRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    speaker: Optional[str] = "Caller"


class CallActionRequest(BaseModel):
    action: str = Field(..., description="END_CALL, BLOCK_CALLER, REPORT_FRAUD, VERIFY_INDEPENDENTLY")
    reason: Optional[str] = None


class SessionDetailResponse(BaseModel):
    id: str
    created_at: datetime
    ended_at: Optional[datetime] = None
    phone_number: str
    claimed_identity: Optional[str] = None
    status: str
    verification_state: str
    carrier_info: Optional[Dict[str, Any]] = None
    attestation: Optional[Dict[str, Any]] = None
    reputation: Optional[Dict[str, Any]] = None
    threat_score: float
    threat_level: str
    confidence: Optional[float] = None
    audio_analysis_status: str
    signals: List[Dict[str, Any]] = []
    quadrants: Optional[Dict[str, Any]] = None
    actions_taken: List[str] = []
    is_demo: bool
    notes: Optional[str] = None


# ==============================================================================
# Endpoints
# ==============================================================================

@router.post("/verify-caller", summary="Verify Caller ID & telecom carrier origin")
async def verify_caller_id(req: VerifyCallerRequest):
    """
    Evaluates caller phone number formatting, telecom provider,
    STIR/SHAKEN attestation headers, and spam reputation.
    Never claims a caller is verified without evidence.
    """
    adapter = get_caller_id_adapter(demo_mode=req.demo_mode)
    res = await adapter.verify(req.phone_number, req.claimed_identity)
    return res


@router.post("/session/start", response_model=SessionDetailResponse, summary="Initiate live Call Protection session")
async def start_protection_session(req: StartSessionRequest, db: AsyncSession = Depends(get_db)):
    """
    Creates an active Call Protection session as soon as an incoming call is detected.
    Captures caller number, claimed identity, and performs initial telecom verification.
    """
    adapter = get_caller_id_adapter(demo_mode=req.demo_mode)
    caller_meta = await adapter.verify(req.phone_number, req.claimed_identity)

    # Initial scoring
    initial_score = CallThreatScorer.calculate_score(
        caller_id_result=caller_meta,
        audio_available=False
    )

    session = CallProtectionSession(
        phone_number=req.phone_number,
        claimed_identity=req.claimed_identity,
        status="ACTIVE",
        verification_state=caller_meta.verification_state,
        carrier_info={
            "operator": caller_meta.carrier,
            "circle": caller_meta.circle_or_region,
            "country": caller_meta.country,
            "flag": caller_meta.country_flag,
            "lineType": caller_meta.line_type,
            "isValid": caller_meta.is_valid_format
        },
        attestation={
            "stir_shaken": caller_meta.stir_shaken_attestation,
            "provider": caller_meta.provider_name
        },
        reputation={
            "reputation_score": caller_meta.reputation_score,
            "spam_reports": caller_meta.spam_reports_count,
            "spoofing_indicators": caller_meta.spoofing_indicators
        },
        threat_score=initial_score.score,
        threat_level=initial_score.level,
        confidence=initial_score.confidence,
        audio_analysis_status="UNAVAILABLE",
        signals=[s.model_dump() for s in initial_score.signals],
        quadrants={k: v.model_dump() for k, v in initial_score.quadrants.items()},
        actions_taken=[],
        is_demo=req.demo_mode,
        notes="Session initiated by Verity live call protection channel."
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Record initial event
    init_evt = CallProtectionEvent(
        session_id=session.id,
        event_type="CALL_INITIATED",
        payload={
            "phone_number": req.phone_number,
            "claimed_identity": req.claimed_identity,
            "verification_state": caller_meta.verification_state,
            "caller_meta": caller_meta.model_dump()
        },
        risk_score=session.threat_score,
        is_simulated=req.demo_mode
    )
    db.add(init_evt)
    await db.commit()

    return session


@router.get("/session/{session_id}", response_model=SessionDetailResponse, summary="Get session status")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Call protection session not found")
    return session


@router.get("/session/{session_id}/events", summary="Get session chronological events")
async def get_session_events(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CallProtectionEvent)
        .where(CallProtectionEvent.session_id == session_id)
        .order_by(CallProtectionEvent.timestamp)
    )
    events = result.scalars().all()
    return events


@router.post("/session/{session_id}/audio-telemetry", summary="Ingest live audio telemetry")
async def ingest_audio_telemetry(
    session_id: str,
    req: AudioTelemetryRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    caller_meta = CallerIdVerificationResult(
        phone_number=session.phone_number,
        normalized_number=session.phone_number,
        country=session.carrier_info.get("country", "Unknown") if session.carrier_info else "Unknown",
        carrier=session.carrier_info.get("operator") if session.carrier_info else None,
        verification_state=session.verification_state,
        stir_shaken_attestation=session.attestation.get("stir_shaken") if session.attestation else None,
        is_valid_format=True
    )

    audio_data = {
        "is_synthetic": req.is_synthetic,
        "synthetic_score": req.synthetic_score,
        "pitch_jitter": req.pitch_jitter,
        "vocoder_detected": req.vocoder_detected
    }

    scorer_res = CallThreatScorer.calculate_score(
        caller_id_result=caller_meta,
        audio_telemetry=audio_data,
        audio_available=True
    )

    session.threat_score = scorer_res.score
    session.threat_level = scorer_res.level
    session.confidence = scorer_res.confidence
    session.audio_analysis_status = "ACTIVE"
    session.signals = [s.model_dump() for s in scorer_res.signals]
    session.quadrants = {k: v.model_dump() for k, v in scorer_res.quadrants.items()}

    evt = CallProtectionEvent(
        session_id=session.id,
        event_type="AUDIO_TELEMETRY_UPDATED",
        payload={
            "audio_telemetry": audio_data,
            "quadrants": session.quadrants,
            "signals": session.signals
        },
        risk_score=session.threat_score,
        is_simulated=session.is_demo
    )
    db.add(evt)
    await db.commit()

    # Broadcast to stream
    await manager.broadcast_json(session_id, {
        "event_type": "AUDIO_TELEMETRY_UPDATED",
        "threat_score": session.threat_score,
        "threat_level": session.threat_level,
        "confidence": session.confidence,
        "audio_status": session.audio_analysis_status,
        "quadrants": session.quadrants,
        "signals": session.signals,
        "is_simulated": session.is_demo
    })

    return {"status": "success", "threat_score": session.threat_score}


@router.post("/session/{session_id}/transcript", summary="Ingest live transcript snippet")
async def ingest_transcript(
    session_id: str,
    req: TranscriptTelemetryRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    caller_meta = CallerIdVerificationResult(
        phone_number=session.phone_number,
        normalized_number=session.phone_number,
        country=session.carrier_info.get("country", "Unknown") if session.carrier_info else "Unknown",
        carrier=session.carrier_info.get("operator") if session.carrier_info else None,
        verification_state=session.verification_state,
        stir_shaken_attestation=session.attestation.get("stir_shaken") if session.attestation else None,
        is_valid_format=True
    )

    audio_available = session.audio_analysis_status == "ACTIVE"
    audio_data = None
    if audio_available and session.quadrants and session.quadrants.get("voice", {}).get("state") == "AI Clone":
        audio_data = {"is_synthetic": True, "synthetic_score": 90.0, "pitch_jitter": 90.0}

    scorer_res = CallThreatScorer.calculate_score(
        caller_id_result=caller_meta,
        transcript_text=req.text,
        audio_telemetry=audio_data,
        audio_available=audio_available
    )

    session.threat_score = scorer_res.score
    session.threat_level = scorer_res.level
    session.confidence = scorer_res.confidence
    session.signals = [s.model_dump() for s in scorer_res.signals]
    session.quadrants = {k: v.model_dump() for k, v in scorer_res.quadrants.items()}

    evt = CallProtectionEvent(
        session_id=session.id,
        event_type="TRANSCRIPT_ANALYZED",
        payload={
            "transcript_text": req.text,
            "quadrants": session.quadrants,
            "signals": session.signals,
            "verdict": scorer_res.verdict,
            "recommended_action": scorer_res.recommended_action
        },
        risk_score=session.threat_score,
        is_simulated=session.is_demo
    )
    db.add(evt)
    await db.commit()

    # Broadcast
    await manager.broadcast_json(session_id, {
        "event_type": "TRANSCRIPT_ANALYZED",
        "threat_score": session.threat_score,
        "threat_level": session.threat_level,
        "confidence": session.confidence,
        "quadrants": session.quadrants,
        "signals": session.signals,
        "verdict": scorer_res.verdict,
        "recommended_action": scorer_res.recommended_action,
        "is_simulated": session.is_demo
    })

    return {"status": "success", "threat_score": session.threat_score}


@router.post("/session/{session_id}/action", summary="Execute protective action on call")
async def execute_call_action(
    session_id: str,
    req: CallActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes real protective actions:
    - END_CALL: Sever inbound stream, persist session to ScanRecord history.
    - BLOCK_CALLER: Add phone number to carrier blacklist.
    - REPORT_FRAUD: Format telemetry packet for National Cybercrime Helpline (1930).
    - VERIFY_INDEPENDENTLY: Log independent directory routing.
    """
    result = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    action_type = req.action.upper()
    current_actions = list(session.actions_taken or [])
    if action_type not in current_actions:
        current_actions.append(action_type)
    session.actions_taken = current_actions

    if action_type == "END_CALL":
        session.status = "ENDED"
        session.ended_at = datetime.now(timezone.utc)

        # Synchronize into ScanRecord for review in History and Incidents
        # Only create if not already linked
        if not session.linked_scan_id:
            risk_tier = RiskLevel.LOW
            if session.threat_score >= 85.0:
                risk_tier = RiskLevel.CRITICAL
            elif session.threat_score >= 60.0:
                risk_tier = RiskLevel.HIGH
            elif session.threat_score >= 30.0:
                risk_tier = RiskLevel.MEDIUM

            scan_rec = ScanRecord(
                modality="AUDIO" if session.audio_analysis_status == "ACTIVE" else "MULTIMODAL",
                sender_info=session.phone_number,
                input_summary=f"Inbound call intercept from {session.phone_number}. Claimed identity: {session.claimed_identity or 'Unstated'}. Threat Score: {session.threat_score}/100.",
                risk_score=session.threat_score,
                risk_level=risk_tier.value,
                who_trusted=(session.verification_state == "VERIFIED"),
                what_communicated="Live voice interaction flagged with coercive deadlines and unverified carrier route.",
                requested_action="Requested disclosure of credentials / OTP and fund transfer.",
                overall_trust=TrustStatus.UNTRUSTED.value if session.threat_score >= 60.0 else TrustStatus.TRUSTED.value,
                signal_breakdown={
                    "identity_score": 40.0 if session.verification_state != "VERIFIED" else 0.0,
                    "intent_pressure_score": 35.0,
                    "media_synthetic_score": 30.0 if session.audio_analysis_status == "ACTIVE" else 0.0,
                    "link_reputation_score": 0.0
                },
                flags=[s.get("text") for s in (session.signals or [])],
                evidence=[s.get("detail") for s in (session.signals or [])],
                recommended_actions=[
                    "Stop sensitive action immediately and verify independently.",
                    "DO NOT share OTP, UPI PIN, or passwords under any circumstances."
                ],
                feedback="BLOCKED" if "BLOCK_CALLER" in current_actions else ("CONFIRMED_SCAM" if session.threat_score >= 80.0 else "PENDING"),
                notes=f"Call Protection session ID: {session.id}. Is simulated: {session.is_demo}."
            )
            db.add(scan_rec)
            await db.flush()
            session.linked_scan_id = scan_rec.id

    elif action_type == "BLOCK_CALLER":
        # Check if already in blocked list
        blk_check = await db.execute(select(BlockedCaller).where(BlockedCaller.phone_number == session.phone_number))
        if not blk_check.scalar_one_or_none():
            blk = BlockedCaller(
                phone_number=session.phone_number,
                reason=req.reason or f"Flagged by Call Protection Threat Score {session.threat_score}/100",
                source_session_id=session.id
            )
            db.add(blk)

    elif action_type == "REPORT_FRAUD":
        session.notes = (session.notes or "") + " | Dispatched to 1930 / cybercrime.gov.in."

    evt = CallProtectionEvent(
        session_id=session.id,
        event_type="USER_ACTION_TAKEN",
        payload={
            "action": action_type,
            "reason": req.reason,
            "actions_taken": current_actions
        },
        risk_score=session.threat_score,
        is_simulated=session.is_demo
    )
    db.add(evt)
    await db.commit()

    # Broadcast action taken to live stream
    await manager.broadcast_json(session_id, {
        "event_type": "USER_ACTION_TAKEN",
        "action": action_type,
        "actions_taken": current_actions,
        "status": session.status,
        "is_simulated": session.is_demo
    })

    return {
        "status": "success",
        "action": action_type,
        "session_status": session.status,
        "actions_taken": current_actions
    }


# ==============================================================================
# Live WebSockets & SSE Event Streams
# ==============================================================================

@router.websocket("/session/{session_id}/ws")
async def call_protection_websocket(websocket: WebSocket, session_id: str):
    """
    Live bidirectional WebSocket event stream for Call Protection.
    Emits continuous telemetric updates for caller ID, voice analysis,
    threat scores, and warning signals without page refreshes.
    """
    await manager.connect(session_id, websocket)
    
    # Check if session exists in DB
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
        session = res.scalar_one_or_none()

    if not session:
        await websocket.send_json({"error": "Session not found", "session_id": session_id})
        await websocket.close()
        return

    # Send current state snapshot
    await websocket.send_json({
        "event_type": "SESSION_SNAPSHOT",
        "session_id": session.id,
        "status": session.status,
        "phone_number": session.phone_number,
        "claimed_identity": session.claimed_identity,
        "threat_score": session.threat_score,
        "threat_level": session.threat_level,
        "confidence": session.confidence,
        "verification_state": session.verification_state,
        "carrier_info": session.carrier_info,
        "attestation": session.attestation,
        "reputation": session.reputation,
        "signals": session.signals,
        "quadrants": session.quadrants,
        "actions_taken": session.actions_taken,
        "is_demo": session.is_demo
    })

    demo_task = None
    if session.is_demo and session.status == "ACTIVE":
        # Launch demo simulator in background for this stream
        async def run_demo():
            try:
                async for event in CallDemoSimulator.generate_demo_event_stream(
                    session_id=session.id,
                    phone_number=session.phone_number,
                    claimed_identity=session.claimed_identity or "Bank Representative",
                    interval_seconds=2.0
                ):
                    # Persist event into database
                    async with AsyncSessionLocal() as inner_db:
                        sess_res = await inner_db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session.id))
                        active_sess = sess_res.scalar_one_or_none()
                        if not active_sess or active_sess.status == "ENDED":
                            break

                        active_sess.threat_score = event.get("threat_score", active_sess.threat_score)
                        active_sess.threat_level = event.get("threat_level", active_sess.threat_level)
                        if "confidence" in event:
                            active_sess.confidence = event["confidence"]
                        if "payload" in event and "quadrants" in event["payload"]:
                            active_sess.quadrants = event["payload"]["quadrants"]
                        if "payload" in event and "signals" in event["payload"]:
                            active_sess.signals = event["payload"]["signals"]

                        evt = CallProtectionEvent(
                            session_id=session.id,
                            event_type=event["event_type"],
                            payload=event["payload"],
                            risk_score=active_sess.threat_score,
                            is_simulated=True
                        )
                        inner_db.add(evt)
                        await inner_db.commit()

                    await manager.broadcast_json(session_id, event)
            except asyncio.CancelledError:
                pass
            except Exception as e:
                pass

        demo_task = asyncio.create_task(run_demo())

    try:
        while True:
            # Listen for incoming client telemetry
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # Handle client ping or telemetry actions
                if msg.get("type") == "PING":
                    await websocket.send_json({"type": "PONG", "timestamp": datetime.now(timezone.utc).isoformat()})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
        if demo_task and not demo_task.done():
            demo_task.cancel()


@router.get("/session/{session_id}/stream", summary="Server-Sent Events (SSE) live call stream")
async def call_protection_sse(session_id: str, db: AsyncSession = Depends(get_db)):
    """
    SSE fallback stream for environments with restricted WebSocket access.
    """
    result = await db.execute(select(CallProtectionSession).where(CallProtectionSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        # Emit initial session data
        initial_data = {
            "session_id": session.id,
            "threat_score": session.threat_score,
            "threat_level": session.threat_level,
            "verification_state": session.verification_state,
            "carrier_info": session.carrier_info,
            "quadrants": session.quadrants,
            "signals": session.signals,
            "is_simulated": session.is_demo
        }
        yield f"data: {json.dumps(initial_data)}\n\n"

        if session.is_demo and session.status == "ACTIVE":
            async for demo_evt in CallDemoSimulator.generate_demo_event_stream(
                session_id=session.id,
                phone_number=session.phone_number,
                claimed_identity=session.claimed_identity or "Bank Representative",
                interval_seconds=2.0
            ):
                yield f"data: {json.dumps(demo_evt)}\n\n"
        else:
            # Keep-alive heartbeat
            for _ in range(30):
                await asyncio.sleep(5)
                yield f"data: {json.dumps({'event_type': 'HEARTBEAT', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/blocked-callers", summary="List blocked caller numbers")
async def list_blocked_callers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlockedCaller).order_by(desc(BlockedCaller.created_at)))
    return result.scalars().all()


@router.delete("/blocked-callers/{phone_number}", summary="Unblock phone number")
async def unblock_caller(phone_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlockedCaller).where(BlockedCaller.phone_number == phone_number))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Blocked number not found")
    await db.delete(rec)
    await db.commit()
    return {"status": "success", "message": f"Number {phone_number} unblocked."}
