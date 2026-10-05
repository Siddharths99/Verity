from enum import Enum
from typing import Dict, List


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ModalityType(str, Enum):
    TEXT = "TEXT"
    AUDIO = "AUDIO"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    URL = "URL"
    MULTIMODAL = "MULTIMODAL"


class TrustStatus(str, Enum):
    TRUSTED = "TRUSTED"
    UNCERTAIN = "UNCERTAIN"
    UNTRUSTED = "UNTRUSTED"


# Known target entities commonly impersonated in scam campaigns
KNOWN_BRANDS_DOMAINS: Dict[str, List[str]] = {
    "sbi": ["sbi.co.in", "onlinesbi.sbi", "statebankofindia.com"],
    "hdfc": ["hdfcbank.com", "hdfcbank.net"],
    "icici": ["icicibank.com"],
    "axis": ["axisbank.com"],
    "pnb": ["pnbindia.in"],
    "rbi": ["rbi.org.in"],
    "paytm": ["paytm.com"],
    "googlepay": ["pay.google.com"],
    "phonepe": ["phonepe.com"],
    "incometax": ["incometax.gov.in"],
    "trai": ["trai.gov.in"],
    "police": ["cybercrime.gov.in", "cbi.gov.in"],
    "fedex": ["fedex.com"],
    "dhl": ["dhl.com"],
    "amazon": ["amazon.in", "amazon.com"],
    "netflix": ["netflix.com"],
    "microsoft": ["microsoft.com", "login.microsoftonline.com"],
    "google": ["google.com", "accounts.google.com"],
    "apple": ["apple.com", "icloud.com"]
}

# Suspicious TLDs frequently used in rapid phishing campaigns
HIGH_RISK_TLDS = {
    "top", "xyz", "club", "buzz", "site", "online", "work", "loan", "click",
    "country", "stream", "gq", "cf", "tk", "ml", "ga", "rest", "fit"
}

# Suspicious keywords signaling urgency, fear, authority, or financial demands
URGENCY_KEYWORDS = [
    "immediately", "urgent", "24 hours", "suspended", "blocked", "deactivated",
    "expire", "legal action", "arrest warrant", "freeze account", "penalty",
    "action required", "critical alert", "compromised", "kyc expired",
    "digital arrest", "police custody", "customs clearance", "narcotics",
    "disconnected", "disconnection", "cut off", "power cut", "bill unpaid", "police order"
]

OTP_PIN_KEYWORDS = [
    "otp", "one time password", "verification code", "upi pin", "atm pin",
    "cvv", "card number", "secret code", "6-digit code", "security pin"
]

REMOTE_ACCESS_TOOLS = [
    "anydesk", "teamviewer", "rustdesk", "quicksupport", "airdroid", "zoho assist"
]
