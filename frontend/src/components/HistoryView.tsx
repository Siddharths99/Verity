import React, { useState, useMemo } from 'react';
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
  Download,
  RotateCcw
} from 'lucide-react';

interface HistoryViewProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onExportAuditLog: () => void;
}

interface HistoryItem {
  id: string;
  time: string;
  timestamp: number;
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
  const pageSize = 8;

  // Relative reference times
  const now = Date.now();
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const sevenDaysAgo = useMemo(() => now - 7 * 24 * 60 * 60 * 1000, [now]);
  const thirtyDaysAgo = useMemo(() => now - 30 * 24 * 60 * 60 * 1000, [now]);

  // Calibrated sample history dataset with precise timestamps
  const sampleHistoryData: HistoryItem[] = useMemo(() => [
    // --- TODAY'S RECORDS ---
    {
      id: 'VRY-1042',
      time: '10:42 AM',
      timestamp: now - 1.5 * 3600 * 1000, // Today, ~1.5h ago
      type: 'Voice',
      typeCategory: 'voice',
      subject: 'Unknown Caller — Bank Pretext',
      callerOrSender: '+1 (555) 932-8411 (VoIP Gateway)',
      riskScore: 87,
      riskLevel: 'HIGH',
      status: 'Needs Verification',
      details: 'Neural vocoder formant jitter detected. Immediate financial transfer request.'
    },
    {
      id: 'VRY-1041',
      time: '09:18 AM',
      timestamp: now - 3 * 3600 * 1000, // Today, ~3h ago
      type: 'URL',
      typeCategory: 'url',
      subject: 'Bank Login Spoofing',
      callerOrSender: 'auth-security-chase.corp-verify.net',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      status: 'Blocked',
      details: 'Credential harvesting kit with punycode domain spoofing.'
    },
    {
      id: 'VRY-1043',
      time: '08:05 AM',
      timestamp: now - 4.5 * 3600 * 1000, // Today, ~4.5h ago
      type: 'Call',
      typeCategory: 'call',
      subject: 'Corporate Desk Line',
      callerOrSender: '+91 98210 93821 (Airtel)',
      riskScore: 16,
      riskLevel: 'LOW',
      status: 'Trusted',
      details: 'STIR/SHAKEN Level A verified. Line connection signed by trusted telecom gateway.'
    },

    // --- 7 DAYS (YESTERDAY & RECENT DAYS) ---
    {
      id: 'VRY-1040',
      time: 'Yesterday, 04:15 PM',
      timestamp: now - 26 * 3600 * 1000, // ~26h ago (Yesterday)
      type: 'Message',
      typeCategory: 'message',
      subject: 'Account Suspension Notice',
      callerOrSender: '+1 (800) 492-1102 (SMS Gateway)',
      riskScore: 71,
      riskLevel: 'HIGH',
      status: 'Flagged',
      details: 'Urgent account suspension threat demanding ACH info update.'
    },
    {
      id: 'VRY-1039',
      time: 'Yesterday, 11:20 AM',
      timestamp: now - 30 * 3600 * 1000, // ~30h ago (Yesterday)
      type: 'Image',
      typeCategory: 'image',
      subject: 'Billing Invoice Inspection',
      callerOrSender: 'billing-receipt-scan.png',
      riskScore: 48,
      riskLevel: 'MEDIUM',
      status: 'Review',
      details: 'Altered invoice metadata and modified destination routing IBAN.'
    },
    {
      id: 'VRY-1038',
      time: '3 days ago',
      timestamp: now - 3 * 24 * 3600 * 1000, // 3 days ago
      type: 'Call',
      typeCategory: 'call',
      subject: 'Utility Provider Helpline',
      callerOrSender: '+91 80012 34567 (BSNL)',
      riskScore: 22,
      riskLevel: 'LOW',
      status: 'Trusted',
      details: 'Acoustic biometrics match registered voiceprint. Zero vocal jitter.'
    },
    {
      id: 'VRY-1037',
      time: '4 days ago',
      timestamp: now - 4 * 24 * 3600 * 1000, // 4 days ago
      type: 'Video',
      typeCategory: 'video',
      subject: 'Executive Townhall Clip',
      callerOrSender: 'CFO_TownHall_Clip.mp4',
      riskScore: 93,
      riskLevel: 'CRITICAL',
      status: 'Blocked',
      details: 'Deepfake synthetic facial reenactment and voice cloning match.'
    },

    // --- 30 DAYS RECORDS ---
    {
      id: 'VRY-1036',
      time: '12 days ago',
      timestamp: now - 12 * 24 * 3600 * 1000, // 12 days ago
      type: 'Call',
      typeCategory: 'call',
      subject: 'Remote Desktop Support Desk',
      callerOrSender: '+1 (888) 293-1002',
      riskScore: 82,
      riskLevel: 'HIGH',
      status: 'Needs Verification',
      details: 'Impersonating enterprise IT asking for remote desktop AnyDesk installation.'
    },
    {
      id: 'VRY-1035',
      time: '18 days ago',
      timestamp: now - 18 * 24 * 3600 * 1000, // 18 days ago
      type: 'Message',
      typeCategory: 'message',
      subject: 'Vendor Remittance Update',
      callerOrSender: 'accountspayable@acme-corp.net',
      riskScore: 18,
      riskLevel: 'LOW',
      status: 'Trusted',
      details: 'DKIM and SPF signed cryptographic sender verification passed.'
    },
    {
      id: 'VRY-1034',
      time: '24 days ago',
      timestamp: now - 24 * 24 * 3600 * 1000, // 24 days ago
      type: 'URL',
      typeCategory: 'url',
      subject: 'Customer Survey Form',
      callerOrSender: 'feedback-rewards-card.com',
      riskScore: 56,
      riskLevel: 'MEDIUM',
      status: 'Review',
      details: 'Domain registered 48 hours ago. Requests personal identity attributes.'
    },

    // --- ALL TIME (OLDER ARCHIVAL) ---
    {
      id: 'VRY-1033',
      time: '42 days ago',
      timestamp: now - 42 * 24 * 3600 * 1000, // 42 days ago
      type: 'Voice',
      typeCategory: 'voice',
      subject: 'Emergency Wire Request',
      callerOrSender: '+1 (702) 843-9912',
      riskScore: 94,
      riskLevel: 'CRITICAL',
      status: 'Blocked',
      details: 'High-frequency voice cloning attempting CEO authorization override.'
    },
    {
      id: 'VRY-1032',
      time: '55 days ago',
      timestamp: now - 55 * 24 * 3600 * 1000, // 55 days ago
      type: 'Message',
      typeCategory: 'message',
      subject: 'Tax Refund Expedite Link',
      callerOrSender: '+1 (800) 992-1200',
      riskScore: 85,
      riskLevel: 'HIGH',
      status: 'Blocked',
      details: 'Fraudulent refund claim with malicious APK payload attachment link.'
    }
  ], [now]);

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

