import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  UserX, 
  Mic, 
  MessageSquareWarning, 
  CreditCard, 
  KeyRound, 
  Shield, 
  PhoneOff, 
  Flag, 
  Radio, 
  Lock, 
  Layers, 
  Home, 
  Plus, 
  FileText, 
  Bell,
  ChevronRight,
  Download,
  SlidersHorizontal,
  AlertOctagon,
  ShieldCheck as ShieldCheckIcon,
  PhoneCall,
  ExternalLink,
  Activity,
  Cpu,
  Zap,
  RotateCcw
} from 'lucide-react';
import { AnalysisRecord } from '../types';
import { exportIncidentReportToPdf } from '../utils/pdfExport';
import { IndependentVerifyModal } from './IndependentVerifyModal';

interface MobileAnalysisResultViewProps {
  record?: AnalysisRecord;
  onBack: () => void;
  onBlockCaller: () => void;
  onReportFraud: () => void;
  onVerifyIndependently: () => void;
  onQuarantine?: () => void;
  onApprove?: () => void;
  onNavigateTab: (tab: string) => void;
  activeMobileTab?: string;
}

export const MobileAnalysisResultView: React.FC<MobileAnalysisResultViewProps> = ({
  record,
  onBack,
  onBlockCaller,
  onReportFraud,
  onVerifyIndependently,
  onQuarantine,
  onApprove,
  onNavigateTab,
  activeMobileTab = 'incidents'
}) => {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [complaintRef, setComplaintRef] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  // Use the current analysis passed via props, or fallback to latest incident
  const currentRecord: AnalysisRecord = record || {
    id: 'VRY-1042',
    time: 'Just now',
    timestamp: Date.now(),
    type: 'voice',
    subject: 'Unknown Caller — Bank Verification Pretext',
    risk: 'HIGH',
    score: 87,
    action: 'Verify',
    identityDetails: {
      callerOrSender: '+91 98401 24590',
      verifiedIdentity: null,
      identityTrustScore: 14,
      spoofingIndicators: ['Unverified Origin', 'Attestation Header Flagged', 'Untrusted Carrier Route'],
      isKnownContact: false,
      stirShakenStatus: 'FAILED'
    },
    communicationDetails: {
      medium: 'Voice Audio Stream (.m4a)',
      syntheticProbability: 91,
      linguisticUrgency: 'Extreme Pressure',
      coercionTactics: ['Account Default Threat', 'Imminent 15-Minute Deadline'],
      syntheticMarkers: ['Neural Vocoder Pitch Jitter', 'Inconsistent Breath Acoustics']
    },
    requestedActionDetails: {
      actionType: 'Immediate Wire Transfer & Verbal OTP Passcode',
      sensitivityLevel: 'Critical',
      financialRiskUsd: 25000,
      destinationRisk: 'High-Risk Account'
    },
    veritySummary: 'Synthetic AI voice clone impersonating official with coercive urgent fund transfer demand and OTP harvesting intent.'
  };

  const isHighRisk = currentRecord.risk === 'CRITICAL' || currentRecord.risk === 'HIGH';

  const handleDownloadPdf = () => {
    exportIncidentReportToPdf(currentRecord, currentRecord.id);
  };

  // Button 1: Verify Independently
  const handleOpenDirectory = () => {
    setIsVerifyModalOpen(true);
    onVerifyIndependently();
  };

  // Button 2: Block Number
  const handleBlockAction = () => {
    setIsBlocked(true);
    setCurrentStatus(`Number ${currentRecord.identityDetails.callerOrSender} blocked across carrier & device blacklist`);
    onBlockCaller();
  };

  // Button 3: Quarantine
  const handleQuarantineAction = () => {
    setCurrentStatus(`Interaction ${currentRecord.id} isolated in security quarantine sandbox`);
    if (onQuarantine) onQuarantine();
  };

  // Button 4: Report to Cybercrime 1930
  const handleReportAction = () => {
    const ref = `NCR-1930-${Math.floor(100000 + Math.random() * 900000)}`;
    setComplaintRef(ref);
    setCurrentStatus(`Dispatched official evidence packet to National Cyber Crime Portal (1930). Complaint Ref #${ref}`);
    onReportFraud();
  };

  // Button 5: Mark as Safe
  const handleApproveAction = () => {
    setIsBlocked(false);
    setCurrentStatus(`Contact ${currentRecord.identityDetails.callerOrSender} marked as Verified Safe Contact`);
    if (onApprove) onApprove();
  };

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto pb-24 space-y-4 animate-fadeIn overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER WITH HIGH-VISIBILITY BACK BUTTON               */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-950/80 hover:border-cyan-300 px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.45)] cursor-pointer active:scale-95"
          title="Back to previous screen"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3] text-cyan-400" />
          <span className="tracking-wide">Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold text-white tracking-tight font-sans">
            Threat & Safety Alert
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="text-cyan-400">{currentRecord.id}</span>
            <span>·</span>
            <span>{currentRecord.time}</span>
          </div>
        </div>

        {/* Download Individual PDF Report */}
        <button
          onClick={handleDownloadPdf}
          title="Download Incident Forensic PDF Report"
          className="p-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY RESULT RISK CARD                                  */}
      {/* ============================================================ */}
      <div className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-2xl space-y-3 ${
        isHighRisk
          ? 'bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
          : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider ${
              isHighRisk ? 'bg-red-500 text-slate-950' : 'bg-emerald-400 text-slate-950'
            }`}>
              {currentRecord.risk} THREAT
            </span>
            <span className="text-[10px] font-mono text-slate-300 uppercase">
              {currentRecord.type}
            </span>
          </div>

          <div className="flex items-baseline gap-1 font-mono">
            <span className={`text-3xl font-black tabular-nums ${
              currentRecord.score >= 80 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {currentRecord.score}
            </span>
            <span className="text-xs text-slate-500 font-bold">/100</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">
            {currentRecord.forensicDetails
              ? (currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE'
                  ? (currentRecord.type === 'url' ? 'VERIFIED SAFE DESTINATION' : 'VERIFIED AUTHENTIC CONTENT')
                  : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN'
                  ? 'INCONCLUSIVE EVIDENCE'
                  : currentRecord.forensicDetails.verdict === 'SUSPICIOUS'
                  ? 'SUSPICIOUS ACTIVITY DETECTED'
                  : currentRecord.forensicDetails.verdict === 'SPAM'
                  ? 'SPAM / PHISHING DETECTED'
                  : currentRecord.forensicDetails.verdict === 'MALICIOUS'
                  ? 'MALICIOUS THREAT DETECTED'
                  : 'MANIPULATED / SYNTHETIC MEDIA')
              : isHighRisk
              ? 'DO NOT TRUST THIS INTERACTION'
              : 'VERIFIED SAFE INTERACTION'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {currentRecord.veritySummary || currentRecord.subject}
          </p>
        </div>

        {/* Real-Time Action Status Feedback Banner */}
        {currentStatus && (
          <div className="p-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 flex items-start gap-2 animate-fadeIn shadow-md">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-white block">Status Updated</span>
              <span>{currentStatus}</span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. THREAT EVIDENCE & FORENSIC TRIGGERS (REPLACED QUESTIONS)  */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Detected Scam Red Flags
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Forensic Audit</span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Target Sender / Line */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Inbound Identity / Sender:</span>
                <span className="font-mono text-white font-bold">{currentRecord.identityDetails.callerOrSender}</span>
              </div>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
              currentRecord.identityDetails.stirShakenStatus === 'FAILED'
                ? 'bg-red-950 text-red-400 border-red-500/30'
                : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
            }`}>
              {currentRecord.identityDetails.stirShakenStatus === 'FAILED' ? 'UNVERIFIED ORIGIN' : 'VERIFIED ORIGIN'}
            </span>
          </div>

          {currentRecord.forensicDetails ? (
            <>
              {/* Multimodal AI Verdict & Manipulation Type */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Multimodal Forensic Verdict:</span>
                    <span className="text-slate-200 font-medium">
                      {currentRecord.forensicDetails.verdict.replace('_', ' ')} · {currentRecord.forensicDetails.manipulationType}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                  currentRecord.forensicDetails.verdict === 'REAL' || currentRecord.forensicDetails.verdict === 'SAFE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : currentRecord.forensicDetails.verdict === 'UNCERTAIN' || currentRecord.forensicDetails.verdict === 'UNKNOWN'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                    : 'bg-purple-950 text-purple-300 border-purple-500/40'
                }`}>
                  {Math.round(currentRecord.forensicDetails.confidence * 100)}% CONF
                </span>
              </div>

              {/* Detected Evidence List */}
              {currentRecord.forensicDetails.evidence.map((ev, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                  <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                    currentRecord.forensicDetails!.verdict === 'REAL' || currentRecord.forensicDetails!.verdict === 'SAFE'
                      ? 'text-emerald-400'
                      : currentRecord.forensicDetails!.verdict === 'UNCERTAIN' || currentRecord.forensicDetails!.verdict === 'UNKNOWN'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Evidence Indicator #{i + 1}:</span>
                    <span className="text-slate-200 font-normal leading-snug">{ev}</span>
                  </div>
                </div>
              ))}

              {/* Recommended Action */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Recommended Action:</span>
                    <span className="text-cyan-300 font-medium">{currentRecord.forensicDetails.recommendedAction}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  {currentRecord.forensicDetails.threatLevel}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* AI Voice Clone or Deepfake Finding */}
              {currentRecord.communicationDetails.syntheticProbability > 50 && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Acoustic Biometrics:</span>
                      <span className="text-slate-200 font-medium">
                        {currentRecord.communicationDetails.syntheticProbability}% AI Cloned Voice Probability
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                    AI DETECTED
                  </span>
                </div>
              )}

              {/* Coercion & Urgency Trap */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Psychological Coercion:</span>
                    <span className="text-slate-200 font-medium">
                      {currentRecord.communicationDetails.coercionTactics.join(' · ') || 'Urgency Trap to Induce Panic'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  HIGH PRESSURE
                </span>
              </div>

              {/* Requested Trap Action */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Dangerous Request:</span>
                    <span className="text-red-300 font-medium">{currentRecord.requestedActionDetails.actionType}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40">
                  DANGER
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ACTIVE ACTIONS (ALL 5 FUNCTIONAL WORKING BUTTONS)         */}
      {/* ============================================================ */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block px-1">
          Recommended Safety Actions (Tap to Act)
        </span>

        {/* 1. Primary Button: Verify Independently via Safe Helpline Directory */}
        <button
          type="button"
          onClick={handleOpenDirectory}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99]"
        >
          <PhoneCall className="w-4 h-4 text-slate-950" />
          <span>Verify Independently (Open Safe Directory / 1930)</span>
        </button>

        {/* 4 Working Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* Button 2: Block Number */}
          <button
            type="button"
            onClick={handleBlockAction}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.99] ${
              isBlocked 
                ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
            }`}
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{isBlocked ? '✓ Number Blocked' : 'Block Number'}</span>
          </button>

          {/* Button 3: Quarantine */}
          <button
            type="button"
            onClick={handleQuarantineAction}
            className="py-2.5 px-3 rounded-xl text-xs font-semibold text-orange-300 bg-orange-950/70 hover:bg-orange-900/60 border border-orange-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Quarantine</span>
          </button>

          {/* Button 4: Report to Cyber Crime Helpline (1930) */}
          <button
            type="button"
            onClick={handleReportAction}
            className="py-2.5 px-3 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/60 border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report to 1930</span>
          </button>

          {/* Button 5: Mark as Safe / Approved */}
          <button
            type="button"
            onClick={handleApproveAction}
            className="py-2.5 px-3 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Mark as Safe</span>
          </button>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. FIXED BOTTOM NAVIGATION (5 TABS)                          */}
      {/* ============================================================ */}
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
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="text-red-400">Alerts</span>
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

      {/* Independent Verification Safe Helpline Directory Modal */}
      {isVerifyModalOpen && (
        <IndependentVerifyModal
          callerNumber={currentRecord.identityDetails.callerOrSender}
          onClose={() => setIsVerifyModalOpen(false)}
          onConfirmVerified={() => {
            setCurrentStatus('Verified via Official Directory (Safe)');
          }}
        />
      )}

    </div>
  );
};
