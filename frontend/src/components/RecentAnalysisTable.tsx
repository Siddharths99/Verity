import React, { useState } from 'react';
import { AnalysisRecord, ModalityType, RiskLevel } from '../types';
import { PhoneCall, Mic, MessageSquareText, Film, Link2, Search } from 'lucide-react';

interface RecentAnalysisTableProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
}

export const RecentAnalysisTable: React.FC<RecentAnalysisTableProps> = ({
  records,
  onSelectRecord
}) => {
  const [filterModality, setFilterModality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getTypeIcon = (type: ModalityType) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />;
      case 'voice':
        return <Mic className="w-3.5 h-3.5 text-blue-400" />;
      case 'message':
        return <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'media':
        return <Film className="w-3.5 h-3.5 text-purple-400" />;
      case 'url':
        return <Link2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getTypeName = (type: ModalityType) => {
    switch (type) {
      case 'call': return 'Call';
      case 'voice': return 'Voice';
      case 'message': return 'Message';
      case 'media': return 'Media';
      case 'url': return 'URL';
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-600/40 text-red-700 dark:text-red-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono bg-orange-50 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-600/40 text-orange-700 dark:text-orange-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/40 text-amber-800 dark:text-amber-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            LOW
          </span>
        );
    }
  };

  const getActionButtonStyle = (action: string) => {
    switch (action) {
      case 'Verify':
        return 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/70 dark:hover:bg-cyan-900/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer active:scale-[0.98]';
      case 'Block':
        return 'bg-red-50 hover:bg-red-100 dark:bg-red-950/70 dark:hover:bg-red-900/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer active:scale-[0.98]';
      case 'Blocked':
        return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700 shadow-none cursor-default';
      case 'Review':
        return 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer active:scale-[0.98]';
      case 'Safe':
        return 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer active:scale-[0.98]';
      default:
        return 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer active:scale-[0.98]';
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesModality = filterModality === 'all' || r.type === filterModality;
    const matchesSearch =
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.identityDetails.callerOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.veritySummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recent Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Latest evaluated interactions across all telemetry streams
          </p>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or sender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-44 sm:w-56 transition-colors"
            />
          </div>

          {/* Modality Segmented Filter */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
            {['all', 'call', 'voice', 'message', 'media', 'url'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterModality(m)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer ${
                  filterModality === m
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4 w-28">Time</th>
                <th scope="col" className="py-3 px-4 w-28">Type</th>
                <th scope="col" className="py-3 px-4">Subject</th>
                <th scope="col" className="py-3 px-4 w-28">Risk</th>
                <th scope="col" className="py-3 px-4 w-20 text-right">Score</th>
                <th scope="col" className="py-3 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <p className="text-sm">No analysis records match your query.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {record.time}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-300">
                        {getTypeIcon(record.type)}
                        <span className="font-medium">{getTypeName(record.type)}</span>
                      </div>
                    </td>

                    {/* Subject + Subtitle / Sender Preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {record.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal line-clamp-1">
                          {record.veritySummary}
                        </span>
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(record.risk)}
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`font-mono text-sm font-bold tabular-nums ${
                        record.score >= 80 ? 'text-red-400' :
                        record.score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {record.score}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 ml-0.5">/100</span>
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(record);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${getActionButtonStyle(
                          record.action
                        )}`}
                      >
                        {record.action}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing {filteredRecords.length} records</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Live multi-vector telemetry active</span>
          </div>
          <span className="text-slate-500 text-[11px]">Select any interaction to view forensic correlation</span>
        </div>
      </div>
    </div>
  );
};
