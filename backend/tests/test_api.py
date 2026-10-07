import io
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_healthz(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_text_analysis_bank_otp_scam(client):
    """
    Validates Slide 3 scenario:
    Bank Impersonation + Urgency + OTP Request -> HIGH / CRITICAL Risk
    Recommended Action: Stop Sensitive Action and Verify Independently
    """
    payload = {
        "content": "Dear customer, your SBI bank account is suspended immediately. Please share your 6-digit OTP code to reactivate your card.",
        "sender_identity": "SBI-ALERT-URGENT",
        "sender_channel": "SMS",
        "claimed_organization": "State Bank of India"
    }

    response = client.post("/api/v1/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "scan_id" in data
    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert data["risk_score"] >= 75.0
    assert data["evaluation"]["who_trusted"] is False
    assert any("OTP" in f or "BANK" in f for f in data["flags"])

    # Check recommended action contains warning
    actions_text = " ".join(data["recommended_actions"]).lower()
    assert "stop sensitive action" in actions_text or "verify independently" in actions_text or "otp" in actions_text


def test_text_analysis_safe_message(client):
    payload = {
        "content": "Hey Siddharth, let's meet tomorrow at 10 AM at the college library for the project discussion.",
        "sender_identity": "+919876543210",
        "sender_channel": "WhatsApp"
    }

    response = client.post("/api/v1/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["risk_level"] == "LOW"
    assert data["risk_score"] < 40.0
    assert data["evaluation"]["who_trusted"] is True


def test_url_analysis_brand_typosquatting(client):
    payload = {
        "url": "http://hdfc-verify-kyc-alert.top/login",
        "target_brand": "HDFC Bank"
    }

    response = client.post("/api/v1/analyze/url", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert any("BRAND_TYPOSQUATTING" in flag or "HIGH_RISK_TLD" in flag for flag in data["flags"])


def test_audio_analysis_endpoint(client):
    fake_audio = io.BytesIO(b"RIFF....WAVEfmt ....data....")
    response = client.post(
        "/api/v1/analyze/audio",
        files={"file": ("call_sample.wav", fake_audio, "audio/wav")},
        data={"caller_info": "+919876543210", "claimed_organization": "Customer Support"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["modality"] == "AUDIO"
    assert "signal_breakdown" in data


def test_media_analysis_endpoint(client):
    fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4")
    response = client.post(
        "/api/v1/analyze/media",
        files={"file": ("fake_slip.png", fake_image, "image/png")},
        data={"caption": "Transfer confirmation receipt", "claimed_source": "Bank Receipt"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["modality"] == "IMAGE"


def test_multimodal_analysis_endpoint(client):
    response = client.post(
        "/api/v1/analyze/multimodal",
        data={
            "message_text": "Your electricity connection will be disconnected tonight by police order unless you pay via link immediately.",
            "sender_identity": "+919999888877",
            "url": "http://electricity-bill-pay.xyz"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert any("HIGH_RISK_TLD" in f or "URGENCY" in f for f in data["flags"])


def test_incidents_listing_and_stats(client):
    # Test stats endpoint
    stats_resp = client.get("/api/v1/incidents/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "total_scans" in stats
    assert stats["total_scans"] >= 3

    # Test incident list
    list_resp = client.get("/api/v1/incidents?limit=10")
    assert list_resp.status_code == 200
    incidents = list_resp.json()
    assert len(incidents) >= 3
    first_id = incidents[0]["id"]

    # Test feedback submission
    feedback_resp = client.post(f"/api/v1/incidents/{first_id}/feedback", json={
        "feedback": "CONFIRMED_SCAM",
        "notes": "Verified fraudulent sender number"
    })
    assert feedback_resp.status_code == 200


def test_signal_scoring_endpoint(client):
    payload = {
        "caller_identity_anomaly": 45.0,
        "audio_synthetic_score": 75.0,
        "semantic_urgency_score": 80.0,
        "url_threat_score": 0.0,
        "requests_otp_or_credentials": True,
        "claims_bank_or_authority": True
    }
    response = client.post("/api/v1/analyze/signals", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["risk_level"] in ("HIGH", "CRITICAL")
    assert data["risk_score"] >= 85.0
    assert "OTP_CREDENTIAL_SOLICITATION" in data["flags"]
    assert "BANK_IMPERSONATION_RISK" in data["flags"]
    assert "SYNTHETIC_VOICE_ARTIFACTS" in data["flags"]
    assert data["signal_breakdown"]["media_synthetic_score"] == 75.0
    assert data["signal_breakdown"]["intent_pressure_score"] == 80.0


def test_caller_id_verification_unverified(client):
    """
    Never claim a caller is verified without authenticated evidence.
    Standard mobile number with no authority claims returns UNVERIFIED.
    """
    res = client.post("/api/v1/call-protection/verify-caller", json={
        "phone_number": "+91 98401 24590",
        "demo_mode": False
    })
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid_format"] is True
    assert data["verification_state"] == "UNVERIFIED"
    assert "Bharti Airtel" in data["carrier"] or "Airtel" in data["carrier"]
    assert data["country"] == "India"
    assert data["is_simulated"] is False


def test_caller_id_verification_high_risk_impersonation(client):
    """
    When personal mobile number claims to be Bank or Police,
    it must be classified as HIGH RISK / SUSPICIOUS.
    """
    res = client.post("/api/v1/call-protection/verify-caller", json={
        "phone_number": "+91 98401 24590",
        "claimed_identity": "HDFC Bank Fraud Department",
        "demo_mode": False
    })
    assert res.status_code == 200
    data = res.json()
    assert data["verification_state"] == "HIGH RISK"
    assert data["claimed_identity_match"] is False
    assert len(data["spoofing_indicators"]) > 0


def test_call_protection_session_lifecycle_and_actions(client):
    """
    Full live call protection flow:
    Create session -> Ingest telemetry -> Execute actions -> Terminate and synchronize history
    """
    # 1. Start protection session
    start_resp = client.post("/api/v1/call-protection/session/start", json={
        "phone_number": "+91 98401 24590",
        "claimed_identity": "State Bank of India Officer",
        "demo_mode": False
    })
    assert start_resp.status_code == 200
    session_data = start_resp.json()
    sess_id = session_data["id"]
    assert session_data["status"] == "ACTIVE"
    assert session_data["threat_score"] >= 40.0

    # 2. Ingest audio telemetry (synthetic vocoder flagged)
    audio_resp = client.post(f"/api/v1/call-protection/session/{sess_id}/audio-telemetry", json={
        "is_synthetic": True,
        "synthetic_score": 91.0,
        "pitch_jitter": 91.0,
        "vocoder_detected": True
    })
    assert audio_resp.status_code == 200

    # 3. Ingest transcript (urgency + OTP solicit)
    transcript_resp = client.post(f"/api/v1/call-protection/session/{sess_id}/transcript", json={
        "text": "Urgent! Your account is blocked immediately. Please share your 6-digit OTP code to avoid arrest."
    })
    assert transcript_resp.status_code == 200
    assert transcript_resp.json()["threat_score"] >= 80.0

    # 4. Check session details
    sess_detail = client.get(f"/api/v1/call-protection/session/{sess_id}").json()
    assert sess_detail["threat_level"] == "HIGH RISK"
    assert sess_detail["quadrants"]["request"]["state"] == "Critical"
    assert sess_detail["quadrants"]["voice"]["state"] == "AI Clone"
    assert len(sess_detail["signals"]) >= 3

    # 5. Check events log
    evts_resp = client.get(f"/api/v1/call-protection/session/{sess_id}/events")
    assert evts_resp.status_code == 200
    events = evts_resp.json()
    assert len(events) >= 3

    # 6. Block caller
    block_resp = client.post(f"/api/v1/call-protection/session/{sess_id}/action", json={
        "action": "BLOCK_CALLER",
        "reason": "AI clone bank impersonator"
    })
    assert block_resp.status_code == 200
    assert "BLOCK_CALLER" in block_resp.json()["actions_taken"]

    # Verify blocked list
    blocked_list = client.get("/api/v1/call-protection/blocked-callers").json()
    assert any(b["phone_number"] == "+91 98401 24590" for b in blocked_list)

    # 7. Report fraud
    report_resp = client.post(f"/api/v1/call-protection/session/{sess_id}/action", json={
        "action": "REPORT_FRAUD"
    })
    assert report_resp.status_code == 200
    assert "REPORT_FRAUD" in report_resp.json()["actions_taken"]

    # 8. End call immediately
    end_resp = client.post(f"/api/v1/call-protection/session/{sess_id}/action", json={
        "action": "END_CALL"
    })
    assert end_resp.status_code == 200
    assert end_resp.json()["session_status"] == "ENDED"

    # Verify session is ended and persisted to ScanRecord
    final_sess = client.get(f"/api/v1/call-protection/session/{sess_id}").json()
    assert final_sess["status"] == "ENDED"

    # Cleanup unblock
    client.delete("/api/v1/call-protection/blocked-callers/+91 98401 24590")


def test_copilot_chat_endpoint(client):
    """
    Test AI Copilot endpoint answers custom user questions.
    """
    resp = client.post("/api/v1/copilot/chat", json={
        "message": "Someone called claiming to be CBI officer and said I am in digital arrest. What should I do?",
        "history": []
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert len(data["reply"]) > 50
    assert "digital arrest" in data["reply"].lower() or "cbi" in data["reply"].lower() or "verity" in data["reply"].lower()
    assert isinstance(data.get("suggested_actions"), list)



