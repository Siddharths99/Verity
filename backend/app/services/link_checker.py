import re
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
import tldextract
from app.core.constants import KNOWN_BRANDS_DOMAINS, HIGH_RISK_TLDS


class LinkChecker:
    """
    Analyzes URLs for phishing indicators, typosquatting, brand impersonation,
    and high-risk domain anomalies.
    """

    @classmethod
    def analyze_url(cls, url_str: str, target_brand: Optional[str] = None) -> Dict[str, Any]:
        if not url_str.startswith(("http://", "https://")):
            url_str = "http://" + url_str

        parsed = urlparse(url_str)
        extracted = tldextract.extract(url_str)

        domain = extracted.domain.lower()
        suffix = extracted.suffix.lower()
        subdomain = extracted.subdomain.lower()
        full_registered_domain = f"{domain}.{suffix}" if suffix else domain

        flags: List[str] = []
        evidence: List[str] = []
        risk_score = 0.0

        # 1. Plain HTTP without SSL/TLS
        if parsed.scheme == "http":
            flags.append("INSECURE_HTTP_PROTOCOL")
            evidence.append("URL uses unencrypted HTTP protocol for sensitive transport.")
            risk_score += 15.0

        # 2. Raw IP address in host
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", parsed.netloc))
        if is_ip:
            flags.append("RAW_IP_HOST_ADDRESS")
            evidence.append(f"URL points directly to an IP address ({parsed.netloc}) rather than a verified domain.")
            risk_score += 45.0

        # 3. High-risk TLD
        if suffix in HIGH_RISK_TLDS:
            flags.append("HIGH_RISK_TLD")
            evidence.append(f"Domain uses high-risk TLD (.{suffix}) frequently associated with ephemeral phishing.")
            risk_score += 30.0

        # 4. Brand Impersonation & Typosquatting
        impersonated_brand = None
        for brand, legitimate_domains in KNOWN_BRANDS_DOMAINS.items():
            # Check if brand name is in domain or subdomain
            brand_in_domain = brand in domain
            brand_in_subdomain = brand in subdomain

            if (brand_in_domain or brand_in_subdomain) and full_registered_domain not in legitimate_domains:
                impersonated_brand = brand
                flags.append("BRAND_TYPOSQUATTING_SUSPICION")
                evidence.append(
                    f"Domain or subdomain mimics legitimate brand '{brand.upper()}' "
                    f"('{full_registered_domain}') but is not an authorized official domain ({', '.join(legitimate_domains)})."
                )
                risk_score += 55.0
                break

        # Explicit target brand mismatch
        if target_brand:
            brand_key = target_brand.lower().replace(" ", "")
            for brand, legit_domains in KNOWN_BRANDS_DOMAINS.items():
                if brand in brand_key and full_registered_domain not in legit_domains:
                    if "BRAND_TYPOSQUATTING_SUSPICION" not in flags:
                        flags.append("CLAIMED_BRAND_MISMATCH")
                        evidence.append(
                            f"User checked link claiming to be '{target_brand}', but domain '{full_registered_domain}' does not belong to authorized domains."
                        )
                        risk_score += 50.0

        # 5. Suspicious keywords in URL path or subdomain (e.g. login, verify, kyc, secure)
        sensitive_slugs = ["kyc", "verify", "update-pan", "netbanking", "secure-login", "authenticate", "otp"]
        matched_slugs = [slug for slug in sensitive_slugs if slug in url_str.lower()]
        if matched_slugs and impersonated_brand:
            flags.append("PHISHING_CREDENTIAL_TRAP_PATH")
            evidence.append(f"URL path includes phishing credential traps: {', '.join(matched_slugs)}.")
            risk_score += 35.0

        risk_score = min(100.0, risk_score)

        return {
            "url": url_str,
            "registered_domain": full_registered_domain,
            "suffix": suffix,
            "subdomain": subdomain,
            "is_ip": is_ip,
            "impersonated_brand": impersonated_brand,
            "risk_score": risk_score,
            "flags": flags,
            "evidence": evidence
        }
