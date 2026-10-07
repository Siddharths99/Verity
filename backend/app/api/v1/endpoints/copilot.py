import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.services.gemini_service import GeminiService

logger = logging.getLogger("verity.copilot")
router = APIRouter()
gemini_service = GeminiService()


class ChatMessage(BaseModel):
    sender: str  # "user" or "assistant"
    text: str


class CopilotChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[Dict[str, Any]] = None


class SuggestedAction(BaseModel):
    label: str
    modality: str  # "call" | "voice" | "message" | "media" | "url"


class CopilotChatResponse(BaseModel):
    reply: str
    suggested_actions: List[SuggestedAction] = []
    model_used: str = "gemini"
    is_simulated: bool = False


SYSTEM_PROMPT = """You are the VERITY AI Security Copilot — an expert cybersecurity, fraud mitigation, and deepfake intelligence specialist.
VERITY is a multi-modal zero-trust fraud prevention platform that protects citizens and organizations from:
- AI Voice Cloning and synthetic speech attacks
- Telecom spoofing and fraudulent phone calls (STIR/SHAKEN attestation, carrier inspection)
- Phishing SMS, WhatsApp extortion, and "Digital Arrest" scams (impersonating Police, CBI, ED, Customs, Telecom Regulatory Authority)
- Malicious links, unicode homograph domains, and credential harvesting
- Deepfake images and synthetic video blackmail

Instructions:
1. Directly and thoroughly answer the user's specific question, concern, or scenario.
2. Break down attacker tactics, psychological pressure, or technology involved.
3. Provide concrete, step-by-step, zero-trust defensive actions (what to do right now).
4. If appropriate, suggest relevant VERITY tools: Call Protection, Voice Forensic Scan, Message Check, or Reporting to National Cyber Crime Helpline (1930 / cybercrime.gov.in).
5. Format your response cleanly using GitHub-style markdown (bolding, clear bullet points, concise sections). Keep your tone calm, authoritative, and helpful."""


