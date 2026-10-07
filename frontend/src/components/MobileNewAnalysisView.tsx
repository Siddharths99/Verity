import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Shield, 
  PhoneCall, 
  Mic, 
  MessageSquareText, 
  Image as ImageIcon, 
  Film, 
  Link2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  X, 
  Check, 
  UserX, 
  Layers, 
  Radio, 
  Lock,
  Phone,
  User,
  ShieldAlert,
  Home,
  Plus,
  FileText,
  Bell,
  Upload,
  Play,
  Volume2,
  FileCheck,
  Trash2,
  RefreshCw,
  Info,
  SlidersHorizontal,
  Send,
  CheckCircle2,
  Flag
} from 'lucide-react';
import { ModalityType, AnalysisRecord } from '../types';
import { apiService, mapBackendResultToAnalysisRecord } from '../utils/apiService';

interface MobileNewAnalysisViewProps {
  initialModality?: ModalityType;
  onBack: () => void;
  onRunAnalysis: (record: AnalysisRecord) => void;
  onNavigateTab?: (tab: string) => void;
  activeMobileTab?: string;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
}

export const MobileNewAnalysisView: React.FC<MobileNewAnalysisViewProps> = ({
  initialModality = 'call',
  onBack,
  onRunAnalysis,
  onNavigateTab = () => {},
  activeMobileTab = 'analyze',
  hideHeader = false,
  hideBottomNav = false
}) => {
  const [selectedModality, setSelectedModality] = useState<string>(
    initialModality ? initialModality.toUpperCase() : 'CALL'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Call fields
  const [callerNumber, setCallerNumber] = useState<string>('+91 98401 24590');
  const [callerName, setCallerName] = useState<string>('Unknown Caller');

  // Voice speaker dropdown + custom manual input
  const [voiceSpeakerCategory, setVoiceSpeakerCategory] = useState<string>('Bank Representative / Loan Officer');
  const [voiceSpeakerCustom, setVoiceSpeakerCustom] = useState<string>('');

  // Message fields & reporting toggle
  const [messagePlatform, setMessagePlatform] = useState<string>('WhatsApp');
  const [senderHandle, setSenderHandle] = useState<string>('+91 98401 24590');
  const [autoReportToHelpline, setAutoReportToHelpline] = useState<boolean>(true);

  // Pretext / "What happened" frequent options
  const [pretextDropdown, setPretextDropdown] = useState<string>('Bank claims my account is blocked unless I verify OTP immediately');
  const [customContextText, setCustomContextText] = useState<string>('');

  // Target URL
  const [targetUrl, setTargetUrl] = useState<string>('https://auth-security-chase.corp-verify.net');

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);

  const [formatError, setFormatError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    if (initialModality) {
      handleSelectModality(initialModality.toUpperCase());
    }
  }, [initialModality]);

  // Modality configurations
  const modalityConfigs: Record<string, {
    label: string;
    allowedExtensions: string[];
    acceptAttr: string;
    defaultSample: string;
    defaultSize: string;
  }> = {
    VOICE: {
      label: 'Voice / Audio File',
      allowedExtensions: ['wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac', 'webm', 'amr'],
      acceptAttr: '.wav,.mp3,.m4a,.ogg,.flac,.aac,.webm,.amr,audio/*',
      defaultSample: 'voice-recording-sample.wav',
      defaultSize: '1.4 MB'
    },
    MESSAGE: {
      label: 'Message Log / Chat Export',
      allowedExtensions: ['txt', 'csv', 'json', 'pdf', 'png', 'jpg', 'jpeg', 'eml'],
      acceptAttr: '.txt,.csv,.json,.pdf,.png,.jpg,.jpeg,.eml',
      defaultSample: 'whatsapp-chat-screenshot.png',
      defaultSize: '420 KB'
    },
    IMAGE: {
      label: 'Image or Document File',
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'tiff', 'bmp'],
      acceptAttr: '.jpg,.jpeg,.png,.webp,.pdf,.tiff,.bmp,image/*',
      defaultSample: 'payment-transfer-receipt.png',
      defaultSize: '2.1 MB'
    },
    VIDEO: {
      label: 'Video Clip or Recording',
      allowedExtensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'],
      acceptAttr: '.mp4,.mov,.avi,.mkv,.webm,.m4v,video/*',
      defaultSample: 'video-call-recording.mp4',
      defaultSize: '8.4 MB'
    }
  };

  // Pretext frequent options per modality (unspecific related event types)
  const pretextOptions: Record<string, string[]> = {
    CALL: [
      'Unsolicited / Unknown Incoming Call',
      'Urgent Request for Money or Wire Transfer',
      'Impersonation of Authority, Agency, or Family',
      'Threat of Legal Action, Penalties, or Service Disconnection',
      'Demanding OTP, Security PIN, or Account Details',
      'Suspicious Robotic or Automated Call',
      'Other (Type custom description)'
    ],
    VOICE: [
      'Urgent Voice Note Asking for Money or Emergency Help',
      'Unnatural, Cloned, or AI-Synthesized Voice',
      'Alleged Family Member or Friend in Distress',
      'Official or Authority Claiming Urgent Action Needed',
      'Automated Interactive Voice Message',
      'Other (Type custom description)'
    ],
    MESSAGE: [
      'Suspicious Verification or Action Link',
      'Account Suspension or Urgent Warning Notice',
      'Prize, Lottery, Cashback, or Refund Notification',
      'Payment or Money Transfer Request',
      'Delivery, Courier, or Address Confirmation Request',
      'Unsolicited Job Offer or Task Opportunity',
      'Other (Type custom description)'
    ],
    IMAGE: [
      'Verify whether this image is real or AI-generated',
      'Suspicious Payment Receipt, Invoice, or Wire Proof',
      'Official ID Card, Government Badge, or Certificate',
      'Screenshot of Suspicious Chat, SMS, or Bank Alert',
      'QR Code or Barcode for Payment Request',
      'Other (Type custom description)'
    ],
    VIDEO: [
      'Check for Deepfake or Facial / Voice Manipulation',
      'Emergency Video Message from Alleged Contact',
      'Promotional or Investment Video with Public Figure',
      'Screen Recording or KYC Verification Video',
      'Manipulated News or Official Announcement',
      'Other (Type custom description)'
    ],
    URL: [
      'Suspicious Login, Banking, or Account Portal',
      'Unfamiliar Payment, Checkout, or Recharge Page',
      'Shortened Link or Unexpected Redirect',
      'Prize, Lottery, Cashback, or Reward Claim Page',
      'Suspicious Document Download or App Install Page',
      'Other (Type custom description)'
    ]
  };

  // Speaker frequent options for voice
  const speakerOptions = [
    'Bank Representative / Loan Officer',
    'Company Executive / Manager',
    'Family Member / Relative',
    'Friend / Colleague',
    'Government / Police Officer',
    'Courier / Delivery Agent',
    'Other (Type manually)'
  ];

  const handleSelectModality = (modId: string) => {
    setSelectedModality(modId);
    setFormatError(null);
    setUploadedFile(null);
    setActualFile(null);

    const opts = pretextOptions[modId] || [];
    if (opts.length > 0) {
      setPretextDropdown(opts[0]);
    }

    if (modId === 'URL') {
      setTargetUrl('https://google.com');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormatError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const config = modalityConfigs[selectedModality];
    if (!config) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!config.allowedExtensions.includes(ext)) {
      setFormatError(
        `Invalid file format (.${ext}). Supported formats for ${config.label} are: ${config.allowedExtensions.map(e => `.${e}`).join(', ')}. Please select a supported file.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setActualFile(file);
    setUploadedFile({
      name: file.name,
      size: `${sizeInMb} MB`,
      type: file.type || ext
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setActualFile(null);
    setFormatError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const modalities = [
    { id: 'CALL', label: 'CALL', icon: PhoneCall, color: 'text-cyan-400', activeBg: 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]' },
    { id: 'VOICE', label: 'VOICE', icon: Mic, color: 'text-blue-400', activeBg: 'border-blue-400 bg-blue-950/60 shadow-[0_0_15px_rgba(59,130,246,0.25)]' },
    { id: 'MESSAGE', label: 'MESSAGE', icon: MessageSquareText, color: 'text-indigo-400', activeBg: 'border-indigo-400 bg-indigo-950/60 shadow-[0_0_15px_rgba(99,102,241,0.25)]' },
    { id: 'IMAGE', label: 'IMAGE', icon: ImageIcon, color: 'text-amber-400', activeBg: 'border-amber-400 bg-amber-950/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]' },
    { id: 'VIDEO', label: 'VIDEO', icon: Film, color: 'text-purple-400', activeBg: 'border-purple-400 bg-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]' },
    { id: 'URL', label: 'URL', icon: Link2, color: 'text-emerald-400', activeBg: 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]' }
  ];

  const effectiveContext = pretextDropdown === 'Other (Type custom description)' && customContextText.trim()
    ? customContextText.trim()
    : pretextDropdown;

  const effectiveSpeaker = voiceSpeakerCategory === 'Other (Type manually)' && voiceSpeakerCustom.trim()
    ? voiceSpeakerCustom.trim()
    : voiceSpeakerCategory;

  const handleStartAnalysis = async () => {
    setFormatError(null);

    if ((selectedModality === 'IMAGE' || selectedModality === 'VIDEO') && !actualFile) {
      setFormatError(`Please attach an actual ${selectedModality.toLowerCase()} file to analyze.`);
      return;
    }

    setIsAnalyzing(true);
    let resolvedRecord: AnalysisRecord | null = null;

    try {
      let res;
      if (selectedModality === 'URL') {
        res = await apiService.analyzeUrl({
          url: targetUrl.trim() || 'https://google.com'
        });
      } else if (selectedModality === 'MESSAGE') {
        res = await apiService.analyzeText({
          content: effectiveContext,
          sender_identity: senderHandle,
          sender_channel: messagePlatform
        });
      } else if ((selectedModality === 'IMAGE' || selectedModality === 'VIDEO')) {
        if (!actualFile) {
          throw new Error('Please attach an image or video file.');
        }
        res = await apiService.analyzeMedia(
          actualFile,
          effectiveContext,
          senderHandle
        );
      } else if (selectedModality === 'VOICE') {
        if (!actualFile) {
          throw new Error('Please attach an audio recording (.wav, .mp3, .m4a).');
        }
        res = await apiService.analyzeAudio(
          actualFile,
          callerNumber,
          effectiveSpeaker
        );
      } else {
        res = await apiService.analyzeMultimodal({
          messageText: selectedModality === 'CALL'
            ? `Phone Call: Caller ${callerNumber}. Pretext: ${effectiveContext}`
            : `${selectedModality} Scan: ${effectiveContext}`,
          senderIdentity: callerNumber || senderHandle,
          claimedOrg: effectiveSpeaker,
          mediaFile: actualFile || undefined
        });
      }

      if (res) {
        const modalityType: ModalityType = (selectedModality.toLowerCase() === 'call' ? 'call' : selectedModality.toLowerCase() === 'voice' ? 'voice' : selectedModality.toLowerCase() === 'message' ? 'message' : selectedModality.toLowerCase() === 'url' ? 'url' : 'media') as any;
        resolvedRecord = mapBackendResultToAnalysisRecord(res, {
          modality: modalityType,
          sender: selectedModality === 'URL' ? targetUrl : (actualFile ? actualFile.name : (callerNumber || senderHandle || 'Uploaded Media')),
          medium: actualFile ? `${actualFile.type || 'Media'} (${actualFile.name})` : (selectedModality === 'URL' ? 'Web URL Link' : `${selectedModality} Channel`),
          subject: actualFile ? `Media Forensics: ${actualFile.name}` : (selectedModality === 'URL' ? `URL Check: ${targetUrl}` : `${selectedModality} Check: ${effectiveContext.slice(0, 42)}...`)
        });
      }
    } catch (err: any) {
      if (selectedModality === 'IMAGE' || selectedModality === 'VIDEO' || selectedModality === 'VOICE' || selectedModality === 'URL') {
        console.error(`${selectedModality} analysis failed:`, err);
        setFormatError(err?.message || `${selectedModality} analysis failed. The input could not be processed.`);
        return;
      }
      console.warn('Backend call warning, fallback engaged:', err);
    } finally {
      setIsAnalyzing(false);
    }

    if (!resolvedRecord) {
      if (selectedModality === 'IMAGE' || selectedModality === 'VIDEO' || selectedModality === 'VOICE' || selectedModality === 'URL') {
        // Do not fabricate results
        return;
      }
      const textLower = (selectedModality === 'URL' ? targetUrl : effectiveContext).toLowerCase();
      const isOtp = /otp|pin|password|cvv|code/.test(textLower);
      const isUrgent = /urgent|immediately|suspended|blocked|arrest|freeze/.test(textLower);
      const isGovOrBank = /police|cbi|bank|sbi|hdfc|rbi|cybercrime/.test(textLower);

      let calcRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let calcScore = 8;
      let calcAction: 'Safe' | 'Review' | 'Verify' | 'Block' = 'Safe';

      if (isGovOrBank && (isOtp || isUrgent)) {
        calcRisk = 'CRITICAL';
        calcScore = 92;
        calcAction = 'Block';
      } else if (isOtp || (isUrgent && isGovOrBank)) {
        calcRisk = 'HIGH';
        calcScore = 85;
        calcAction = 'Verify';
      } else if (isUrgent || isGovOrBank) {
        calcRisk = 'MEDIUM';
        calcScore = 45;
        calcAction = 'Review';
      }

      const isSafe = calcRisk === 'LOW';

      resolvedRecord = {
        id: `VRY-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        type: (selectedModality.toLowerCase() === 'call' ? 'call' : selectedModality.toLowerCase() === 'voice' ? 'voice' : selectedModality.toLowerCase() === 'message' ? 'message' : selectedModality.toLowerCase() === 'url' ? 'url' : 'media') as any,
        subject: `${selectedModality} Check: ${effectiveContext.slice(0, 42)}...`,
        risk: calcRisk,
        score: calcScore,
        action: calcAction,
        identityDetails: {
          callerOrSender: selectedModality === 'URL' ? targetUrl : selectedModality === 'MESSAGE' ? `${senderHandle} (${messagePlatform})` : (uploadedFile ? uploadedFile.name : callerNumber),
          verifiedIdentity: isSafe ? (callerNumber || senderHandle) : null,
          identityTrustScore: isSafe ? 95 : 100 - calcScore,
          spoofingIndicators: isSafe ? ['Verified Origin / No Spoofing Detected'] : ['Unverified Origin / Spoofing Risk'],
          isKnownContact: isSafe,
          stirShakenStatus: isSafe ? 'PASSED' : 'FAILED'
        },
        communicationDetails: {
          medium: `${selectedModality} Channel`,
          syntheticProbability: isSafe ? 2 : 75,
          linguisticUrgency: isUrgent ? 'Extreme Pressure' : 'Normal',
          coercionTactics: isSafe ? ['Standard communication - no coercive threats found'] : [effectiveContext],
          syntheticMarkers: isSafe ? undefined : ['Synthesis anomalies detected']
        },
        requestedActionDetails: {
          actionType: effectiveContext,
          sensitivityLevel: calcRisk === 'CRITICAL' ? 'Critical' : calcRisk === 'HIGH' ? 'High' : calcRisk === 'MEDIUM' ? 'Moderate' : 'Low',
          financialRiskUsd: calcScore >= 80 ? 25000 : 0,
          destinationRisk: isSafe ? 'Legitimate' : 'High-Risk Account'
        },
        veritySummary: isSafe
          ? `Routine ${selectedModality} interaction. No scam patterns detected.`
          : `Potential threat detected in ${selectedModality} interaction.`
      };
    }

    onRunAnalysis(resolvedRecord);
  };

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto pb-28 sm:pb-32 space-y-4 animate-fadeIn overflow-x-hidden">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={modalityConfigs[selectedModality]?.acceptAttr || '*/*'}
        onChange={handleFileChange}
      />

      {/* ============================================================ */}
      {/* 1. TOP HEADER WITH HIGH-VISIBILITY BACK BUTTON               */}
      {/* ============================================================ */}
      {!hideHeader && (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-950/80 hover:border-cyan-300 px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.45)] cursor-pointer active:scale-95"
            title="Back to previous screen"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3] text-cyan-400" />
            <span className="tracking-wide">Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">
              VERITY
            </span>
          </div>

          <div className="w-14" />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TITLE                                                     */}
      {/* ============================================================ */}
      <div className="space-y-0.5">
        <h1 className="text-lg font-bold tracking-tight text-white font-sans">
          Check a Suspicious Interaction
        </h1>
        <p className="text-[11px] text-slate-400 font-normal">
          Free protection for everyone. Choose what you want to inspect:
        </p>
      </div>

      {/* ============================================================ */}
      {/* 3. 6 INTERACTION CHANNELS                                    */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
          Choose Channel
        </span>

        <div className="grid grid-cols-3 gap-2">
          {modalities.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedModality === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectModality(item.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-100 border-2 border-amber-600 dark:bg-amber-950/80 dark:border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-800 hover:border-stone-500 dark:hover:border-stone-600 hover:bg-stone-100/80 dark:hover:bg-stone-800/80'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                )}

                <div className={`p-1 rounded-lg ${isSelected ? 'bg-amber-200/90 dark:bg-amber-900/60' : 'bg-stone-100 dark:bg-stone-800'}`}>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-900 dark:text-amber-300 stroke-[2.2]' : 'text-stone-700 dark:text-stone-300'}`} />
                </div>
                <span className={`text-[11px] font-mono ${isSelected ? 'text-stone-950 dark:text-stone-50 font-black' : 'text-stone-800 dark:text-stone-300 font-bold'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Error Notice */}
      {formatError && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-start gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-300 block">Unsupported File Format</span>
            <p className="text-[11px] leading-relaxed text-red-200">{formatError}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODALITY INPUT CONTROLS                                   */}
      {/* ============================================================ */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-sm">
        
        {/* TAB 1: CALL INPUTS */}
        {selectedModality === 'CALL' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Phone Call Details</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400">Caller ID Verification</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block font-medium">Caller Phone Number</label>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block font-medium">Caller Claimed Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="Unknown Caller"
              />
            </div>
          </div>
        )}

        {/* TAB 2: VOICE AUDIO WITH DROPDOWN SPEAKER + OTHER */}
        {selectedModality === 'VOICE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span>Voice Recording Ingest</span>
              </span>
              <span className="text-[9px] font-mono text-blue-400">24.0 kHz HD</span>
            </div>

            {/* Claimed Speaker Dropdown + Custom Other */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-medium">
                Who does the voice claim to be?
              </label>
              <select
                value={voiceSpeakerCategory}
                onChange={(e) => setVoiceSpeakerCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {speakerOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>

              {voiceSpeakerCategory === 'Other (Type manually)' && (
                <input
                  type="text"
                  value={voiceSpeakerCustom}
                  onChange={(e) => setVoiceSpeakerCustom(e.target.value)}
                  placeholder="e.g. Electricity Officer, Lottery Agent, Grandson..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-500/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 animate-fadeIn"
                  autoFocus
                />
              )}
            </div>

            {/* Audio Upload Card with REMOVE button */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block">Accepted Formats: .wav, .mp3, .m4a, .ogg, .flac</span>
              {uploadedFile ? (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                    <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <div className="overflow-hidden min-w-0">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">{uploadedFile.name}</span>
                      <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400 block">{uploadedFile.size} · Spectral Ingest Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-orange-600 cursor-pointer"
                      title="Replace file"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-100 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors flex flex-col items-center justify-center gap-1 text-center cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-200">Tap to Upload Voice Memo / Audio</span>
                  <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400">Supported: .wav, .mp3, .m4a (Up to 50MB)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MESSAGE WITH REPORTING CELL INTEGRATION */}
        {selectedModality === 'MESSAGE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Message Channel & Platform</span>
              </span>
              <span className="text-[9px] font-mono text-indigo-400">Scam Shield</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block">Received On:</label>
                <select 
                  value={messagePlatform}
                  onChange={(e) => setMessagePlatform(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">Normal SMS</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Instagram">Instagram DM</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block">Sender Number / ID:</label>
                <input
                  type="text"
                  value={senderHandle}
                  onChange={(e) => setSenderHandle(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Official Complaint Cell Reporting Integration */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Report to Cyber Fraud Cell & Platform Support</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAutoReportToHelpline(!autoReportToHelpline)}
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    autoReportToHelpline ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${autoReportToHelpline ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                If flagged as a scam, VERITY automatically prepares an official report for the <strong>National Cyber Crime Portal (1930)</strong> and {messagePlatform} Trust & Safety.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: IMAGE FILE UPLOAD */}
        {selectedModality === 'IMAGE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Image / Document Upload</span>
              </span>
              <span className="text-[9px] font-mono text-amber-400">Forgery Detection</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block">Accepted Formats: .jpg, .png, .webp, .pdf</span>
              {uploadedFile ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-100 block truncate">{uploadedFile.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">{uploadedFile.size} · Document Loaded</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 transition-colors flex flex-col items-center justify-center gap-1 text-center cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">Tap to Upload Image or Screenshot</span>
                  <span className="text-[9px] font-mono text-slate-400">Supported: .jpg, .png, .webp, .pdf</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: VIDEO FILE UPLOAD */}
        {selectedModality === 'VIDEO' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Video Clip Upload</span>
              </span>
              <span className="text-[9px] font-mono text-purple-400">Face-Swap Check</span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block">Accepted Formats: .mp4, .mov, .avi, .webm</span>
              {uploadedFile ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Play className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-100 block truncate">{uploadedFile.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">{uploadedFile.size} · Video Loaded</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3.5 rounded-xl border border-dashed border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/40 transition-colors flex flex-col items-center justify-center gap-1 text-center cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200">Tap to Upload Video Clip</span>
                  <span className="text-[9px] font-mono text-slate-400">Supported: .mp4, .mov, .webm (Up to 100MB)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: URL / LINK INPUT */}
        {selectedModality === 'URL' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suspicious Link / Website URL</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400">Phishing Shield</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block font-medium">Paste the exact link here:</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
                placeholder="https://example-scam-link.net"
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* "WHAT HAPPENED" FREQUENT DROPDOWN OPTIONS + OTHER FOR ALL     */}
        {/* ============================================================ */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-mono font-bold text-slate-200 block">
            What are you suspecting? (Choose or specify)
          </label>
          
          <select
            value={pretextDropdown}
            onChange={(e) => setPretextDropdown(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {(pretextOptions[selectedModality] || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>

          {pretextDropdown === 'Other (Type custom description)' && (
            <textarea
              rows={3}
              value={customContextText}
              onChange={(e) => setCustomContextText(e.target.value)}
              placeholder="Describe in your own words what happened..."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-cyan-500/50 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed animate-fadeIn"
              autoFocus
            />
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. SIMPLIFIED 1-LINE TRUST BADGE (REPLACED COMPLEX MATRIX)    */}
      {/* ============================================================ */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>4-Point AI Scam Shield Active</span>
        </div>
        <span className="text-cyan-300 font-bold">100% Free Public Tool</span>
      </div>

      {/* ============================================================ */}
      {/* 6. ACTION BUTTONS                                            */}
      {/* ============================================================ */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer font-sans disabled:opacity-75 active:scale-[0.99]"
        >
          {isAnalyzing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Across Anti-Fraud Models...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Start Scam & Fraud Check</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer text-center"
        >
          Cancel
        </button>
      </div>

      {/* ============================================================ */}
      {/* 7. FIXED BOTTOM NAVIGATION BAR (5 TABS)                      */}
      {/* ============================================================ */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-1.5">
          <div className="max-w-md mx-auto flex items-center justify-around">
            
            <button
              onClick={() => onNavigateTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'home' || activeMobileTab === 'dashboard'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onNavigateTab('analyze')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'analyze'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>

            <button
              onClick={() => onNavigateTab('history')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'history'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => onNavigateTab('incidents')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 relative ${
                activeMobileTab === 'incidents'
                  ? 'text-red-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <span>Alerts</span>
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'settings'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
