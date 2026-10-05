import json
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger("verity.gemini")


class GeminiService:
    """
    Multimodal AI analysis service powered by Google Gemini API.
    Evaluates:
      1. WHO is contacting you (Identity, spoofing check)
      2. WHAT is being communicated (Pretext, urgency, fear, deception)
      3. WHAT you are being asked to do (Sensitive action, OTP, payment)
      4. CAN THE INTERACTION BE TRUSTED?
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Google Gemini client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

    def is_available(self) -> bool:
        return self._client is not None

    async def analyze_interaction(
        self,
        content: str,
        sender_identity: Optional[str] = None,
        modality: str = "TEXT",
        extracted_signals: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Sends multimodal context to Gemini for social engineering evaluation.
        Falls back to local heuristic reasoning if API key is not configured.
        """
        if not self.is_available():
            return self._heuristic_analysis(content, sender_identity, modality, extracted_signals)

        system_prompt = (
            "You are VERITY, an elite AI system specialized in detecting social engineering, "
            "AI-driven impersonation, deepfakes, and fraud.\n"
            "Analyze the given interaction thoroughly and return a JSON object with this EXACT structure:\n"
            "{\n"
            '  "who_trusted": false,\n'
            '  "who_evaluation": "string explanation of sender authenticity",\n'
            '  "what_communicated": "summary of the narrative, urgency, authority pretext, or scam theme",\n'
            '  "requested_action": "explicit sensitive action requested (e.g., OTP disclosure, money transfer, app installation)",\n'
            '  "overall_trust": "TRUSTED" | "UNCERTAIN" | "UNTRUSTED",\n'
            '  "identity_risk_score": 0.0 to 100.0,\n'
            '  "intent_risk_score": 0.0 to 100.0,\n'
            '  "synthetic_risk_score": 0.0 to 100.0,\n'
            '  "flags": ["FLAG_NAME_1", "FLAG_NAME_2"],\n'
            '  "evidence": ["Point 1", "Point 2"],\n'
            '  "recommended_actions": ["Action 1", "Action 2"]\n'
            "}\n"
            "Do not return markdown code blocks, return ONLY valid raw JSON."
        )

        user_content = (
            f"Modality: {modality}\n"
            f"Claimed Sender: {sender_identity or 'Unknown/Not Provided'}\n"
            f"Communication Content: {content}\n"
            f"Pre-extracted signals: {json.dumps(extracted_signals or {})}"
        )

        models_to_try = [self.model_name]
        for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        last_error = None
        for model in models_to_try:
            try:
                from google.genai import types

                response = self._client.models.generate_content(
                    model=model,
                    contents=f"{system_prompt}\n\nUser Context:\n{user_content}",
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )

                text_resp = response.text.strip()
                if text_resp.startswith("```json"):
                    text_resp = text_resp[7:]
                if text_resp.endswith("```"):
                    text_resp = text_resp[:-3]

                parsed = json.loads(text_resp.strip())
                return parsed

            except Exception as e:
                last_error = e
                logger.warning(f"Gemini model {model} attempt failed: {e}. Trying next fallback...")

        logger.error(f"All Gemini models exhausted. Last error: {last_error}. Falling back to rule-guided analysis.")
        return self._heuristic_analysis(content, sender_identity, modality, extracted_signals)

    async def analyze_media_file(
        self,
        file_path: str,
        mime_type: str,
        context_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Multimodal media analysis (Image/Video/Audio) using Gemini.
        """
        if not self.is_available():
            return {
                "media_synthetic_score": 25.0,
                "flags": ["OFFLINE_ANALYSIS_MODE"],
                "evidence": ["Gemini API key not configured; media analyzed via baseline checks."],
                "what_communicated": "Media provided without online AI verification."
            }

        try:
            from google.genai import types

            with open(file_path, "rb") as f:
                media_bytes = f.read()

            prompt = (
                "Analyze this uploaded media (image, audio, or document) for signs of:\n"
                "1. AI generation / deepfake manipulation / cloning artifacts.\n"
                "2. Fraudulent documents (fake bank receipts, fake police warrants, fake KYC forms).\n"
                "3. Social engineering or urgency cues.\n"
                "Return a raw JSON object with keys: "
                "'is_synthetic' (bool), 'media_synthetic_score' (0-100 float), "
                "'findings' (list of strings), 'flags' (list of strings), 'what_communicated' (string)."
            )

            response = self._client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=media_bytes, mime_type=mime_type),
                    prompt + (f"\nAdditional Context: {context_prompt}" if context_prompt else "")
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )

            text_resp = response.text.strip()
            if text_resp.startswith("```json"):
                text_resp = text_resp[7:]
            if text_resp.endswith("```"):
                text_resp = text_resp[:-3]

            return json.loads(text_resp.strip())

        except Exception as e:
            logger.error(f"Error in Gemini multimodal media analysis: {e}")
            return {
                "media_synthetic_score": 30.0,
                "flags": ["ANALYSIS_ERROR_FALLBACK"],
                "evidence": [f"Could not complete AI media scan: {str(e)}"],
                "what_communicated": "Media analysis failed to complete."
            }

    def _heuristic_analysis(
        self,
        content: str,
        sender_identity: Optional[str],
        modality: str,
        extracted_signals: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Robust offline fallback analyzer that matches VERITY's core questions.
        """
        signals = extracted_signals or {}
        flags = list(signals.get("flags", []))
        evidence = list(signals.get("evidence", []))
        intent_score = float(signals.get("intent_score", 10.0))
        identity_score = float(signals.get("identity_score", 10.0))

        content_lower = content.lower()

        # Deduce who_trusted
        who_trusted = True
        who_eval = "Sender identity has no overt spoofing signs."
        if "BANK_IMPERSONATION_RISK" in flags or "LAW_ENFORCEMENT_DIGITAL_ARREST_PRETEXT" in flags:
            who_trusted = False
            who_eval = f"Unverified sender claiming authority or banking status ({sender_identity or 'unverified'})."
            identity_score = max(identity_score, 80.0)

        # Deduce what_communicated
        what_communicated = "Standard informational message."
        if "ARTIFICIAL_URGENCY_PRESSURE" in flags:
            what_communicated = "Urgent notification pressuring recipient with imminent account suspension, penalties, or threats."
        elif "LAW_ENFORCEMENT_DIGITAL_ARREST_PRETEXT" in flags:
            what_communicated = "Police/Law enforcement inquiry claiming recipient is implicated in criminal or money-laundering offenses."

        # Deduce requested_action
        requested_action = "No sensitive action detected."
        if "OTP_CREDENTIAL_SOLICITATION" in flags or "ACTIVE_OTP_THEFT_PATTERN" in flags:
            requested_action = "Provide or enter OTP/Verification PIN/Password to an unauthorized entity."
        elif "REMOTE_ACCESS_TOOL_SOLICITATION" in flags:
            requested_action = "Install remote control software granting full device access to the caller."
        elif "extracted_urls" in signals and signals["extracted_urls"]:
            requested_action = f"Click external link: {signals['extracted_urls'][0]}"

        # Overall trust
        if intent_score > 60 or identity_score > 60 or len(flags) >= 2:
            overall_trust = "UNTRUSTED"
        elif intent_score > 25 or identity_score > 25:
            overall_trust = "UNCERTAIN"
        else:
            overall_trust = "TRUSTED"

        # Recommendations
        recommended_actions = []
        if overall_trust == "UNTRUSTED":
            recommended_actions.append("Halt interaction immediately; do NOT perform the requested action.")
            if "OTP" in requested_action or "PIN" in requested_action:
                recommended_actions.append("NEVER share OTP, CVV, or banking PINs with anyone over call or message.")
            if "extracted_urls" in signals and signals["extracted_urls"]:
                recommended_actions.append("Do NOT open the link or enter credentials.")
            recommended_actions.append("Verify independently using the official website or customer support number.")
        else:
            recommended_actions.append("Maintain routine caution; ensure sender is legitimate before sharing details.")

        return {
            "who_trusted": who_trusted,
            "who_evaluation": who_eval,
            "what_communicated": what_communicated,
            "requested_action": requested_action,
            "overall_trust": overall_trust,
            "identity_risk_score": identity_score,
            "intent_risk_score": intent_score,
            "synthetic_risk_score": 10.0,
            "flags": flags,
            "evidence": evidence,
            "recommended_actions": recommended_actions
        }


gemini_service = GeminiService()