def generate_expert_fallback_response(query: str) -> Dict[str, Any]:
    """
    Comprehensive multi-intent cybersecurity and fraud advisor fallback.
    Directly answers specific user questions, scenarios, incident response,
    and VERITY platform capabilities with actionable, zero-trust advice.
    """
    lower = query.lower().strip()
    suggested_actions = []

    # 1. Digital Arrest / Law Enforcement / Customs / CBI / Narcotics Pretext
    if any(k in lower for k in ["digital arrest", "cbi", "police", "customs", "courier", "fedex", "dhl", "parcel", "narcotics", "mumbai police", "court", "arrest warrant", "ed ", "enforcement directorate"]):
        reply = (
            "### 🚨 Digital Arrest & Impersonation Extortion Advisory\n\n"
            "**Official Fact**: **There is NO legal concept of 'Digital Arrest' anywhere in India or internationally.**\n\n"
            "Neither the Police, CBI, Customs, ED, nor judicial authorities ever conduct interrogations, make arrests, issue digital summons, or demand 'verification deposits' via WhatsApp, Skype, Zoom, or cellular calls.\n\n"
            "**How This Attack Works:**\n"
            "1. **False Pretext**: Scammers claim a package with contraband (drugs, fake passports, multiple ATM cards) addressed to you was seized at Customs, or your Aadhaar/phone was flagged in a money laundering case.\n"
            "2. **Psychological Coercion**: They use forged digital letterheads, police uniforms, and fake police station video backdrops, demanding you remain on video call without speaking to family or lawyers.\n"
            "3. **Financial Extortion**: They order you to transfer your bank balance to a 'Secret RBI Verification Account' or 'Court Clearance Account'.\n\n"
            "**Immediate Action Steps:**\n"
            "1. **Hang up the call immediately.** Do not argue or attempt to explain.\n"
            "2. **Never send any money.** No authentic authority requests money transfers for verification.\n"
            "3. **Report to National Cyber Crime Portal**: Dial **1930** or file at **cybercrime.gov.in** immediately.\n"
            "4. **Block the caller number** across your carrier and add it to VERITY's Blocklist."
        )
        suggested_actions = [
            {"label": "📞 Inspect Inbound Number in Call Protection", "modality": "call"},
            {"label": "⚠️ Report Incident to 1930 Helpline", "modality": "message"}
        ]

    # 2. Voice Cloning / Audio Deepfakes / Kidnapping / Family Emergency Calls
    elif any(k in lower for k in ["voice clone", "cloned voice", "ai voice", "deepfake voice", "synthetic audio", "mimic voice", "kidnap", "family emergency", "fake audio", "voice note"]):
        reply = (
            "### 🎙️ AI Voice Cloning & Audio Deepfake Countermeasures\n\n"
            "**How Attackers Clone Voices:**\n"
            "Modern generative neural vocoders can replicate a vocal timbre, pitch cadence, and accent from just **3 to 5 seconds** of clean audio extracted from social media clips, Reels, or voicemail greetings.\n\n"
            "**Key Acoustic Anomalies Detected by VERITY:**\n"
            "• **Vocoder Pitch Formants**: Micro-robotic stuttering and unnatural harmonic stitching at phoneme transitions.\n"
            "• **Loss of Natural Jitter**: Human vocal cords have organic micro-variations that AI speech synthesizers smooth out.\n"
            "• **Room Acoustic Mismatch**: Synthetic voices lack natural room reverberation, ambient breath pauses, and realistic background sound reflections.\n\n"
            "**Zero-Trust Defense Protocol:**\n"
            "1. **Establish a Secret Family Safe Word**: A private verbal phrase that cannot be scraped online.\n"
            "2. **Out-of-Band Callback**: Hang up immediately and call the individual back on their verified primary phone number, never on the calling channel.\n"
            "3. **Submit Recording**: Upload the audio memo to VERITY's **Voice Scan** tool to inspect spectral discontinuities."
        )
        suggested_actions = [
            {"label": "🎙️ Run Voice Forensic Scan", "modality": "voice"},
            {"label": "📞 Launch In-Call Protection", "modality": "call"}
        ]

    # 3. Deepfake Video / Video Calls / Face Swap / Video Blackmail
    elif any(k in lower for k in ["deepfake video", "face swap", "synthetic video", "video call", "video scam", "blackmail", "webcam", "sextortion", "nude", "morph"]):
        reply = (
            "### 📹 Deepfake Video & Synthetic Media Defense\n\n"
            "**How Video Deepfakes Operate:**\n"
            "Attackers use real-time generative adversarial networks (GANs) and diffusion models to swap faces or animate facial features during live video calls or create synthetic compromising footage for extortion.\n\n"
            "**Visual Markers to Look For:**\n"
            "• **Facial Boundary Blending**: Blurring, color mismatches, or pixel artifacts around the jawline, ears, and hairline.\n"
            "• **Unnatural Eye & Blink Dynamics**: Irregular blinking frequency, lack of synchronous micro-saccades, and flat light reflections in pupils.\n"
            "• **Head Turning Anomalies**: When the person turns sideways or passes their hand in front of their face, the mask will briefly glitch or warp.\n\n"
            "**Protective Protocol:**\n"
            "1. **Challenge on Video**: Ask the caller to turn their head 90 degrees or wave their hand across their face; real-time video masks will distort.\n"
            "2. **Do Not Pay Extortion**: Complying with blackmail demands guarantees repeated demands. Cease all contact immediately.\n"
            "3. **Preserve Evidence & Report**: Capture screen recordings and report immediately to **1930 / cybercrime.gov.in**."
        )
        suggested_actions = [
            {"label": "🎬 Inspect Video in Media Scanner", "modality": "media"},
            {"label": "⚠️ Report Blackmail to Cybercrime", "modality": "message"}
        ]

    # 4. Compromised Incident Response ("I already sent money", "I gave OTP", "I clicked link")
    elif any(k in lower for k in ["already sent", "already paid", "gave otp", "gave my otp", "clicked the link", "transferred money", "scammed", "hacked", "lost money", "compromised"]):
        reply = (
            "### 🚨 EMERGENCY COMPROMISE RESPONSE CHECKLIST (Act Immediately)\n\n"
            "**Every minute counts during a financial or credential incident. Execute these steps right now:**\n\n"
            "1. **Contact Your Bank Emergency Hotline Immediately (Golden Hour)**:\n"
            "   • Request an immediate **emergency freeze on all debits, UPI IDs, credit/debit cards, and NetBanking**.\n"
            "   • Report the beneficiary account details and transaction reference number (UTR/Txn ID).\n"
            "2. **Dial 1930 (National Cyber Crime Reporting Helpline)**:\n"
            "   • The Indian Citizen Financial Cyber Fraud Reporting System can freeze fraudulent mule accounts across Indian banks if reported quickly.\n"
            "3. **Change All Passwords from a Clean Device**:\n"
            "   • Immediately change your primary email, banking passwords, and revoke active sessions.\n"
            "4. **Disconnect Compromised Devices**:\n"
            "   • If an APK or remote tool was installed, immediately turn on **Airplane Mode** to prevent data exfiltration.\n"
            "5. **Save All Evidence**: Screenshot SMS messages, transaction IDs, phone numbers, and WhatsApp chats for the police FIR."
        )
        suggested_actions = [
            {"label": "⚠️ Document Incident in Ledger", "modality": "message"},
            {"label": "📞 Dial 1930 Helpline Assistance", "modality": "call"}
        ]

    # 5. Malicious APK / Android Trojan / Screen Share / AnyDesk / WhatsApp Malware
    elif any(k in lower for k in ["apk", "download app", "install app", "anydesk", "teamviewer", "rustdesk", "quicksupport", "screen share", "trojan", "malware", "virus"]):
        reply = (
            "### ⚠️ Malicious APK & Remote Access Trojan Warning\n\n"
            "**The Threat:**\n"
            "Scammers send direct `.apk` files or instruct you to download remote support tools (AnyDesk, TeamViewer, RustDesk) under pretexts like 'Bill Update', 'Bank KYC', or 'Courier Redelivery'.\n\n"
            "**Technical Impact:**\n"
            "• **SMS & OTP Interception**: Sideloaded APKs obtain accessibility and SMS permissions to silently read 2FA codes.\n"
            "• **Screen Mirroring**: Remote support apps let attackers view your banking credentials, UPI PIN, and balance in real-time.\n\n"
            "**Immediate Action Protocol:**\n"
            "1. **NEVER install `.apk` files sent over messaging channels.** Legitimate institutions only publish to Google Play Store / Apple App Store.\n"
            "2. **If Installed: Enable Airplane Mode Instantly**: Cut off cellular data and Wi-Fi to sever the attacker's command-and-control connection.\n"
            "3. **Boot in Safe Mode & Uninstall**: Remove the rogue app under *Settings > Apps > Manage Apps*.\n"
            "4. **Revoke Remote Access Permissions**: Uninstall any remote sharing software immediately."
        )
        suggested_actions = [
            {"label": "⚠️ Scan Suspicious Message & Link", "modality": "message"},
            {"label": "🔗 Analyze Download Link in Sandbox", "modality": "url"}
        ]

    # 6. Utility Bill / Electricity Disconnection / Gas / Water Pretext
    elif any(k in lower for k in ["electricity", "power cutoff", "bill", "disconnected", "disconnection tonight", "water bill", "gas agency", "meter"]):
        reply = (
            "### ⚡ Electricity Bill Disconnection Scam Alert\n\n"
            "**The Scam Scenario:**\n"
            "You receive an SMS: *'Dear Customer, your electricity power will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Please call Electricity Officer at 98XXXXXX immediately.'*\n\n"
            "**The Trap:**\n"
            "When you call, the fake officer instructs you to pay ₹10 or download an app for bill reconciliation. This gives them remote access or captures your card credentials.\n\n"
            "**The Truth:**\n"
            "• State electricity boards **never** send disconnection notices from standard 10-digit mobile numbers; authentic notices come from official government SMS headers (e.g., `AD-TNEB`, `VM-BESCOM`, `VK-MAHAVITARAN`).\n"
            "• Disconnections require formal statutory written notices, not same-night threats.\n\n"
            "**Defensive Steps:**\n"
            "1. Do not call the number listed in the SMS.\n"
            "2. Check your balance directly on your official state electricity board app or website.\n"
            "3. Block and report the fraudulent sender number."
        )
        suggested_actions = [
            {"label": "⚠️ Scan Message Content in VERITY", "modality": "message"},
            {"label": "📞 Inspect Caller ID in Call Protection", "modality": "call"}
        ]

    # 7. Bank Account Blocked / KYC Expiry / Credit Card Points / NetBanking Alert
    elif any(k in lower for k in ["kyc", "account blocked", "account suspended", "pan card", "credit card", "reward points", "debit card", "sbi", "hdfc", "icici", "axis", "pnb"]):
        reply = (
            "### 🏦 Bank Account Suspension & KYC Phishing Alert\n\n"
            "**The Pretext:**\n"
            "Messages claiming: *'Your HDFC/SBI account has been blocked today due to pending PAN KYC. Update immediately at [fake link] to avoid permanent closure.'*\n\n"
            "**Zero-Trust Reality:**\n"
            "• Banks **never** provide links in SMS to update KYC or link PAN cards.\n"
            "• The links lead to deceptive credential-harvesting phishing portals designed to clone the bank's login UI.\n\n"
            "**What You Should Do:**\n"
            "1. **Never click the link in the message.**\n"
            "2. Log in only via your official banking app installed from the verified app store or type your bank's URL directly into your browser.\n"
            "3. If in doubt, call your relationship manager or branch using the number printed on the back of your debit card.\n"
            "4. Forward the phishing SMS to **1909** (Do Not Disturb reporting) and the cyber helpline."
        )
        suggested_actions = [
            {"label": "🔗 Inspect Phishing Link in Sandbox", "modality": "url"},
            {"label": "⚠️ Analyze SMS Text in Message Scanner", "modality": "message"}
        ]

    # 8. Work from Home / YouTube Likes / Telegram Task / Part-Time Job Scams
    elif any(k in lower for k in ["part time", "job offer", "work from home", "youtube like", "like and subscribe", "telegram task", "daily income", "crypto investment", "trading profit"]):
        reply = (
            "### 💼 Part-Time Job & 'Task Completion' Investment Fraud\n\n"
            "**How the Scheme Unfolds (Task / Pig Butchering Scam):**\n"
            "1. **Bait**: You receive an unsolicited WhatsApp or Telegram message offering ₹2,000–₹10,000 daily for liking YouTube videos, reviewing hotels, or rating Google Maps locations.\n"
            "2. **Initial Payoff**: They pay you a small real amount (₹150–₹500) to build trust and lower your guard.\n"
            "3. **The Trap (Prepaid Tasks)**: They add you to a VIP Telegram group and ask you to invest ₹5,000 to earn ₹8,000, then ₹50,000 to earn ₹80,000.\n"
            "4. **The Exit**: When you try to withdraw your funds, they freeze your 'account' and demand a 30% tax clearance deposit before disappearing completely.\n\n"
            "**Defensive Actions:**\n"
            "• No legitimate enterprise hires employees over anonymous Telegram channels to click like buttons.\n"
            "• Never send money to 'earn' money back from tasks.\n"
            "• Exit and block the group immediately."
        )
        suggested_actions = [
            {"label": "⚠️ Analyze Message in VERITY Scanner", "modality": "message"},
            {"label": "🔗 Check Telegram Link in URL Sandbox", "modality": "url"}
        ]

    # 9. OTP / 2FA / Passcode / PIN Protection
    elif any(k in lower for k in ["otp", "mfa", "2fa", "passcode", "cvv", "atm pin", "password", "security code"]):
        reply = (
            "### 🔒 Golden Rule: OTP & Authentication Passcode Security\n\n"
            "**Absolute Zero-Trust Rule**: **Legitimate banks, telecom operators, government entities, and support teams NEVER ask for OTPs, CVVs, or passwords over the phone or chat.**\n\n"
            "**Common OTP Theft Excuses:**\n"
            "• *'I am bank fraud control. Read the 6-digit code to cancel an unauthorized transaction.'* (The code is actually authorizing the transaction!)\n"
            "• *'Share OTP to verify delivery of your courier.'*\n"
            "• *'Provide code to upgrade your SIM to 5G without interruption.'*\n\n"
            "**Defensive Protocol:**\n"
            "• Read the SMS carefully: does it say *'OTP for transaction of ₹...' * or *'OTP for NetBanking registration'*? Disclosing it grants instant access to your funds.\n"
            "• If pressured, disconnect the call immediately."
        )
        suggested_actions = [
            {"label": "⚠️ Scan Suspicious Request in Message Tool", "modality": "message"}
        ]

    # 10. STIR/SHAKEN / Telecom Spoofing / Caller ID Verification
    elif any(k in lower for k in ["stir", "shaken", "spoof", "caller id", "fake number", "voip", "attestation"]):
        reply = (
            "### 📞 STIR/SHAKEN Telecom Attestation & Spoofing Defense\n\n"
            "**What STIR/SHAKEN Means:**\n"
            "STIR/SHAKEN is the cryptographic telecom framework that validates whether incoming caller IDs are authentic or spoofed:\n\n"
            "• **Level A (Full Attestation)**: The originating carrier verifies the caller's identity AND confirms they own the rights to display that phone number (Legitimate).\n"
            "• **Level B (Partial Attestation)**: The carrier knows who is calling, but cannot verify if they own the caller ID displayed (Elevated Risk).\n"
            "• **Level C (Gateway Attestation)**: The call originated outside verified carrier routes, such as international VoIP gateways or unregulated SIP trunks (**Highest Spoofing Risk**).\n\n"
            "**How VERITY Helps:**\n"
            "VERITY inspects SIP routing telemetry and caller carrier reputation in real-time, alerting you before you pick up."
        )
        suggested_actions = [
            {"label": "📞 Launch In-Call Protection Session", "modality": "call"}
        ]

    # 11. Homograph / Punycode / URL & Link Phishing
    elif any(k in lower for k in ["url", "link", "homograph", "punycode", "domain", "fake website", "phishing site", "ssl"]):
        reply = (
            "### 🔗 Homograph Attacks & Malicious URL Detection\n\n"
            "**How Homograph Spoofing Works:**\n"
            "Attackers register domains using internationalized characters that look identical to regular letters (e.g., Cyrillic 'а' instead of Latin 'a', so `chаse.com` renders identically but routes to `xn--chse-43d.com`).\n\n"
            "**Key Indicators Inspected by VERITY URL Sandbox:**\n"
            "• **Punycode Decompilation**: Exposes hidden Cyrillic/Greek Unicode homoglyphs.\n"
            "• **SSL Issuer & Domain Age**: Flags domains registered within the last 14–30 days with free automated certificates.\n"
            "• **Credential Harvest Traps**: Checks for forged password input fields and spoofed bank branding.\n\n"
            "**Action**: Paste any suspicious URL into VERITY's **URL Scanner** to safely inspect it in an isolated sandbox without opening it on your device."
        )
        suggested_actions = [
            {"label": "🔗 Scan URL in VERITY Sandbox", "modality": "url"}
        ]

    # 12. VERITY Platform Capabilities / Features / How it Works
    elif any(k in lower for k in ["what is verity", "how does verity work", "features", "how to use", "audit log", "score", "risk score", "who made", "free"]):
        reply = (
            "### 🛡️ VERITY Zero-Trust Multimodal Fraud Defense\n\n"
            "**VERITY** is a free, citizen-focused multi-modal security platform engineered to defeat modern AI-driven impersonation and fraud:\n\n"
            "**The 4-Pillar Verification Model:**\n"
            "1. **WHO (Identity Trust)**: STIR/SHAKEN Level A attestation, carrier lineage, and biometric verification.\n"
            "2. **WHAT (Communication Authenticity)**: Acoustic neural vocoder spectral analysis, visual deepfake artifact detection, and NLP coercion detection.\n"
            "3. **ACTION (Sensitive Risk)**: Detects OTP harvesting, unauthorized fund transfers, credential theft, and extortion threats.\n"
            "4. **VERDICT (Composite Score 0–100)**:\n"
            "   • **0–30 (Low Risk)**: Verified and nominal.\n"
            "   • **31–69 (Medium Risk)**: Caution required; verify out-of-band.\n"
            "   • **70–84 (High Risk)**: Severe synthetic or coercion markers.\n"
            "   • **85–100 (Critical Risk)**: Active attack; auto-block recommended.\n\n"
            "**Key Modules Available:**\n"
            "• **Call Protection**: Live in-call telemetry defense\n"
            "• **Voice Forensic Scan**: AI synthetic audio inspection\n"
            "• **Message & URL Sandbox**: Phishing and malicious domain deconstruction\n"
            "• **Forensic Audit Ledger**: Cryptographic PDF generation for police & bank reporting."
        )
        suggested_actions = [
            {"label": "📞 Open Call Protection", "modality": "call"},
            {"label": "🎙️ Open Voice Scan", "modality": "voice"},
            {"label": "⚠️ Check Suspicious Message", "modality": "message"}
        ]

    # 13. Dynamic Custom Scenario Synthesizer
    else:
        reply = (
            f"### 🛡️ VERITY AI Security Analysis: \"{query}\"\n\n"
            "**Threat Assessment & Zero-Trust Advisory:**\n"
            "Any inbound interaction demanding urgency, emotional pressure, financial action, or credential verification must be treated as **Untrusted** until independently verified.\n\n"
            "**Core Defensive Rules:**\n"
            "1. **Out-of-Band Verification**: Never trust inbound caller ID, SMS headers, or message sender names. Initiate contact yourself using a verified official telephone number.\n"
            "2. **Zero Credential Sharing**: Never disclose OTPs, UPI PINs, banking passwords, or remote desktop codes over any channel.\n"
            "3. **Dual Authorization**: Enforce secondary independent sign-off before making unexpected wire transfers or sensitive account changes.\n"
            "4. **Audit & Report**: If this interaction seemed suspicious, log it in VERITY's Forensic Ledger and report caller numbers to **1930 / cybercrime.gov.in**.\n\n"
            "You can paste the exact message, phone number, or URL here to evaluate it directly, or launch one of VERITY's specialized scan engines below."
        )
        suggested_actions = [
            {"label": "📞 Live Call Protection", "modality": "call"},
            {"label": "🎙️ Voice Forensic Scan", "modality": "voice"},
            {"label": "⚠️ Message Analysis", "modality": "message"},
            {"label": "🔗 URL Sandbox Check", "modality": "url"}
        ]

    return {
        "reply": reply,
        "suggested_actions": [SuggestedAction(**a) for a in suggested_actions],
        "model_used": "verity-security-heuristics",
        "is_simulated": False
    }


