import React from 'react';
import { PhoneCall, Mic, MessageSquareText, Film, Link2, ArrowUpRight, Sparkles, Activity, ShieldCheck, Waves, Cpu } from 'lucide-react';
import { QUICK_ANALYSIS_CATEGORIES } from '../data/mockData';
import { ModalityType } from '../types';

interface QuickAnalysisGridProps {
  onSelectModality: (modality: ModalityType) => void;
}

export const QuickAnalysisGrid: React.FC<QuickAnalysisGridProps> = ({ onSelectModality }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5 text-cyan-400" />;
      case 'Mic':
        return <Mic className="w-5 h-5 text-blue-400" />;
      case 'MessageSquareText':
        return <MessageSquareText className="w-5 h-5 text-indigo-400" />;
      case 'Film':
        return <Film className="w-5 h-5 text-purple-400" />;
      case 'Link2':
        return <Link2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getAccentBorder = (id: ModalityType) => {
    switch (id) {
      case 'call':
        return 'hover:border-cyan-500/70 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] bg-gradient-to-b from-slate-900/90 to-cyan-950/20';
      case 'voice':
        return 'hover:border-blue-500/70 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] bg-gradient-to-b from-slate-900/90 to-blue-950/20';
      case 'message':
        return 'hover:border-indigo-500/70 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] bg-gradient-to-b from-slate-900/90 to-indigo-950/20';
      case 'media':
        return 'hover:border-purple-500/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-gradient-to-b from-slate-900/90 to-purple-950/20';
      case 'url':
        return 'hover:border-emerald-500/70 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] bg-gradient-to-b from-slate-900/90 to-emerald-950/20';
    }
  };

  const getBadgeStyle = (id: ModalityType) => {
    switch (id) {
      case 'call':
        return 'text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border-cyan-300 dark:border-cyan-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'voice':
        return 'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'message':
        return 'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'media':
        return 'text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'url':
        return 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
    }
  };

  const renderMicroVisualization = (id: ModalityType) => {
    switch (id) {
      case 'voice':
        return (
          <div className="flex items-end gap-1 h-3.5 my-1">
            <span className="w-1 bg-blue-400 h-2 animate-pulse rounded-full" />
            <span className="w-1 bg-blue-400 h-3.5 animate-pulse rounded-full delay-75" />
            <span className="w-1 bg-blue-400 h-1.5 animate-pulse rounded-full delay-150" />
            <span className="w-1 bg-blue-400 h-3 animate-pulse rounded-full delay-100" />
            <span className="w-1 bg-blue-400 h-2.5 animate-pulse rounded-full" />
            <span className="text-[10px] font-mono text-blue-400 ml-1">Spectral Scan</span>
          </div>
        );
      case 'call':
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 my-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>STIR/SHAKEN Attestation</span>
          </div>
        );
      case 'message':
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 my-1">
            <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>Urgency NLP Classifier</span>
          </div>
        );
      case 'media':
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 my-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>Facial Artifact Model</span>
          </div>
        );
      case 'url':
        return (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 my-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Homograph Sandbox</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Quick Analysis
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            5 Active Engines
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click any card to start forensic scan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {QUICK_ANALYSIS_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectModality(category.id)}
            className={`group relative flex flex-col justify-between text-left p-4 rounded-xl border border-slate-800/90 transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-md shadow-md ${getAccentBorder(
              category.id
            )}`}
          >
            {/* Top row: Icon + Modality Badge */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400 transition-all shadow-sm">
                  {getIcon(category.iconName)}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getBadgeStyle(category.id)}`}>
                  {category.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold tracking-wider text-stone-600 group-hover:text-stone-950 dark:text-stone-400 dark:group-hover:text-stone-100 transition-colors">
                    {category.title}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-700 dark:text-stone-100 dark:group-hover:text-orange-300 mt-0.5 leading-snug transition-colors">
                  {category.subtitle}
                </h3>
              </div>

              {/* Micro Live Visualizer */}
              <div className="pt-0.5">
                {renderMicroVisualization(category.id)}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            </div>

            {/* Bottom action button link */}
            <div className="pt-3.5 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors">
              <span>{category.actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
