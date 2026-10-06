import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, Optional

from app.services.caller_id_adapter import SimulatedTelecomCallerIdProvider
from app.services.call_threat_scorer import CallThreatScorer


class CallDemoSimulator:
    """
    Asynchronous event generator for explicit DEMO MODE.
    Provides realistic, sequential forensic events for an incoming call scam scenario.
    All data is rigorously stamped with is_simulated=True and simulation_notice.
    Never presents simulated detection as real detection.
    """

    @classmethod
    async def generate_demo_event_stream(
        cls,
        session_id: str,
        phone_number: str = "+91 98401 24590",
        claimed_identity: str = "Bank Representative",
        interval_seconds: float = 2.0
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Yields chronological live events for the demo call protection session.
        """
        # Event 1: CALL_INITIATED
        yield {
            "session_id": session_id,
            "event_type": "CALL_INITIATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_simulated": True,
            "simulation_notice": "DEMO / SIMULATED EVENT STREAM",
            "payload": {
                "phone_number": phone_number,
                "claimed_identity": claimed_identity,
                "call_status": "RINGING",
                "message": "Incoming call detected on monitored intercept channel"
            },
            "threat_score": 10.0,
            "threat_level": "TRUSTED"
        }

        await asyncio.sleep(interval_seconds)

        # Event 2: CALLER_ID_VERIFIED
        caller_provider = SimulatedTelecomCallerIdProvider()
        caller_meta = await caller_provider.verify(phone_number, claimed_identity)

        yield {
            "session_id": session_id,
            "event_type": "CALLER_ID_VERIFIED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_simulated": True,
            "simulation_notice": "DEMO / SIMULATED TELECOM DATA",
            "payload": {
                "caller_id": caller_meta.model_dump(),
                "verification_state": caller_meta.verification_state,
                "message": "Carrier STIR/SHAKEN Level A cryptographic attestation header absent"
            },
            "threat_score": 45.0,
            "threat_level": "CAUTION"
        }

        await asyncio.sleep(interval_seconds)

        # Event 3: AUDIO_TELEMETRY_UPDATED
        audio_telemetry = {
            "is_synthetic": True,
            "synthetic_score": 91.0,
            "pitch_jitter": 91.0,
            "vocoder_detected": True,
            "breath_cadence": "None (unnatural)"
        }

        scorer_res_3 = CallThreatScorer.calculate_score(
            caller_id_result=caller_meta,
            audio_telemetry=audio_telemetry,
            audio_available=True
        )

        yield {
            "session_id": session_id,
            "event_type": "AUDIO_TELEMETRY_UPDATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_simulated": True,
            "simulation_notice": "DEMO / SIMULATED AUDIO FORENSICS",
            "payload": {
                "audio_status": "ACTIVE",
                "audio_telemetry": audio_telemetry,
                "quadrants": {k: v.model_dump() for k, v in scorer_res_3.quadrants.items()},
                "signals": [s.model_dump() for s in scorer_res_3.signals],
                "message": "Vocoder formant anomalies (91%) & absence of natural breath pauses flagged"
            },
            "threat_score": scorer_res_3.score,
            "threat_level": scorer_res_3.level,
            "confidence": scorer_res_3.confidence
        }

        await asyncio.sleep(interval_seconds)

        # Event 4: TRANSCRIPT_COERCION_DETECTED
        transcript_snippet_1 = (
            "This is an urgent call regarding your bank account. Immediate action required. "
            "Your account will be suspended within 30 minutes due to irregular activities."
        )

        scorer_res_4 = CallThreatScorer.calculate_score(
            caller_id_result=caller_meta,
            transcript_text=transcript_snippet_1,
            audio_telemetry=audio_telemetry,
            audio_available=True
        )

        yield {
            "session_id": session_id,
            "event_type": "TRANSCRIPT_ANALYZED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_simulated": True,
            "simulation_notice": "DEMO / SIMULATED NLP EXTRACTION",
            "payload": {
                "transcript_snippet": transcript_snippet_1,
                "urgency_detected": True,
                "quadrants": {k: v.model_dump() for k, v in scorer_res_4.quadrants.items()},
                "signals": [s.model_dump() for s in scorer_res_4.signals],
                "message": "High-pressure coercive deadlines framing imminent account suspension"
            },
            "threat_score": scorer_res_4.score,
            "threat_level": scorer_res_4.level,
            "confidence": scorer_res_4.confidence
        }

        await asyncio.sleep(interval_seconds)

        # Event 5: CRITICAL_ACTION_SOLICITED (Escalate to 94 / 100 HIGH RISK)
        full_transcript = (
            "We need to secure your funds now. Please share the 6-digit OTP code sent to your mobile "
            "and authorize the wire transfer to our temporary security escrow vault immediately."
        )

        scorer_res_5 = CallThreatScorer.calculate_score(
            caller_id_result=caller_meta,
            transcript_text=full_transcript,
            audio_telemetry=audio_telemetry,
            audio_available=True
        )

        yield {
            "session_id": session_id,
            "event_type": "THREAT_SCORE_UPDATED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_simulated": True,
            "simulation_notice": "DEMO / SIMULATED CRITICAL ESCALATION",
            "payload": {
                "transcript_snippet": full_transcript,
                "quadrants": {k: v.model_dump() for k, v in scorer_res_5.quadrants.items()},
                "signals": [s.model_dump() for s in scorer_res_5.signals],
                "verdict": scorer_res_5.verdict,
                "verdict_badge": scorer_res_5.verdict_badge,
                "recommended_action": scorer_res_5.recommended_action,
                "protective_protocol_triggered": True,
                "message": "High Financial Fraud Exposure: Urgent verbal coercion demanding OTP passcode & fund transfer"
            },
            "threat_score": scorer_res_5.score,
            "threat_level": scorer_res_5.level,
            "confidence": scorer_res_5.confidence
        }