@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(req: CopilotChatRequest):
    """
    Interactive Copilot endpoint that answers user queries with live Gemini LLM
    or comprehensive threat intelligence security heuristics fallback.
    """
    user_query = req.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # If Gemini is available, query live LLM with conversation history
    if gemini_service.is_available():
        try:
            # Build conversation context
            history_text = ""
            if req.history:
                recent_history = req.history[-6:]  # Keep last 6 exchanges
                for msg in recent_history:
                    role = "User" if msg.sender == "user" else "Copilot"
                    history_text += f"{role}: {msg.text}\n"

            prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"Platform Context:\n"
                f"- User: Visal (Security Analyst / Citizen)\n"
                f"- Protected Line: +91 98401 24590 (STIR/SHAKEN Level A Certified)\n"
                f"- Platform: VERITY Zero-Trust Multimodal Fraud Defense\n\n"
                f"Conversation History:\n{history_text}\n"
                f"Current User Question/Scenario:\n{user_query}\n\n"
                f"Please provide a direct, insightful, and practical response addressing this user's exact question and needs."
            )

            models_to_try = [
                settings.GEMINI_MODEL,
                "gemini-3.5-flash-lite",
                "gemini-3.5-flash",
                "gemini-flash-lite-latest",
                "gemini-3.8-flash",
                "gemini-3.7-flash"
            ]
            unique_models = []
            for m in models_to_try:
                if m and m not in unique_models:
                    unique_models.append(m)

            for model in unique_models:
                try:
                    response = gemini_service.generate_content(
                        model=model,
                        contents=prompt
                    )
                    reply_text = ""
                    if hasattr(response, "text") and response.text:
                        reply_text = response.text.strip()

                    if reply_text:
                        # Extract suggested actions based on response content
                        suggested = []
                        lower = (user_query + " " + reply_text).lower()
                        if "voice" in lower or "audio" in lower or "clone" in lower:
                            suggested.append(SuggestedAction(label="🎙️ Run Voice Clone Analysis", modality="voice"))
                        if "call" in lower or "phone" in lower or "caller" in lower or "cbi" in lower or "police" in lower:
                            suggested.append(SuggestedAction(label="📞 Open Live Call Protection", modality="call"))
                        if "message" in lower or "whatsapp" in lower or "sms" in lower or "otp" in lower or "apk" in lower:
                            suggested.append(SuggestedAction(label="⚠️ Analyze Suspicious Message", modality="message"))
                        if "url" in lower or "link" in lower or "domain" in lower or "website" in lower:
                            suggested.append(SuggestedAction(label="🔗 Inspect Malicious Link", modality="url"))

                        return CopilotChatResponse(
                            reply=reply_text,
                            suggested_actions=suggested[:2],
                            model_used=model,
                            is_simulated=False
                        )
                except Exception as model_err:
                    logger.warning(f"Gemini model {model} attempt in Copilot failed: {model_err}")
                    continue

        except Exception as e:
            logger.warning(f"Error querying Gemini for Copilot chat: {e}. Using expert security fallback.")

    # High-quality fallback if Gemini is offline or unconfigured
    fallback = generate_expert_fallback_response(user_query)
    return CopilotChatResponse(**fallback)
