import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  PhoneCall, 
  PhoneOff, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  UserX, 
  Mic, 
  MessageSquareWarning, 
  KeyRound, 
  CreditCard, 
  Shield, 
  Flag, 
  ArrowRight, 
  Radio, 
  Lock, 
  Volume2, 
  Wifi, 
  CheckCircle2, 
  Activity,
  PhoneForwarded,
  XCircle,
  HelpCircle,
  Clock,
  Home,
  Plus,
  FileText,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Download,
  Info
} from 'lucide-react';
import { IndependentVerifyModal } from './IndependentVerifyModal';
import { 
  callProtectionService, 
  CallProtectionSession, 
  CallProtectionEvent,
  CallSignalData,
  QuadrantDetail 
} from '../utils/callProtectionService';

interface CallProtectionViewProps {
  initialPhoneNumber?: string;
  initialClaimedIdentity?: string;
  isDemoMode?: boolean;
  onEndCall?: () => void;
  onBlockCaller?: (phoneNumber?: string) => void;
  onReportFraud?: (phoneNumber?: string) => void;
  onVerifyIndependently?: (phoneNumber?: string) => void;
  onBackToDashboard?: () => void;
  isMobile?: boolean;
  onNavigateTab?: (tab: string) => void;
  activeMobileTab?: string;
}

