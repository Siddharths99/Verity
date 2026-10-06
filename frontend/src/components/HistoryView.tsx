import React, { useState } from 'react';
import { AnalysisRecord, ModalityType, RiskLevel, ActionType } from '../types';
import { exportIncidentReportToPdf } from '../utils/pdfExport';
import { 
  PhoneCall, 
  Mic, 
  MessageSquareText, 
  Film, 
  Image as ImageIcon,
  Link2, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Layers,
  Activity,
  SlidersHorizontal,
  ExternalLink,
  Lock,
  Download
} from 'lucide-react';

interface HistoryViewProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onExportAuditLog: () => void;
}

interface HistoryItem {
  id: string;
  time: string;
  type: string;
  typeCategory: 'call' | 'voice' | 'message' | 'image' | 'video' | 'url';
  subject: string;
  callerOrSender: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  details: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onSelectRecord,
  onExportAuditLog
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('All Risks');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Today');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Extended realistic dataset matching the brief
  const sampleHistoryData: HistoryItem[] = [
    {
      id: 'VRY-1042',
      time: '10:42 AM',
      type: 'Voice',
      typeCategory: 'voice',
      subject: 'Unknown Caller',
      callerOrSender: '+1 (555) 932-8411 (VoIP Gateway)',
      riskScore: 87,
      riskLevel: 'HIGH',
      status: 'Needs Verification',
      details: 'Neural vocoder formant jitter detected. Immediate financial transfer request.'
    },
    {
      id: 'VRY-1041',
      time: '09:18 AM',
      type: 'URL',
      typeCategory: 'url',
      subject: 'Bank Login',
      callerOrSender: 'auth-security-chase.corp-verify.net',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      status: 'Blocked',
      details: 'Credential harvesting kit with punycode domain spoofing.'
    },
    {
      id: 'VRY-1040',
      time: 'Yesterday',
      type: 'Message',
      typeCategory: 'message',
      subject: 'Unknown Sender',
      callerOrSender: '+1 (800) 492-1102 (SMS Gateway)',
      riskScore: 71,
      riskLevel: 'HIGH',
      status: 'Flagged',
      details: 'Urgent account suspension threat demanding ACH info update.'
    },
    {
      id: 'VRY-1039',
      time: 'Yesterday',
      type: 'Image',
      typeCategory: 'image',
      subject: 'Unknown Contact',
      callerOrSender: 'billing-receipt-scan.png',
      riskScore: 48,
      riskLevel: 'MEDIUM',
      status: 'Review',
      details: 'Altered invoice metadata and modified destination routing IBAN.'
    },
    {
      id: 'VRY-1038',
      time: 'Oct 03',
      type: 'Call',
      typeCategory: 'call',
      subject: '+91 XXXXX XXXXX',
      callerOrSender: '+91 98210 93821 (Airtel)',
      riskScore: 22,
      riskLevel: 'LOW',
      status: 'Trusted',
      details: 'STIR/SHAKEN Level A verified. Acoustic biometrics match registered voiceprint.'
    },
    {
      id: 'VRY-1037',
      time: 'Oct 03',
      type: 'Video',
      typeCategory: 'video',
      subject: 'Executive Briefing',
      callerOrSender: 'CFO_TownHall_Clip.mp4',
      riskScore: 93,
      riskLevel: 'CRITICAL',
      status: 'Blocked',
      details: 'Deepfake synthetic facial reenactment and voice cloning match.'
    },
    {
      id: 'VRY-1036',
      time: 'Oct 02',
      type: 'Call',
      typeCategory: 'call',
      subject: 'Tech Support Desk',
      callerOrSender: '+1 (888) 293-1002',
      riskScore: 82,
      riskLevel: 'HIGH',
      status: 'Needs Verification',
      details: 'Impersonating enterprise IT asking for remote desktop AnyDesk installation.'
    },
    {
      id: 'VRY-1035',
      time: 'Oct 01',
      type: 'Message',
      typeCategory: 'message',
      subject: 'Vendor Remittance Update',
      callerOrSender: 'accountspayable@acme-corp.net',
      riskScore: 18,
      riskLevel: 'LOW',
      status: 'Trusted',
      details: 'DKIM and SPF signed cryptographic sender verification passed.'
    }
  ];

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'call': return <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />;
      case 'voice': return <Mic className="w-3.5 h-3.5 text-blue-400" />;
      case 'message': return <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-amber-400" />;
      case 'video': return <Film className="w-3.5 h-3.5 text-purple-400" />;
      case 'url': return <Link2 className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRiskBadge = (risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-600/40 text-red-700 dark:text-red-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-orange-50 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-600/40 text-orange-700 dark:text-orange-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/40 text-amber-800 dark:text-amber-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Blocked
          </span>
        );
      case 'Needs Verification':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Needs Verification
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Flagged
          </span>
        );
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Review
          </span>
        );
      case 'Trusted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Trusted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {status}
          </span>
        );
    }
  };

  // Filter criteria
  const filteredItems = sampleHistoryData.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.callerOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypeFilter === 'All' ||
      (selectedTypeFilter === 'Calls' && item.typeCategory === 'call') ||
      (selectedTypeFilter === 'Voice' && item.typeCategory === 'voice') ||
      (selectedTypeFilter === 'Messages' && item.typeCategory === 'message') ||
      (selectedTypeFilter === 'Images' && item.typeCategory === 'image') ||
      (selectedTypeFilter === 'Videos' && item.typeCategory === 'video') ||
      (selectedTypeFilter === 'URLs' && item.typeCategory === 'url');

    const matchesRisk =
      selectedRiskFilter === 'All Risks' ||
      item.riskLevel === selectedRiskFilter.toUpperCase();

    return matchesSearch && matchesType && matchesRisk;
  });

  const handleRowClick = (item: HistoryItem) => {
    const mappedRecord: AnalysisRecord = {
      id: item.id,
      time: item.time,
      timestamp: Date.now(),
      type: (item.typeCategory === 'image' || item.typeCategory === 'video') ? 'media' : item.typeCategory as ModalityType,
      subject: item.subject,
      risk: item.riskLevel as RiskLevel,
      score: item.riskScore,
      action: (item.status === 'Blocked' ? 'Blocked' : item.status === 'Trusted' ? 'Safe' : 'Verify') as ActionType,
      identityDetails: {
        callerOrSender: item.callerOrSender,
        verifiedIdentity: item.riskScore < 40 ? 'Verified Contact' : null,
        identityTrustScore: 100 - item.riskScore,
        spoofingIndicators: item.riskScore > 50 ? ['Untrusted Carrier Route', 'Attestation Header Flagged'] : [],
        isKnownContact: item.riskScore < 40,
        stirShakenStatus: item.riskScore < 40 ? 'PASSED' : 'FAILED'
      },
      communicationDetails: {
        medium: `${item.type} Channel Stream`,
        syntheticProbability: item.riskScore > 60 ? item.riskScore : 12,
        linguisticUrgency: item.riskScore > 60 ? 'Extreme Pressure' : 'Normal',
        coercionTactics: item.riskScore > 60 ? ['Authority Impersonation', 'Urgent Deadline Demand'] : [],
        syntheticMarkers: item.riskScore > 60 ? ['Acoustic Discontinuity', 'Neural Vocoder Formants'] : []
      },
      requestedActionDetails: {
        actionType: item.subject === 'Bank Login' ? 'Disclose Banking Credentials' : 'Execute Sensitive Wire / Disclose OTP',
        sensitivityLevel: item.riskScore > 70 ? 'Critical' : 'Low',
        financialRiskUsd: item.riskScore > 70 ? 48500 : 0,
        destinationRisk: item.riskScore > 70 ? 'High-Risk Account' : 'Legitimate'
      },
      veritySummary: item.details
    };

    onSelectRecord(mappedRecord);
  };

  const handleDownloadItemPdf = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const mappedRecord: AnalysisRecord = {
      id: item.id,
      time: item.time,
      timestamp: Date.now(),
      type: (item.typeCategory === 'image' || item.typeCategory === 'video') ? 'media' : item.typeCategory as ModalityType,
      subject: item.subject,
      risk: item.riskLevel as RiskLevel,
      score: item.riskScore,
      action: (item.status === 'Blocked' ? 'Blocked' : item.status === 'Trusted' ? 'Safe' : 'Verify') as ActionType,
      identityDetails: {
        callerOrSender: item.callerOrSender,
        verifiedIdentity: item.riskScore < 40 ? 'Verified Contact' : null,
        identityTrustScore: 100 - item.riskScore,
        spoofingIndicators: item.riskScore > 50 ? ['Untrusted Carrier Route', 'Attestation Header Flagged'] : [],
        isKnownContact: item.riskScore < 40,
        stirShakenStatus: item.riskScore < 40 ? 'PASSED' : 'FAILED'
      },
      communicationDetails: {
        medium: `${item.type} Channel Stream`,
        syntheticProbability: item.riskScore > 60 ? item.riskScore : 12,
        linguisticUrgency: item.riskScore > 60 ? 'Extreme Pressure' : 'Normal',
        coercionTactics: item.riskScore > 60 ? ['Authority Impersonation', 'Urgent Deadline Demand'] : [],
        syntheticMarkers: item.riskScore > 60 ? ['Acoustic Discontinuity', 'Neural Vocoder Formants'] : []
      },
      requestedActionDetails: {
        actionType: item.subject === 'Bank Login' ? 'Disclose Banking Credentials' : 'Execute Sensitive Wire / Disclose OTP',
        sensitivityLevel: item.riskScore > 70 ? 'Critical' : 'Low',
        financialRiskUsd: item.riskScore > 70 ? 48500 : 0,
        destinationRisk: item.riskScore > 70 ? 'High-Risk Account' : 'Legitimate'
      },
      veritySummary: item.details
    };
    exportIncidentReportToPdf(mappedRecord, item.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-7 animate-fadeIn py-2">
      
      {/* ============================================================ */}
      {/* 1. PAGE HEADER                                               */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Analysis History</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase">
              128 Records
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Review previous interactions analyzed by VERITY.
          </p>
        </div>

        {/* Export PDF Action */}
        <button
          type="button"
          onClick={onExportAuditLog}
          className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Export Audit Report (PDF)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP SUMMARY (4 COMPACT CARDS)                             */}
      {/* Total Analyses: 128, High Risk: 24, Critical: 8, Protected: 96 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Analyses */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Total Analyses
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              128
            </div>
            <span className="text-[11px] text-slate-500 block font-mono">
              Across all 5 channels
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: High Risk */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              High Risk
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-orange-400 tracking-tight">
              24
            </div>
            <span className="text-[11px] text-orange-400/80 block font-mono">
              Flagged & Verified
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Critical */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Critical
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-red-400 tracking-tight">
              8
            </div>
            <span className="text-[11px] text-red-400/80 block font-mono">
              Immediate Intercepts
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Protected */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Protected
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              96
            </div>
            <span className="text-[11px] text-emerald-400/80 block font-mono">
              Zero-Trust Cleared
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. FILTER / SEARCH AREA                                      */}
      {/* Clean toolbar with Search, Channel Filters, Risk & Date      */}
      {/* ============================================================ */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caller, message, URL or incident..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">Timeframe:</span>
            {['Today', '7 Days', '30 Days'].map((dateOpt) => (
              <button
                key={dateOpt}
                type="button"
                onClick={() => setSelectedDateFilter(dateOpt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedDateFilter === dateOpt
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dateOpt}
              </button>
            ))}
          </div>

        </div>

        {/* Channel / Modality Tabs + Risk Filter Dropdown */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Channel Filters: All, Calls, Voice, Messages, Images, Videos, URLs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Calls', 'Voice', 'Messages', 'Images', 'Videos', 'URLs'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTypeFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer font-medium ${
                  selectedTypeFilter === tab
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Risk Level Filter Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-mono text-slate-500">Risk:</span>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="px-3 py-1 text-xs rounded-md bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="All Risks">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. PROFESSIONAL ANALYSIS TABLE                               */}
      {/* TIME | TYPE | SUBJECT | RISK SCORE | RISK LEVEL | STATUS | ACTION */}
      {/* ============================================================ */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            {/* Table Header */}
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th scope="col" className="py-3.5 px-4 w-28">TIME</th>
                <th scope="col" className="py-3.5 px-4 w-28">TYPE</th>
                <th scope="col" className="py-3.5 px-4">SUBJECT</th>
                <th scope="col" className="py-3.5 px-4 w-28 text-right">RISK SCORE</th>
                <th scope="col" className="py-3.5 px-4 w-32">RISK LEVEL</th>
                <th scope="col" className="py-3.5 px-4 w-36">STATUS</th>
                <th scope="col" className="py-3.5 px-4 w-28 text-right">ACTION</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm">No analysis history interactions found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* 1. TIME */}
                    <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap text-xs">
                      {item.time}
                    </td>

                    {/* 2. TYPE */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-200 font-mono text-[11px]">
                        {getTypeIcon(item.typeCategory)}
                        <span>{item.type}</span>
                      </div>
                    </td>

                    {/* 3. SUBJECT */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-xs">
                          {item.subject}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <span className="text-cyan-400 truncate max-w-xs">{item.callerOrSender}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 font-sans line-clamp-1">{item.details}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. RISK SCORE */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                      <span className={
                        item.riskScore >= 80 ? 'text-red-400' :
                        item.riskScore >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {item.riskScore}
                      </span>
                      <span className="text-slate-500 text-xs"> / 100</span>
                    </td>

                    {/* 5. RISK LEVEL */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getRiskBadge(item.riskLevel)}
                    </td>

                    {/* 6. STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* 7. ACTION */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleDownloadItemPdf(item, e)}
                          title="Download forensic PDF dossier for this individual event"
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item);
                          }}
                          className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 group-hover:border-cyan-400/50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* ============================================================ */}
        {/* 5. PAGINATION & FOOTER                                       */}
        {/* ← Previous | 1 2 3 4 | Next →                                */}
        {/* ============================================================ */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          
          <div>
            <span>Showing 1 to {filteredItems.length} of 128 interactions</span>
          </div>

          <div className="flex items-center gap-1.5">
            
            {/* Previous */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                currentPage === 1
                  ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page numbers */}
            {[1, 2, 3, 4].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
              disabled={currentPage === 4}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                currentPage === 4
                  ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
