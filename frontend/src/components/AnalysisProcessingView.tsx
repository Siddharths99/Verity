import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Cpu, 
  Activity, 
  UserCheck, 
  Mic, 
  MessageSquareWarning, 
  CreditCard, 
  Zap, 
  Radio, 
  Layers,
  ArrowDown,
  Plus,
  Equal,
  PhoneCall,
  Globe,
  Film,
  FileImage,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { ModalityType } from '../types';

interface AnalysisProcessingViewProps {
  modality?: ModalityType;
  targetSubject?: string;
  targetSender?: string;
  targetAction?: string;
  isBackendComplete?: boolean;
  errorMessage?: string | null;
  onCompleteAnalysis: () => void;
  onCancel: () => void;
}

export const AnalysisProcessingView: React.FC<AnalysisProcessingViewProps> = ({
  modality = 'voice',
  targetSubject = 'Inbound Voice Call Stream',
  targetSender = '+1 (555) 932-8411 (VoIP Gateway)',
  targetAction = 'Execute emergency $48,500 wire transfer & disclose MFA token',
  isBackendComplete,
  errorMessage,
  onCompleteAnalysis,
  onCancel
}) => {
  const [activePipelineIndex, setActivePipelineIndex] = useState<number>(0);
  const [calculationProgress, setCalculationProgress] = useState<number>(10);
  const [isPipelineComplete, setIsPipelineComplete] = useState<boolean>(false);

  // Progressive multi-node pipeline execution (steps 1 through 8)
  useEffect(() => {
    if (errorMessage) return;

    const stepConfigs = [
      { step: 0, progress: 12, duration: 400 },
      { step: 1, progress: 26, duration: 400 },
      { step: 2, progress: 40, duration: 400 },
      { step: 3, progress: 54, duration: 400 },
      { step: 4, progress: 68, duration: 400 },
      { step: 5, progress: 82, duration: 400 },
      { step: 6, progress: 94, duration: 500 }, // Risk Engine
      { step: 7, progress: 100, duration: 500 } // Verity Result
    ];

    let timer: NodeJS.Timeout;

    const executeStep = (idx: number) => {
      // If waiting for backend to complete, pause at step 6
      if (idx === 6 && isBackendComplete === false) {
        setActivePipelineIndex(6);
        setCalculationProgress(94);
        return;
      }

      if (idx >= stepConfigs.length) {
        setIsPipelineComplete(true);
        setActivePipelineIndex(7);
        setCalculationProgress(100);
        // Automatically transition to the final Verity Result screen
        timer = setTimeout(() => {
          onCompleteAnalysis();
        }, 500);
        return;
      }

      setActivePipelineIndex(stepConfigs[idx].step);
      setCalculationProgress(stepConfigs[idx].progress);

      timer = setTimeout(() => {
        executeStep(idx + 1);
      }, stepConfigs[idx].duration);
    };

    timer = setTimeout(() => {
      executeStep(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [onCompleteAnalysis, isBackendComplete, errorMessage]);

  // Resume when backend completes while holding at step 6
  useEffect(() => {
    if (isBackendComplete === true && activePipelineIndex === 6) {
      setIsPipelineComplete(true);
      setActivePipelineIndex(7);
      setCalculationProgress(100);
      const timer = setTimeout(() => {
        onCompleteAnalysis();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isBackendComplete, activePipelineIndex, onCompleteAnalysis]);

  if (errorMessage) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn py-2">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-red-950/40 border border-red-500/50 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-950 border border-red-500/40 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Forensic Analysis Unavailable
              </h2>
              <span className="text-xs font-mono text-red-400">
                Visual & Media Forensics pipeline error
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {errorMessage}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono">
              The media could not be processed by the multimodal model.
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Scanner</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modality-specific configurations for all 5 vectors
  const getModalityConfig = () => {
    switch (modality) {
      case 'call':
        return {
          title: 'Analyzing Phone Call & Telecom Origin',
          subtitle: 'Correlating telecom STIR/SHAKEN attestation headers, caller ID carrier route, and conversational NLP urgency.',
          pill: 'TELECOM & STIR/SHAKEN CORRELATION IN PROGRESS',
          icon: PhoneCall,
          pipeline: [
            { id: 'input', label: 'INPUT', desc: 'Inbound SIP Ingest', status: 'completed' },
            { id: 'attestation', label: 'STIR/SHAKEN', desc: 'Attestation Level C Check', status: 'completed' },
            { id: 'carrier', label: 'CARRIER ORIGIN', desc: 'VoIP Routing & ASN Match', status: 'completed' },
            { id: 'nlp', label: 'CONVERSATIONAL NLP', desc: 'Urgency & Coercion Scan', status: 'completed' },
            { id: 'impersonation', label: 'IMPERSONATION', desc: 'Police / Bank Identity Check', status: 'completed' },
            { id: 'financial', label: 'SOLICITATION', desc: 'Urgent Wire / OTP Demand', status: 'completed' },
            { id: 'risk-engine', label: 'RISK ENGINE', desc: 'Telecom Multi-Vector Matrix', status: 'processing' },
            { id: 'verdict', label: 'VERITY RESULT', desc: 'Call Blocking & Defense Action', status: 'pending' }
          ],
          statusLogs: [
            { text: 'Inbound SIP call stream ingested', time: '0ms', note: 'Raw Telecom Stream' },
            { text: 'Caller origin resolved', time: '12ms', note: 'STIR/SHAKEN Level C (Untrusted Gateway)' },
            { text: 'Carrier infrastructure inspected', time: '28ms', note: 'Virtual VoIP Relay · No Physical SIM' },
            { text: 'Speech-to-text NLP analyzed', time: '48ms', note: 'Coercive arrest / account freeze threat detected' },
            { text: 'Financial solicitation flagged', time: '64ms', note: 'Immediate wire payment & OTP request' }
          ],
          signalCards: [
            { title: 'Identity Signal', status: 'Untrusted Origin', desc: 'STIR/SHAKEN Level C Gateway Relay with spoofed CLI.', icon: UserCheck, color: 'text-orange-400' },
            { title: 'Communication Risk', status: 'High Coercion', desc: 'Impersonates law enforcement with immediate arrest threats.', icon: MessageSquareWarning, color: 'text-red-400' },
            { title: 'Requested Action', status: 'Wire Transfer / OTP', desc: 'Demands immediate money disbursement to unverified account.', icon: CreditCard, color: 'text-red-400' },
            { title: 'Telephony Indicator', status: 'VoIP Spoofing', desc: 'Carrier routing mismatch with unauthenticated CLI header.', icon: PhoneCall, color: 'text-purple-400' }
          ],
          factors: [
            { weight: '30%', name: 'Identity & STIR/SHAKEN', value: 'Untrusted VoIP Gateway' },
            { weight: '25%', name: 'Carrier ASN Reputation', value: 'Unregistered Relay' },
            { weight: '25%', name: 'NLP Coercion Intent', value: 'High Pressure Demands' },
            { weight: '20%', name: 'Financial Exposure', value: 'Urgent Money Transfer' }
          ]
        };

      case 'voice':
        return {
          title: 'Analyzing AI Voice Clone & Audio Spectrum',
          subtitle: 'Inspecting acoustic waveforms, neural vocoder pitch jitter, and synthetic harmonics to detect cloned speech.',
          pill: 'ACOUSTIC & VOCODER DEEPFAKE SCAN IN PROGRESS',
          icon: Mic,
          pipeline: [
            { id: 'input', label: 'INPUT', desc: 'Audio Buffer Ingest', status: 'completed' },
            { id: 'spectrogram', label: 'MEL-SPECTROGRAM', desc: 'Acoustic Frequency Scan', status: 'completed' },
            { id: 'vocoder', label: 'NEURAL VOCODER', desc: 'Pitch Jitter Artifacts', status: 'completed' },
            { id: 'harmonics', label: 'PHASE HARMONICS', desc: 'Formant Discontinuity Check', status: 'completed' },
            { id: 'speaker', label: 'SPEAKER PROFILE', desc: 'Voiceprint Verification', status: 'completed' },
            { id: 'intent', label: 'SOCIAL ENGINEERING', desc: 'Distress / Emergency Pretext', status: 'completed' },
            { id: 'risk-engine', label: 'RISK ENGINE', desc: 'Acoustic Deepfake Weighting', status: 'processing' },
            { id: 'verdict', label: 'VERITY RESULT', desc: 'Voice Clone Score & Report', status: 'pending' }
          ],
          statusLogs: [
            { text: 'Audio stream buffer decoded (.mp3 / .wav)', time: '0ms', note: '16kHz High-Res PCM' },
            { text: 'Mel-spectrogram transformed', time: '14ms', note: 'High-frequency unnatural cutoffs detected' },
            { text: 'Neural vocoder markers extracted', time: '36ms', note: '94% synthetic pitch jitter match' },
            { text: 'Acoustic room reverberation analyzed', time: '52ms', note: 'Synthetic non-spatial dry audio' },
            { text: 'Impersonation intent correlated', time: '70ms', note: 'Executive / Family distress bailout claim' }
          ],
          signalCards: [
            { title: 'Identity Signal', status: 'Impersonated Speaker', desc: 'Claimed voiceprint does not match baseline biometric profile.', icon: UserCheck, color: 'text-orange-400' },
            { title: 'Acoustic Indicator', status: 'Synthetic Vocoder', desc: 'Neural speech synthesis artifacts detected in upper formants.', icon: Mic, color: 'text-purple-400' },
            { title: 'Communication Risk', status: 'Urgent Distress', desc: 'Manufactured emergency plea requesting immediate compliance.', icon: MessageSquareWarning, color: 'text-red-400' },
            { title: 'Requested Action', status: 'Emergency Wire', desc: 'Demands urgent wire transfer to third-party clearing account.', icon: CreditCard, color: 'text-red-400' }
          ],
          factors: [
            { weight: '35%', name: 'Vocoder Pitch Jitter', value: '94% Synthetic Match' },
            { weight: '25%', name: 'Acoustic Artifacts', value: 'Phase Discontinuities' },
            { weight: '20%', name: 'Speaker Mismatch', value: 'Unverified Voiceprint' },
            { weight: '20%', name: 'Action Risk', value: 'Unsolicited Wire Demand' }
          ]
        };

      case 'message':
        return {
          title: 'Analyzing SMS / Chat Message & Smishing Vectors',
          subtitle: 'Extracting conversational NLP coercion, impersonated entity branding, and malicious redirect links in text.',
          pill: 'SMISHING & NLP INTENT EXTRACTION IN PROGRESS',
          icon: MessageSquareWarning,
          pipeline: [
            { id: 'input', label: 'INPUT', desc: 'Text Payload Parse', status: 'completed' },
            { id: 'entity', label: 'ENTITY EXTRACTION', desc: 'Impersonated Brand Check', status: 'completed' },
            { id: 'urgency', label: 'PANIC TRIGGERS', desc: 'Account Suspension NLP', status: 'completed' },
            { id: 'shortlink', label: 'LINK EXPANSION', desc: 'Malicious URL Unmasking', status: 'completed' },
            { id: 'credential', label: 'CREDENTIAL HARVEST', desc: 'Fake KYC Form Intercept', status: 'completed' },
            { id: 'coercion', label: 'COERCION PATTERN', desc: 'Artificial Deadline Tactic', status: 'completed' },
            { id: 'risk-engine', label: 'RISK ENGINE', desc: 'Smishing Multi-Factor Matrix', status: 'processing' },
            { id: 'verdict', label: 'VERITY RESULT', desc: 'SMS Block & Citizen Advisory', status: 'pending' }
          ],
          statusLogs: [
            { text: 'Message payload parsed (SMS / WhatsApp text)', time: '0ms', note: 'Text & Metadata Buffer' },
            { text: 'Sender address analyzed', time: '8ms', note: 'Unofficial short-code / alphanumeric header' },
            { text: 'NLP sentiment & panic triggers flagged', time: '22ms', note: '"Account Blocked in 2 Hours" threat' },
            { text: 'Embedded link expanded & redirected', time: '41ms', note: 'Redirects to unverified phishing domain' },
            { text: 'Credential harvesting intent detected', time: '58ms', note: 'Fake KYC verification form with OTP field' }
          ],
          signalCards: [
            { title: 'Identity Signal', status: 'Spoofed Header', desc: 'Unofficial alphanumeric sender pretending to be a bank.', icon: UserCheck, color: 'text-orange-400' },
            { title: 'Message Urgency', status: 'Panic Coercion', desc: 'Threatens immediate service cutoff to bypass rational thinking.', icon: MessageSquareWarning, color: 'text-red-400' },
            { title: 'Embedded Payload', status: 'Malicious Link', desc: 'Directs victim to a credential harvesting phishing portal.', icon: Globe, color: 'text-purple-400' },
            { title: 'Requested Action', status: 'Fake KYC / OTP Entry', desc: 'Demands entry of banking passwords and mobile OTP.', icon: KeyRound, color: 'text-red-400' }
          ],
          factors: [
            { weight: '30%', name: 'NLP Panic Inducers', value: 'False Urgency Coercion' },
            { weight: '25%', name: 'Sender Header Trust', value: 'Unregistered Bulk SMS' },
            { weight: '25%', name: 'Link Reputation', value: 'Phishing Domain Redirect' },
            { weight: '20%', name: 'Data Exposure Risk', value: 'KYC / Credential Theft' }
          ]
        };

      case 'media':
        return {
          title: 'Analyzing Media Asset & Deepfake Forensics',
          subtitle: 'Running computer vision inspection on facial blending boundaries, document metadata EXIF tampering, and GAN artifacts.',
          pill: 'COMPUTER VISION & DEEPFAKE FORENSICS IN PROGRESS',
          icon: Film,
          pipeline: [
            { id: 'input', label: 'INPUT', desc: 'Media Container Ingest', status: 'completed' },
            { id: 'metadata', label: 'EXIF INTEGRITY', desc: 'Software Tampering Traces', status: 'completed' },
            { id: 'gan', label: 'GAN ARTIFACTS', desc: 'Pixel Noise & Texture Scan', status: 'completed' },
            { id: 'blending', label: 'FACE BLENDING', desc: 'Boundary & Eye Reflection', status: 'completed' },
            { id: 'document', label: 'DOCUMENT SEALS', desc: 'Counterfeit Stamp Check', status: 'completed' },
            { id: 'extortion', label: 'FRAUD PATTERN', desc: 'Fake Arrest Warrant Intent', status: 'completed' },
            { id: 'risk-engine', label: 'RISK ENGINE', desc: 'Visual Deepfake Matrix', status: 'processing' },
            { id: 'verdict', label: 'VERITY RESULT', desc: 'Forensic Media Audit Report', status: 'pending' }
          ],
          statusLogs: [
            { text: 'Media file decoded (Image / Video binary buffer)', time: '0ms', note: 'High-Resolution Frame Buffer' },
            { text: 'EXIF metadata inspected', time: '18ms', note: 'Synthetic generator traces & missing camera signature' },
            { text: 'Pixel-level noise distribution analyzed', time: '38ms', note: 'Inconsistent compression & GAN artifacts' },
            { text: 'Facial landmark consistency scanned', time: '62ms', note: 'Blending seams detected around jawline & eyes' },
            { text: 'Document structure evaluated', time: '84ms', note: 'Counterfeit legal header & forged police emblem' }
          ],
          signalCards: [
            { title: 'Visual Artifacts', status: 'GAN Deepfake Traces', desc: 'Facial boundary inconsistencies and unnatural texture smoothing.', icon: Film, color: 'text-purple-400' },
            { title: 'Metadata Integrity', status: 'Tampered EXIF', desc: 'Missing hardware camera signatures; generated via AI software.', icon: FileImage, color: 'text-orange-400' },
            { title: 'Document Authenticity', status: 'Counterfeit Seal', desc: 'Forged government emblem and fake arrest warrant layout.', icon: FileCheck, color: 'text-red-400' },
            { title: 'Fraud Intent', status: 'Digital Arrest Extortion', desc: 'Used to intimidate victim into paying fake bail fees.', icon: ShieldAlert, color: 'text-red-400' }
          ],
          factors: [
            { weight: '35%', name: 'GAN Artifact Density', value: '91% Synthetic Texture' },
            { weight: '25%', name: 'Forged Document Layout', value: 'Counterfeit Header' },
            { weight: '20%', name: 'EXIF Metadata Mismatch', value: 'Missing Camera Tag' },
            { weight: '20%', name: 'Extortion Severity', value: 'Fabricated Arrest Threat' }
          ]
        };

      case 'url':
      default:
        return {
          title: 'Analyzing URL & Phishing Domain Sandbox',
          subtitle: 'Inspecting domain registration age, DNS entropy, homoglyph typosquatting, and credential harvesting forms in an isolated headless browser.',
          pill: 'HEADLESS BROWSER SANDBOX & TYPOSQUATTING CHECK IN PROGRESS',
          icon: Globe,
          pipeline: [
            { id: 'input', label: 'INPUT', desc: 'URL Normalization', status: 'completed' },
            { id: 'whois', label: 'DOMAIN WHOIS', desc: 'Domain Age & Registration', status: 'completed' },
            { id: 'homoglyph', label: 'TYPOSQUATTING', desc: 'Punycode & Lookalike Scan', status: 'completed' },
            { id: 'sandbox', label: 'BROWSER SANDBOX', desc: 'Headless DOM Emulation', status: 'completed' },
            { id: 'ssl', label: 'SSL CERTIFICATE', desc: 'Issuer & Validity Check', status: 'completed' },
            { id: 'harvesting', label: 'FORM INTERCEPT', desc: 'Credential Field Scraper', status: 'completed' },
            { id: 'risk-engine', label: 'RISK ENGINE', desc: 'Phishing Intelligence Matrix', status: 'processing' },
            { id: 'verdict', label: 'VERITY RESULT', desc: 'Domain Blacklist & Advisory', status: 'pending' }
          ],
          statusLogs: [
            { text: 'URL parsed into headless cloud sandbox', time: '0ms', note: 'Isolated Chromium Sandbox' },
            { text: 'Domain registration queried', time: '10ms', note: 'Newly registered domain (< 4 days old)' },
            { text: 'Punycode & homoglyph scan evaluated', time: '24ms', note: 'Lookalike character substitution imitating brand' },
            { text: 'SSL certificate validated', time: '49ms', note: 'Free automated certificate on fake domain' },
            { text: 'DOM form inputs intercepted', time: '72ms', note: 'Phishing kit scraping NetBanking passwords & OTP' }
          ],
          signalCards: [
            { title: 'Domain Reputation', status: 'Newly Registered', desc: 'Domain registered within last 4 days with high DNS entropy.', icon: Globe, color: 'text-orange-400' },
            { title: 'Typosquatting Match', status: 'Lookalike Domain', desc: 'Homoglyph substitution mimicking an official banking portal.', icon: AlertTriangle, color: 'text-red-400' },
            { title: 'SSL Certificate', status: 'Suspicious Issuer', desc: 'Automated free cert deployed on unverified hosting infrastructure.', icon: Lock, color: 'text-amber-400' },
            { title: 'Page Payload', status: 'Credential Harvester', desc: 'Intercepts user login credentials, card numbers, and OTP.', icon: KeyRound, color: 'text-red-400' }
          ],
          factors: [
            { weight: '30%', name: 'Domain Age & DNS', value: 'High-Risk New Registration' },
            { weight: '25%', name: 'Typosquatting Match', value: '96% Lookalike Brand Score' },
            { weight: '25%', name: 'Form Harvesting Kit', value: 'Intercepted Password Fields' },
            { weight: '20%', name: 'Threat Intel Feeds', value: 'Known Phishing Signature' }
          ]
        };
    }
  };

  const config = getModalityConfig();
  const ModalityIcon = config.icon;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn py-2">
      
      {/* ============================================================ */}
      {/* 1. HEADER SECTION                                            */}
      {/* ============================================================ */}
      <div className="relative border-b border-slate-800/80 pb-6">
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-96 h-28 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            
            {/* Live Telemetry Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                {config.pill}
              </span>
              <span className="text-slate-500 font-mono">·</span>
              <span className="font-mono text-slate-400 text-xs">Session #{Date.now().toString().slice(-6)}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ModalityIcon className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
              <span>{config.title}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              {config.subtitle}
            </p>
          </div>

          {/* Interaction Target Card */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 shrink-0 backdrop-blur-sm">
            <span className="text-slate-400 text-[11px] block uppercase font-mono">Target Payload</span>
            <div className="font-semibold text-slate-100 truncate max-w-xs">{targetSubject}</div>
            <div className="font-mono text-cyan-400 text-[11px] truncate max-w-xs">{targetSender}</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CENTRAL ANALYSIS PIPELINE                                 */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Central Analysis Pipeline
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              8 Processing Nodes
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {calculationProgress}% Pipeline Execution
          </span>
        </div>

        <div className="relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <div className="relative grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 items-stretch">
            {config.pipeline.map((stage, idx) => {
              const isCompleted = isPipelineComplete || idx < activePipelineIndex;
              const isProcessing = !isPipelineComplete && idx === activePipelineIndex;
              const isPending = !isPipelineComplete && idx > activePipelineIndex;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isProcessing
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : isCompleted
                      ? 'bg-slate-950/70 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-slate-500">0{idx + 1}</span>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isProcessing && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                      {isPending && <span className="w-2 h-2 rounded-full bg-slate-700" />}
                    </div>
                    <div className={`text-[11px] font-bold font-sans tracking-tight leading-tight ${
                      isProcessing ? 'text-cyan-300' : isCompleted ? 'text-slate-100' : 'text-slate-500'
                    }`}>
                      {stage.label}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono mt-2 leading-tight">
                    {stage.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Vector Forensic Correlation Active</span>
            </span>
            <span className="text-cyan-400 font-bold">
              {isPipelineComplete
                ? 'Node #08 [Verity Result] Finalized ✓'
                : `Node #0${activePipelineIndex + 1} [${config.pipeline[activePipelineIndex]?.label || 'Scanning'}] Active`}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LIVE STATUS LOG + SIGNAL SUMMARY (2-COLUMN GRID)           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 cols: Live Status checklist */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Status Log
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Real-Time Telemetry</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 shadow-md backdrop-blur-sm space-y-3 font-mono text-xs">
            {config.statusLogs.slice(0, Math.min(config.statusLogs.length, activePipelineIndex + 1)).map((log, idx) => {
              const isLogComplete = isPipelineComplete || idx < activePipelineIndex;
              return (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 animate-fadeIn">
                  {isLogComplete ? (
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className={isLogComplete ? "text-slate-200 font-medium" : "text-cyan-300 font-medium"}>{log.text}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{log.time} · {log.note}</span>
                  </div>
                </div>
              );
            })}

            {/* Active Processing Step */}
            {!isPipelineComplete ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 shadow-inner">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                <div className="flex-1 flex items-baseline justify-between">
                  <span className="text-cyan-300 font-bold animate-pulse">
                    {activePipelineIndex === 6
                      ? "Calculating topic-specific weighted risk score..."
                      : activePipelineIndex === 7
                      ? "Synthesizing multi-vector forensic indicators..."
                      : `Inspecting node 0${activePipelineIndex + 1}: ${config.pipeline[activePipelineIndex]?.label}...`}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">In Progress</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 shadow-inner animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 flex items-baseline justify-between">
                  <span className="text-emerald-300 font-bold">
                    Forensic synthesis complete. Opening Verity Result...
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Finalized</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 6 cols: Signal Summary Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Signal Summary
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Extracted Telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.signalCards.map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 shadow-md backdrop-blur-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 uppercase font-mono">{card.title}</span>
                    <CardIcon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div className={`text-base sm:text-lg font-bold ${card.color} tracking-tight`}>
                    {card.status}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. RISK ENGINE SYNTHESIS VISUALIZATION                       */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Risk Engine Multi-Factor Matrix
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 animate-pulse">
            Neural Weight Aggregation
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl backdrop-blur-md space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {config.factors.map((factor, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Weight: {factor.weight}</span>
                <div className="text-xs font-bold text-slate-200">{factor.name}</div>
                <div className="text-[11px] font-mono text-orange-400">{factor.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono">
              Action Required: High-exposure trigger verification
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel Analysis
              </button>
              <button
                type="button"
                onClick={onCompleteAnalysis}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>View Forensic Verdict</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
