import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UserX, 
  Mic, 
  MessageSquareWarning, 
  CreditCard, 
  KeyRound, 
  UserCheck, 
  Shield, 
  PhoneOff, 
  Flag, 
  ArrowRight, 
  Download, 
  FileText,
  Lock,
  Radio,
  ChevronLeft,
  Copy,
  Clock,
  Zap,
  Activity,
  ArrowUpRight,
  Layers,
  Cpu,
  ChevronRight,
  PhoneCall,
  Globe,
  Film,
  FileImage,
  FileCheck
} from 'lucide-react';
import { exportIncidentReportToPdf } from '../utils/pdfExport';
import { AnalysisRecord } from '../types';

interface AnalysisResultViewProps {
  record?: AnalysisRecord;
  onBackToDashboard: () => void;
  onBlockCaller: () => void;
  onReportFraud: () => void;
  onVerifyIndependently: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  record,
  onBackToDashboard,
  onBlockCaller,
  onReportFraud,
  onVerifyIndependently
}) => {
  const [isTakeActionMenuOpen, setIsTakeActionMenuOpen] = useState<boolean>(false);

  const currentRecord: AnalysisRecord = record || {
    id: 'VRY-1042',
    time: '10:42 AM',
    timestamp: Date.now(),
    type: 'voice',
    subject: 'Unknown Caller — Bank Verification Pretext',
    risk: 'HIGH',
    score: 87,
    action: 'Verify',
    identityDetails: {
      callerOrSender: '+1 (555) 932-8411 (VoIP Gateway)',
      verifiedIdentity: null,
      identityTrustScore: 14,
      spoofingIndicators: ['Unverified VoIP Carrier', 'Attestation Header Missing', 'Untrusted Routing ASN'],
      isKnownContact: false,
      stirShakenStatus: 'FAILED'
    },
    communicationDetails: {
      medium: 'Voice Audio Stream (.m4a payload)',
      syntheticProbability: 91,
      linguisticUrgency: 'Extreme Pressure',
      coercionTactics: ['Authority Coercion', 'Imminent 15-Minute Deadline Pressure'],
      syntheticMarkers: ['Neural Vocoder Pitch Jitter', 'Inconsistent Acoustic Reverberation']
    },
    requestedActionDetails: {
      actionType: 'Execute urgent $48,500 wire transfer & disclose MFA token',
      sensitivityLevel: 'Critical',
      financialRiskUsd: 48500,
      destinationRisk: 'High-Risk Account'
    },
    veritySummary: 'Synthetic AI voice clone impersonating executive with coercive urgent wire demand and OTP harvesting intent.'
  };

  const handleDownloadPdf = () => {
    exportIncidentReportToPdf(currentRecord, currentRecord.id || 'VRY-1042');
  };

  // Dynamically compute topic-specific evidence and telemetry based on modality
  const getModalityData = () => {
    switch (currentRecord.type) {
      case 'call':
        return {
          breakdown: [
            { label: 'STIR/SHAKEN Risk', score: 88, color: 'bg-orange-500', textColor: 'text-orange-400' },
            { label: 'Caller ID Spoofing', score: 92, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Conversational Coercion', score: 86, color: 'bg-purple-500', textColor: 'text-purple-400' },
            { label: 'Financial / OTP Demand', score: 90, color: 'bg-red-600', textColor: 'text-red-400' }
          ],
          evidence: [
            {
              id: 'ev-1',
              title: 'STIR/SHAKEN Level C (Untrusted Gateway)',
              icon: PhoneOff,
              color: 'text-orange-400',
              bgColor: 'bg-orange-950/40 border-orange-500/30',
              explanation: 'Inbound carrier relay lacks cryptographic Level A signature. Call originated from an unauthenticated VoIP gateway relay.',
              confidence: '98%'
            },
            {
              id: 'ev-2',
              title: 'Caller ID CLI Header Mismatch',
              icon: UserX,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Displayed phone number does not match originating PSTN switch or verified SIM carrier records.',
              confidence: '95%'
            },
            {
              id: 'ev-3',
              title: 'Digital Arrest / Legal Summons Threat',
              icon: MessageSquareWarning,
              color: 'text-purple-400',
              bgColor: 'bg-purple-950/40 border-purple-500/30',
              explanation: 'Conversational NLP flagged coercive police/customs impersonation threatening immediate arrest if money is not transferred.',
              confidence: '94%'
            },
            {
              id: 'ev-4',
              title: 'Active Solicitation of Verbal OTP',
              icon: KeyRound,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Caller pressured victim to disclose 6-digit banking verification passcode over an insecure verbal channel.',
              confidence: '99%'
            }
          ],
          timeline: [
            { time: '10:42:01', label: 'Call handshake received', detail: 'Inbound SIP trunk handshake from carrier relay (+1 555 932-8411)', icon: Clock },
            { time: '10:42:03', label: 'Telecom identity verified', detail: 'STIR/SHAKEN Level C untrusted gateway flag triggered', icon: PhoneOff },
            { time: '10:42:05', label: 'Audio stream speech-to-text', detail: 'Real-time NLP flagged digital arrest & account seizure phrases', icon: MessageSquareWarning },
            { time: '10:42:08', label: 'Requested action classified', detail: 'Financial transfer & OTP harvesting solicitation detected', icon: KeyRound },
            { time: '10:42:10', label: 'Threat verdict generated', detail: 'Automated telecom block rule primed and 1930 report ready', icon: ShieldAlert }
          ]
        };

      case 'voice': {
        const fd = currentRecord.forensicDetails;
        if (fd) {
          const isReal = fd.verdict === 'REAL';
          const isUncertain = fd.verdict === 'UNCERTAIN';
          const confPercent = Math.round(fd.confidence * 100);

          const breakdown = [
            {
              label: 'Voice Authenticity Confidence',
              score: confPercent,
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-red-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-red-400'
            },
            {
              label: `${fd.manipulationType || 'Synthetic Vocoder'} Signal`,
              score: isReal ? Math.max(1, 100 - confPercent) : (isUncertain ? 50 : confPercent),
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-purple-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-purple-400'
            },
            {
              label: 'Acoustic Formant / Physics Consistency',
              score: isReal ? 95 : (isUncertain ? 45 : 16),
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-orange-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-orange-400'
            },
            {
              label: 'Threat & Risk Level Score',
              score: currentRecord.score,
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-red-600',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-red-400'
            }
          ];

          const evidenceIcons = [Mic, Activity, UserX, ShieldAlert, AlertTriangle, CheckCircle2];
          const rawEvidenceList = fd.evidence && fd.evidence.length > 0 ? fd.evidence : [currentRecord.veritySummary || 'Audio content analyzed by multimodal speech AI.'];
          const evidence = rawEvidenceList.map((evText, idx) => {
            const EvIcon = isReal ? CheckCircle2 : (isUncertain ? AlertTriangle : evidenceIcons[idx % evidenceIcons.length]);
            const evColor = isReal ? 'text-emerald-400' : (isUncertain ? 'text-amber-400' : 'text-red-400');
            const evBg = isReal ? 'bg-emerald-950/40 border-emerald-500/30' : (isUncertain ? 'bg-amber-950/40 border-amber-500/30' : 'bg-red-950/40 border-red-500/30');

            return {
              id: `ev-voice-${idx + 1}`,
              title: `Observation #${idx + 1}: ${fd.manipulationType || (isReal ? 'Verified Authentic Speech' : fd.verdict)}`,
              icon: EvIcon,
              color: evColor,
              bgColor: evBg,
              explanation: evText,
              confidence: `${confPercent}%`
            };
          });

          return {
            breakdown,
            evidence,
            timeline: [
              { time: '10:42:01', label: 'Audio payload ingested', detail: `${currentRecord.identityDetails?.callerOrSender || 'Uploaded audio stream'} loaded into acoustic analyzer`, icon: Clock },
              { time: '10:42:03', label: 'MIME & waveform ingestion', detail: `${currentRecord.communicationDetails?.medium || 'Audio payload'} parsed for frequency examination`, icon: Mic },
              { time: '10:42:06', label: 'Multimodal AI acoustic analysis', detail: 'Evaluated for synthetic vocoder pitch jitter and acoustic reverberation', icon: Activity },
              { time: '10:42:08', label: 'Acoustic markers aggregated', detail: `Verdict: ${fd.verdict} | Type: ${fd.manipulationType || 'Voice Analysis'}`, icon: ShieldAlert },
              { time: '10:42:10', label: 'Threat verdict issued', detail: `Threat Level: ${fd.threatLevel} | Action: ${fd.recommendedAction || currentRecord.action}`, icon: CheckCircle2 }
            ]
          };
        }

        return {
          breakdown: [
            { label: 'Voiceprint Match Risk', score: 82, color: 'bg-orange-500', textColor: 'text-orange-400' },
            { label: 'Vocoder Pitch Jitter', score: 94, color: 'bg-purple-500', textColor: 'text-purple-400' },
            { label: 'Phase Discontinuity', score: 89, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Social Engineering Urgency', score: 93, color: 'bg-red-600', textColor: 'text-red-400' }
          ],
          evidence: [
            {
              id: 'ev-1',
              title: 'Neural Vocoder Pitch Jitter (Cloned Speech)',
              icon: Mic,
              color: 'text-purple-400',
              bgColor: 'bg-purple-950/40 border-purple-500/30',
              explanation: 'Acoustic mel-spectrogram analysis revealed 94% neural speech synthesis probability and phase discontinuities in upper formants.',
              confidence: '94%'
            },
            {
              id: 'ev-2',
              title: 'Missing Room Acoustic Reverberation',
              icon: Activity,
              color: 'text-orange-400',
              bgColor: 'bg-orange-950/40 border-orange-500/30',
              explanation: 'Audio payload lacks natural environmental reverberation and organic breath rhythm, characteristic of text-to-speech models.',
              confidence: '91%'
            },
            {
              id: 'ev-3',
              title: 'Biometric Voiceprint Impersonation',
              icon: UserX,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Acoustic profile deviates significantly from authenticated ground truth voiceprint for the claimed speaker identity.',
              confidence: '96%'
            },
            {
              id: 'ev-4',
              title: 'High-Pressure Emergency Bailout Pretext',
              icon: CreditCard,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Exploits emotional distress ("In hospital / arrested, wire cash now") to force immediate bypass of verification checks.',
              confidence: '99%'
            }
          ],
          timeline: [
            { time: '10:42:01', label: 'Audio payload ingested', detail: 'Audio stream loaded from voice message buffer (.mp3 / .wav)', icon: Clock },
            { time: '10:42:03', label: 'Mel-spectrogram transformed', detail: 'FFT spectrum analyzed for high-frequency synthetic cutoffs', icon: Mic },
            { time: '10:42:06', label: 'Neural vocoder extracted', detail: 'Pitch jitter anomaly score exceeded 0.01% threshold', icon: Activity },
            { time: '10:42:08', label: 'Emotional coercion flagged', detail: 'Distress bailout pretext matched emergency scam pattern', icon: MessageSquareWarning },
            { time: '10:42:10', label: 'Voice clone verdict issued', detail: '94% synthetic speech clone alert dispatched', icon: ShieldAlert }
          ]
        };
      }

      case 'message':
        return {
          breakdown: [
            { label: 'Sender ID Trust', score: 85, color: 'bg-orange-500', textColor: 'text-orange-400' },
            { label: 'Smishing Panic Triggers', score: 91, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Malicious Link Risk', score: 94, color: 'bg-purple-500', textColor: 'text-purple-400' },
            { label: 'Credential Harvesting', score: 96, color: 'bg-red-600', textColor: 'text-red-400' }
          ],
          evidence: [
            {
              id: 'ev-1',
              title: 'Spoofed Alphanumeric Sender Header',
              icon: UserX,
              color: 'text-orange-400',
              bgColor: 'bg-orange-950/40 border-orange-500/30',
              explanation: 'Message originated from an unverified bulk SMS gateway imitating an official financial institution header.',
              confidence: '97%'
            },
            {
              id: 'ev-2',
              title: 'Panic Coercion ("Account Blocked in 2 Hours")',
              icon: MessageSquareWarning,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'NLP text analysis flagged artificial urgency coercion designed to induce panic and prevent independent verification.',
              confidence: '95%'
            },
            {
              id: 'ev-3',
              title: 'Malicious Shortlink in Message Body',
              icon: Globe,
              color: 'text-purple-400',
              bgColor: 'bg-purple-950/40 border-purple-500/30',
              explanation: 'Embedded link expands into an unindexed phishing portal on an offshore newly registered domain.',
              confidence: '98%'
            },
            {
              id: 'ev-4',
              title: 'Fake KYC / Credential Harvesting Form',
              icon: KeyRound,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Demands entry of debit card numbers, NetBanking passwords, and live SMS OTPs under the guise of KYC renewal.',
              confidence: '99%'
            }
          ],
          timeline: [
            { time: '10:42:01', label: 'Message payload received', detail: 'SMS / WhatsApp text string parsed into NLP pipeline', icon: Clock },
            { time: '10:42:03', label: 'Sender header verified', detail: 'Unregistered bulk gateway detected (No official DLT registration)', icon: UserX },
            { time: '10:42:05', label: 'Shortlink expanded', detail: 'Redirect chain traced to newly registered phishing host', icon: Globe },
            { time: '10:42:07', label: 'Panic triggers extracted', detail: 'Urgent 2-hour account lockout threat flagged', icon: MessageSquareWarning },
            { time: '10:42:10', label: 'Smishing alert generated', detail: 'High-risk SMS phishing verdict issued with block recommendation', icon: ShieldAlert }
          ]
        };

      case 'media': {
        const fd = currentRecord.forensicDetails;
        if (fd) {
          const isReal = fd.verdict === 'REAL';
          const isUncertain = fd.verdict === 'UNCERTAIN';
          const confPercent = Math.round(fd.confidence * 100);

          const breakdown = [
            {
              label: 'Visual Model Confidence',
              score: confPercent,
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-red-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-red-400'
            },
            {
              label: `${fd.manipulationType || 'Generative Artifact'} Signal`,
              score: isReal ? Math.max(1, 100 - confPercent) : (isUncertain ? 50 : confPercent),
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-purple-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-purple-400'
            },
            {
              label: 'Optical Physics Consistency',
              score: isReal ? 96 : (isUncertain ? 45 : 18),
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-orange-500',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-orange-400'
            },
            {
              label: 'Threat & Risk Level Score',
              score: currentRecord.score,
              color: isReal ? 'bg-emerald-500' : isUncertain ? 'bg-amber-500' : 'bg-red-600',
              textColor: isReal ? 'text-emerald-400' : isUncertain ? 'text-amber-400' : 'text-red-400'
            }
          ];

          const evidenceIcons = [Film, FileImage, ShieldAlert, AlertTriangle, FileCheck, CheckCircle2];
          const rawEvidenceList = fd.evidence && fd.evidence.length > 0 ? fd.evidence : [currentRecord.veritySummary || 'Visual content analyzed by multimodal AI model.'];
          const evidence = rawEvidenceList.map((evText, idx) => {
            const EvIcon = isReal ? CheckCircle2 : (isUncertain ? AlertTriangle : evidenceIcons[idx % evidenceIcons.length]);
            const evColor = isReal ? 'text-emerald-400' : (isUncertain ? 'text-amber-400' : 'text-red-400');
            const evBg = isReal ? 'bg-emerald-950/40 border-emerald-500/30' : (isUncertain ? 'bg-amber-950/40 border-amber-500/30' : 'bg-red-950/40 border-red-500/30');

            return {
              id: `ev-media-${idx + 1}`,
              title: `Observation #${idx + 1}: ${fd.manipulationType || (isReal ? 'Verified Authentic' : fd.verdict)}`,
              icon: EvIcon,
              color: evColor,
              bgColor: evBg,
              explanation: evText,
              confidence: `${confPercent}%`
            };
          });

          return {
            breakdown,
            evidence,
            timeline: [
              { time: '10:42:01', label: 'Media container decoded', detail: `${currentRecord.identityDetails?.callerOrSender || 'Uploaded file'} loaded into multimodal analyzer`, icon: Clock },
              { time: '10:42:03', label: 'MIME & frame extraction', detail: 'Actual file payload / representative frames processed', icon: FileImage },
              { time: '10:42:06', label: 'Multimodal AI vision model scan', detail: 'Evaluated for synthetic synthesis, GAN seams, and diffusion artifacts', icon: Film },
              { time: '10:42:08', label: 'Forensic signals aggregated', detail: `Verdict: ${fd.verdict} | Manipulation: ${fd.manipulationType}`, icon: FileCheck },
              { time: '10:42:10', label: 'Risk & threat rating issued', detail: `Threat Level: ${fd.threatLevel} | Action: ${fd.recommendedAction}`, icon: ShieldAlert }
            ]
          };
        }

        return {
          breakdown: [
            { label: 'GAN Artifact Density', score: 88, color: 'bg-purple-500', textColor: 'text-purple-400' },
            { label: 'EXIF Metadata Integrity', score: 84, color: 'bg-orange-500', textColor: 'text-orange-400' },
            { label: 'Counterfeit Document Stamp', score: 92, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Extortion Pattern Risk', score: 95, color: 'bg-red-600', textColor: 'text-red-400' }
          ],
          evidence: [
            {
              id: 'ev-1',
              title: 'GAN / Deepfake Facial Blending Artifacts',
              icon: Film,
              color: 'text-purple-400',
              bgColor: 'bg-purple-950/40 border-purple-500/30',
              explanation: 'Computer vision pixel analysis detected inconsistent boundary blending and corneal reflection asymmetry.',
              confidence: '91%'
            },
            {
              id: 'ev-2',
              title: 'Tampered EXIF & Software Editing Signatures',
              icon: FileImage,
              color: 'text-orange-400',
              bgColor: 'bg-orange-950/40 border-orange-500/30',
              explanation: 'File metadata lacks authentic camera hardware tags and contains signatures of digital generative software.',
              confidence: '96%'
            },
            {
              id: 'ev-3',
              title: 'Counterfeit Official Seal & Stamp',
              icon: FileCheck,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Document features a forged police crest and counterfeit court seal imitating a digital arrest warrant.',
              confidence: '98%'
            },
            {
              id: 'ev-4',
              title: 'Digital Arrest Extortion Demand',
              icon: ShieldAlert,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Fabricated legal document used to extort immediate bail payment to avoid police raid.',
              confidence: '99%'
            }
          ],
          timeline: [
            { time: '10:42:01', label: 'Media container decoded', detail: 'High-resolution frame buffer loaded for visual forensics', icon: Clock },
            { time: '10:42:03', label: 'EXIF metadata scanned', detail: 'Software tampering markers & missing camera tags detected', icon: FileImage },
            { time: '10:42:06', label: 'GAN artifact filter ran', detail: 'Facial boundary blending seams identified', icon: Film },
            { time: '10:42:08', label: 'Document emblem verified', detail: 'Counterfeit government stamp recognized against database', icon: FileCheck },
            { time: '10:42:10', label: 'Forgery verdict issued', detail: 'Deepfake & counterfeit document alert dispatched', icon: ShieldAlert }
          ]
        };
      }

      case 'url':
      default: {
        const fd = currentRecord.forensicDetails;
        if (fd) {
          const isSafe = fd.verdict === 'SAFE';
          const isUnknown = fd.verdict === 'UNKNOWN';
          const confPercent = Math.round(fd.confidence * 100);

          const breakdown = [
            {
              label: 'Domain Reputation & Safety',
              score: isSafe ? confPercent : (isUnknown ? 50 : Math.max(5, 100 - confPercent)),
              color: isSafe ? 'bg-emerald-500' : isUnknown ? 'bg-amber-500' : 'bg-red-500',
              textColor: isSafe ? 'text-emerald-400' : isUnknown ? 'text-amber-400' : 'text-red-400'
            },
            {
              label: 'Typosquatting & Lookalike Risk',
              score: isSafe ? 2 : (isUnknown ? 45 : confPercent),
              color: isSafe ? 'bg-emerald-500' : isUnknown ? 'bg-amber-500' : 'bg-purple-500',
              textColor: isSafe ? 'text-emerald-400' : isUnknown ? 'text-amber-400' : 'text-purple-400'
            },
            {
              label: 'Host Structure & Protocol',
              score: currentRecord.requestedActionDetails?.destinationRisk?.includes('Insecure') ? 25 : 95,
              color: currentRecord.requestedActionDetails?.destinationRisk?.includes('Insecure') ? 'bg-red-500' : 'bg-emerald-500',
              textColor: currentRecord.requestedActionDetails?.destinationRisk?.includes('Insecure') ? 'text-red-400' : 'text-emerald-400'
            },
            {
              label: 'Threat & Risk Level Score',
              score: currentRecord.score,
              color: isSafe ? 'bg-emerald-500' : isUnknown ? 'bg-amber-500' : 'bg-red-600',
              textColor: isSafe ? 'text-emerald-400' : isUnknown ? 'text-amber-400' : 'text-red-400'
            }
          ];

          const evidenceIcons = [Globe, AlertTriangle, KeyRound, Lock, ShieldAlert, CheckCircle2];
          const rawEvidenceList = fd.evidence && fd.evidence.length > 0 ? fd.evidence : [currentRecord.veritySummary || 'URL structure and domain reputation analyzed.'];
          const evidence = rawEvidenceList.map((evText, idx) => {
            const EvIcon = isSafe ? CheckCircle2 : (isUnknown ? AlertTriangle : evidenceIcons[idx % evidenceIcons.length]);
            const evColor = isSafe ? 'text-emerald-400' : (isUnknown ? 'text-amber-400' : 'text-red-400');
            const evBg = isSafe ? 'bg-emerald-950/40 border-emerald-500/30' : (isUnknown ? 'bg-amber-950/40 border-amber-500/30' : 'bg-red-950/40 border-red-500/30');

            return {
              id: `ev-url-${idx + 1}`,
              title: `Observation #${idx + 1}: ${fd.manipulationType || (isSafe ? 'Legitimate Domain' : fd.verdict)}`,
              icon: EvIcon,
              color: evColor,
              bgColor: evBg,
              explanation: evText,
              confidence: `${confPercent}%`
            };
          });

          return {
            breakdown,
            evidence,
            timeline: [
              { time: '10:42:01', label: 'URL payload ingested', detail: `${currentRecord.identityDetails?.callerOrSender || 'Target URL'} parsed and syntax validated`, icon: Clock },
              { time: '10:42:03', label: 'Domain & protocol inspection', detail: 'Evaluated host structure, HTTPS encryption, and homoglyphs', icon: Globe },
              { time: '10:42:06', label: 'Cybersecurity heuristics & AI reasoning', detail: 'Analyzed typosquatting, credential parameters, and reputation signals', icon: Lock },
              { time: '10:42:08', label: 'Threat indicators aggregated', detail: `Verdict: ${fd.verdict} | Risk: ${fd.threatLevel}`, icon: AlertTriangle },
              { time: '10:42:10', label: 'Final threat rating issued', detail: `Threat Level: ${fd.threatLevel} | Action: ${fd.recommendedAction || currentRecord.action}`, icon: ShieldAlert }
            ]
          };
        }

        return {
          breakdown: [
            { label: 'Domain Age & Reputation', score: 94, color: 'bg-orange-500', textColor: 'text-orange-400' },
            { label: 'Typosquatting Lookalike', score: 96, color: 'bg-red-500', textColor: 'text-red-400' },
            { label: 'Credential Harvesting Kit', score: 98, color: 'bg-red-600', textColor: 'text-red-400' },
            { label: 'SSL Host Risk', score: 85, color: 'bg-purple-500', textColor: 'text-purple-400' }
          ],
          evidence: [
            {
              id: 'ev-1',
              title: 'Newly Registered Phishing Domain (< 4 Days)',
              icon: Globe,
              color: 'text-orange-400',
              bgColor: 'bg-orange-950/40 border-orange-500/30',
              explanation: 'Domain was created within the last 96 hours with high DNS entropy on bulletproof offshore hosting infrastructure.',
              confidence: '99%'
            },
            {
              id: 'ev-2',
              title: 'Homoglyph Brand Impersonation',
              icon: AlertTriangle,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Domain uses lookalike Unicode/Punycode characters mimicking authentic banking and payment portals.',
              confidence: '96%'
            },
            {
              id: 'ev-3',
              title: 'Intercepted Credential Harvesting Form',
              icon: KeyRound,
              color: 'text-red-400',
              bgColor: 'bg-red-950/40 border-red-500/30',
              explanation: 'Headless sandbox intercepted unencrypted POST handlers harvesting user passwords, card PINs, and OTPs.',
              confidence: '99%'
            },
            {
              id: 'ev-4',
              title: 'Suspicious Automated SSL Certificate',
              icon: Lock,
              color: 'text-amber-400',
              bgColor: 'bg-amber-950/40 border-amber-500/30',
              explanation: 'Automated free certificate deployed on fake hosting to simulate browser security padlock.',
              confidence: '92%'
            }
          ],
          timeline: [
            { time: '10:42:01', label: 'URL sandbox instantiated', detail: 'Headless isolated browser sandbox launched for URL inspection', icon: Clock },
            { time: '10:42:03', label: 'Domain WHOIS queried', detail: 'Newly registered domain (< 4 days old) flagged on high-risk ASN', icon: Globe },
            { time: '10:42:06', label: 'Typosquatting evaluated', detail: 'Homoglyph character substitution detected mimicking brand portal', icon: AlertTriangle },
            { time: '10:42:08', label: 'DOM form inputs scraped', detail: 'Phishing kit credential harvesting forms detected in HTML payload', icon: KeyRound },
            { time: '10:42:10', label: 'Domain blacklisted', detail: 'Critical phishing verdict issued and automatic browser block primed', icon: ShieldAlert }
          ]
        };
      }
    }
  };

  const isSafe = currentRecord.risk === 'LOW';
  const isHighRisk = currentRecord.risk === 'CRITICAL' || currentRecord.risk === 'HIGH';
  const isMediumRisk = currentRecord.risk === 'MEDIUM';

  const topicData = getModalityData();
  
  // Dynamic signal breakdown adapting to genuine vs high-risk interaction
  const signalBreakdown = currentRecord.forensicDetails
    ? topicData.breakdown
    : isSafe
    ? [
        { label: 'Identity Authenticity', score: currentRecord.identityDetails?.identityTrustScore ?? 96, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
        { label: 'Content Optical Integrity', score: 98, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
        { label: 'Synthetic Anomaly Probability', score: currentRecord.communicationDetails?.syntheticProbability ?? 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
        { label: 'Interaction Safety Index', score: 95, color: 'bg-emerald-500', textColor: 'text-emerald-400' }
      ]
    : topicData.breakdown;

  // Dynamic evidence items reflecting authentic validation or threat findings
  const detectedEvidenceItems = currentRecord.forensicDetails
    ? topicData.evidence
    : isSafe
    ? [
        {
          id: 'ev-safe-1',
          title: 'Sensor Optics & Pixel Consistency',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30',
          explanation: 'Pixel distribution, noise levels, and optical compression curves match genuine hardware capture with no generative diffusion smoothing or GAN seams.',
          confidence: '99%'
        },
        {
          id: 'ev-safe-2',
          title: 'EXIF Metadata & Cryptographic Integrity',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30',
          explanation: 'File metadata contains authentic camera hardware signatures, consistent color profiles, and legitimate capture timestamp sequences.',
          confidence: '98%'
        },
        {
          id: 'ev-safe-3',
          title: 'Document / Graphic Structure Authenticity',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30',
          explanation: 'Typography, seals, emblems, and visual geometry conform to verified standards with zero counterfeit layer compositing.',
          confidence: '97%'
        },
        {
          id: 'ev-safe-4',
          title: 'Zero Coercion or Fraud Intent',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30',
          explanation: 'Conversational and contextual analysis identified zero extortion demands, fake legal threats, or credential harvesting traps.',
          confidence: '100%'
        }
      ]
    : topicData.evidence;
  const timelineEvents = topicData.timeline;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn py-2">
      
      {/* ============================================================ */}
      {/* 1. HEADER                                                    */}
      {/* ← Back to History | Incident VRY-1042 | Status | Action      */}
      {/* ============================================================ */}
      <div className="relative border-b border-slate-800/80 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-950/80 hover:border-cyan-300 px-3.5 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.45)] mb-2 cursor-pointer active:scale-95"
              title="Back to queue"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3] text-cyan-400" />
              <span className="tracking-wide">Back to Queue / History</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
                <span>Incident {currentRecord.id}</span>
              </h1>
              <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-sm ${
                currentRecord.risk === 'CRITICAL' || currentRecord.risk === 'HIGH'
                  ? 'bg-red-500 text-slate-950'
                  : 'bg-emerald-400 text-slate-950'
              }`}>
                {currentRecord.risk} RISK
              </span>
            </div>

            {/* Small Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono pt-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">Timestamp:</span>
                <strong className="text-slate-200">{currentRecord.time}</strong>
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">Analysis Type:</span>
                <strong className="text-cyan-400 font-semibold uppercase">{currentRecord.type}</strong>
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-400">
                Origin: {currentRecord.identityDetails.callerOrSender}
              </span>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5">
            
            {/* Primary Action Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTakeActionMenuOpen(!isTakeActionMenuOpen)}
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Take Action</span>
              </button>

              {isTakeActionMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-fadeIn text-xs">
                  <button
                    onClick={() => {
                      setIsTakeActionMenuOpen(false);
                      onVerifyIndependently();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Verify Independently</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTakeActionMenuOpen(false);
                      onBlockCaller();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-300 hover:bg-red-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4 text-red-400" />
                    <span>Block Caller</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTakeActionMenuOpen(false);
                      onReportFraud();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Report Fraud</span>
                  </button>
                </div>
              )}
            </div>

            {/* Download PDF Dossier */}
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download full forensic PDF dossier"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">PDF Dossier</span>
            </button>

            <button
              onClick={() => navigator.clipboard?.writeText('VERITY Incident VRY-1042: High Risk (87/100) - Unverified Caller requesting Wire Transfer & OTP')}
              className="p-2.5 text-xs font-medium text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Copy incident summary"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. INCIDENT SUMMARY CARD                                     */}
      {/* ============================================================ */}
      <div className={`relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 backdrop-blur-md space-y-6 ${
        isSafe
          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900/95 to-slate-900 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.25)]'
          : isMediumRisk
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900/95 to-slate-900 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
          : 'bg-gradient-to-r from-red-950/70 via-slate-900/95 to-slate-900 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.25)]'
      }`}>
        
        {/* Ambient flare */}
        <div className={`absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none rounded-full ${
          isSafe ? 'bg-emerald-600/10' : isMediumRisk ? 'bg-amber-600/10' : 'bg-red-600/10'
        }`} />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Dominant Risk & Warning / Verified Authentic */}
          <div className="flex items-start gap-5">
            <div className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 shrink-0 shadow-lg ${
              isSafe
                ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-400 shadow-emerald-950'
                : isMediumRisk
                ? 'bg-amber-600/20 border-amber-500/60 text-amber-400 shadow-amber-950'
                : 'bg-red-600/20 border-red-500/60 text-red-400 shadow-red-950'
            }`}>
              {isSafe ? (
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : (
                <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
              <div className={`absolute inset-0 rounded-2xl opacity-75 ${
                isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20 animate-ping'
              }`} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-sm ${
                  isSafe
                    ? 'bg-emerald-400 text-slate-950'
                    : isMediumRisk
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-red-500 text-slate-950'
                }`}>
                  {isSafe ? 'VERIFIED AUTHENTIC' : `${currentRecord.risk} RISK`}
                </span>
                <span className={`text-xs font-mono font-semibold tracking-wider uppercase ${
                  isSafe ? 'text-emerald-400' : isMediumRisk ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {isSafe ? 'Forensic Authenticity Check Passed' : 'Multi-Factor Fraud Alert'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {currentRecord.forensicDetails
                  ? (currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE'
                      ? (currentRecord.type === 'url' ? 'DESTINATION VERIFIED SAFE' : 'CONTENT VERIFIED REAL & AUTHENTIC')
                      : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN'
                      ? 'INCONCLUSIVE EVIDENCE — EXERCISE CAUTION'
                      : currentRecord.forensicDetails.verdict === 'SUSPICIOUS'
                      ? 'SUSPICIOUS INDICATORS DETECTED'
                      : currentRecord.forensicDetails.verdict === 'SPAM'
                      ? 'SUSPICIOUS SPAM URL DETECTED'
                      : currentRecord.forensicDetails.verdict === 'MALICIOUS'
                      ? 'MALICIOUS CYBER THREAT DETECTED'
                      : 'MANIPULATED / SYNTHETIC MEDIA DETECTED')
                  : isSafe
                  ? 'CONTENT VERIFIED REAL & AUTHENTIC'
                  : 'DO NOT CONTINUE THIS INTERACTION'}
              </h2>

              <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl leading-relaxed">
                "{currentRecord.veritySummary || (isSafe ? 'Verified authentic media with natural capture characteristics. No deepfake or fraud detected.' : 'Multiple correlated fraud indicators detected.')}"
              </p>
            </div>
          </div>

          {/* Right: Risk Score */}
          <div className={`flex flex-col items-start md:items-end justify-center p-4 sm:p-5 rounded-xl bg-slate-950/80 border shrink-0 shadow-inner ${
            isSafe ? 'border-emerald-500/40' : 'border-red-500/40'
          }`}>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              VERITY Risk Score
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className={`text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tight ${
                isSafe ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {currentRecord.score}
              </span>
              <span className="text-sm font-mono text-slate-500 font-semibold">
                / 100
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold ${
              isSafe ? 'text-emerald-400' : 'text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
              <span>{isSafe ? 'Verified Authentic / Minimal Threat' : 'Severe Threat Probability'}</span>
            </div>
          </div>

        </div>

        {/* 4 Summary Pills Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Identity:</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isSafe
                ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                : 'text-orange-300 bg-orange-950/70 border-orange-500/40'
            }`}>
              {isSafe ? 'Verified Origin' : 'Suspicious'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Communication:</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isSafe
                ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                : 'text-red-300 bg-red-950/70 border-red-500/40'
            }`}>
              {isSafe ? 'Authentic Content' : 'High Risk'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Media / Voice:</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isSafe
                ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                : 'text-purple-300 bg-purple-950/70 border-purple-500/40'
            }`}>
              {currentRecord.forensicDetails
                ? `${currentRecord.forensicDetails.verdict.replace('_', ' ')} (${Math.round(currentRecord.forensicDetails.confidence * 100)}%)`
                : isSafe
                ? 'Genuine Asset (0% Synthetic)'
                : `${currentRecord.communicationDetails?.syntheticProbability || 91}% Synthetic`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Requested Action:</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border truncate max-w-[170px] ${
              isSafe
                ? 'text-emerald-300 bg-emerald-950/70 border-emerald-500/40'
                : 'text-red-300 bg-red-950/70 border-red-500/40'
            }`} title={currentRecord.forensicDetails?.recommendedAction || currentRecord.requestedActionDetails?.actionType}>
              {currentRecord.forensicDetails?.recommendedAction || (isSafe ? 'Standard / Safe' : 'Financial / OTP Request')}
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. SIGNAL BREAKDOWN (WEIGHTED CORRELATION)                   */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Signal Breakdown</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              VERITY combines multiple signals across independent threat vectors into one weighted risk score.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Overall Risk:</span>
            <span className={`text-base font-black tabular-nums ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{currentRecord.score}%</span>
          </div>
        </div>

        {/* Progress Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {signalBreakdown.map((signal, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-medium">{signal.label}</span>
                <span className={`font-bold ${signal.textColor}`}>{signal.score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${signal.color}`}
                  style={{ width: `${signal.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. DETECTED EVIDENCE (6 CARDS WITH CONFIDENCE)               */}
      {/* ============================================================ */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Detected Evidence</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500">{detectedEvidenceItems.length} Correlated Telemetry Points</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {detectedEvidenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${item.bgColor}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <h4 className="text-xs font-bold text-slate-100 leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    {item.explanation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Confidence:</span>
                  <span className={`font-bold ${item.color}`}>{item.confidence}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. RECOMMENDED RESPONSE PANEL                                */}
      {/* ============================================================ */}
      <div className={`p-6 sm:p-7 rounded-2xl border shadow-xl backdrop-blur-md space-y-5 ${
        isSafe
          ? 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/30 border-emerald-500/40'
          : 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-red-950/30 border-slate-800'
      }`}>
        
        <div className="space-y-1">
          <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${
            isSafe ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <Lock className="w-4 h-4" />
            <span>Recommended Response Protocol</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {currentRecord.forensicDetails
              ? (currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE'
                  ? 'CONTENT VERIFIED SAFE TO TRUST'
                  : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN'
                  ? 'INSUFFICIENT EVIDENCE — INDEPENDENT VERIFICATION RECOMMENDED'
                  : currentRecord.forensicDetails.verdict === 'SUSPICIOUS' || currentRecord.forensicDetails.verdict === 'SPAM'
                  ? 'SUSPICIOUS CONTENT — DO NOT PROVIDE CREDENTIALS'
                  : currentRecord.forensicDetails.verdict === 'MALICIOUS'
                  ? 'MALICIOUS THREAT — BLOCK & ISOLATE IMMEDIATELY'
                  : 'SYNTHETIC / MANIPULATED CONTENT — RESTRICT DISSEMINATION')
              : isSafe
              ? 'CONTENT VERIFIED SAFE TO TRUST'
              : 'DO NOT CONTINUE THIS INTERACTION'}
          </h3>
        </div>

        {/* Recommended Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {currentRecord.forensicDetails ? (
            <>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSafe || currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE' ? 'text-emerald-400' : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN' ? 'text-amber-400' : 'text-red-400'}`} />
                <span>Verdict: {currentRecord.forensicDetails.verdict.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSafe || currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE' ? 'text-emerald-400' : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN' ? 'text-amber-400' : 'text-red-400'}`} />
                <span>Confidence: {Math.round(currentRecord.forensicDetails.confidence * 100)}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSafe || currentRecord.forensicDetails.threatLevel === 'LOW' ? 'text-emerald-400' : currentRecord.forensicDetails.threatLevel === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'}`} />
                <span>Threat: {currentRecord.forensicDetails.threatLevel}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate" title={currentRecord.forensicDetails.recommendedAction}>Action: {currentRecord.forensicDetails.recommendedAction}</span>
              </div>
            </>
          ) : isSafe ? (
            <>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Content verified real & authentic</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero deepfake or AI synthesis detected</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cryptographic & EXIF integrity verified</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Safe to store, view, and process</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>End the interaction immediately</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Do not share OTP or transfer funds</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verify through an official channel</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>File complaint to National Cybercrime 1930</span>
              </div>
            </>
          )}
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {isSafe ? (
              <>
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Verified Safe</span>
                </button>
                <button
                  type="button"
                  onClick={onVerifyIndependently}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Cross-Reference Directory</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onVerifyIndependently}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Verify Independently</span>
                </button>
                <button
                  type="button"
                  onClick={onBlockCaller}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-950 flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Block Sender / Blacklist</span>
                </button>
                <button
                  type="button"
                  onClick={onReportFraud}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report Fraud (1930)</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
          >
            Return to Investigation Queue
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 7. INCIDENT TIMELINE                                         */}
      {/* 10:42:01 — Interaction received                              */}
      {/* 10:42:03 — Identity analyzed                                 */}
      {/* 10:42:05 — Communication analyzed                            */}
      {/* 10:42:07 — AI voice indicators detected                      */}
      {/* 10:42:08 — Requested action classified                       */}
      {/* 10:42:09 — Risk score calculated                             */}
      {/* 10:42:10 — HIGH RISK alert generated                         */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Incident Investigation Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Sub-second Multi-Threaded Forensic Execution</span>
        </div>

        <div className="relative pl-6 space-y-4 border-l border-slate-800 ml-2 pt-1">
          {timelineEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <div key={idx} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border border-cyan-400/80 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-400 font-bold">{evt.time}</span>
                    <span className="text-slate-600">—</span>
                    <span className="text-slate-200 font-semibold">{evt.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {evt.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 8. CORE ARCHITECTURAL MESSAGE                                */}
      {/* ============================================================ */}
      <div className="py-4 text-center border-t border-slate-900">
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          VERITY does not depend on a single signal. It correlates <span className="text-cyan-300 font-semibold">Identity</span> + <span className="text-blue-300 font-semibold">Communication</span> + <span className="text-purple-300 font-semibold">AI Voice Indicators</span> + <span className="text-red-300 font-semibold">Requested Action</span> into a single unified zero-trust risk verdict.
        </p>
      </div>

    </div>
  );
};
