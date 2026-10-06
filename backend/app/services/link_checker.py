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
        if not url_str or not isinstance(url_str, str) or not url_str.strip():
            return {
                "url": url_str or "",
                "is_valid": False,
                "is_https": False,
                "registered_domain": "",
                "suffix": "",
                "subdomain": "",
                "is_ip": False,
                "impersonated_brand": None,
                "risk_score": 70.0,
                "flags": ["INVALID_URL_SYNTAX"],
                "evidence": ["URL string is empty or invalid."]
            }

        url_clean = url_str.strip()
        if not url_clean.startswith(("http://", "https://")):
            url_clean = "http://" + url_clean

        parsed = urlparse(url_clean)
        netloc = (parsed.netloc or "").strip().lower()
        is_valid = bool(netloc and ("." in netloc or re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", netloc)))

        extracted = tldextract.extract(url_clean)
        domain = extracted.domain.lower()
        suffix = extracted.suffix.lower()
        subdomain = extracted.subdomain.lower()
        full_registered_domain = f"{domain}.{suffix}" if suffix else domain

        flags: List[str] = []
        evidence: List[str] = []
        risk_score = 0.0

        if not is_valid:
            flags.append("INVALID_URL_SYNTAX")
            evidence.append("URL hostname could not be validated or contains malformed syntax.")
            risk_score += 40.0

        # 1. HTTPS / SSL transport inspection
        is_https = parsed.scheme.lower() == "https"
        if not is_https:
            flags.append("INSECURE_HTTP_PROTOCOL")
            evidence.append("URL uses unencrypted HTTP protocol for sensitive data transport.")
            risk_score += 15.0
        else:
            evidence.append("URL enforces HTTPS protocol transport.")

        # 2. Raw IP address in host
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", netloc))
        if is_ip:
            flags.append("RAW_IP_HOST_ADDRESS")
            evidence.append(f"URL points directly to an IP address ({netloc}) rather than a registered domain.")
            risk_score += 45.0

        # 3. Domain structure checks: deep subdomain nesting & homoglyphs
        if subdomain:
            sub_parts = [p for p in subdomain.split(".") if p]
            if len(sub_parts) >= 2:
                flags.append("DEEPLY_NESTED_SUBDOMAINS")
                evidence.append(f"Domain contains {len(sub_parts)} nested subdomain levels ('{subdomain}'), typical of deceptive URL obfuscation.")
                risk_score += 25.0

        if "xn--" in netloc:
            flags.append("HOMOGLYPH_PUNYCODE_HOST")
            evidence.append(f"Hostname uses Punycode encoding ('{netloc}') which can disguise visual lookalike character spoofing.")
            risk_score += 35.0

        if domain.count("-") >= 2:
            flags.append("EXCESSIVE_HYPHENS_IN_DOMAIN")
            evidence.append(f"Domain name contains multiple hyphens ('{domain}'), characteristic of brand lookalike domains.")
            risk_score += 20.0

        # 4. High-risk TLD
        if suffix in HIGH_RISK_TLDS:
            flags.append("HIGH_RISK_TLD")
            evidence.append(f"Domain uses high-risk TLD (.{suffix}) frequently associated with ephemeral phishing.")
            risk_score += 30.0

        # 5. Brand Impersonation & Typosquatting
        impersonated_brand = None
        for brand, legitimate_domains in KNOWN_BRANDS_DOMAINS.items():
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

        # 6. Suspicious parameters in query string
        if parsed.query:
            query_lower = parsed.query.lower()
            redirect_tokens = ["redirect=", "url=", "next=", "return_to=", "dest=", "goto=", "target="]
            matched_redirects = [tok.replace("=", "") for tok in redirect_tokens if tok in query_lower]
            if matched_redirects:
                flags.append("SUSPICIOUS_REDIRECT_PARAMETER")
                evidence.append(f"URL query string contains redirect parameter(s): {', '.join(matched_redirects)}.")
                risk_score += 25.0

            credential_tokens = ["token=", "session=", "auth=", "pwd=", "password=", "otp=", "pin=", "key="]
            matched_cred = [tok.replace("=", "") for tok in credential_tokens if tok in query_lower]
            if matched_cred:
                flags.append("CREDENTIAL_OR_TOKEN_PARAM")
                evidence.append(f"URL parameters pass or solicit sensitive authentication tokens: {', '.join(matched_cred)}.")
                risk_score += 35.0

        # 7. Suspicious keywords in URL path (e.g. login, verify, kyc, secure)
        sensitive_slugs = ["kyc", "verify", "update-pan", "netbanking", "secure-login", "authenticate", "otp"]
        matched_slugs = [slug for slug in sensitive_slugs if slug in url_clean.lower()]
        if matched_slugs and (impersonated_brand or is_ip or suffix in HIGH_RISK_TLDS):
            flags.append("PHISHING_CREDENTIAL_TRAP_PATH")
            evidence.append(f"URL path includes phishing credential traps: {', '.join(matched_slugs)}.")
            risk_score += 35.0

        risk_score = min(100.0, risk_score)

        return {
            "url": url_clean,
            "is_valid": is_valid,
            "is_https": is_https,
            "registered_domain": full_registered_domain,
            "suffix": suffix,
            "subdomain": subdomain,
            "is_ip": is_ip,
            "impersonated_brand": impersonated_brand,
            "risk_score": risk_score,
            "flags": flags,
            "evidence": evidence
        }
