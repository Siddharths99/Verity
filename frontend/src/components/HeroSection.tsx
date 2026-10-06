import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-6 pb-2">
      {/* Background subtle radial ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-44 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl space-y-3">
        {/* Tagline banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold tracking-wider text-cyan-400 uppercase text-[11px]">
            VERITY
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono text-[11px]">
            Detect · Correlate · Score · Warn · Prevent
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          Multimodal AI Impersonation & Fraud Prevention
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
          Real-time evaluation of caller identity, synthetic voice biometrics, and high-risk action requests across all connected channels.
        </p>

        {/* 4 Core Pillars Indicators */}
        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Who is contacting
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            What is communicated
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            What is requested
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Weighted correlation score
          </span>
        </div>
      </div>
    </section>
  );
};
