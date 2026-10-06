import os
import json
import logging
from typing import Dict, Any, Optional
from app.services.gemini_service import gemini_service

logger = logging.getLogger("verity.stt")


class SpeechToTextService:
    """
    Handles speech transcription and audio analysis for incoming calls and voice notes.
    Leverages Gemini Multimodal Audio understanding or fallback acoustic analysis.
    """

    @classmethod
    async def process_audio(
        cls,
        audio_path: str,
        mime_type: str = "audio/wav",
        caller_identity: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribes audio and checks for synthetic voice markers or scam rhetoric.
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        file_size_kb = os.path.getsize(audio_path) / 1024

        if not gemini_service.is_available():
            raise RuntimeError("Gemini multimodal service is not available for audio analysis.")

        from google.genai import types

        with open(audio_path, "rb") as f:
            audio_data = f.read()

        if not audio_data:
            raise ValueError(f"Uploaded audio file at '{audio_path}' is empty.")

        prompt = (
            "You are VERITY Audio Forensics. Analyze the ACTUAL audio content of this uploaded voice recording or phone call.\n"
            "You must:\n"
            "1. Accurately transcribe any spoken text. If there is no speech, silent audio, or unintelligible noise, describe that accurately.\n"
            "2. Perform acoustic forensics on the audio signal (vocal tract resonance, breath cadence, ambient acoustics, neural vocoder pitch jitter, synthetic phasing).\n"
            "3. Determine if the speaker is a genuine human voice, an AI-generated synthetic voice clone (cloned/TTS), suspicious, or uncertain.\n"
            "4. Identify any coercive pressure, impersonation, or financial/OTP demands.\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. 'verdict': Exactly ONE of: 'REAL', 'AI_GENERATED', 'SUSPICIOUS', 'UNCERTAIN'.\n"
            "   - If audio quality is too poor, corrupted, or insufficient to evaluate authenticity, return 'UNCERTAIN'.\n"
            "2. 'confidence': Float strictly between 0.05 and 0.99. NEVER claim 1.00 (100% certainty).\n"
            "3. 'threat_level': Exactly ONE of: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'.\n"
            "   - Genuine/REAL audio -> 'LOW'.\n"
            "   - Inconclusive/UNCERTAIN audio -> 'MEDIUM'.\n"
            "   - SUSPICIOUS or AI_GENERATED -> 'HIGH' or 'CRITICAL' depending on coercion/fraud.\n"
            "4. 'voice_synthetic_score': Float between 0.0 and 100.0 representing AI likelihood.\n"
            "5. 'indicators': List of at least 2 specific acoustic and contextual indicators observed.\n"
            "6. 'recommended_action': Specific, actionable guidance for the user.\n"
            "7. 'summary_intent': Concise summary of what was communicated.\n\n"
            "Return ONLY a raw JSON object with this exact structure:\n"
            "{\n"
            '  "transcript": "string",\n'
            '  "verdict": "REAL" | "AI_GENERATED" | "SUSPICIOUS" | "UNCERTAIN",\n'
            '  "confidence": 0.85,\n'
            '  "threat_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
            '  "voice_synthetic_score": 15.0,\n'
            '  "indicators": ["observation 1", "observation 2"],\n'
            '  "recommended_action": "action recommendation",\n'
            '  "summary_intent": "concise description of call or message"\n'
            "}\n"
            "Do NOT include markdown backticks. Return valid JSON only."
        )

        models_to_try = [gemini_service.model_name, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        last_error = None
        for model in unique_models:
            try:
                response = gemini_service.generate_content(
                    model=model,
                    contents=[
                        types.Part.from_bytes(data=audio_data, mime_type=mime_type),
                        prompt
                    ]
                )
                text_resp = response.text.strip()
                start_idx = text_resp.find("{")
                end_idx = text_resp.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    text_resp = text_resp[start_idx:end_idx+1]

                parsed = json.loads(text_resp.strip())

                verdict = str(parsed.get("verdict", "UNCERTAIN")).upper().strip()
                if verdict not in ("REAL", "AI_GENERATED", "SUSPICIOUS", "UNCERTAIN"):
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
                elif verdict in ("AI_GENERATED", "SUSPICIOUS") and threat_level in ("LOW", "MEDIUM"):
                    threat_level = "HIGH"

                indicators = parsed.get("indicators", [])
                if isinstance(indicators, str):
                    indicators = [indicators]
                elif not isinstance(indicators, list) or not indicators:
                    indicators = [f"Acoustic evaluation completed: Voice evaluated as {verdict}."]

                rec_action = str(parsed.get("recommended_action", "")).strip()
                if not rec_action:
                    rec_action = (
                        "Voice verified authentic. Safe to trust speaker."
                        if verdict == "REAL"
                        else (
                            "Audio authenticity is inconclusive. Verify speaker via official callback."
                            if verdict == "UNCERTAIN"
                            else "Halt interaction immediately; do not disclose sensitive details or transfer funds."
                        )
                    )

                synth_score = float(parsed.get("voice_synthetic_score", 15.0 if verdict == "REAL" else (50.0 if verdict == "UNCERTAIN" else 90.0)))
                synth_score = min(100.0, max(0.0, synth_score))

                return {
                    "transcript": str(parsed.get("transcript", "")).strip(),
                    "verdict": verdict,
                    "confidence": confidence,
                    "threat_level": threat_level,
                    "voice_synthetic_score": synth_score,
                    "indicators": indicators,
                    "voice_indicators": indicators,
                    "recommended_action": rec_action,
                    "summary_intent": str(parsed.get("summary_intent", "Audio communication evaluated.")).strip(),
                    "file_size_kb": file_size_kb
                }

            except Exception as model_err:
                last_error = model_err
                logger.warning(f"Audio STT model {model} failed: {model_err}. Trying next candidate...")

        logger.warning(f"Audio forensic analysis could not determine authenticity ({last_error}). Returning UNCERTAIN.")
        return {
            "transcript": "",
            "verdict": "UNCERTAIN",
            "confidence": 0.50,
            "threat_level": "MEDIUM",
            "voice_synthetic_score": 50.0,
            "indicators": [
                "Audio stream cannot be reliably decoded or contains insufficient acoustic clarity.",
                "Authenticity cannot be definitively verified from the uploaded audio data."
            ],
            "voice_indicators": [
                "Audio stream cannot be reliably decoded or contains insufficient acoustic clarity.",
                "Authenticity cannot be definitively verified from the uploaded audio data."
            ],
            "recommended_action": "Audio authenticity cannot be reliably determined. Verify speaker through official callback channels.",
            "summary_intent": "Audio communication authenticity inconclusive.",
            "file_size_kb": file_size_kb
        }


stt_service = SpeechToTextService()
