import React, { useState, useEffect } from 'react';
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
  Download
} from 'lucide-react';
import { IndependentVerifyModal } from './IndependentVerifyModal';

interface CallProtectionViewProps {
  onEndCall?: () => void;
  onBlockCaller?: () => void;
  onReportFraud?: () => void;
  onVerifyIndependently?: () => void;
  onBackToDashboard?: () => void;
  isMobile?: boolean;
  onNavigateTab?: (tab: string) => void;
  activeMobileTab?: string;
}

export const CallProtectionView: React.FC<CallProtectionViewProps> = ({
  onEndCall = () => {},
  onBlockCaller = () => {},
  onReportFraud = () => {},
  onVerifyIndependently = () => {},
  onBackToDashboard = () => {},
  isMobile = false,
  onNavigateTab = () => {},
  activeMobileTab = 'home'
}) => {
  const [callDuration, setCallDuration] = useState<number>(14); // seconds elapsed
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const handleEndCallAction = () => {
    setIsCallActive(false);
    setActionNotice('Inbound call stream severed by user command');
    onEndCall();
  };

  const handleBlockAction = () => {
    setActionNotice('Caller +91 XXXXX XXXXX added to carrier blacklist');
    onBlockCaller();
  };

  const handleReportAction = () => {
    setActionNotice('Fraud telemetry dispatched to National Cybercrime Helpline (1930)');
    onReportFraud();
  };

  const handleOpenVerify = () => {
    setIsVerifyModalOpen(true);
    onVerifyIndependently();
  };

  const warningSignals = [
    { id: 'ws-1', text: 'Caller identity cannot be verified', detail: 'STIR/SHAKEN Level A cryptographic attestation header absent', icon: UserX },
    { id: 'ws-2', text: 'Possible synthetic voice', detail: 'Vocoder formant anomalies and zero natural acoustic breath pauses', icon: Mic },
    { id: 'ws-3', text: 'Urgency detected', detail: 'High-pressure linguistic coercive deadline framing', icon: MessageSquareWarning },
    { id: 'ws-4', text: 'Financial request detected', detail: 'Active solicitation for urgent account fund re-routing', icon: CreditCard },
    { id: 'ws-5', text: 'OTP request detected', detail: 'Direct verbal demand for one-time SMS verification token', icon: KeyRound }
  ];

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

        {/* Top: Caller Identity Block (FULL WIDTH — nothing positioned to the right of the number) */}
        <div className="flex items-center gap-3 text-left">
          
          {/* Caller Avatar Emblem */}
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-slate-800 border-2 border-red-500/40 text-slate-300 shrink-0 shadow-md">
            <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 border border-slate-900 flex items-center justify-center text-white">
              <AlertTriangle className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                INCOMING CALL
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-amber-400 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                NOT VERIFIED
              </span>
            </div>

            <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight truncate">
              +91 XXXXX XXXXX
            </div>

            <div className="text-[11px] text-slate-300 truncate">
              Claimed: <strong className="text-white font-medium">Bank Representative</strong>
            </div>
          </div>
        </div>

        {/* Bottom: Live Call Signal Activity Visualizer (Appears cleanly BELOW the number) */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 w-full space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>CARRIER LINE UNSECURED</span>
            </div>
            <span className="text-slate-500">24.0 kHz HD Audio</span>
          </div>

          {/* Audio Waveform Bars Simulation */}
          <div className="flex items-end justify-between gap-1 h-5 w-full px-1">
            {[35, 65, 80, 50, 30, 75, 95, 60, 40, 85, 65, 30, 70, 55, 90, 35, 50, 80, 60, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse flex-1 max-w-[4px]"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 60}ms`
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
            <span>Vocoder Spectral Ingest</span>
            <span className="text-red-400 font-semibold">Pitch Jitter: 91%</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. REAL-TIME RISK (MATCHES PROTECTIVE PROTOCOL WINDOW STYLE) */}
      {/* ============================================================ */}
      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/50 shadow-lg backdrop-blur-md space-y-3">
        
        {/* Header Block matching Protective Protocol typography */}
        <div className="space-y-0.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>Threat Assessment</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-950/80 border border-red-500/40 text-red-400 shrink-0">
              Score 94 / 100
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Do not proceed with this call.
          </h3>

          <p className="text-[11px] sm:text-xs text-red-200/90 font-normal leading-relaxed">
            Strong indicators of impersonation, synthetic AI voice cloning, and financial fraud.
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
                Synthetic vocoder anomalies (91%) & unverified VoIP carrier ID
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
              <span className="text-sm sm:text-base font-black font-mono text-red-400">94</span>
              <span className="text-[9px] text-slate-500 font-bold font-mono">/ 100</span>
            </div>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-red-500/30">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 h-full w-[94%]" />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-ping shrink-0" />
              Immediate Intercept Mandated
            </span>
            <span className="text-slate-500">Confidence: 94%</span>
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
                ● Suspicious
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">Caller Identity</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">Unverified VoIP</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              Fails carrier STIR/SHAKEN certification.
            </p>
          </div>

          {/* Card 2: WHAT */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
                WHAT
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/70 text-red-400 border border-red-500/30 font-bold shrink-0">
                ● Coercive
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">Communication</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">High Pressure</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              Coercive deadlines framing account lockdown.
            </p>
          </div>

          {/* Card 3: VOICE */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">
                VOICE
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-400 border border-purple-500/30 font-bold shrink-0">
                ● AI Clone
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">Voice Authenticity</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">Synthetic Vocoder</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              Synthetic pitch discontinuities flagged at 91%.
            </p>
          </div>

          {/* Card 4: REQUEST */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
                REQUEST
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/70 text-red-400 border border-red-500/30 font-bold shrink-0">
                ● Critical
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">Requested Action</span>
              <span className="text-[11px] sm:text-xs font-bold text-white block mt-0.5 truncate">OTP / Transfer</span>
            </div>
            <p className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 font-mono line-clamp-2">
              Demands verbal disclosure of 6-digit MFA passcode.
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
          <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold">5 High-Confidence Vectors</span>
        </div>

        {isMobile ? (
          /* Mobile Aligned Checklist Format */
          <div className="space-y-1.5">
            {warningSignals.map((sig) => {
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
            {warningSignals.map((sig) => {
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
            <span className="text-[11px] sm:text-xs font-bold text-orange-400 block truncate">Unverified Caller</span>
            <span className="text-[9px] text-slate-500 block leading-tight">Failed Level A carrier validation</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase block font-bold">WHAT?</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 block truncate">Bank Pretext Claim</span>
            <span className="text-[9px] text-slate-500 block leading-tight">Impersonates institutional authority</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[9px] text-slate-400 uppercase block font-bold">ACTION?</span>
            <span className="text-[11px] sm:text-xs font-bold text-red-400 block truncate">Provide OTP & Wire</span>
            <span className="text-[9px] text-slate-500 block leading-tight">Critical credential exposure vector</span>
          </div>

        </div>

        {/* Verdict Callout Banner — Cleanly Aligned */}
        <div className="p-2.5 sm:p-3 rounded-lg bg-red-950/60 border-2 border-red-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
              CAN THIS INTERACTION BE TRUSTED?
            </span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight block">
              NO — HIGH CONFIDENCE FRAUD RISK
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-md bg-red-600 text-white font-mono font-bold text-[10px] shadow-sm uppercase shrink-0">
            Quarantine Mandated
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
          callerNumber="+91 XXXXX XXXXX"
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

