# VERITY — Multimodal AI Impersonation & Fraud Prevention (Backend)

**Team BIFROST**  
Nehru College of Engineering and Research Centre, Pampady  
Team Members: Fardeen K N, Siddharth S, Sreenadh J, Visal J  

---

## 📌 Project Overview

**VERITY** goes beyond traditional deepfake detection. Rather than simply asking *"Is the media fake?"*, VERITY evaluates:
1. **WHO is contacting you?** (Identity authentication, caller ID, domain spoofing check)
2. **WHAT is being communicated?** (Pretexts, artificial urgency, authority intimidation, fear triggers)
3. **WHAT are you being asked to do?** (OTP disclosure, financial wire transfer, downloading remote desktop tools)
4. **CAN THE INTERACTION BE TRUSTED?** (Multimodal correlation, weighted risk scoring, and actionable defensive guidance)

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Python 3.13 + **FastAPI** (asynchronous REST API with OpenAPI/Swagger docs)
- **AI / Cognitive Reasoning**: **Google Gemini API** (`gemini-2.5-flash` via official `google-genai` SDK)
- **Speech-to-Text & Audio Forensics**: Gemini Multimodal Audio & acoustic feature extraction
- **Rule-Based Detection Layer**: Deterministic regex matching for OTP traps, urgency keywords, remote desktop tools, utility disconnection scams, and digital arrest pretexts
- **Link & Phishing Engine**: `tldextract` heuristics, lookalike/typosquatting detection against major banking & institution domains, high-risk TLD checks
- **Risk Engine**: Multi-factor weighted fraud scoring matrix with hard escalation overrides
- **Database / Storage**: **SQLite** with asynchronous **SQLAlchemy 2.0** (`aiosqlite`)

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── analyze.py      # Unified multimodal master endpoint
│   │       │   ├── text.py         # Text, SMS, and WhatsApp message analysis
│   │       │   ├── audio.py        # Voice calls & synthetic voice forensics
│   │       │   ├── media.py        # Image, screenshot & deepfake analysis
│   │       │   ├── url.py          # Phishing & typosquatting domain analysis
│   │       │   └── incidents.py    # Incident history, feedback & dashboard stats
│   │       └── router.py           # API v1 route aggregator
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings (.env loader)
│   │   └── constants.py            # Risk tiers, scam keywords, known brand domains
│   ├── db/
│   │   ├── database.py             # SQLite async engine and sessionmaker
│   │   └── models.py               # SQLAlchemy ORM models (ScanRecord)
│   ├── schemas/
│   │   ├── analysis.py             # Pydantic request/response schemas (VerityResult)
│   │   └── incident.py             # Incident summary, detail, and stats schemas
│   ├── services/
│   │   ├── gemini_service.py       # Google Gemini multimodal integration & offline fallback
│   │   ├── stt_service.py          # Speech-to-text & acoustic analyzer
│   │   ├── rules_engine.py         # Rule-based regex fraud indicators
│   │   ├── link_checker.py         # Phishing & brand typosquatting checker
│   │   └── risk_engine.py          # Weighted scoring matrix & critical escalation logic
│   └── main.py                     # FastAPI application, CORS & database initialization
├── tests/
│   └── test_api.py                 # Pytest test suite covering all modalities
├── run.py                          # Development server launcher
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Activate the Virtual Environment
Windows (PowerShell):
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Note: If no API key is provided, the backend automatically runs in offline heuristic mode, ensuring complete development functionality without crashes).*

### 3. Run the Development Server
```powershell
python run.py
```
Or with uvicorn:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Server endpoints:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 🧪 Running Automated Tests

Run the test suite:
```powershell
pytest tests/ -v
```
All 8 automated tests validate:
- Bank Impersonation + OTP Request escalation to HIGH/CRITICAL (Slide 3)
- Benign text messages correctly categorized as LOW risk
- Fake banking URLs and typosquatted domains flagged
- Audio voice recording processing & synthetic flags
- Screenshot and image verification
- Unified multimodal analysis combining text + authority pressure + phishing links
- SQLite incident logging, stats aggregation, and user feedback

---

## 📊 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/analyze/text` | Analyze SMS, WhatsApp, chat text for urgency, OTP demands, and bank pretexting |
| `POST` | `/api/v1/analyze/audio` | Upload call recording or voice note (`.wav`, `.mp3`) for STT + synthetic voice detection |
| `POST` | `/api/v1/analyze/media` | Upload screenshots, ID cards, payment slips (`.png`, `.jpg`, `.mp4`) |
| `POST` | `/api/v1/analyze/url` | Check URLs for typosquatting, high-risk TLDs, and credential harvesting paths |
| `POST` | `/api/v1/analyze/multimodal` | Unified master endpoint accepting text, media file, caller ID, and URLs in one call |
| `GET` | `/api/v1/incidents` | Retrieve scan history with filters (`risk_level`, `modality`, pagination) |
| `GET` | `/api/v1/incidents/{scan_id}` | Fetch full forensic breakdown and evidence for a specific scan |
| `POST` | `/api/v1/incidents/{scan_id}/feedback` | Submit validation feedback (`CONFIRMED_SCAM`, `FALSE_ALARM`) |
| `GET` | `/api/v1/incidents/stats` | Aggregated dashboard statistics (Total scans, Critical count, Top scam flags) |
| `GET` | `/healthz` | Service health status |

---

## ⚖️ Risk Scoring Matrix

The risk engine computes a normalized score ($0.0 - 100.0$):

$$RiskScore = (0.25 \times S_{identity}) + (0.35 \times S_{intent}) + (0.20 \times S_{synthetic}) + (0.20 \times S_{link})$$

### Critical Escalation Invariants:
1. **Bank Impersonation + OTP / PIN Request**: Automatically escalates to $\ge 88.0$ (`CRITICAL`).
2. **AI Voice + Bank Impersonation**: Escalates to $\ge 78.0$ (`HIGH`).
3. **Law Enforcement / "Digital Arrest" Pretext**: Escalates to $\ge 80.0$ (`HIGH` / `CRITICAL`).
4. **Brand Lookalike / Typosquatting + Credential Trap**: Escalates to $\ge 92.0$ (`CRITICAL`).
5. **Remote Access Software Solicitation (AnyDesk/TeamViewer)**: Escalates to $\ge 85.0$ (`CRITICAL`).