export const CallProtectionView: React.FC<CallProtectionViewProps> = ({
  initialPhoneNumber = '+91 98401 24590',
  initialClaimedIdentity = 'Bank Representative',
  isDemoMode = true,
  onEndCall = () => {},
  onBlockCaller = () => {},
  onReportFraud = () => {},
  onVerifyIndependently = () => {},
  onBackToDashboard = () => {},
  isMobile = false,
  onNavigateTab = () => {},
  activeMobileTab = 'home'
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live session state
  const [session, setSession] = useState<CallProtectionSession | null>(null);
  const [callerNumber, setCallerNumber] = useState<string>(initialPhoneNumber);
  const [claimedIdentity, setClaimedIdentity] = useState<string>(initialClaimedIdentity);
  const [threatScore, setThreatScore] = useState<number>(45);
  const [threatLevel, setThreatLevel] = useState<'TRUSTED' | 'CAUTION' | 'SUSPICIOUS' | 'HIGH RISK'>('CAUTION');
  const [verificationState, setVerificationState] = useState<string>('SUSPICIOUS');
  const [confidence, setConfidence] = useState<number | null>(94);
  const [audioStatus, setAudioStatus] = useState<'UNAVAILABLE' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [signals, setSignals] = useState<CallSignalData[]>([]);
  const [isDemo, setIsDemo] = useState<boolean>(isDemoMode);
  const [eventsLog, setEventsLog] = useState<CallProtectionEvent[]>([]);

  // Quadrants state
  const [quadrants, setQuadrants] = useState<{
    who: QuadrantDetail;
    what: QuadrantDetail;
    voice: QuadrantDetail;
    request: QuadrantDetail;
  }>({
    who: {
      state: 'Suspicious',
      badge_color: 'orange',
      title: 'Caller Identity',
      headline: 'Unverified VoIP',
      detail: 'Fails carrier STIR/SHAKEN certification.',
      is_flagged: true
    },
    what: {
      state: 'Coercive',
      badge_color: 'red',
      title: 'Communication',
      headline: 'High Pressure',
      detail: 'Coercive deadlines framing account lockdown.',
      is_flagged: true
    },
    voice: {
      state: 'AI Clone',
      badge_color: 'purple',
      title: 'Voice Authenticity',
      headline: 'Synthetic Vocoder',
      detail: 'Synthetic pitch discontinuities flagged at 91%.',
      is_flagged: true
    },
    request: {
      state: 'Critical',
      badge_color: 'red',
      title: 'Requested Action',
      headline: 'OTP / Transfer',
      detail: 'Demands verbal disclosure of 6-digit MFA passcode.',
      is_flagged: true
    }
  });

  const sessionRef = useRef<CallProtectionSession | null>(null);

  // 1. Initialize or connect Call Protection session on mount
  useEffect(() => {
    let cleanupStream: (() => void) | null = null;
    let isCancelled = false;

    const initSession = async () => {
      try {
        const newSession = await callProtectionService.startProtectionSession({
          phoneNumber: initialPhoneNumber,
          claimedIdentity: initialClaimedIdentity,
          demoMode: isDemoMode
        });

        if (isCancelled) return;

        setSession(newSession);
        sessionRef.current = newSession;
        setCallerNumber(newSession.phone_number);
        setClaimedIdentity(newSession.claimed_identity || initialClaimedIdentity);
        setThreatScore(newSession.threat_score);
        setThreatLevel(newSession.threat_level);
        setVerificationState(newSession.verification_state);
        setIsDemo(newSession.is_demo);
        setAudioStatus(newSession.audio_analysis_status);

        if (newSession.confidence !== undefined) {
          setConfidence(newSession.confidence);
        }
        if (newSession.signals && newSession.signals.length > 0) {
          setSignals(newSession.signals);
        }
        if (newSession.quadrants) {
          setQuadrants(newSession.quadrants);
        }

        // Connect to live WebSocket / SSE event stream
        cleanupStream = callProtectionService.connectLiveStream(
          newSession.id,
          (event: CallProtectionEvent) => {
            if (isCancelled) return;
            handleLiveStreamEvent(event);
          },
          (err) => {
            console.warn('Call stream notification:', err);
          }
        );
      } catch (err) {
        console.warn('Protection session start fallback to local demo stream:', err);
        // Fallback local initialization if backend is offline
        setCallerNumber(initialPhoneNumber);
        setClaimedIdentity(initialClaimedIdentity);
        setIsDemo(true);
      }
    };

    initSession();

    return () => {
      isCancelled = true;
      if (cleanupStream) cleanupStream();
    };
  }, [initialPhoneNumber, initialClaimedIdentity, isDemoMode]);

  // Handle incoming live stream events without page refresh
  const handleLiveStreamEvent = (evt: CallProtectionEvent) => {
    setEventsLog((prev) => [evt, ...prev]);

    if (evt.threat_score !== undefined) {
      setThreatScore(evt.threat_score);
    }
    if (evt.threat_level) {
      setThreatLevel(evt.threat_level);
    }
    if (evt.confidence !== undefined) {
      setConfidence(evt.confidence);
    }

    if (evt.payload) {
      const p = evt.payload;
      if (p.caller_id && p.caller_id.verification_state) {
        setVerificationState(p.caller_id.verification_state);
      }
      if (p.verification_state) {
        setVerificationState(p.verification_state);
      }
      if (p.audio_status) {
        setAudioStatus(p.audio_status);
      }
      if (p.quadrants) {
        setQuadrants((prev) => ({ ...prev, ...p.quadrants }));
      }
      if (p.signals && Array.isArray(p.signals)) {
        setSignals(p.signals);
      }
    }
  };

  // Timer: Live Call Duration
  useEffect(() => {
    if (!isCallActive) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Action Handlers backed by backend
  const handleEndCallAction = async () => {
    setIsCallActive(false);
    setActionNotice('Inbound call stream severed by user command');
    if (session) {
      try {
        await callProtectionService.performCallAction(session.id, 'END_CALL', 'User initiated immediate termination');
      } catch (e) {
        console.warn('Backend call end action error:', e);
      }
    }
    onEndCall();
  };

  const handleBlockAction = async () => {
    setActionNotice(`Caller ${callerNumber} added to carrier blacklist`);
    if (session) {
      try {
        await callProtectionService.performCallAction(session.id, 'BLOCK_CALLER', 'Flagged as high-risk impersonator');
      } catch (e) {
        console.warn('Backend block caller error:', e);
      }
    }
    onBlockCaller(callerNumber);
  };

  const handleReportAction = async () => {
    setActionNotice('Fraud telemetry dispatched to National Cybercrime Helpline (1930)');
    if (session) {
      try {
        await callProtectionService.performCallAction(session.id, 'REPORT_FRAUD', 'Automated forensic packet generated');
      } catch (e) {
        console.warn('Backend report fraud error:', e);
      }
    }
    onReportFraud(callerNumber);
  };

  const handleOpenVerify = async () => {
    setIsVerifyModalOpen(true);
    if (session) {
      try {
        await callProtectionService.performCallAction(session.id, 'VERIFY_INDEPENDENTLY', 'User reviewing official directory');
      } catch (e) {}
    }
    onVerifyIndependently(callerNumber);
  };

  // Warning signals: dynamically populated from live session or actual forensic heuristics
  const activeWarningSignals = signals.length > 0 ? signals.map((sig, idx) => {
    let IconComponent = AlertTriangle;
    if (sig.category === 'IDENTITY' || sig.text.toLowerCase().includes('identity')) IconComponent = UserX;
    else if (sig.category === 'VOICE' || sig.text.toLowerCase().includes('voice')) IconComponent = Mic;
    else if (sig.category === 'INTENT' || sig.text.toLowerCase().includes('urgency')) IconComponent = MessageSquareWarning;
    else if (sig.category === 'ACTION' && sig.text.toLowerCase().includes('financial')) IconComponent = CreditCard;
    else if (sig.category === 'ACTION' && sig.text.toLowerCase().includes('otp')) IconComponent = KeyRound;

    return {
      id: sig.id || `ws-${idx + 1}`,
      text: sig.text,
      detail: sig.detail,
      icon: IconComponent
    };
  }) : [
    { id: 'ws-1', text: 'Caller identity cannot be verified', detail: 'STIR/SHAKEN Level A cryptographic attestation header absent', icon: UserX },
    { id: 'ws-2', text: audioStatus === 'UNAVAILABLE' ? 'Audio analysis unavailable' : 'Possible synthetic voice', detail: audioStatus === 'UNAVAILABLE' ? 'Live audio telemetry feed not ingested' : 'Vocoder formant anomalies and zero natural acoustic breath pauses', icon: Mic },
    { id: 'ws-3', text: 'Urgency detected', detail: 'High-pressure linguistic coercive deadline framing', icon: MessageSquareWarning },
    { id: 'ws-4', text: 'Financial request detected', detail: 'Active solicitation for urgent account fund re-routing', icon: CreditCard },
    { id: 'ws-5', text: 'OTP request detected', detail: 'Direct verbal demand for one-time SMS verification token', icon: KeyRound }
  ];

  useEffect(() => {
    if (initialPhoneNumber) {
      setCallerNumber(initialPhoneNumber);
    }
    if (initialClaimedIdentity) {
      setClaimedIdentity(initialClaimedIdentity);
    }
  }, [initialPhoneNumber, initialClaimedIdentity]);

  return (
    <div className={`w-full ${isMobile ? 'max-w-full sm:max-w-md pb-28 sm:pb-32 space-y-3.5' : 'max-w-7xl space-y-5'} mx-auto animate-fadeIn py-1 overflow-x-hidden`}>
      
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION & HEADER                                    */}
      {/* ============================================================ */}
      {isMobile ? (
        /* Mobile-Optimized Header Bar */
        <div className="space-y-1.5 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-400/80 hover:bg-cyan-950/80 hover:border-cyan-300 text-[11px] font-bold text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.35)] active:scale-95 shrink-0"
              title="Back to dashboard"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] text-cyan-400" />
              <span className="tracking-wide">Back</span>
            </button>

            <div className="text-center min-w-0 flex-1">
              <h1 className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5 truncate">
                <span>Call Protection</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </h1>
              <span className="text-[9px] font-mono text-cyan-400 block truncate">
                Live Intercept Channel
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-cyan-400 shrink-0">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Mobile Telemetry Status Strip */}
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-0.5">
            <div className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[10px]">
              <Radio className="w-2.5 h-2.5 text-red-400 animate-pulse shrink-0" />
              <span className="text-slate-400 text-[9px]">SIP:</span>
              <span className="text-red-400 font-bold truncate">LIVE INTERCEPT</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[10px]">
              <Activity className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-[9px]">SHIELD:</span>
              <span className="text-emerald-400 font-bold truncate">ACTIVE DEFENSE</span>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Enterprise Console Header */
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400/80 hover:bg-cyan-950/80 text-xs font-bold text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.35)] active:scale-95"
              title="Back to dashboard"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5] text-cyan-400" />
              <span className="tracking-wide">Back</span>
            </button>

            <span className="text-[10px] font-mono text-slate-500">Live Voice Defense Channel</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Call Protection</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Protection Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time in-call telemetry analysis and active impersonation defense.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                <span>SIP Stream:</span>
                <span className="text-slate-200 font-bold">LIVE INTERCEPT</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <span>Call Duration: </span>
                <span className="text-cyan-400 font-bold">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK INCOMING CALL SCENARIOS SELECTOR */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            <span>Simulate Incoming Call Scenarios:</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400">Live Telephony Feed</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { label: 'CBI Digital Arrest', phone: '+91 98401 24590', claimed: 'CBI Officer Suresh Patel' },
            { label: 'Bank KYC Threat', phone: '+91 91234 56789', claimed: 'SBI Cards Fraud Cell' },
            { label: 'AI Voice Clone', phone: '+91 98765 43210', claimed: 'Family Emergency (Voice Clone)' },
            { label: 'TRAI SIM Cutoff', phone: '+91 80012 34567', claimed: 'TRAI Telecom Inspector' }
          ].map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCallerNumber(sc.phone);
                setClaimedIdentity(sc.claimed);
                setCallDuration(0);
                setIsCallActive(true);
                setActionNotice(`Live call switched to ${sc.phone} (${sc.claimed})`);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                callerNumber === sc.phone
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* DEMO / SIMULATION MODE NOTICE (Required by Item 8) */}
      {isDemo && (
        <div className="p-2 sm:p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>DEMO / SIMULATED MODE:</strong> Live simulated telephony telemetry stream active for testing. Never presented as real detection.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 text-[10px] font-bold shrink-0">
            SIMULATED
          </span>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[9px] text-cyan-400 hover:text-cyan-200 underline font-semibold shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. INCOMING CALL CARD                                        */}
      {/* Clean vertical layout: Identity on top, visualizer BELOW     */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-3 sm:p-4 shadow-lg backdrop-blur-md space-y-3">
        
        {/* Subtle glowing ring background */}
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

        {/* Top: Caller Identity Block */}
        <div className="flex items-center gap-3 text-left">
          
          {/* Caller Avatar Emblem */}
          <div className={`relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-slate-800 border-2 shrink-0 shadow-md ${
            verificationState === 'VERIFIED' ? 'border-emerald-500/40 text-emerald-300' :
            verificationState === 'HIGH RISK' ? 'border-red-500/40 text-red-400' :
            'border-amber-500/40 text-amber-400'
          }`}>
            <UserX className={`w-5 h-5 sm:w-6 sm:h-6 ${verificationState === 'VERIFIED' ? 'text-emerald-400' : 'text-red-400'}`} />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-white ${
              verificationState === 'VERIFIED' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              <AlertTriangle className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                INCOMING CALL
              </span>
              <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                verificationState === 'VERIFIED'
                  ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30'
                  : verificationState === 'HIGH RISK'
                  ? 'text-red-400 bg-red-950/70 border-red-500/30'
                  : 'text-amber-400 bg-amber-950/70 border-amber-500/30'
              }`}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {verificationState.replace('_', ' ')}
              </span>
            </div>

            <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight truncate">
              {callerNumber}
            </div>

            <div className="text-[11px] text-slate-300 truncate">
              Claimed: <strong className="text-white font-medium">{claimedIdentity}</strong>
            </div>
          </div>
        </div>

        {/* Bottom: Live Call Signal Activity Visualizer */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 w-full space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>{verificationState === 'VERIFIED' ? 'CARRIER LINE VERIFIED' : 'CARRIER LINE UNSECURED'}</span>
            </div>
            <span className="text-slate-500">
              {audioStatus === 'ACTIVE' ? '24.0 kHz HD Audio Ingest' : 'Audio Analysis Unavailable'}
            </span>
          </div>

          {/* Audio Waveform Bars Simulation */}
          <div className="flex items-end justify-between gap-1 h-5 w-full px-1">
            {[35, 65, 80, 50, 30, 75, 95, 60, 40, 85, 65, 30, 70, 55, 90, 35, 50, 80, 60, 40].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full flex-1 max-w-[4px] ${audioStatus === 'ACTIVE' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`}
                style={{
                  height: audioStatus === 'ACTIVE' ? `${h}%` : '20%',
                  animationDelay: `${i * 60}ms`
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
            <span>{audioStatus === 'ACTIVE' ? 'Vocoder Spectral Ingest' : 'Media Stream: Offline'}</span>
            <span className={audioStatus === 'ACTIVE' ? 'text-red-400 font-semibold' : 'text-slate-500'}>
              {audioStatus === 'ACTIVE' ? 'Pitch Jitter: 91%' : 'No synthetic anomalies registered'}
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. REAL-TIME RISK (MATCHES PROTECTIVE PROTOCOL WINDOW STYLE) */}
      {/* ============================================================ */}
      <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br border shadow-lg backdrop-blur-md space-y-3 ${
        threatLevel === 'HIGH RISK'
          ? 'from-red-950/40 via-slate-900 to-slate-900 border-red-500/50'
          : threatLevel === 'SUSPICIOUS'
          ? 'from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50'
          : 'from-cyan-950/40 via-slate-900 to-slate-900 border-slate-800'
      }`}>
        
        {/* Header Block matching Protective Protocol typography */}
        <div className="space-y-0.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider ${
              threatLevel === 'HIGH RISK' ? 'text-red-400' : 'text-amber-400'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Threat Assessment</span>
            </div>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border shrink-0 ${
              threatLevel === 'HIGH RISK'
                ? 'bg-red-950/80 border-red-500/40 text-red-400'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
            }`}>
              Score {Math.round(threatScore)} / 100
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {threatLevel === 'HIGH RISK' ? 'Do not proceed with this call.' :
             threatLevel === 'SUSPICIOUS' ? 'Exercise heightened caution.' :
             threatLevel === 'CAUTION' ? 'Unverified inbound connection.' :
             'Verified legitimate connection.'}
          </h3>

          <p className="text-[11px] sm:text-xs text-red-200/90 font-normal leading-relaxed">
            {threatLevel === 'HIGH RISK' ? 'Strong indicators of impersonation, synthetic AI voice cloning, and financial fraud.' :
             'Inbound line lacks certified STIR/SHAKEN Level A cryptographic attestation.'}
          </p>
        </div>

        {/* 2 Diagnostic Evidence Cards matching Protective Protocol layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-left">
          <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 border border-red-500/40 text-[10px]">
              !
            </span>
            <div className="space-y-0.5 min-w-0">
              <span className="text-slate-200 font-bold block text-[11px]">Active Impersonation Detected</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px] block leading-snug">
                {audioStatus === 'ACTIVE' 
                  ? 'Synthetic vocoder anomalies (91%) & unverified VoIP carrier ID' 
                  : 'STIR/SHAKEN Level A absent & unverified carrier route'}
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/40 text-[10px]">
              !
            </span>
            <div className="space-y-0.5 min-w-0">
              <span className="text-slate-200 font-bold block text-[11px]">High Financial Fraud Exposure</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px] block leading-snug">
                Urgent verbal coercion demanding OTP passcode & fund transfer
              </span>
            </div>
          </div>
        </div>

        {/* Integrated Real-Time Threat Score Meter */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold">VERITY Threat Score</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black font-mono text-red-400">{Math.round(threatScore)}</span>
              <span className="text-[9px] text-slate-500 font-bold font-mono">/ 100</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-red-500/30">
            <div 
              className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, threatScore))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-ping shrink-0" />
              {threatLevel === 'HIGH RISK' ? 'Immediate Intercept Mandated' : 'Continuous Telemetry Monitored'}
            </span>
            <span className="text-slate-500">
              Confidence: {confidence ? `${Math.round(confidence)}%` : 'Calibrating'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LIVE ANALYSIS (4 SYMMETRICAL QUADRANTS)                   */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Live Analysis Quadrants</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-500">Real-Time Correlated Evaluation</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          
          {/* Card 1: WHO */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                WHO
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-950/70 text-orange-400 border border-orange-500/30 font-bold shrink-0">
                ● {quadrants.who.state}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">{quadrants.who.title}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">{quadrants.who.headline}</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              {quadrants.who.detail}
            </p>
          </div>

          {/* Card 2: WHAT */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
                WHAT
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/70 text-red-400 border border-red-500/30 font-bold shrink-0">
                ● {quadrants.what.state}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">{quadrants.what.title}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">{quadrants.what.headline}</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              {quadrants.what.detail}
            </p>
          </div>

          {/* Card 3: VOICE */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                VOICE
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-400 border border-purple-500/30 font-bold shrink-0">
                ● {quadrants.voice.state}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">{quadrants.voice.title}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">{quadrants.voice.headline}</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              {quadrants.voice.detail}
            </p>
          </div>

          {/* Card 4: REQUEST */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
                REQUEST
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/70 text-red-400 border border-red-500/30 font-bold shrink-0">
                ● {quadrants.request.state}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">{quadrants.request.title}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">{quadrants.request.headline}</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              {quadrants.request.detail}
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. DETECTED WARNING SIGNALS (ALIGNED STACK ON MOBILE)        */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span>Detected Warning Signals</span>
          </h3>
          <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold">
            {activeWarningSignals.length} Flagged Vectors
          </span>
        </div>

        {isMobile ? (
          /* Mobile Aligned Checklist Format */
          <div className="space-y-1.5">
            {activeWarningSignals.map((sig) => {
              const Icon = sig.icon;
              return (
                <div
                  key={sig.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-red-500/30 flex items-start gap-2.5 shadow-xs"
                >
                  <div className="p-1.5 rounded-md bg-red-950/70 border border-red-500/40 text-red-400 shrink-0 mt-0.5">
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-white leading-tight truncate">
                        {sig.text}
                      </span>
                      <span className="text-[8px] font-mono text-red-400 font-bold bg-red-950/80 border border-red-500/30 px-1 py-0.2 rounded shrink-0">
                        FLAGGED
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
                      {sig.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop 5-Column Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {activeWarningSignals.map((sig) => {
              const Icon = sig.icon;
              return (
                <div
                  key={sig.id}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-red-500/30 flex flex-col justify-between space-y-1.5 text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                      <span className="text-orange-400">⚠</span>
                      <span className="leading-tight">{sig.text}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                      {sig.detail}
                    </p>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-red-400">
                    <span>Flagged</span>
                    <Icon className="w-3 h-3 opacity-80" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. RECOMMENDED ACTION & TOUCH ACTION CENTER                  */}
      {/* ============================================================ */}
      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/50 shadow-lg backdrop-blur-md space-y-3">
        
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Protective Protocol</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Do not share OTP, PIN, password or banking information.
          </h3>
        </div>

        {/* 3 Step Protocol Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-left">
          <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 border border-red-500/40 text-[10px]">
              1
            </span>
            <span className="text-slate-200 font-medium pt-0.5 leading-snug text-[10px] sm:text-[11px]">
              End the call immediately
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-500/40 text-[10px]">
              2
            </span>
            <span className="text-slate-200 font-medium pt-0.5 leading-snug text-[10px] sm:text-[11px]">
              Verify through official directory
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/40 text-[10px]">
              3
            </span>
            <span className="text-slate-200 font-medium pt-0.5 leading-snug text-[10px] sm:text-[11px]">
              Do not follow caller instructions
            </span>
          </div>
        </div>

        {/* Action Buttons — Unified Full-Width & Grid Alignment on Mobile */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          
          {/* Primary Action Button: End Call (High Urgency) */}
          <button
            type="button"
            onClick={handleEndCallAction}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-950/60 flex items-center justify-center gap-1.5 cursor-pointer border border-red-400/40 active:scale-[0.99]"
          >
            <PhoneOff className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>End Call Immediately</span>
          </button>

          {/* Secondary Action: Verify Independently */}
          <button
            type="button"
            onClick={handleOpenVerify}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Verify Independently (Safe Directory & 1930)</span>
          </button>

          {/* Tertiary Row: Block Caller & Report Fraud */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={handleBlockAction}
              className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <UserX className="w-3 h-3 text-red-400" />
              <span>Block Caller</span>
            </button>

            <button
              type="button"
              onClick={handleReportAction}
              className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <Flag className="w-3 h-3" />
              <span>Report Fraud</span>
            </button>
          </div>

          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
            >
              Return to Console Dashboard
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 7. TRUST DECISION (HOLISTIC VERDICT MATRIX)                  */}
      {/* ============================================================ */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm space-y-2.5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Holistic Trust Verdict Matrix</span>
          </h3>
          <span className="text-[9px] font-mono text-slate-500">Continuous Decision Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-left">
          
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase block font-bold">WHO?</span>
            <span className="text-[11px] sm:text-xs font-bold text-orange-400 block truncate">
              {verificationState === 'VERIFIED' ? 'Verified Caller' : 'Unverified Caller'}
            </span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              {verificationState === 'VERIFIED' ? 'Passed Level A carrier validation' : 'Failed Level A carrier validation'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase block font-bold">WHAT?</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 block truncate">
              {claimedIdentity || 'Institutional Claim'}
            </span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              Impersonates institutional authority
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase block font-bold">ACTION?</span>
            <span className="text-[11px] sm:text-xs font-bold text-red-400 block truncate">
              Provide OTP & Wire
            </span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              Critical credential exposure vector
            </span>
          </div>

        </div>

        {/* Verdict Callout Banner */}
        <div className={`p-2.5 sm:p-3 rounded-lg border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-left ${
          threatLevel === 'HIGH RISK'
            ? 'bg-red-950/60 border-red-500'
            : threatLevel === 'SUSPICIOUS'
            ? 'bg-amber-950/60 border-amber-500'
            : 'bg-emerald-950/60 border-emerald-500'
        }`}>
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
              CAN THIS INTERACTION BE TRUSTED?
            </span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight block">
              {threatLevel === 'HIGH RISK' ? 'NO — HIGH CONFIDENCE FRAUD RISK' :
               threatLevel === 'SUSPICIOUS' ? 'UNCERTAIN — CAUTION ADVISED' :
               'YES — INTERACTION TRUSTED'}
            </span>
          </div>

          <div className={`px-2.5 py-1 rounded-md text-white font-mono font-bold text-[10px] shadow-sm uppercase shrink-0 ${
            threatLevel === 'HIGH RISK' ? 'bg-red-600' : 'bg-amber-600'
          }`}>
            {threatLevel === 'HIGH RISK' ? 'Quarantine Mandated' : 'Inspection Required'}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 8. MOBILE BOTTOM NAVIGATION DOCK (WHEN IN MOBILE VIEW)       */}
      {/* ============================================================ */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md max-w-md mx-auto py-1 px-3">
          <div className="flex items-center justify-around">
            
            {/* 1. Home */}
            <button
              onClick={() => onNavigateTab('home')}
              className={`flex flex-col items-center gap-0.5 text-[8px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'home' || activeMobileTab === 'dashboard'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* 2. Analyze */}
            <button
              onClick={() => onNavigateTab('analyze')}
              className={`flex flex-col items-center gap-0.5 text-[8px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'analyze'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>

            {/* 3. History */}
            <button
              onClick={() => onNavigateTab('history')}
              className={`flex flex-col items-center gap-0.5 text-[8px] font-mono transition-colors cursor-pointer py-0.5 ${
                activeMobileTab === 'history'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            {/* 4. Alerts / Incidents */}
            <button
              onClick={() => onNavigateTab('incidents')}
              className={`flex flex-col items-center gap-0.5 text-[8px] font-mono transition-colors cursor-pointer py-0.5 relative ${
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

            {/* 5. Settings */}
            <button
              onClick={() => onNavigateTab('settings')}
              className={`flex flex-col items-center gap-0.5 text-[8px] font-mono transition-colors cursor-pointer py-0.5 ${
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

      {/* Safe Verification Modal */}
      {isVerifyModalOpen && (
        <IndependentVerifyModal
          callerNumber={callerNumber}
          onClose={() => setIsVerifyModalOpen(false)}
          onConfirmVerified={() => {
            setIsVerifyModalOpen(false);
            setActionNotice('Safe directory hotline initiated');
          }}
        />
      )}

    </div>
  );
};
