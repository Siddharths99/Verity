import React, { useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { IncomingCallPayload } from '../utils/callDetectionService';

interface IncomingCallBannerProps {
  call: IncomingCallPayload;
  onAcceptAndOpenShield: () => void;
  onDeclineCall: () => void;
}

export const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({
  call,
  onAcceptAndOpenShield,
  onDeclineCall
}) => {
  // Auto-redirect to call protection after 4 seconds if not dismissed
  useEffect(() => {
    const timer = setTimeout(() => {
      onAcceptAndOpenShield();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onAcceptAndOpenShield]);

  const isCritical = call.threatLevel === 'CRITICAL' || call.riskScore >= 80;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md animate-in slide-in-from-top-6 duration-300 select-none">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
        isCritical
          ? 'bg-slate-950/95 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.35)]'
          : 'bg-slate-950/95 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.35)]'
      }`}>
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-red-400 uppercase">
              INCOMING CALL DETECTED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              call.attestationGrade === 'LEVEL_A'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-950 text-red-300 border border-red-500/40'
            }`}>
              {call.attestationGrade === 'LEVEL_A' ? 'STIR/SHAKEN PASS' : 'SPOOF RISK: ' + call.attestationGrade}
            </span>
            <button
              onClick={onDeclineCall}
              aria-label="Close alert"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Caller Number & Identity */}
        <div className="flex items-center gap-3.5 my-2">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
            <PhoneCall className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-lg font-black text-white font-mono tracking-tight leading-none truncate">
              {call.phoneNumber}
            </div>
            <div className="text-xs font-semibold text-cyan-300 mt-1 truncate">
              {call.claimedIdentity}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              {call.carrier} · {call.circle}
            </div>
          </div>
        </div>

        {/* Pretext Warning */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-tight line-clamp-2">
            {call.pretext}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDeclineCall}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5 text-red-400" />
            <span>Decline / Ignore</span>
          </button>

          <button
            type="button"
            onClick={onAcceptAndOpenShield}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Open Call Shield →</span>
          </button>
        </div>

      </div>
    </div>
  );
};