  // Dynamic user items mapped from records
  const userHistoryItems: HistoryItem[] = useMemo(() => {
    return records.map((r) => {
      let typeCat: HistoryItem['typeCategory'] = 'call';
      if (r.type === 'voice') typeCat = 'voice';
      else if (r.type === 'message') typeCat = 'message';
      else if (r.type === 'media') {
        typeCat = r.subject.toLowerCase().includes('video') ? 'video' : 'image';
      } else if (r.type === 'url') typeCat = 'url';

      let displayStatus = r.action as string;
      if (r.action === 'Verify') displayStatus = 'Needs Verification';
      else if (r.action === 'Safe' || r.action === 'Verified') displayStatus = 'Trusted';
      else if (r.action === 'Rejected' || r.action === 'Blocked') displayStatus = 'Blocked';

      return {
        id: r.id,
        time: r.time,
        timestamp: r.timestamp || Date.now(),
        type: r.type.charAt(0).toUpperCase() + r.type.slice(1),
        typeCategory: typeCat,
        subject: r.subject,
        callerOrSender: r.identityDetails.callerOrSender,
        riskScore: r.score,
        riskLevel: r.risk,
        status: displayStatus,
        details: r.veritySummary
      };
    });
  }, [records]);

  // Combine user records and sample data avoiding duplicate IDs
  const combinedHistoryData: HistoryItem[] = useMemo(() => {
    const existingIds = new Set(userHistoryItems.map((u) => u.id));
    const uniqueSamples = sampleHistoryData.filter((s) => !existingIds.has(s.id));
    return [...userHistoryItems, ...uniqueSamples];
  }, [userHistoryItems, sampleHistoryData]);

  // Timeframe filter evaluation helper
  const isItemInTimeframe = (item: HistoryItem, filter: string): boolean => {
    if (filter === 'Today') {
      return item.timestamp >= startOfToday;
    }
    if (filter === '7 Days') {
      return item.timestamp >= sevenDaysAgo;
    }
    if (filter === '30 Days') {
      return item.timestamp >= thirtyDaysAgo;
    }
    return true; // 'All Time'
  };

