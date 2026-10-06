import React, { useState, useMemo } from 'react';
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
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Today');

  // Relative reference times
  const now = Date.now();
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const sevenDaysAgo = useMemo(() => now - 7 * 24 * 60 * 60 * 1000, [now]);
  const thirtyDaysAgo = useMemo(() => now - 30 * 24 * 60 * 60 * 1000, [now]);

  // Fallback sample records if empty
  const fallbackRecords: AnalysisRecord[] = useMemo(() => [
    {
      id: 'VRY-1042',
      time: '10:42 AM',
      timestamp: now - 1.5 * 3600 * 1000,
      type: 'voice',
      subject: 'Unknown Caller — Bank Verification Pretext',
      risk: 'HIGH',
      score: 87,
      action: 'Verify',
      identityDetails: {
        callerOrSender: '+1 (555) 932-8411 (VoIP Gateway)',
        verifiedIdentity: null,
        identityTrustScore: 13,
        spoofingIndicators: ['Untrusted Carrier Route', 'Attestation Header Flagged'],
        isKnownContact: false,
        stirShakenStatus: 'FAILED'
      },
      communicationDetails: {
        medium: 'Voice Channel Stream',
        syntheticProbability: 87,
        linguisticUrgency: 'Extreme Pressure',
        coercionTactics: ['Authority Impersonation', 'Urgent Deadline Demand'],
        syntheticMarkers: ['Acoustic Discontinuity', 'Neural Vocoder Formants']
      },
      requestedActionDetails: {
        actionType: 'Immediate Wire Transfer / Disclose OTP',
        sensitivityLevel: 'Critical',
        financialRiskUsd: 48500,
        destinationRisk: 'High-Risk Account'
      },
      veritySummary: 'Neural vocoder formant jitter detected. Immediate financial transfer request.'
    },
    {
      id: 'VRY-1041',
      time: '09:18 AM',
      timestamp: now - 3 * 3600 * 1000,
      type: 'url',
      subject: 'Bank Login Credential Spoof',
      risk: 'CRITICAL',
      score: 96,
      action: 'Blocked',
      identityDetails: {
        callerOrSender: 'auth-security-chase.corp-verify.net',
        verifiedIdentity: null,
        identityTrustScore: 4,
        spoofingIndicators: ['Punycode Domain', 'Unregistered SSL Issuer'],
        isKnownContact: false,
        stirShakenStatus: 'FAILED'
      },
      communicationDetails: {
        medium: 'HTTPS URL Packet',
        syntheticProbability: 96,
        linguisticUrgency: 'Extreme Pressure',
        coercionTactics: ['Account Lockout Threat'],
        syntheticMarkers: ['Lookalike Glyphs']
      },
      requestedActionDetails: {
        actionType: 'Disclose Net Banking Credentials',
        sensitivityLevel: 'Critical',
        financialRiskUsd: 25000,
        destinationRisk: 'Unverified Domain'
      },
      veritySummary: 'Credential harvesting kit with punycode domain spoofing.'
    },
    {
      id: 'VRY-1040',
      time: 'Yesterday, 04:15 PM',
      timestamp: now - 26 * 3600 * 1000,
      type: 'message',
      subject: 'Account Suspension Threat SMS',
      risk: 'HIGH',
      score: 71,
      action: 'Blocked',
      identityDetails: {
        callerOrSender: '+1 (800) 492-1102 (SMS Gateway)',
        verifiedIdentity: null,
        identityTrustScore: 29,
        spoofingIndicators: ['Bulk SMS Route'],
        isKnownContact: false,
        stirShakenStatus: 'FAILED'
      },
      communicationDetails: {
        medium: 'SMS Gateway Payload',
        syntheticProbability: 71,
        linguisticUrgency: 'Extreme Pressure',
        coercionTactics: ['Service Suspension'],
        syntheticMarkers: ['Urgent Call-To-Action']
      },
      requestedActionDetails: {
        actionType: 'Update Banking Details',
        sensitivityLevel: 'High',
        financialRiskUsd: 12000,
        destinationRisk: 'Unverified Domain'
      },
      veritySummary: 'Urgent account suspension threat demanding ACH info update.'
    },
    {
      id: 'VRY-1038',
      time: '3 days ago',
      timestamp: now - 3 * 24 * 3600 * 1000,
      type: 'call',
      subject: 'Utility Provider Helpline',
      risk: 'LOW',
      score: 22,
      action: 'Safe',
      identityDetails: {
        callerOrSender: '+91 80012 34567 (BSNL)',
        verifiedIdentity: 'BSNL Telecom Official',
        identityTrustScore: 92,
        spoofingIndicators: [],
        isKnownContact: true,
        stirShakenStatus: 'PASSED'
      },
      communicationDetails: {
        medium: 'Cellular Voice',
        syntheticProbability: 12,
        linguisticUrgency: 'Normal',
        coercionTactics: [],
        syntheticMarkers: []
      },
      requestedActionDetails: {
        actionType: 'Bill Inquiry',
        sensitivityLevel: 'Low',
        financialRiskUsd: 0,
        destinationRisk: 'Legitimate'
      },
      veritySummary: 'Acoustic biometrics match registered voiceprint. Zero vocal jitter.'
    }
  ], [now]);

  const activeDataset = useMemo(() => {
    return records.length > 0 ? records : fallbackRecords;
  }, [records, fallbackRecords]);

  const isRecordInTimeframe = (r: AnalysisRecord, filter: string): boolean => {
    const ts = r.timestamp || now;
    if (filter === 'Today') return ts >= startOfToday;
    if (filter === '7 Days') return ts >= sevenDaysAgo;
    if (filter === '30 Days') return ts >= thirtyDaysAgo;
    return true; // 'All Time'
  };

  // Timeframe-specific data
  const timeframeRecords = useMemo(() => {
    return activeDataset.filter((r) => isRecordInTimeframe(r, selectedDateFilter));
  }, [activeDataset, selectedDateFilter, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  const stats = useMemo(() => {
    const total = timeframeRecords.length;
    const threats = timeframeRecords.filter((r) => r.risk === 'CRITICAL' || r.risk === 'HIGH' || r.score >= 70).length;
    const safe = timeframeRecords.filter((r) => r.risk === 'LOW' || r.score < 50 || r.action === 'Safe').length;
    return { total, threats, safe };
  }, [timeframeRecords]);

  const getTypeIcon = (type: ModalityType) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4 text-cyan-400" />;
      case 'voice': return <Mic className="w-4 h-4 text-blue-400" />;
      case 'message': return <MessageSquareText className="w-4 h-4 text-indigo-400" />;
      case 'media': return <Film className="w-4 h-4 text-purple-400" />;
      case 'url': return <Link2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const filteredRecords = useMemo(() => {
    return activeDataset.filter((r) => {
      // 1. Timeframe
      if (!isRecordInTimeframe(r, selectedDateFilter)) return false;

      // 2. Search
      const matchesSearch =
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.identityDetails.callerOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 3. Modality
      const matchesType =
        selectedFilter === 'All' ||
        (selectedFilter === 'Calls' && r.type === 'call') ||
        (selectedFilter === 'Voice' && r.type === 'voice') ||
        (selectedFilter === 'Messages' && r.type === 'message') ||
        (selectedFilter === 'Media' && r.type === 'media') ||
        (selectedFilter === 'URLs' && r.type === 'url');
      if (!matchesType) return false;

      // 4. Risk
      const matchesRisk =
        selectedRiskFilter === 'All' ||
        (selectedRiskFilter === 'High/Crit' && (r.risk === 'CRITICAL' || r.risk === 'HIGH')) ||
        (selectedRiskFilter === 'Medium' && r.risk === 'MEDIUM') ||
        (selectedRiskFilter === 'Low' && r.risk === 'LOW');
      if (!matchesRisk) return false;

      return true;
    });
  }, [activeDataset, selectedDateFilter, searchQuery, selectedFilter, selectedRiskFilter, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

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
          <span className="text-[9px] font-mono text-cyan-400 font-bold">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'Interaction' : 'Interactions'} ({selectedDateFilter})
          </span>
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

      {/* Dynamic Telemetry Banner */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 block">Total Scans</span>
          <span className="text-lg font-bold font-mono text-white block">{stats.total}</span>
          <span className="text-[9px] text-cyan-400 font-mono">{selectedDateFilter}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-red-400 block">Threats Blocked</span>
          <span className="text-lg font-bold font-mono text-red-400 block">{stats.threats}</span>
          <span className="text-[9px] text-red-400/80 font-mono">Intercepted</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-[10px] font-mono text-emerald-400 block">Verified Safe</span>
          <span className="text-lg font-bold font-mono text-emerald-400 block">{stats.safe}</span>
          <span className="text-[9px] text-emerald-400/80 font-mono">Nominal</span>
        </div>
      </div>

      {/* Timeframe Filter Buttons: Today, 7 Days, 30 Days, All Time */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span>Dedicated Timeframe:</span>
          <span className="text-cyan-400 font-bold">{selectedDateFilter}</span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-xs">
          {['Today', '7 Days', '30 Days', 'All Time'].map((dateOpt) => (
            <button
              key={dateOpt}
              type="button"
              onClick={() => setSelectedDateFilter(dateOpt)}
              className={`py-1.5 px-1 rounded-xl text-center text-[11px] font-mono transition-all cursor-pointer ${
                selectedDateFilter === dateOpt
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {dateOpt}
            </button>
          ))}
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
          <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Clock className="w-6 h-6 text-cyan-400/50 mx-auto" />
            <p className="font-semibold text-slate-300">
              No interactions in timeframe: "{selectedDateFilter}"
            </p>
            <p className="text-[11px] text-slate-500">
              Try switching timeframe to "7 Days", "30 Days", or "All Time".
            </p>
            <button
              onClick={() => {
                setSelectedDateFilter('All Time');
                setSelectedFilter('All');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Show All Time Records
            </button>
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

              {/* Summary line */}
              <p className="text-[11px] text-slate-400 line-clamp-2 font-sans leading-relaxed">
                {r.veritySummary}
              </p>

              {/* Bottom footer: Time, Status & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                <span className="text-slate-500">{r.time}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded ${
                    r.action === 'Blocked' ? 'bg-red-950 text-red-400' :
                    r.action === 'Safe' ? 'bg-emerald-950 text-emerald-400' :
                    'bg-amber-950 text-amber-300'
                  }`}>
                    {r.action}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
