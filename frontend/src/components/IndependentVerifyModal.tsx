import React from 'react';
import { X, PhoneCall, ShieldCheck, ExternalLink, AlertTriangle, Building, PhoneForwarded } from 'lucide-react';

interface IndependentVerifyModalProps {
  callerNumber?: string;
  onClose: () => void;
  onConfirmVerified: () => void;
}

export const IndependentVerifyModal: React.FC<IndependentVerifyModalProps> = ({
  callerNumber = '+91 98401 24590',
  onClose,
  onConfirmVerified
}) => {
  const safeDirectories = [
    {
      name: 'National Cyber Crime Helpline (Govt of India)',
      number: '1930',
      timing: '24x7 Toll-Free Emergency',
      desc: 'Immediate reporting of unauthorized bank transfers, digital arrests, or scam calls.'
    },
    {
      name: 'RBI Sachet Fraud Portal & Telecom DND',
      number: '1909',
      timing: 'Toll-Free SMS / Voice',
      desc: 'Forward fake SMS or report unregistered telemarketers directly.'
    },
    {
      name: 'State Bank of India (SBI) Fraud Desk',
      number: '1800 1234 / 1800 2100',
      timing: '24x7 Verified Branch',
      desc: 'Instant freezing of debit card / net banking access.'
    },
    {
      name: 'HDFC Bank Scam Hotline',
      number: '1800 1600 / 1800 2600',
      timing: '24x7 Priority Support',
      desc: 'Official direct line to verify genuine bank officials.'
    },
    {
      name: 'ICICI Bank Fraud Reporting',
      number: '1800 1080',
      timing: '24x7 Direct Gateway',
      desc: 'Direct authentication of bank executive credentials.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Independent Verification Protocol
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Zero-Trust Directory</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Rule: Never call back on the number that just called you!
          </span>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            Scammers spoof phone numbers. Hang up and dial the official verified helpline number below to verify if any alert is genuine.
          </p>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {safeDirectories.map((item, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{item.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {item.timing}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-cyan-400 font-bold text-sm tracking-wide">
                  {item.number}
                </span>
                <a
                  href={`tel:${item.number.split('/')[0].trim()}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Safe Number</span>
                </a>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-800 shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => {
              onConfirmVerified();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Have Verified Through Official Directory</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 text-center cursor-pointer"
          >
            Cancel & Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
