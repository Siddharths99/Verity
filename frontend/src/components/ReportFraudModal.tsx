import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  FileText, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { AnalysisRecord } from '../types';

interface ReportFraudModalProps {
  record?: AnalysisRecord;
  onClose: () => void;
  onConfirmReport: (complaintRef: string) => void;
}

export const ReportFraudModal: React.FC<ReportFraudModalProps> = ({
  record,
  onClose,
  onConfirmReport
}) => {
  const [complaintRef] = useState<string>(
    () => `NCR-1930-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  const callerOrSender = record?.identityDetails?.callerOrSender || '+1 (555) 932-8411';
  const riskScore = record?.score ?? 87;
  const riskLevel = record?.risk ?? 'HIGH';
  const incidentId = record?.id ?? 'VRY-1042';
  const summary = record?.veritySummary || 'Impersonation scam with neural vocoder formant jitter and urgent financial transfer demand.';

  const evidenceText = `--- VERITY INCIDENT FORENSIC DOSSIER ---
National Cyber Crime Portal Complaint Ref: ${complaintRef}
Incident ID: ${incidentId}
Date/Time: ${record?.time || new Date().toLocaleString()}
Offender Identity / Caller ID: ${callerOrSender}
Channel: ${record?.type || 'Voice Call'}
Verity Risk Verdict: ${riskLevel} (${riskScore}/100)
Summary: ${summary}
Attestation Status: ${record?.identityDetails?.stirShakenStatus || 'FAILED'}
Acoustic / Synthetic Markers: ${record?.communicationDetails?.syntheticMarkers?.join(', ') || 'Neural Vocoder Formants'}
Requested Action: ${record?.requestedActionDetails?.actionType || 'Urgent Fund Transfer'}
Generated via VERITY Zero-Trust Defense System
Reported to National Cybercrime Helpline 1930 / cybercrime.gov.in
----------------------------------------`;

  const handleCopyEvidence = () => {
    navigator.clipboard?.writeText(evidenceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    onConfirmReport(complaintRef);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 shadow-md">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                National Cyber Crime Reporting (1930)
              </h3>
              <span className="text-[10px] font-mono text-amber-400">
                Direct Indian Cybercrime Coordination Centre (I4C) Protocol
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDispatched ? (
          <div className="py-10 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-mono">Formal Telemetry Dispatched</h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-xs mx-auto text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Reference Number</span>
              <span className="text-amber-400 font-bold text-sm">{complaintRef}</span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto font-sans">
              Evidence hash has been transmitted to National Cybercrime records.
            </p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
            
            {/* National Helpline 1930 Immediate Call Bar */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-amber-950/60 to-slate-900 border border-red-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                  National Financial Fraud Helpline
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white">
                  DIAL 1930
                </span>
                <span className="text-[10px] text-slate-300 block">
                  24x7 Toll-Free Citizen Emergency Service
                </span>
              </div>

              <a
                href="tel:1930"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all shrink-0 cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1930 Now</span>
              </a>
            </div>

            {/* Generated Complaint Dossier Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300">
                  Incident Evidence Packet Preview
                </label>
                <span className="text-[10px] font-mono text-cyan-400">
                  Complaint Ref: {complaintRef}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Suspect / Sender:</span>
                  <span className="text-red-400 font-bold truncate max-w-[200px]">{callerOrSender}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Risk Severity:</span>
                  <span className="text-amber-400 font-bold">{riskLevel} ({riskScore}/100)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Channel Type:</span>
                  <span className="text-cyan-300">{record?.type || 'Voice'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Forensic Summary:</span>
                  <span className="text-slate-300 font-sans text-[11px] block mt-0.5 leading-relaxed">
                    {summary}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyEvidence}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copied ? 'Dossier Copied to Clipboard!' : 'Copy Evidence Packet'}</span>
              </button>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2 font-semibold cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>cybercrime.gov.in Portal</span>
              </a>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        {!isDispatched && (
          <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDispatch}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Formal Report & Log Complaint</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
