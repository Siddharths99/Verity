import re
from typing import List, Dict, Any, Tuple
from app.core.constants import URGENCY_KEYWORDS, OTP_PIN_KEYWORDS, REMOTE_ACCESS_TOOLS, KNOWN_BRANDS_DOMAINS


class RulesEngine:
    """
    Deterministic rule-based fraud detection engine.
    Scans text content for high-risk scam patterns, urgency triggers, OTP extraction,
    remote administration tools, and authority impersonation.
    """

    @classmethod
    def analyze_text(cls, text: str, claimed_org: str = None) -> Dict[str, Any]:
        text_lower = text.lower()
        flags: List[str] = []
        evidence: List[str] = []
        intent_score = 0.0
        identity_score = 0.0

        # 1. OTP and Credential Extraction Rules
        matched_otp_terms = [kw for kw in OTP_PIN_KEYWORDS if kw in text_lower]
        if matched_otp_terms:
            flags.append("OTP_CREDENTIAL_SOLICITATION")
            evidence.append(f"Detected solicitation of sensitive credentials/codes ({', '.join(matched_otp_terms)}).")
            intent_score += 45.0

        # Specific OTP regex (e.g. 'share your 6-digit code', 'enter OTP')
        if re.search(r"\b(share|send|enter|give|provide)\b.*\b(otp|pin|password|code|cvv)\b", text_lower):
            flags.append("ACTIVE_OTP_THEFT_PATTERN")
            evidence.append("Direct pattern attempting to solicit or extract one-time password (OTP).")
            intent_score += 25.0

        # 2. Urgency & Coercion Pressure Rules
        matched_urgency = [kw for kw in URGENCY_KEYWORDS if kw in text_lower]
        if matched_urgency:
            flags.append("ARTIFICIAL_URGENCY_PRESSURE")
            evidence.append(f"Detected psychological pressure triggers: {', '.join(matched_urgency[:4])}.")
            intent_score += 20.0

        # 3. Remote Access Software Solicitation Rules
        matched_rat = [tool for tool in REMOTE_ACCESS_TOOLS if tool in text_lower]
        if matched_rat:
            flags.append("REMOTE_ACCESS_TOOL_SOLICITATION")
            evidence.append(f"Requests installation of remote desktop management software ({', '.join(matched_rat)}).")
            intent_score += 40.0

        # 4. Impersonation & Pretexting Rules
        bank_keywords = ["bank", "sbi", "hdfc", "icici", "axis", "pnb", "rbi", "card", "account"]
        gov_keywords = ["police", "cbi", "customs", "cybercrime", "court", "trai", "telecom", "digital arrest", "police order"]
        utility_keywords = ["electricity", "power", "bill", "disconnected", "disconnection", "gas", "water"]

        has_bank_mention = any(bk in text_lower for bk in bank_keywords)
        has_gov_mention = any(gk in text_lower for gk in gov_keywords)
        has_utility_mention = any(uk in text_lower for uk in utility_keywords)

        if has_bank_mention and (matched_otp_terms or "blocked" in text_lower or "kyc" in text_lower):
            flags.append("BANK_IMPERSONATION_RISK")
            evidence.append("Message pretexts banking institution alerts with urgent account suspension or KYC expiry.")
            identity_score += 40.0

        if has_gov_mention:
            flags.append("AUTHORITY_COERCION_PRETEXT")
            evidence.append("Message invokes government, legal, or police authority to compel immediate compliance.")
            identity_score += 45.0
            intent_score += 30.0

        if has_utility_mention and ("disconnected" in text_lower or "disconnection" in text_lower or "pay" in text_lower):
            flags.append("UTILITY_DISCONNECTION_SCAM_PATTERN")
            evidence.append("Classic utility disconnection scam pattern threatening immediate power/service cut off.")
            intent_score += 40.0

        # 5. Extract URLs
        extracted_urls = re.findall(r"(?:https?://|www\.)[^\s<>\"']+", text)

        # Cap individual scores to 100
        intent_score = min(100.0, intent_score)
        identity_score = min(100.0, identity_score)

        return {
            "flags": flags,
            "evidence": evidence,
            "intent_score": intent_score,
            "identity_score": identity_score,
            "extracted_urls": extracted_urls,
            "matched_urgency": matched_urgency,
            "matched_credentials": matched_otp_terms
        }
