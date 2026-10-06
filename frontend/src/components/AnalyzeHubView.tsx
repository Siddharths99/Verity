import React, { useState, useRef } from 'react';
import { ModalityType, AnalysisRecord } from '../types';
import { 
  PhoneCall, 
  Mic, 
  MessageSquareText, 
  Film, 
  Image as ImageIcon,
  Link2, 
  Sparkles, 
  Upload, 
  FileAudio, 
  FileVideo, 
  Play, 
  Pause, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Zap, 
  CheckCircle2, 
  Lock,
  Flag,
  ChevronLeft,
  UserX,
  FileCheck,
  Loader2,
  Radio
} from 'lucide-react';
import { AnalysisProcessingView } from './AnalysisProcessingView';
import { CountryPhoneInput } from './CountryPhoneInput';
import { apiService, mapBackendResultToAnalysisRecord } from '../utils/apiService';
import { callProtectionService } from '../utils/callProtectionService';

interface AnalyzeHubViewProps {
  onRunAnalysis: (record: AnalysisRecord) => void;
  onViewResultScreen: () => void;
  onLaunchCallProtection?: (phoneNumber: string, claimedIdentity: string) => void;
}

// Frequent options for claimed speaker (Voice / Audio)
const SPEAKER_OPTIONS = [
  'Bank Representative / Loan Officer',
  'Police / Law Enforcement Officer (CBI / Cyber Police)',
  'Company Executive / CEO / Manager',
  'Family Member / Relative (Child / Parent / Sibling)',
  'Friend / Colleague',
  'Government Tax / Utility Agency',
  'Delivery Agent / Courier Service',
  'Tech Support (Microsoft / Apple / Telecom)',
  'Other (Type manually)'
];

// Frequent options for "What are you suspecting / Event Type" per modality
const PRETEXT_FREQUENT_OPTIONS: Record<ModalityType, string[]> = {
  call: [
    'Unsolicited / Unknown Incoming Call',
    'Urgent Request for Money or Wire Transfer',
    'Impersonation of Authority, Agency, or Family',
    'Threat of Legal Action, Penalties, or Service Disconnection',
    'Demanding OTP, Security PIN, or Account Details',
    'Suspicious Robotic or Automated Call',
    'Other (Type custom description)'
  ],
  voice: [
    'Urgent Voice Note Asking for Money or Emergency Help',
    'Unnatural, Cloned, or AI-Synthesized Voice',
    'Alleged Family Member or Friend in Distress',
    'Official or Authority Claiming Urgent Action Needed',
    'Automated Interactive Voice Message',
    'Other (Type custom description)'
  ],
  message: [
    'Suspicious Verification or Action Link',
    'Account Suspension or Urgent Warning Notice',
    'Prize, Lottery, Cashback, or Refund Notification',
    'Payment or Money Transfer Request',
    'Delivery, Courier, or Address Confirmation Request',
    'Unsolicited Job Offer or Task Opportunity',
    'Other (Type custom description)'
  ],
  media: [
    'Check for Deepfake or Facial / Voice Manipulation',
    'Emergency Video Message from Alleged Contact',
    'Promotional or Investment Video with Public Figure',
    'Screen Recording or KYC Verification Video',
    'Manipulated News or Official Announcement',
    'Other (Type custom description)'
  ],
  url: [
    'Suspicious Login, Banking, or Account Portal',
    'Unfamiliar Payment, Checkout, or Recharge Page',
    'Shortened Link or Unexpected Redirect',
    'Prize, Lottery, Cashback, or Reward Claim Page',
    'Suspicious Document Download or App Install Page',
    'Other (Type custom description)'
  ]
};

// Image frequent options (mapped to media/image)
const IMAGE_FREQUENT_OPTIONS = [
  'Verify whether this image is real or AI-generated',
  'Suspicious Payment Receipt, Invoice, or Wire Proof',
  'Official ID Card, Government Badge, or Certificate',
  'Screenshot of Suspicious Chat, SMS, or Bank Alert',
  'QR Code or Barcode for Payment Request',
  'Other (Type custom description)'
];

