import React, { useEffect } from 'react';
import { AnalysisRecord } from '../types';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  User, 
  FileAudio, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Shield,
  PhoneOff,
  Flag
} from 'lucide-react';

interface AnalysisDetailModalProps {
  record: AnalysisRecord | null;
  onClose: () => void;
  onTakeAction: (recordId: string, action: string) => void;
  onViewIncidentDossier?: () => void;
  onVerifyIndependently?: (record: AnalysisRecord) => void;
  onBlockCaller?: (record: AnalysisRecord) => void;
  onReportFraud?: (record: AnalysisRecord) => void;
}

export const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({
  record,
  onClose,
  onTakeAction,
  onViewIncidentDossier,
  onVerifyIndependently,
  onBlockCaller,
  onReportFraud
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const getRiskHeaderBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'HIGH':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'MEDIUM':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default:
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden cursor-default m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  VERITY Forensic Correlation
                </span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{record.time}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[260px] sm:max-w-md md:max-w-xl">
                {record.subject}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {record.action === 'Verified' && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hidden sm:flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED SAFE
              </span>
            )}
            {record.action === 'Rejected' && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/50 hidden sm:flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                REJECTED (THREAT)
              </span>
            )}
            <span className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold font-mono border ${getRiskHeaderBadge(record.risk)}`}>
              {record.risk} RISK · {record.score}/100
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: The 4 Core Questions of VERITY */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
          
          {/* Executive Summary Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Verdict & Correlation Analysis</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {record.veritySummary}
            </p>
          </div>

          {/* 3 Multimodal Evaluation Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            
            {/* 1. WHO is contacting */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    1. Caller Identity
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {record.identityDetails.identityTrustScore}% Trust
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2.5">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sender / Caller</span>
                    <span className="font-mono text-slate-200 break-words">
                      {record.identityDetails.callerOrSender}
                    </span>
                  </div>

                  {record.identityDetails.stirShakenStatus && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">STIR/SHAKEN Attestation</span>
                      <span className={`font-mono font-semibold ${
                        record.identityDetails.stirShakenStatus === 'PASSED' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {record.identityDetails.stirShakenStatus}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block text-[11px]">Spoofing Indicators</span>
                    {record.identityDetails.spoofingIndicators.length > 0 ? (
                      <ul className="list-disc list-inside text-red-300/90 space-y-0.5 mt-0.5 text-[11px]">
                        {record.identityDetails.spoofingIndicators.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">No spoofing indicators</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WHAT is communicated */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileAudio className="w-3.5 h-3.5 text-blue-400" />
                    2. Media & Urgency
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {record.communicationDetails.syntheticProbability}% Synthetic
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2.5">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Communication Medium</span>
                    <span className="text-slate-200">{record.communicationDetails.medium}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Linguistic Pressure</span>
                    <span className={`font-semibold ${
                      record.communicationDetails.linguisticUrgency === 'Extreme Pressure' ? 'text-red-400' :
                      record.communicationDetails.linguisticUrgency === 'Elevated' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {record.communicationDetails.linguisticUrgency}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Detected Coercion Tactics</span>
                    {record.communicationDetails.coercionTactics.length > 0 ? (
                      <ul className="list-disc list-inside text-amber-300/90 space-y-0.5 mt-0.5 text-[11px] max-h-36 overflow-y-auto pr-1">
                        {record.communicationDetails.coercionTactics.map((tac, i) => (
                          <li key={i}>{tac}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">Normal conversational flow</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. WHAT is requested */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    3. Requested Action
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {record.requestedActionDetails.sensitivityLevel}
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2.5">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Action Demanded</span>
                    <span className="text-slate-100 font-medium break-words">
                      {record.requestedActionDetails.actionType}
                    </span>
                  </div>

                  {record.requestedActionDetails.financialRiskUsd ? (
                    <div>
                      <span className="text-slate-500 block text-[11px]">Financial Exposure</span>
                      <span className="font-mono text-red-400 font-bold">
                        ${record.requestedActionDetails.financialRiskUsd.toLocaleString()} USD
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <span className="text-slate-500 block text-[11px]">Destination Risk</span>
                    <span className="font-mono text-slate-300">
                      {record.requestedActionDetails.destinationRisk}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Recommended Protective Actions */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Protective Actions
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Verify Out-of-Band</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                    Call the verified primary number on file directly. Never call back on the inbound caller's line.
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Enforce Dual-Authorization</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                    Any fund transfers or credential requests must require multi-party secondary approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            {onViewIncidentDossier && (
              <button
                onClick={() => {
                  onClose();
                  onViewIncidentDossier();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Open full interactive forensic dossier"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Incident Dossier</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onVerifyIndependently && (
              <button
                type="button"
                onClick={() => {
                  onVerifyIndependently(record);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Verify Independently</span>
              </button>
            )}

            {onBlockCaller && (
              <button
                type="button"
                onClick={() => {
                  onBlockCaller(record);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-950 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Block Sender / Blacklist</span>
              </button>
            )}

            {onReportFraud && (
              <button
                type="button"
                onClick={() => {
                  onReportFraud(record);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Fraud (1930)</span>
              </button>
            )}

            <button
              onClick={() => {
                onTakeAction(record.id, 'Verified');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark Safe</span>
            </button>
            <button
              onClick={() => {
                onTakeAction(record.id, 'Rejected');
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-950/70 hover:bg-red-900/80 border border-red-500/50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Reject Threat</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