  // Dynamic stats calculated for the selected timeframe
  const timeframeItems = useMemo(() => {
    return combinedHistoryData.filter((item) => isItemInTimeframe(item, selectedDateFilter));
  }, [combinedHistoryData, selectedDateFilter, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  const summaryMetrics = useMemo(() => {
    const total = timeframeItems.length;
    const highRisk = timeframeItems.filter((i) => i.riskLevel === 'HIGH').length;
    const critical = timeframeItems.filter((i) => i.riskLevel === 'CRITICAL').length;
    const protectedCount = timeframeItems.filter((i) => i.riskLevel === 'LOW' || i.status === 'Trusted').length;
    return { total, highRisk, critical, protectedCount };
  }, [timeframeItems]);

  // Full filter criteria (Timeframe + Search + Channel + Risk)
  const filteredItems = useMemo(() => {
    return combinedHistoryData.filter((item) => {
      // 1. Timeframe filter (Dedicated timeframe respective contents)
      const matchesDate = isItemInTimeframe(item, selectedDateFilter);
      if (!matchesDate) return false;

      // 2. Search query
      const matchesSearch =
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.callerOrSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 3. Channel Type
      const matchesType =
        selectedTypeFilter === 'All' ||
        (selectedTypeFilter === 'Calls' && item.typeCategory === 'call') ||
        (selectedTypeFilter === 'Voice' && item.typeCategory === 'voice') ||
        (selectedTypeFilter === 'Messages' && item.typeCategory === 'message') ||
        (selectedTypeFilter === 'Images' && item.typeCategory === 'image') ||
        (selectedTypeFilter === 'Videos' && item.typeCategory === 'video') ||
        (selectedTypeFilter === 'URLs' && item.typeCategory === 'url');
      if (!matchesType) return false;

      // 4. Risk Level
      const matchesRisk =
        selectedRiskFilter === 'All Risks' ||
        item.riskLevel === selectedRiskFilter.toUpperCase();
      if (!matchesRisk) return false;

      return true;
    });
  }, [combinedHistoryData, selectedDateFilter, searchQuery, selectedTypeFilter, selectedRiskFilter, startOfToday, sevenDaysAgo, thirtyDaysAgo]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleRowClick = (item: HistoryItem) => {
    const foundRecord = records.find((r) => r.id === item.id);
    if (foundRecord) {
      onSelectRecord(foundRecord);
      return;
    }
    const mappedRecord: AnalysisRecord = {
      id: item.id,
      time: item.time,
      timestamp: item.timestamp,
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
        actionType: item.subject.toLowerCase().includes('login') ? 'Disclose Banking Credentials' : 'Execute Sensitive Wire / Disclose OTP',
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
    const foundRecord = records.find((r) => r.id === item.id);
    if (foundRecord) {
      exportIncidentReportToPdf(foundRecord, item.id);
      return;
    }
    const mappedRecord: AnalysisRecord = {
      id: item.id,
      time: item.time,
      timestamp: item.timestamp,
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
        actionType: item.subject.toLowerCase().includes('login') ? 'Disclose Banking Credentials' : 'Execute Sensitive Wire / Disclose OTP',
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
              {filteredItems.length} {filteredItems.length === 1 ? 'Record' : 'Records'} ({selectedDateFilter})
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Review previous interactions analyzed by VERITY across chronological timeframes.
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
      {/* 2. TOP SUMMARY (4 DYNAMIC METRIC CARDS)                      */}
      {/* Dynamic based on active selected timeframe                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Analyses in Timeframe */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Total Analyses
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {summaryMetrics.total}
            </div>
            <span className="text-[11px] text-cyan-400 block font-mono">
              In {selectedDateFilter}
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
              {summaryMetrics.highRisk}
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
              {summaryMetrics.critical}
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
              {summaryMetrics.protectedCount}
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
      {/* Dedicated Timeframe + Search + Modality + Risk               */}
      {/* ============================================================ */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search caller, message, URL or incident..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans transition-colors"
            />
          </div>

          {/* Timeframe Filter Buttons: Today, 7 Days, 30 Days, All Time */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">Timeframe:</span>
            {['Today', '7 Days', '30 Days', 'All Time'].map((dateOpt) => (
              <button
                key={dateOpt}
                type="button"
                onClick={() => {
                  setSelectedDateFilter(dateOpt);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedDateFilter === dateOpt
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
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
                onClick={() => {
                  setSelectedTypeFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer font-medium ${
                  selectedTypeFilter === tab
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
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
              onChange={(e) => {
                setSelectedRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
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
                <th scope="col" className="py-3.5 px-4 w-32">TIME</th>
                <th scope="col" className="py-3.5 px-4 w-28">TYPE</th>
                <th scope="col" className="py-3.5 px-4">SUBJECT & THREAT SUMMARY</th>
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
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <Clock className="w-8 h-8 text-cyan-400/50 mx-auto" />
                      <p className="text-sm font-semibold text-slate-200">
                        No interactions found for timeframe: <span className="text-cyan-400 font-mono">"{selectedDateFilter}"</span>
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        There are no recorded interactions in this specific timeframe matching your filters. Switch timeframe to explore historical interaction ledger.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDateFilter('All Time');
                            setSearchQuery('');
                            setSelectedTypeFilter('All');
                            setSelectedRiskFilter('All Risks');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all cursor-pointer shadow-md"
                        >
                          Show All Time Records
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* 1. TIME */}
                    <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap text-xs">
                      <div>
                        <span>{item.time}</span>
                        <span className="text-[10px] text-slate-600 block">{item.id}</span>
                      </div>
                    </td>

                    {/* 2. TYPE */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-200 font-mono text-[11px]">
                        {getTypeIcon(item.typeCategory)}
                        <span>{item.type}</span>
                      </div>
                    </td>

                    {/* 3. SUBJECT & DETAILS */}
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
                          title="Download forensic PDF dossier for this event"
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
        {/* Real dynamic slicing and page buttons                        */}
        {/* ============================================================ */}
        {filteredItems.length > 0 && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            
            <div>
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredItems.length)} to {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} interactions ({selectedDateFilter})
              </span>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  currentPage === totalPages
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