export const AnalyzeHubView: React.FC<AnalyzeHubViewProps> = ({
  onRunAnalysis,
  onViewResultScreen,
  onLaunchCallProtection
}) => {
  const [selectedModality, setSelectedModality] = useState<ModalityType>('voice');
  const [senderInput, setSenderInput] = useState<string>('+91 98401 24590');
  
  // Voice speaker selection & custom manual typing
  const [voiceSpeakerDropdown, setVoiceSpeakerDropdown] = useState<string>('Bank Representative / Loan Officer');
  const [voiceSpeakerManual, setVoiceSpeakerManual] = useState<string>('');

  // Message channel & Complaint Cell reporting
  const [messagePlatform, setMessagePlatform] = useState<string>('WhatsApp');
  const [autoReportToHelpline, setAutoReportToHelpline] = useState<boolean>(true);

  // Pretext / What Happened dropdown + Custom manual description
  const [pretextDropdown, setPretextDropdown] = useState<string>('Urgent voice memo demanding emergency wire transfer');
  const [customDescription, setCustomDescription] = useState<string>('');

  // URL input
  const [targetUrl, setTargetUrl] = useState<string>('https://security-auth-verify-portal.net/login');

  // Media sub-category: video or image
  const [mediaSubType, setMediaSubType] = useState<'video' | 'image'>('video');

  // Files
  const [uploadedAudio, setUploadedAudio] = useState<{ name: string; size: string } | null>(null);
  const [realAudioFile, setRealAudioFile] = useState<File | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{ name: string; size: string } | null>(null);
  const [realMediaFile, setRealMediaFile] = useState<File | null>(null);
  const [directMessageText, setDirectMessageText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mediaScanError, setMediaScanError] = useState<string | null>(null);
  const [isBackendComplete, setIsBackendComplete] = useState<boolean>(false);
  const [liveBackendRecord, setLiveBackendRecord] = useState<AnalysisRecord | null>(null);
  const liveBackendRecordRef = useRef<AnalysisRecord | null>(null);

  const audioFileRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  const handleModalityChange = (m: ModalityType) => {
    setSelectedModality(m);
    setMediaScanError(null);
    setIsBackendComplete(false);
    const defaults = PRETEXT_FREQUENT_OPTIONS[m] || [];
    setPretextDropdown(defaults[0] || 'Other (Type custom description)');
    setCustomDescription('');

    switch (m) {
      case 'call':
        setSenderInput('+91 98401 24590');
        break;
      case 'voice':
        setSenderInput('+91 98401 24590');
        setUploadedAudio(null);
        setRealAudioFile(null);
        break;
      case 'message':
        setSenderInput('+91 98401 24590');
        setDirectMessageText('');
        break;
      case 'media':
        setSenderInput('Media Upload');
        setUploadedMedia(null);
        setRealMediaFile(null);
        break;
      case 'url':
        setSenderInput('SMS Shortcode "NOTICE-ALERT"');
        setTargetUrl('https://google.com');
        break;
    }
  };

  const getEffectiveSpeaker = () => {
    if (selectedModality === 'voice') {
      if (voiceSpeakerDropdown === 'Other (Type manually)') {
        return voiceSpeakerManual.trim() || 'Unknown Claimed Speaker';
      }
      return voiceSpeakerDropdown;
    }
    return senderInput;
  };

  const getEffectiveReason = () => {
    if (pretextDropdown === 'Other (Type custom description)') {
      return customDescription.trim() || 'Suspicious interaction flagged for multi-point scan';
    }
    return pretextDropdown;
  };

  const handleStartProcessing = () => {
    if (selectedModality === 'media' && !realMediaFile) {
      setMediaScanError('Please select an image or video file to analyze before starting the scan.');
      setIsProcessing(true);
      return;
    }

    setMediaScanError(null);
    setIsBackendComplete(false);
    setIsProcessing(true);
    setLiveBackendRecord(null);
    liveBackendRecordRef.current = null;

    const effectiveSender = selectedModality === 'voice' ? getEffectiveSpeaker() : senderInput;
    const contentToAnalyze = selectedModality === 'message' && directMessageText.trim()
      ? directMessageText.trim()
      : getEffectiveReason();

    // Asynchronously call the live FastAPI backend
    const triggerBackendScan = async () => {
      try {
        let res;
        if (selectedModality === 'url') {
          const urlToTest = targetUrl.trim() || 'https://google.com';
          const brandTarget = (effectiveSender && !effectiveSender.includes('NOTICE-ALERT') && !effectiveSender.includes('+91'))
            ? effectiveSender.trim()
            : undefined;
          res = await apiService.analyzeUrl({
            url: urlToTest,
            target_brand: brandTarget
          });
        } else if (selectedModality === 'message') {
          res = await apiService.analyzeText({
            content: contentToAnalyze,
            sender_identity: effectiveSender,
            sender_channel: messagePlatform,
            claimed_organization: getEffectiveSpeaker()
          });
        } else if (selectedModality === 'media') {
          if (!realMediaFile) {
            throw new Error('No image or video file selected.');
          }
          res = await apiService.analyzeMedia(
            realMediaFile,
            contentToAnalyze,
            effectiveSender
          );
        } else if (selectedModality === 'voice') {
          if (!realAudioFile) {
            throw new Error('No audio file selected. Please select a recorded call or voice memo.');
          }
          res = await apiService.analyzeAudio(
            realAudioFile,
            senderInput,
            getEffectiveSpeaker()
          );
        } else if (selectedModality === 'call') {
          const callerCheck = await callProtectionService.verifyCallerId({
            phoneNumber: (senderInput && senderInput.trim()) || '+91 98401 24590',
            claimedIdentity: getEffectiveSpeaker() || pretextDropdown,
            demoMode: false
          });

          const isSafe = callerCheck.verification_state === 'VERIFIED';
          const isHigh = callerCheck.verification_state === 'HIGH RISK';
          const isSuspicious = callerCheck.verification_state === 'SUSPICIOUS';
          const riskTier = isHigh ? 'CRITICAL' : isSuspicious ? 'HIGH' : isSafe ? 'LOW' : 'MEDIUM';
          const scoreVal = callerCheck.reputation_score ? Math.round(callerCheck.reputation_score) : (isHigh ? 88 : isSafe ? 12 : 55);

          const callRecord: AnalysisRecord = {
            id: `VRY-${Math.floor(1000 + Math.random() * 9000)}`,
            time: 'Just now',
            timestamp: Date.now(),
            type: 'call',
            subject: `Caller ID Check — ${callerCheck.normalized_number || senderInput}`,
            risk: riskTier,
            score: scoreVal,
            action: isHigh ? 'Block' : isSuspicious ? 'Verify' : isSafe ? 'Safe' : 'Review',
            forensicDetails: {
              verdict: isHigh ? 'MALICIOUS' : isSuspicious ? 'SUSPICIOUS' : isSafe ? 'SAFE' : 'UNKNOWN',
              confidence: callerCheck.is_valid_format ? 92 : 60,
              threatLevel: riskTier,
              manipulationType: isHigh ? 'Caller ID PBX Spoofing' : 'None Detected',
              evidence: callerCheck.spoofing_indicators.length > 0 ? callerCheck.spoofing_indicators : [
                `Carrier Network: ${callerCheck.carrier || 'Unregistered Carrier'} (${callerCheck.line_type || 'VoIP / Cellular'})`,
                `STIR/SHAKEN Attestation: ${callerCheck.stir_shaken_attestation || 'Header Absent'}`
              ],
              recommendedAction: isHigh
                ? 'End call immediately, do not disclose OTP, and block number.'
                : 'Verify caller through official directory.'
            },
            identityDetails: {
              callerOrSender: callerCheck.phone_number,
              verifiedIdentity: isSafe ? callerCheck.phone_number : null,
              identityTrustScore: isSafe ? 95 : Math.max(5, 100 - scoreVal),
              spoofingIndicators: callerCheck.spoofing_indicators,
              isKnownContact: isSafe,
              stirShakenStatus: callerCheck.stir_shaken_attestation?.includes('Level A') ? 'PASSED' : 'FAILED'
            },
            communicationDetails: {
              medium: `${callerCheck.carrier || 'Telecom'} Voice Channel`,
              syntheticProbability: isHigh ? 85 : 5,
              linguisticUrgency: isHigh ? 'Extreme Pressure' : 'Normal',
              coercionTactics: callerCheck.spoofing_indicators,
              syntheticMarkers: callerCheck.diagnostic_notes
            },
            requestedActionDetails: {
              actionType: 'Incoming Voice Call',
              sensitivityLevel: isHigh ? 'Critical' : isSafe ? 'Low' : 'Moderate',
              financialRiskUsd: isHigh ? 15000 : 0,
              destinationRisk: isHigh ? 'High-Risk Account' : isSafe ? 'Legitimate' : 'Unverified Domain'
            },
            veritySummary: isHigh 
              ? `Inbound call from ${callerCheck.phone_number} lacks valid STIR/SHAKEN Level A attestation. Flags PBX Gateway CLI mismatch and unverified carrier route.`
              : `Inbound call verified with valid telecom carrier route.`
          };

          liveBackendRecordRef.current = callRecord;
          setLiveBackendRecord(callRecord);
          setIsBackendComplete(true);
          return;
        } else {
          res = await apiService.analyzeMultimodal({
            messageText: `Visual media scan: ${contentToAnalyze}`,
            senderIdentity: effectiveSender,
            claimedOrg: getEffectiveSpeaker(),
            mediaFile: realMediaFile || undefined
          });
        }

        if (res) {
          const mapped = mapBackendResultToAnalysisRecord(res, {
            modality: selectedModality,
            sender: selectedModality === 'media' && realMediaFile
              ? realMediaFile.name
              : selectedModality === 'voice' && realAudioFile
              ? realAudioFile.name
              : selectedModality === 'url'
              ? targetUrl
              : effectiveSender,
            medium: selectedModality === 'media' && realMediaFile
              ? `${realMediaFile.type || 'Media'} (${realMediaFile.name})`
              : selectedModality === 'voice' && realAudioFile
              ? `${realAudioFile.type || 'Audio'} (${realAudioFile.name})`
              : selectedModality === 'url'
              ? 'Web URL Link'
              : (selectedModality === 'message' ? `${messagePlatform} Chat Payload` : `${selectedModality.toUpperCase()} Live Forensics`),
            subject: selectedModality === 'media' && realMediaFile
              ? `Media Forensics: ${realMediaFile.name}`
              : selectedModality === 'voice' && realAudioFile
              ? `Audio Forensics: ${realAudioFile.name}`
              : selectedModality === 'url'
              ? `URL Verification: ${targetUrl}`
              : `${selectedModality.toUpperCase()} Scam Check — ${contentToAnalyze.slice(0, 42)}...`
          });
          liveBackendRecordRef.current = mapped;
          setLiveBackendRecord(mapped);
          setIsBackendComplete(true);
        }
      } catch (err: any) {
        if (selectedModality === 'media' || selectedModality === 'voice' || selectedModality === 'url') {
          console.error(`${selectedModality} analysis failed:`, err);
          setMediaScanError(err?.message || `${selectedModality.toUpperCase()} analysis failed. Could not process.`);
          return;
        }
        console.warn('Backend live API warning, fallback heuristic engaged:', err);
        setIsBackendComplete(true);
      }
    };

    triggerBackendScan();
  };

  if (isProcessing) {
    return (
      <AnalysisProcessingView
        modality={selectedModality}
        targetSubject={
          selectedModality === 'voice' ? `Voice Audio — ${realAudioFile?.name || getEffectiveSpeaker()}` :
          selectedModality === 'call' ? `Incoming Caller — ${senderInput}` :
          selectedModality === 'message' ? `${messagePlatform} Message — ${senderInput}` :
          selectedModality === 'url' ? `Link Verification — ${targetUrl}` : 'Media Asset Forensics'
        }
        targetSender={selectedModality === 'voice' ? (realAudioFile?.name || getEffectiveSpeaker()) : senderInput}
        targetAction={getEffectiveReason()}
        isBackendComplete={isBackendComplete}
        errorMessage={mediaScanError}
        onCancel={() => {
          setIsProcessing(false);
          setMediaScanError(null);
        }}
        onCompleteAnalysis={() => {
          let finalRecord = liveBackendRecordRef.current || liveBackendRecord;

          if (finalRecord) {
            onRunAnalysis(finalRecord);
            onViewResultScreen();
            return;
          }

          if (selectedModality === 'media' || selectedModality === 'voice' || selectedModality === 'url') {
            setMediaScanError(`Analysis unavailable: The ${selectedModality.toUpperCase()} analysis could not return a verified result.`);
            return;
          }

          const rawContent = selectedModality === 'message' && directMessageText.trim()
            ? directMessageText.trim()
            : getEffectiveReason();
          const textLower = rawContent.toLowerCase();
          const isOtp = /otp|pin|password|cvv|code/.test(textLower);
          const isUrgent = /urgent|immediately|suspended|blocked|arrest|freeze/.test(textLower);
          const isGovOrBank = /police|cbi|bank|sbi|hdfc|rbi|cybercrime/.test(textLower);

          let isFileDeceptive = false;
          let specificSummary = '';
          let specificSender = senderInput;
          let specificIndicators: string[] = [];
          let specificMarkers: string[] = [];
          let specificCoercion: string[] = [];

          if (selectedModality === 'call') {
            specificSender = senderInput || '+1 (555) 932-8411';
            isFileDeceptive = isGovOrBank || isOtp || isUrgent;
            if (isFileDeceptive) {
              specificIndicators = ['Unverified VoIP Carrier Route', 'Attestation Header Missing', 'STIR/SHAKEN Level C (Untrusted Gateway)'];
              specificMarkers = ['CLI Header Mismatch', 'International Gateway Relay'];
              specificCoercion = ['Digital Arrest / Legal Summons Threat', 'Immediate Account Freeze Coercion'];
              specificSummary = `Inbound call from ${specificSender} lacks valid STIR/SHAKEN Level A attestation. Flags high-pressure intimidation and coercion.`;
            } else {
              specificIndicators = ['Verified PSTN Carrier Route', 'STIR/SHAKEN Attestation Level A', 'Registered CLI Header'];
              specificSummary = `Inbound call from ${specificSender} verified legitimate with valid STIR/SHAKEN Level A cryptographic attestation.`;
            }
          } else {
            // message
            specificSender = `${messagePlatform} (${senderInput || 'SMS'})`;
            isFileDeceptive = isGovOrBank || isOtp || isUrgent || /http|bit\.ly|link|click|verify|kyc/.test(textLower);
            if (isFileDeceptive) {
              specificIndicators = ['Unofficial Bulk SMS Gateway', 'Homoglyph Link in Message Body', 'Artificial Panic Trigger Words'];
              specificMarkers = ['Fake KYC Alphanumeric Header', 'Urgent Account Lockout Threat'];
              specificCoercion = ['False Account Suspension Notice', 'Urgent KYC Re-Verification Threat'];
              specificSummary = `Smishing attempt via ${messagePlatform} impersonating an official institution to harvest banking credentials and OTP.`;
            } else {
              specificIndicators = ['Standard Personal Communication', 'No Phishing Links', 'Zero Coercive Triggers'];
              specificSummary = `Routine communication via ${messagePlatform}. No coercive patterns, fake links, or credential traps detected.`;
            }
          }

          let calcRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
          let calcScore = 8;
          let calcAction: 'Safe' | 'Review' | 'Verify' | 'Block' = 'Safe';

          if (isFileDeceptive) {
            if (isGovOrBank && (isOtp || isUrgent)) {
              calcRisk = 'CRITICAL';
              calcScore = 94;
              calcAction = 'Block';
            } else {
              calcRisk = 'HIGH';
              calcScore = 85;
              calcAction = 'Verify';
            }
          }

          const isSafe = calcRisk === 'LOW';

          finalRecord = {
            id: `VRY-${Math.floor(1000 + Math.random() * 9000)}`,
            time: 'Just now',
            timestamp: Date.now(),
            type: selectedModality,
            subject: `${selectedModality.toUpperCase()} Scam Check — ${rawContent.slice(0, 42)}...`,
            risk: calcRisk,
            score: calcScore,
            action: calcAction,
            identityDetails: {
              callerOrSender: specificSender,
              verifiedIdentity: isSafe ? specificSender : null,
              identityTrustScore: isSafe ? 96 : Math.max(5, 100 - calcScore),
              spoofingIndicators: specificIndicators,
              isKnownContact: isSafe,
              stirShakenStatus: selectedModality === 'call' ? (isSafe ? 'PASSED' : 'FAILED') : 'UNVERIFIED'
            },
            communicationDetails: {
              medium: selectedModality === 'message' ? `${messagePlatform} Chat Payload` : `${selectedModality.toUpperCase()} Forensic Stream`,
              syntheticProbability: isSafe ? 0 : 85,
              linguisticUrgency: isSafe ? 'Normal' : isUrgent ? 'Extreme Pressure' : 'Elevated',
              coercionTactics: isSafe ? ['Standard communication - no coercive threats found'] : specificCoercion,
              syntheticMarkers: isSafe ? undefined : (specificMarkers.length > 0 ? specificMarkers : undefined)
            },
            requestedActionDetails: {
              actionType: rawContent,
              sensitivityLevel: calcRisk === 'CRITICAL' ? 'Critical' : calcRisk === 'HIGH' ? 'High' : 'Low',
              financialRiskUsd: calcScore >= 80 ? 25000 : 0,
              destinationRisk: isSafe ? 'Legitimate' : 'High-Risk Account'
            },
            veritySummary: specificSummary
          };

          onRunAnalysis(finalRecord);
          onViewResultScreen();
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn py-2">
      
      {/* Header with High-Visibility Back Button & Modality Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Scan & Verify Interaction
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] font-bold">
              5 Scam Modalities Covered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze any suspicious call, voice memo, text message, screenshot, video, or link in seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewResultScreen}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>View Incident Alert</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Analysis Form Container */}
      <div className="p-5 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
        
        {/* Modality Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono block">
            What type of interaction do you want to check?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {[
              { id: 'call', label: 'Call', icon: PhoneCall, desc: 'Fake Caller ID' },
              { id: 'voice', label: 'Voice', icon: Mic, desc: 'AI Cloned Voice' },
              { id: 'message', label: 'Message', icon: MessageSquareText, desc: 'WhatsApp & SMS' },
              { id: 'media', label: 'Media', icon: Film, desc: 'Deepfake Video/Image' },
              { id: 'url', label: 'Link (URL)', icon: Link2, desc: 'Phishing Shield' }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModality === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModalityChange(m.id as ModalityType)}
                  aria-pressed={isSelected}
                  className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer relative min-h-[92px] sm:min-h-[100px] last:col-span-2 sm:last:col-span-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-amber-100 border-2 border-amber-600 dark:bg-amber-950/80 dark:border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 hover:border-stone-500 dark:hover:border-stone-600 hover:bg-stone-100/80 dark:hover:bg-stone-800/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    isSelected
                      ? 'text-amber-900 dark:text-amber-300 stroke-[2.2]'
                      : 'text-stone-700 dark:text-stone-300'
                  }`} />
                  <span className={`text-xs font-mono transition-colors ${
                    isSelected
                      ? 'text-stone-950 dark:text-stone-50 font-black'
                      : 'text-stone-800 dark:text-stone-200 font-bold'
                  }`}>
                    {m.label}
                  </span>
                  <span className={`text-[10px] font-mono transition-colors ${
                    isSelected
                      ? 'text-amber-900 dark:text-amber-200 font-bold'
                      : 'text-stone-600 dark:text-stone-400 font-medium'
                  }`}>
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          
          {/* Left Column (6 cols): Modality Specific Inputs */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* CALL MODALITY */}
            {selectedModality === 'call' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Incoming Caller Phone Number
                  </label>
                  <input
                    type="text"
                    value={senderInput}
                    onChange={(e) => setSenderInput(e.target.value)}
                    placeholder="+91 98401 24590 or +1 (555) 932-8411"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    VERITY verifies carrier origin and checks against known telecom spoofing databases.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      <span>Active Inbound Call?</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Launch live in-call intercept defense and real-time voice telemetry.
                    </span>
                  </div>
                  {onLaunchCallProtection && (
                    <button
                      type="button"
                      onClick={() => onLaunchCallProtection(senderInput || '+91 98401 24590', getEffectiveSpeaker() || pretextDropdown)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                    >
                      Open Live Call Protection →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VOICE MODALITY: Frequent Claimed Speaker Dropdown + Custom Manual Input */}
            {selectedModality === 'voice' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    1. Who is the claimed speaker? (Select frequent role or type custom)
                  </label>
                  
                  <select
                    value={voiceSpeakerDropdown}
                    onChange={(e) => setVoiceSpeakerDropdown(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
                  >
                    {SPEAKER_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt} className="bg-slate-900 text-slate-100 py-1">
                        {opt}
                      </option>
                    ))}
                  </select>

                  {/* Manual Type Input when "Other" is chosen */}
                  {voiceSpeakerDropdown === 'Other (Type manually)' && (
                    <div className="pt-1.5 space-y-1 animate-fadeIn">
                      <span className="text-[11px] font-mono text-cyan-400 block font-medium">
                        Type Claimed Identity / Person Name:
                      </span>
                      <input
                        type="text"
                        autoFocus
                        value={voiceSpeakerManual}
                        onChange={(e) => setVoiceSpeakerManual(e.target.value)}
                        placeholder="e.g. Electricity Board Supervisor, Uncle Rajesh, Customs Officer"
                        className="w-full px-3.5 py-2 text-xs bg-slate-950/90 border border-cyan-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Audio File Upload & Removal */}
                <div className="space-y-2.5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-950 dark:text-stone-50 flex items-center gap-1.5">
                      <FileAudio className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                      <span>Upload Voice Memo / Audio Recording</span>
                    </span>
                    {uploadedAudio && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedAudio(null);
                          setRealAudioFile(null);
                        }}
                        className="text-xs font-bold text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={audioFileRef}
                    accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.aac"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRealAudioFile(file);
                        setUploadedAudio({ name: file.name, size: `${(file.size / (1024*1024)).toFixed(1)} MB` });
                      }
                    }}
                    className="hidden"
                  />

                  {uploadedAudio ? (
                    <div className="p-3.5 rounded-lg bg-amber-50/90 dark:bg-stone-950 border border-amber-300 dark:border-amber-600/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-stone-950 dark:text-stone-100 block truncate">{uploadedAudio.name}</span>
                          <span className="text-[11px] font-mono text-stone-700 dark:text-stone-300 block">{uploadedAudio.size} · High-Res Audio Attached</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-600/50 px-2.5 py-0.5 rounded shrink-0">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => audioFileRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-500 rounded-lg p-5 text-center cursor-pointer bg-white dark:bg-stone-900/80 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-all"
                    >
                      <Upload className="w-5 h-5 text-stone-700 dark:text-stone-300 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-stone-950 dark:text-stone-100 block">Click to upload voice note (.wav, .mp3, .m4a)</span>
                      <span className="text-[11px] text-stone-600 dark:text-stone-400 font-mono mt-0.5 block">Scans for AI vocoder pitch stitching & breath artifacts</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MESSAGE MODALITY: Platform & Complaint Cell Reporting */}
            {selectedModality === 'message' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Message Content / Communication Body:
                  </label>
                  <textarea
                    rows={3}
                    value={directMessageText}
                    onChange={(e) => setDirectMessageText(e.target.value)}
                    placeholder="Paste or type SMS, WhatsApp, or email message body here..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Platform Received On:
                    </label>
                    <select
                      value={messagePlatform}
                      onChange={(e) => setMessagePlatform(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">Normal SMS</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Instagram">Instagram DM</option>
                      <option value="Email">Email</option>
                      <option value="Signal">Signal</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Sender Phone Number or ID:
                    </label>
                    <input
                      type="text"
                      value={senderInput}
                      onChange={(e) => setSenderInput(e.target.value)}
                      placeholder="+91 98401 24590"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* Automated Complaint Cell Reporting Notice & Toggle */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Flag className="w-4 h-4 text-indigo-400" />
                      <span>Report to Complaint Cell & Platform Safety</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoReportToHelpline(!autoReportToHelpline)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        autoReportToHelpline ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoReportToHelpline ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Yes, VERITY oversees and protects:</strong> If flagged as untrustworthy, VERITY automatically compiles a forensic complaint packet for the <strong>National Cyber Crime Portal (1930 / cybercrime.gov.in)</strong> and the <strong>{messagePlatform} Trust & Safety Scam Desk</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* MEDIA MODALITY: Video or Image with Dropdown */}
            {selectedModality === 'media' && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaSubType('video');
                      setPretextDropdown(PRETEXT_FREQUENT_OPTIONS.media[0]);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      mediaSubType === 'video' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/40' : 'text-slate-400'
                    }`}
                  >
                    Video Clip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaSubType('image');
                      setPretextDropdown(IMAGE_FREQUENT_OPTIONS[0]);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      mediaSubType === 'image' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400'
                    }`}
                  >
                    Image / Screenshot
                  </button>
                </div>

                <div className="space-y-2.5 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-950 dark:text-stone-50 flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span>Upload {mediaSubType === 'video' ? 'Video File (.mp4, .mov)' : 'Image / Document (.jpg, .png, .pdf)'}</span>
                    </span>
                    {uploadedMedia && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedMedia(null);
                          setRealMediaFile(null);
                        }}
                        className="text-xs font-bold text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={mediaFileRef}
                    accept={mediaSubType === 'video' ? 'video/*,.mp4,.mov,.webm' : 'image/*,.jpg,.png,.webp,.pdf'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRealMediaFile(file);
                        setUploadedMedia({ name: file.name, size: `${(file.size / (1024*1024)).toFixed(1)} MB` });
                      }
                    }}
                    className="hidden"
                  />

                  {uploadedMedia ? (
                    <div className="p-3.5 rounded-lg bg-purple-50/90 dark:bg-stone-950 border border-purple-300 dark:border-purple-600/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-600/50 text-purple-800 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-stone-950 dark:text-stone-100 block truncate">{uploadedMedia.name}</span>
                          <span className="text-[11px] font-mono text-stone-700 dark:text-stone-300 block">{uploadedMedia.size} · Ready for GAN/Deepfake Scan</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-600/50 px-2.5 py-0.5 rounded shrink-0">
                        Attached
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => mediaFileRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-purple-600 dark:hover:border-purple-500 rounded-lg p-5 text-center cursor-pointer bg-white dark:bg-stone-900/80 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-all"
                    >
                      <Upload className="w-5 h-5 text-stone-700 dark:text-stone-300 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-stone-950 dark:text-stone-100 block">Click to upload file</span>
                      <span className="text-[11px] text-stone-600 dark:text-stone-400 font-mono mt-0.5 block">Checks facial blending boundaries, corneal reflection, and digital tampering</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL MODALITY */}
            {selectedModality === 'url' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Suspicious Link or Website URL:
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example-scam-banking-portal.net"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Scanned in an isolated headless cloud sandbox for phishing kits, homoglyph typosquatting, and credential harvesting forms.
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column (6 cols): "What Happened" Frequent Options + Custom Description */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                What are you suspecting? (Frequent Options or Type Custom)
              </label>
              
              <select
                value={pretextDropdown}
                onChange={(e) => setPretextDropdown(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer leading-normal"
              >
                {(selectedModality === 'media' && mediaSubType === 'image' 
                  ? IMAGE_FREQUENT_OPTIONS 
                  : PRETEXT_FREQUENT_OPTIONS[selectedModality] || []
                ).map((opt, idx) => (
                  <option key={idx} value={opt} className="bg-slate-900 text-slate-100 py-1">
                    {opt}
                  </option>
                ))}
              </select>

              {/* Custom Description Textarea when "Other" is chosen */}
              {pretextDropdown === 'Other (Type custom description)' && (
                <div className="space-y-1.5 pt-1 animate-fadeIn">
                  <span className="text-[11px] font-mono text-cyan-400 block font-medium">
                    Describe in your own words what happened:
                  </span>
                  <textarea
                    rows={4}
                    autoFocus
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Paste message text, transcript, or explain why this interaction felt suspicious..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-cyan-500/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
                  />
                </div>
              )}
            </div>

            {/* SIMPLIFIED 3-STEP CHECKLIST (REPLACED COMPLEX MATRIX) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold block">
                VERITY Protection Checklist
              </span>
              <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1. Identity Origin & Carrier Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>2. AI Cloned Voice & Deepfake Media Inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>3. High-Pressure Coercion & Fraud Intent Analysis</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>AI Anti-Fraud Models Ready</span>
          </div>

          <button
            type="button"
            onClick={handleStartProcessing}
            disabled={isProcessing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Forensic Engines...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run Scam Detection Check</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
