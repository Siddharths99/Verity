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
