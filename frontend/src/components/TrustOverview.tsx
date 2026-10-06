import React from 'react';
import { UserCheck, MessageCircleWarning, ShieldAlert, FileCheck, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { TRUST_OVERVIEW_METRICS } from '../data/mockData';
import { TrustOverviewMetric } from '../types';

interface TrustOverviewProps {
  onCardClick?: (metricId: string) => void;
}

export const TrustOverview: React.FC<TrustOverviewProps> = ({ onCardClick }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'identity-trust':
        return <UserCheck className="w-4 h-4 text-cyan-400" />;
      case 'communication-risk':
        return <MessageCircleWarning className="w-4 h-4 text-amber-400" />;
      case 'media-authenticity':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'action-risk':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getScoreColor = (id: string, score: number) => {
    if (id === 'identity-trust' || id === 'media-authenticity') {
      if (score >= 90) return 'text-emerald-400';
      if (score >= 70) return 'text-amber-400';
      return 'text-red-400';
    } else {
      // Risk metrics (lower is better, higher is dangerous)
      if (score <= 30) return 'text-emerald-400';
      if (score <= 70) return 'text-amber-400';
      return 'text-red-400';
    }
  };

  const getProgressBarColor = (id: string, score: number) => {
    if (id === 'identity-trust' || id === 'media-authenticity') {
      if (score >= 90) return 'bg-emerald-500';
      if (score >= 70) return 'bg-amber-500';
      return 'bg-red-500';
    } else {
      if (score <= 30) return 'bg-emerald-500';
      if (score <= 70) return 'bg-amber-500';
      return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Trust & Risk Overview
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Correlated Multi-Vector Posture
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TRUST_OVERVIEW_METRICS.map((metric) => (
          <div
            key={metric.id}
            onClick={() => onCardClick?.(metric.id)}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            tabIndex={0}
            role="button"
            aria-label={`${metric.label} score ${metric.score}`}
          >
            {/* Header: Label + Icon */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{metric.label}</span>
                <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700/60 group-hover:scale-105 transition-transform">
                  {getIcon(metric.id)}
                </div>
              </div>

              {/* Metric Number & Status Text */}
              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${getScoreColor(metric.id, metric.score)}`}>
                    {metric.score}
                  </span>
                  {metric.unit && (
                    <span className="text-xs font-mono text-slate-400">
                      {metric.unit}
                    </span>
                  )}
                </div>
                
                <span className="text-xs font-medium text-slate-300">
                  {metric.statusText}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(metric.id, metric.score)}`}
                  style={{ width: `${Math.min(metric.score, 100)}%` }}
                />
              </div>
            </div>

            {/* Micro Breakdown Items */}
            <div className="space-y-1 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              {metric.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-400 truncate">{item.name}</span>
                  <span className="font-mono text-slate-200 tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
