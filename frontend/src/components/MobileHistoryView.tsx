import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Search, 
  PhoneCall, 
  Mic, 
  MessageSquareText, 
  Film, 
  Link2, 
  ChevronRight, 
  Home, 
  Plus, 
  FileText, 
  Bell, 
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { AnalysisRecord, ModalityType } from '../types';
import { exportIncidentReportToPdf } from '../utils/pdfExport';

interface MobileHistoryViewProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onNavigateTab: (tab: string) => void;
  onExportAuditLog: () => void;
  activeMobileTab?: string;
}

export const MobileHistoryView: React.FC<MobileHistoryViewProps> = ({
  records,
  onSelectRecord,
  onNavigateTab,
  onExportAuditLog,
  activeMobileTab = 'history'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All');

  const getTypeIcon = (type: ModalityType) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4 text-cyan-400" />;
      case 'voice': return <Mic className="w-4 h-4 text-blue-400" />;
      case 'message': return <MessageSquareText className="w-4 h-4 text-indigo-400" />;
      case 'media': return <Film className="w-4 h-4 text-purple-400" />;
      case 'url': return <Link2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.identityDetails.callerOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      selectedFilter === 'All' ||
      (selectedFilter === 'Calls' && r.type === 'call') ||
      (selectedFilter === 'Voice' && r.type === 'voice') ||
      (selectedFilter === 'Messages' && r.type === 'message') ||
      (selectedFilter === 'Media' && r.type === 'media') ||
      (selectedFilter === 'URLs' && r.type === 'url');

    const matchesRisk =
      selectedRiskFilter === 'All' ||
      (selectedRiskFilter === 'High/Crit' && (r.risk === 'CRITICAL' || r.risk === 'HIGH')) ||
      (selectedRiskFilter === 'Medium' && r.risk === 'MEDIUM') ||
      (selectedRiskFilter === 'Low' && r.risk === 'LOW');

    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto pb-28 sm:pb-32 space-y-4 animate-fadeIn overflow-x-hidden">
      
      {/* Top Header with High-Visibility Back Button and Export Action */}
      <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-950/80 hover:border-cyan-300 px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.45)] cursor-pointer active:scale-95"
          title="Back to dashboard"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3] text-cyan-400" />
          <span className="tracking-wide">Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold text-white tracking-tight font-sans">
            Forensic Audit Ledger
          </h1>
          <span className="text-[9px] font-mono text-slate-400">128 Interactions Logged</span>
        </div>

        <button
          onClick={onExportAuditLog}
          title="Export All Cryptographic PDF Reports"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-colors cursor-pointer text-[10px] font-mono font-bold shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All</span>
        </button>
      </div>

      {/* Full Telemetry Banner */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 block">Total Scans</span>
          <span className="text-lg font-bold font-mono text-white block">128</span>
          <span className="text-[9px] text-slate-500 font-mono">100% Attested</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-red-400 block">Threats Blocked</span>
          <span className="text-lg font-bold font-mono text-red-400 block">32</span>
          <span className="text-[9px] text-red-400/80 font-mono">25.0% Intercept</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-400 block">Verified Safe</span>
          <span className="text-lg font-bold font-mono text-emerald-400 block">96</span>
          <span className="text-[9px] text-emerald-400/80 font-mono">75.0% Nominal</span>
        </div>
      </div>

      {/* Search Bar with Clear Button */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, caller, domain or keyword..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modality Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {['All', 'Calls', 'Voice', 'Messages', 'Media', 'URLs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer font-medium ${
              selectedFilter === tab
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Full Records List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="font-semibold text-slate-300">No telemetry records found</p>
            <p className="text-[11px] text-slate-500">Try adjusting your search terms or modality filter.</p>
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectRecord(r)}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:bg-slate-800 transition-all flex flex-col space-y-2 shadow-sm cursor-pointer group"
            >
              {/* Header row of card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${
                    r.risk === 'CRITICAL' ? 'bg-red-950/60 border-red-500/40 text-red-400' :
                    r.risk === 'HIGH' ? 'bg-orange-950/60 border-orange-500/40 text-orange-400' :
                    r.risk === 'MEDIUM' ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' :
                    'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  }`}>
                    {getTypeIcon(r.type)}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors block leading-tight">
                      {r.subject}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate block max-w-[190px]">
                      {r.identityDetails.callerOrSender}
                    </span>
                  </div>
                </div>

                {/* Score & Risk Badge */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-baseline gap-0.5 font-mono">
                    <span className={`text-sm font-bold ${
                      r.score >= 80 ? 'text-red-400' : r.score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {r.score}
                    </span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    r.risk === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800' :
                    r.risk === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                    r.risk === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {r.risk}
                  </span>
                </div>
              </div>

              {/* Detail summary & action row with individual PDF download */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">{r.id}</span>
                  <span>·</span>
                  <span className="text-slate-400">{r.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportIncidentReportToPdf(r);
                    }}
                    title="Download this specific incident PDF report"
                    className="px-2 py-0.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 flex items-center gap-1 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>PDF</span>
                  </button>

                  <div className="flex items-center gap-1 text-slate-300 group-hover:text-cyan-400 transition-colors font-sans font-medium text-[11px]">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Navigation Bar (5 Tabs) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button
            onClick={() => onNavigateTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
              activeMobileTab === 'home' || activeMobileTab === 'dashboard'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigateTab('analyze')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
              activeMobileTab === 'analyze'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Analyze</span>
          </button>

          <button
            onClick={() => onNavigateTab('history')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
              activeMobileTab === 'history'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => onNavigateTab('incidents')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 relative ${
              activeMobileTab === 'incidents'
                ? 'text-red-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <span>Alerts</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className={`flex flex-col items-center gap-0.5 text-[9px] font-mono transition-colors cursor-pointer py-0.5 ${
              activeMobileTab === 'settings'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

        </div>
      </div>

    </div>
  );
};
