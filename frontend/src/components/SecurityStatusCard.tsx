import React from 'react';
import { ShieldCheck, Activity, Radio, Lock, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface SecurityStatusCardProps {
  protectionActive: boolean;
  onToggleProtection: () => void;
  onQuickScan: () => void;
}

export const SecurityStatusCard: React.FC<SecurityStatusCardProps> = ({
  protectionActive,
  onToggleProtection,
  onQuickScan
}) => {
  const telemetryEngines = [
    { name: 'Caller STIR/SHAKEN', status: 'Active', latency: '12ms' },
    { name: 'Spectral Voice Forensics', status: 'Active', latency: '48ms' },
    { name: 'Linguistic Urgency NLP', status: 'Active', latency: '18ms' },
    { name: 'Sensitive Action Shield', status: 'Active', latency: '4ms' }
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md p-4 sm:p-5 ${
      protectionActive
        ? 'bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-cyan-950/40 border-cyan-500/30'
        : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Background ambient sweep */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Prominent status icon and title */}
        <div className="flex items-start gap-4">
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl border shrink-0 transition-all ${
            protectionActive
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <ShieldCheck className="w-6 h-6" />
            {protectionActive && (
              <div className="absolute inset-0 rounded-xl bg-emerald-400/10 animate-ping opacity-75" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                VERITY Protection Active
              </h3>
              
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                protectionActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${protectionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {protectionActive ? 'Continuous Intercept Online' : 'Interception Paused'}
              </span>

              {/* Refined 14 Threats Intercepted Today Security Metric Badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/70 px-2.5 py-0.5 rounded-md border border-orange-300 dark:border-orange-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 shrink-0" />
                <span>14 Threats Intercepted Today</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-normal max-w-2xl">
              Identity, communication patterns and requested actions are being evaluated across all connected inbound channels in real time.
            </p>
          </div>
        </div>

        {/* Right: Live Telemetry Engines + Quick Diagnostics */}
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
          <div className="hidden xl:grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 border-r border-slate-800 pr-4">
            {telemetryEngines.map((engine, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${protectionActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="text-slate-300 truncate max-w-[130px]">{engine.name}</span>
                <span className="font-mono text-slate-500 tabular-nums">{engine.latency}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleProtection}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                protectionActive
                  ? 'bg-red-950/40 hover:bg-red-900/40 text-red-300 border-red-500/30'
                  : 'bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {protectionActive ? 'Pause Shield' : 'Resume Protection'}
            </button>

            <button
              onClick={onQuickScan}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
