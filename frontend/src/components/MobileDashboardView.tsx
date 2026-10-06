import React from 'react';
import { 
  Shield, 
  Plus, 
  PhoneCall, 
  Mic, 
  MessageSquareText, 
  Film, 
  Link2, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  Activity, 
  Radio, 
  Layers, 
  Zap, 
  Lock, 
  AlertTriangle,
  Clock,
  Home,
  FileText,
  Bell,
  User,
  ExternalLink,
  Phone,
  CheckCircle2,
  Sliders,
  SlidersHorizontal
} from 'lucide-react';
import { AnalysisRecord, ModalityType } from '../types';
import { UserProfile } from '../types/user';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';

interface MobileDashboardViewProps {
  user: UserProfile;
  protectionActive: boolean;
  onToggleProtection: () => void;
  onOpenNewAnalysis: (modality?: ModalityType) => void;
  onSelectRecord: (record: AnalysisRecord) => void;
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
  records?: AnalysisRecord[];
  activeMobileTab?: string;
  onMobileTabChange?: (tab: string) => void;
}

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({
  user,
  protectionActive,
  onToggleProtection,
  onOpenNewAnalysis,
  onSelectRecord,
  onNavigateTab,
  onOpenProfile,
  records,
  activeMobileTab = 'home',
  onMobileTabChange = () => {}
}) => {
  // 5 Quick Analysis touch-friendly buttons
  const quickAnalysisOptions = [
    { id: 'call' as ModalityType, label: 'Call', icon: PhoneCall, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-500/30' },
    { id: 'voice' as ModalityType, label: 'Voice', icon: Mic, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/30' },
    { id: 'message' as ModalityType, label: 'Message', icon: MessageSquareText, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-500/30' },
    { id: 'media' as ModalityType, label: 'Media', icon: Film, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-500/30' },
    { id: 'url' as ModalityType, label: 'URL', icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/30' }
  ];

  // 4 Compact Mobile Trust Overview Cards
  const trustMetrics = [
    { label: 'Identity Trust', score: '82%', status: 'Nominal', color: 'text-cyan-400', barColor: 'bg-cyan-400' },
    { label: 'Communication Risk', score: '18%', status: 'Low Risk', color: 'text-emerald-400', barColor: 'bg-emerald-400' },
    { label: 'Media Authenticity', score: '94%', status: 'Verified', color: 'text-blue-400', barColor: 'bg-blue-400' },
    { label: 'Requested Action', score: '24%', status: 'Low Risk', color: 'text-indigo-400', barColor: 'bg-indigo-400' }
  ];

  // Recent Mobile Analysis Items
  const recentItems = [
    {
      id: 'mb-1',
      risk: 'HIGH',
      subject: 'Unknown Caller',
      score: 87,
      time: '10:42 AM',
      type: 'voice' as ModalityType,
      typeIcon: Mic,
      caller: '+1 (555) 932-8411',
      summary: 'Possible AI synthetic voice requesting urgent wire & OTP.'
    },
    {
      id: 'mb-2',
      risk: 'CRITICAL',
      subject: 'Bank Login URL',
      score: 96,
      time: '09:18 AM',
      type: 'url' as ModalityType,
      typeIcon: Link2,
      caller: 'auth-security-chase.corp-verify.net',
      summary: 'Phishing domain attempting credential harvesting.'
    },
    {
      id: 'mb-3',
      risk: 'MEDIUM',
      subject: 'Unknown Image',
      score: 48,
      time: 'Yesterday',
      type: 'media' as ModalityType,
      typeIcon: Film,
      caller: 'billing-receipt-scan.png',
      summary: 'Manipulated document metadata and routing numbers.'
    }
  ];

  const handleItemTap = (item: typeof recentItems[0]) => {
    const record: AnalysisRecord = {
      id: item.id,
      time: item.time,
      timestamp: Date.now(),
      type: item.type,
      subject: item.subject,
      risk: item.risk as any,
      score: item.score,
      action: item.risk === 'CRITICAL' ? 'Blocked' : item.risk === 'HIGH' ? 'Verify' : 'Review',
      identityDetails: {
        callerOrSender: item.caller,
        verifiedIdentity: null,
        identityTrustScore: 100 - item.score,
        spoofingIndicators: ['Untrusted Origin Header'],
        isKnownContact: false
      },
      communicationDetails: {
        medium: `${item.type.toUpperCase()} Channel`,
        syntheticProbability: item.score > 60 ? item.score : 10,
        linguisticUrgency: item.score > 70 ? 'Extreme Pressure' : 'Normal',
        coercionTactics: item.score > 70 ? ['Urgent Deadline'] : []
      },
      requestedActionDetails: {
        actionType: item.subject === 'Bank Login URL' ? 'Disclose Credentials' : 'Wire Transfer & OTP',
        sensitivityLevel: item.score > 70 ? 'Critical' : 'Moderate',
        destinationRisk: 'High-Risk Account'
      },
      veritySummary: item.summary
    };
    onSelectRecord(record);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-28 sm:pb-32 space-y-3.5 animate-fadeIn">
      
      {/* ============================================================ */}
      {/* 1. TOP MOBILE HEADER                                         */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
        {/* VERITY Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-sans">
            VERITY
          </span>
        </div>

        {/* Right side: Interactive Protection Toggle + Settings + Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Protection Active / Pause Button */}
          <button
            onClick={onToggleProtection}
            title={protectionActive ? "Tap to Pause Protection" : "Tap to Enable Protection"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border transition-all cursor-pointer select-none active:scale-95 ${
              protectionActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${protectionActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{protectionActive ? 'Active' : 'Paused'}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
              protectionActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
            }`}>
              {protectionActive ? 'Pause' : 'Enable'}
            </span>
          </button>

          {/* Quick Settings Shortcut */}
          <button
            onClick={() => onNavigateTab('settings')}
            title="System Settings"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Perfectly Aligned Profile Avatar Photo */}
          <button
            onClick={onOpenProfile}
            title="User Profile"
            className="w-7 h-7 rounded-full overflow-hidden border border-cyan-500/40 bg-slate-800 flex items-center justify-center shadow-sm cursor-pointer relative shrink-0"
          >
            <img
              src={avatarImg}
              alt={user.name}
              className="w-full h-full object-cover object-center"
            />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ZERO-TRUST SHIELD & NEW ANALYSIS CTA                     */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-md space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            <Radio className="w-2.5 h-2.5 text-cyan-400" />
            <span>Zero-Trust Shield</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-snug">
            Is this interaction trustworthy?
          </h1>
          <p className="text-[11px] text-slate-400 font-normal leading-normal">
            Analyze suspicious calls, messages, media and links in real-time.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => onOpenNewAnalysis('call')}
          className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5 cursor-pointer font-sans active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3] text-slate-950" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK ANALYSIS (5 CHANNELS)                              */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Quick Analysis
          </h2>
          <span className="text-[9px] font-mono text-slate-500">Tap to inspect</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {quickAnalysisOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onOpenNewAnalysis(opt.id)}
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${opt.bg} hover:border-cyan-400/60`}
              >
                <div className="p-1 rounded-md bg-slate-950/60">
                  <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                </div>
                <span className="text-[10px] font-medium text-slate-200 font-sans">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LIVE IN-CALL INTERCEPT BANNER (DIRECT CALL PROTECTION)   */}
      {/* ============================================================ */}
      <div 
        onClick={() => onNavigateTab('call-protection')}
        className="p-3 rounded-xl bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-900 border border-red-500/40 flex items-center justify-between gap-3 shadow-md cursor-pointer hover:border-red-400 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-950 border border-red-500/50 text-red-400 animate-pulse">
            <Phone className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500 text-slate-950">
                LIVE INTERCEPT
              </span>
              <span className="text-[11px] font-bold text-white">
                In-Call Protection
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              24.0 kHz Spectral Vocoder Active · 94/100 Risk
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-red-400" />
      </div>

      {/* ============================================================ */}
      {/* 5. TRUST OVERVIEW (4 CORE DIMENSIONS)                        */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Trust Overview
          </h2>
          <span className="text-[9px] font-mono text-cyan-400">Score 89/100</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {trustMetrics.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-1.5 shadow-sm"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 block leading-tight">
                  {m.label}
                </span>
                <span className="text-sm font-bold font-mono text-white block">
                  {m.score}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full rounded-full ${m.barColor}`} style={{ width: m.score }} />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-semibold ${m.color}`}>{m.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. RECENT ANALYSIS (TOUCH LIST)                              */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Recent Analysis
          </h2>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer flex items-center gap-0.5"
          >
            <span>View All (128)</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {records && records.length > 0 ? (
            records.slice(0, 5).map((rec) => {
              const Icon = rec.type === 'call' ? PhoneCall : rec.type === 'voice' ? Mic : rec.type === 'message' ? MessageSquareText : rec.type === 'media' ? Film : Link2;
              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:bg-slate-800/80 transition-all flex items-center justify-between gap-2.5 shadow-sm cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${
                      rec.risk === 'CRITICAL' ? 'bg-red-950/60 border-red-500/40 text-red-400' :
                      rec.risk === 'HIGH' ? 'bg-orange-950/60 border-orange-500/40 text-orange-400' :
                      'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                          rec.risk === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800' :
                          rec.risk === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                          'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {rec.risk}
                        </span>
                        <span className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {rec.subject}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                        <span className="text-slate-500">{rec.time}</span>
                        <span>·</span>
                        <span className="text-slate-400 truncate max-w-[130px]">{rec.identityDetails.callerOrSender}</span>
                        <span>·</span>
                        <span className={rec.action === 'Verified' ? 'text-emerald-400 font-semibold' : rec.action === 'Rejected' ? 'text-red-400 font-semibold' : 'text-slate-500'}>
                          {rec.action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="text-right font-mono">
                      <span className={`text-[11px] font-bold ${
                        rec.score >= 80 ? 'text-red-400' : rec.score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {rec.score}
                      </span>
                      <span className="text-[9px] text-slate-500">/100</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            recentItems.map((item) => {
              const Icon = item.typeIcon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemTap(item)}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:bg-slate-800/80 transition-all flex items-center justify-between gap-2.5 shadow-sm cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${
                      item.risk === 'CRITICAL' ? 'bg-red-950/60 border-red-500/40 text-red-400' :
                      item.risk === 'HIGH' ? 'bg-orange-950/60 border-orange-500/40 text-orange-400' :
                      'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${
                          item.risk === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800' :
                          item.risk === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                          'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {item.risk}
                        </span>
                        <span className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {item.subject}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                        <span className="text-slate-500">{item.time}</span>
                        <span>·</span>
                        <span className="text-slate-400 truncate max-w-[130px]">{item.caller}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="text-right font-mono">
                      <span className={`text-[11px] font-bold ${
                        item.score >= 80 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {item.score}
                      </span>
                      <span className="text-[9px] text-slate-500">/100</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. CARRIER ATTESTATION FOOTER STATUS PILL                    */}
      {/* ============================================================ */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>STIR/SHAKEN Level A Certified</span>
        </div>
        <span className="text-cyan-400">Line: {user.phoneNumber}</span>
      </div>

      {/* ============================================================ */}
      {/* 8. FIXED BOTTOM NAVIGATION (5 TABS)                          */}
      {/* ============================================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* 1. Home */}
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

          {/* 2. Analyze */}
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

          {/* 3. History */}
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

          {/* 4. Alerts (Incidents) */}
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

          {/* 5. Settings */}
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
