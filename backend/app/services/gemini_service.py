import os
import json
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings

logger = logging.getLogger("verity.gemini")


def extract_representative_video_frames(video_path: str, max_frames: int = 6) -> List[bytes]:
    """
    Extracts evenly spaced representative JPEG frames from a video file using OpenCV.
    """
    try:
        import cv2
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frames_bytes = []
        if total_frames <= 0:
            count = 0
            while count < max_frames:
                ret, frame = cap.read()
                if not ret or frame is None:
                    break
                h, w = frame.shape[:2]
                max_dim = 1024
                if max(h, w) > max_dim:
                    scale = max_dim / max(h, w)
                    frame = cv2.resize(frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
                success, encoded_img = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
                if success:
                    frames_bytes.append(encoded_img.tobytes())
                count += 1
            cap.release()
            return frames_bytes

        if total_frames <= max_frames:
            indices = list(range(total_frames))
        else:
            step = total_frames / max_frames
            indices = [int(i * step) for i in range(max_frames)]
        
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret and frame is not None:
                h, w = frame.shape[:2]
                max_dim = 1024
                if max(h, w) > max_dim:
                    scale = max_dim / max(h, w)
                    frame = cv2.resize(frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
                success, encoded_img = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
                if success:
                    frames_bytes.append(encoded_img.tobytes())
        cap.release()
        return frames_bytes
    except Exception as e:
        logger.warning(f"Video frame extraction warning: {e}")
        return []


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
                # Do NOT log the exception details directly — it may contain key fragments
                logger.warning("Failed to initialize Google GenAI client. Check your GEMINI_API_KEY.")

    def is_available(self) -> bool:
        return self._client is not None

    def generate_content(self, model: str, contents, config=None):
        """
        Public wrapper around the internal client's generate_content.
        Use this instead of accessing _client directly to preserve encapsulation.
        """
        if not self.is_available():
            raise RuntimeError("Gemini client is not initialized.")
        from google.genai import types
        kwargs = {"model": model, "contents": contents}
        if config is not None:
            kwargs["config"] = config
        return self._client.models.generate_content(**kwargs)

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
            "You are VERITY, an elite AI system specialized in evaluating interaction authenticity, "
            "accurately distinguishing genuine everyday communications from social engineering, fraud, and deepfakes.\n"
            "Analyze the given interaction objectively. If it is a normal, legitimate communication with no fraud or threats, "
            "mark who_trusted: true, overall_trust: 'TRUSTED', and set risk scores between 0.0 and 15.0 with empty flags.\n"
            "If it contains impersonation, artificial urgency, coercion, or credential theft, assign appropriate high risk scores and flags.\n"
            "Return a JSON object with this EXACT structure:\n"
            "{\n"
            '  "who_trusted": true,\n'
            '  "who_evaluation": "string explanation of sender authenticity",\n'
            '  "what_communicated": "summary of the narrative, urgency, authority pretext, or communication theme",\n'
            '  "requested_action": "explicit sensitive action requested (e.g., OTP disclosure, wire transfer, or Routine communication)",\n'
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

        models_to_try = [self.model_name, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]
        # Deduplicate while preserving order
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        last_error = None
        for model in unique_models:
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
        Multimodal media analysis (Image/Video) using Gemini.
        Evaluates visual/temporal content, detects AI generation, digital manipulation,
        or authentic origin, and returns structured forensic analysis.
        """
        if not self.is_available():
            raise RuntimeError("Multimodal analysis service unavailable: GEMINI_API_KEY is not configured.")

        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            raise ValueError(f"Uploaded media file is empty or does not exist at '{file_path}'.")

        from google.genai import types

        with open(file_path, "rb") as f:
            media_bytes = f.read()

        is_video = mime_type.startswith("video/")

        prompt = (
            "You are VERITY Visual & Media Forensics, an elite multimodal forensic analyst specialized in visual authenticity inspection.\n"
            "Carefully analyze the actual visual and temporal content of this uploaded file (image or video).\n"
            "You must inspect:\n"
            "- Camera sensor noise patterns, compression artifacts, and optical physics.\n"
            "- Generative AI artifacts (diffusion texture smoothing, unnatural anatomical geometry, GAN blending seams, warping).\n"
            "- Digital tampering, splicing, cloned regions, and copy-move alterations.\n"
            "- Document integrity (forged letterheads, counterfeit stamps, mismatched typography, synthetic badges/crests).\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. You must determine exactly ONE verdict from: 'REAL', 'AI_GENERATED', 'MANIPULATED', or 'UNCERTAIN'.\n"
            "2. 'confidence': A float between 0.00 and 0.99. NEVER claim 1.00 (100% certainty) under any circumstances.\n"
            "3. If there is insufficient evidence, low resolution, or ambiguous features, set verdict to 'UNCERTAIN' and explain why in evidence.\n"
            "4. 'threat_level': Choose exactly ONE from: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'.\n"
            "   - Genuine/REAL media must have 'LOW' threat_level.\n"
            "   - Inconclusive/UNCERTAIN media must have 'MEDIUM' threat_level.\n"
            "   - Deceptive AI_GENERATED or MANIPULATED media must have 'HIGH' or 'CRITICAL' threat_level.\n"
            "5. 'manipulation_type': A clear concise classification of the manipulation (e.g. 'None (Authentic Capture)', 'Generative Diffusion AI', 'Facial Deepfake / Face Swap', 'Digital Splicing / Document Forgery', 'Synthetic Animation', or 'Inconclusive').\n"
            "6. 'evidence': A list of specific, concrete visual indicators actually detected in the visual content (minimum 2 detailed observations).\n"
            "7. 'recommended_action': Specific, actionable guidance for the user.\n"
            "8. 'what_communicated': A concise factual summary of what the visual content depicts.\n\n"
            "Return ONLY a valid raw JSON object with this exact schema:\n"
            "{\n"
            '  "verdict": "REAL" | "AI_GENERATED" | "MANIPULATED" | "UNCERTAIN",\n'
            '  "confidence": 0.85,\n'
            '  "threat_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
            '  "manipulation_type": "string",\n'
            '  "evidence": ["Specific observation 1", "Specific observation 2"],\n'
            '  "recommended_action": "action recommendation",\n'
            '  "what_communicated": "concise description of content"\n'
            "}\n"
            "Do NOT include markdown formatting or backticks. Return valid JSON only."
        )

        full_prompt = prompt + (f"\nAdditional Context / User Notes: {context_prompt}" if context_prompt else "")

        models_to_try = [self.model_name, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        parts_candidates = []

        if is_video:
            # First candidate: representative video frames extracted via OpenCV
            frames = extract_representative_video_frames(file_path, max_frames=6)
            if frames:
                frame_parts = [types.Part.from_bytes(data=f, mime_type="image/jpeg") for f in frames]
                parts_candidates.append(
                    frame_parts + [f"The preceding images are representative sequential frames from the uploaded video file.\n\n{full_prompt}"]
                )
            # Second candidate: direct inline video bytes
            parts_candidates.append([
                types.Part.from_bytes(data=media_bytes, mime_type=mime_type),
                full_prompt
            ])
        else:
            parts_candidates.append([
                types.Part.from_bytes(data=media_bytes, mime_type=mime_type),
                full_prompt
            ])

        last_error = None
        for parts in parts_candidates:
            for model in unique_models:
                try:
                    response = self._client.models.generate_content(
                        model=model,
                        contents=parts,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.1
                        )
                    )
                    text_resp = response.text.strip()
                    start_idx = text_resp.find("{")
                    end_idx = text_resp.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        text_resp = text_resp[start_idx:end_idx+1]

                    parsed = json.loads(text_resp.strip())

                    # Enforce schema constraints
                    verdict = str(parsed.get("verdict", "UNCERTAIN")).upper().strip()
                    if verdict not in ("REAL", "AI_GENERATED", "MANIPULATED", "UNCERTAIN"):
                        verdict = "UNCERTAIN"

                    confidence = float(parsed.get("confidence", 0.75))
                    confidence = round(min(0.99, max(0.05, confidence)), 2)

                    threat_level = str(parsed.get("threat_level", "MEDIUM")).upper().strip()
                    if threat_level not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
                        threat_level = "LOW" if verdict == "REAL" else ("MEDIUM" if verdict == "UNCERTAIN" else "HIGH")

                    if verdict == "REAL":
                        threat_level = "LOW"
                    elif verdict == "UNCERTAIN":
                        threat_level = "MEDIUM"
                    elif verdict in ("AI_GENERATED", "MANIPULATED") and threat_level in ("LOW", "MEDIUM"):
                        threat_level = "HIGH"

                    manipulation_type = str(parsed.get("manipulation_type", "")).strip()
                    if not manipulation_type:
                        manipulation_type = "None (Authentic Capture)" if verdict == "REAL" else ("Inconclusive" if verdict == "UNCERTAIN" else "AI Generated Visual Content")

                    evidence = parsed.get("evidence", [])
                    if isinstance(evidence, str):
                        evidence = [evidence]
                    elif not isinstance(evidence, list) or not evidence:
                        evidence = [f"Media evaluated as {verdict} based on multimodal forensic indicators."]

                    recommended_action = str(parsed.get("recommended_action", "")).strip()
                    if not recommended_action:
                        if verdict == "REAL":
                            recommended_action = "Content verified authentic. Safe to process and view."
                        elif verdict == "UNCERTAIN":
                            recommended_action = "Forensic evidence is inconclusive. Verify through independent secondary channels."
                        else:
                            recommended_action = "Halt interaction immediately; do not trust or act upon this manipulated media."

                    what_communicated = str(parsed.get("what_communicated", "Visual media submitted for forensic inspection.")).strip()

                    result = {
                        "verdict": verdict,
                        "confidence": confidence,
                        "threat_level": threat_level,
                        "manipulation_type": manipulation_type,
                        "evidence": evidence,
                        "recommended_action": recommended_action,
                        "what_communicated": what_communicated,
                        "is_synthetic": verdict in ("AI_GENERATED", "MANIPULATED"),
                        "findings": evidence,
                    }

                    if verdict == "REAL":
                        result["media_synthetic_score"] = round((1.0 - confidence) * 12.0, 1)
                        result["flags"] = []
                    elif verdict == "UNCERTAIN":
                        result["media_synthetic_score"] = 50.0
                        result["flags"] = ["INSUFFICIENT_FORENSIC_EVIDENCE"]
                    elif verdict == "AI_GENERATED":
                        result["media_synthetic_score"] = round(max(85.0, confidence * 100.0), 1)
                        result["flags"] = ["AI_GENERATED_MEDIA", "SYNTHETIC_DEEPFAKE_ARTIFACTS"]
                    else:  # MANIPULATED
                        result["media_synthetic_score"] = round(max(85.0, confidence * 100.0), 1)
                        result["flags"] = ["MANIPULATED_MEDIA", "IMAGE_TAMPERING_DETECTED"]

                    return result

                except Exception as model_err:
                    last_error = model_err
                    logger.warning(f"Media analysis with model {model} failed: {model_err}. Trying next candidate...")

        logger.warning(f"All models exhausted for media analysis ({last_error}). Returning UNCERTAIN.")
        return {
            "verdict": "UNCERTAIN",
            "confidence": 0.50,
            "threat_level": "MEDIUM",
            "manipulation_type": "Inconclusive",
            "evidence": [
                "Media file could not be reliably decoded or contains degraded/insufficient visual forensic markers.",
                "Authenticity cannot be definitively verified from the provided media stream."
            ],
            "recommended_action": "Media authenticity is inconclusive. Verify through independent secondary channels before trusting.",
            "what_communicated": "Uploaded visual media inspected.",
            "is_synthetic": False,
            "findings": [
                "Media file could not be reliably decoded or contains degraded/insufficient visual forensic markers.",
                "Authenticity cannot be definitively verified from the provided media stream."
            ],
            "media_synthetic_score": 50.0,
            "flags": ["INSUFFICIENT_FORENSIC_EVIDENCE"]
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
        intent_score = float(signals.get("intent_score", 0.0))
        identity_score = float(signals.get("identity_score", 0.0))

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
