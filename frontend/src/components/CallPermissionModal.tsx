import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Radio, 
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface CallPermissionModalProps {
  onGrantPermission: (mode: 'full' | 'simulated') => void;
}

export const CallPermissionModal: React.FC<CallPermissionModalProps> = ({
  onGrantPermission
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-title"
        className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border-b border-cyan-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <PhoneCall className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 id="permission-title" className="text-base font-bold text-white tracking-tight font-sans">
              Telephony & Call Screening Access
            </h2>
            <p className="text-[11px] text-cyan-300 font-mono">
              VERITY Real-time Inbound Protection
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300 font-sans">
          <p className="text-slate-300 leading-relaxed text-xs">
            To protect your line from <strong className="text-white">Digital Arrest extortion scams</strong>, <strong className="text-white">AI voice clones</strong>, and <strong className="text-white">VoIP caller ID spoofing</strong>, VERITY requires permission to inspect incoming calls and analyze call logs.
          </p>

          {/* Capabilities Grid */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-100 block">
                  Real-Time Incoming Call Intercept
                </span>
                <span className="text-[11px] text-slate-400 block leading-normal">
                  Automatically detects incoming callers, displays the true phone number, and routes active calls to the Call Protection shield.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-100 block">
                  STIR/SHAKEN Telecom Attestation
                </span>
                <span className="text-[11px] text-slate-400 block leading-normal">
                  Verifies carrier origin (Level A vs Gateway Level C), exposing spoofed numbers posing as banks, CBI, or police agencies.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-100 block">
                  Call Logs & Missed Call Forensics
                </span>
                <span className="text-[11px] text-slate-400 block leading-normal">
                  Cross-references recent numbers against the National Cyber Crime 1930 bad-actor ledger and reported mule rings.
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Zero-Trust Notice */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-2.5 text-[11px] text-cyan-200">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="leading-tight">
              <strong>Zero-Trust Local Privacy:</strong> No call audio is ever recorded without consent or uploaded to commercial trackers.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onGrantPermission('full')}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Grant Call Screening & Log Access</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-950/70" />
          </button>

          <button
            type="button"
            onClick={() => onGrantPermission('simulated')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue in Simulated Sandbox Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
