import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Shield, 
  KeyRound, 
  Phone, 
  Palette, 
  Sliders, 
  Bell, 
  Lock, 
  CheckCircle2, 
  Save, 
  SlidersHorizontal,
  Home, 
  Plus, 
  FileText, 
  Download,
  Server,
  Radio,
  User,
  ExternalLink,
  ShieldCheck,
  Building,
  Smartphone,
  Mail,
  AlertTriangle,
  Users,
  Sparkles
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types/user';
import { lookupCarrierDetails } from '../utils/telecomLookup';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';
import { getUserSettings, saveUserSettings, UserSettings, DEFAULT_USER_SETTINGS } from '../utils/userSettings';

interface MobileSettingsViewProps {
  user: UserProfile;
  currentTheme: ThemeMode;
  protectionActive: boolean;
  onToggleProtection: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onOpenVerifyOtp?: (type: 'phone' | 'email') => void;
  onSaveSettings: () => void;
  onExportAuditLog: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
  activeMobileTab?: string;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
}

export const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({
  user,
  currentTheme,
  protectionActive,
  onToggleProtection,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onOpenVerifyOtp = () => {},
  onSaveSettings,
  onExportAuditLog,
  onNavigateTab,
  onOpenProfile,
  activeMobileTab = 'settings',
  hideHeader = false,
  hideBottomNav = false
}) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());
  const [attestationLevel, setAttestationLevel] = useState<string>(() => userSettings.attestationLevel);
  const [autoBlockThreshold, setAutoBlockThreshold] = useState<number>(() => userSettings.autoBlockThreshold);
  const [vocoderSensitivity, setVocoderSensitivity] = useState<string>(() => userSettings.vocoderSensitivity);
  const [nlpUrgencyFilter, setNlpUrgencyFilter] = useState<boolean>(() => userSettings.nlpUrgencyFilter);
  const [quarantineMfaDemands, setQuarantineMfaDemands] = useState<boolean>(() => userSettings.quarantineMfaDemands);
  const [familyAlerts, setFamilyAlerts] = useState<boolean>(() => userSettings.familyScamAlerts);
  const [cyberCrimeReport, setCyberCrimeReport] = useState<boolean>(() => userSettings.cyberCrimeHelplineReport);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Auto-detect network provider / SIM details from phone number
  const carrierInfo = lookupCarrierDetails(user.phoneNumber);

  const handleSave = () => {
    const updated: UserSettings = {
      ...userSettings,
      attestationLevel: attestationLevel as any,
      autoBlockThreshold,
      vocoderSensitivity: vocoderSensitivity as any,
      nlpUrgencyFilter,
      quarantineMfaDemands,
      familyScamAlerts: familyAlerts,
      cyberCrimeHelplineReport: cyberCrimeReport
    };
    saveUserSettings(updated);
    setUserSettings(updated);
    setIsSaved(true);
    onSaveSettings();
    setTimeout(() => setIsSaved(false), 2500);
  };

  const themes: { id: ThemeMode; label: string; dot: string }[] = [
    { id: 'light', label: 'Light Mode', dot: 'bg-amber-600' },
    { id: 'dark', label: 'Dark Mode (Inverted)', dot: 'bg-orange-400' }
  ];

  const isFullyVerified = user.isPhoneVerified && user.isEmailVerified;

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto pb-24 space-y-4 animate-fadeIn">
      
      {/* ============================================================ */}
      {/* 1. TOP MOBILE HEADER / SUB-HEADER                            */}
      {/* ============================================================ */}
      {!hideHeader ? (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 border-2 border-cyan-400 hover:bg-cyan-950/80 hover:border-cyan-300 px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.45)] cursor-pointer active:scale-95"
            title="Back to dashboard"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3] text-cyan-400" />
            <span className="tracking-wide">Back</span>
          </button>

          <h1 className="text-sm font-bold text-white tracking-tight font-sans">
            Protection & Settings
          </h1>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
          <h1 className="text-sm font-bold text-white tracking-tight font-sans">
            Protection & Settings
          </h1>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. VERIFIED CITIZEN ACCOUNT & SIM OPERATOR CARD              */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500/50 bg-slate-800 shrink-0">
              <img
                src={avatarImg}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white leading-tight">{user.name}</span>
                {isFullyVerified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Verified
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">Personal & Family Account (Free)</span>
            </div>
          </div>

          <button
            onClick={onOpenProfile}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold"
          >
            Profile
          </button>
        </div>

        {/* Mobile Number & SIM Provider Detection */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[9px] font-mono text-slate-400 block">Protected Mobile Number</span>
                <span className="font-mono text-slate-100 text-xs font-bold flex items-center gap-1.5">
                  <span>{carrierInfo.flag}</span>
                  <span>{user.phoneNumber}</span>
                </span>
              </div>
            </div>

            {user.isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                OTP Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onOpenVerifyOtp('phone')}
                className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-bold text-[10px] hover:bg-cyan-300 cursor-pointer"
              >
                Verify with OTP
              </button>
            )}
          </div>

          {/* Auto-Detected SIM Operator Details */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[9px]">SIM Provider:</span>
              <span className="text-emerald-400 font-bold">{carrierInfo.operator}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">Telecom Circle:</span>
              <span className="text-slate-200 truncate block">{carrierInfo.circle}</span>
            </div>
          </div>
        </div>

        {/* Email Address & Verification */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[9px] font-mono text-slate-400 block">Registered Email</span>
              <span className="font-mono text-slate-200 text-xs truncate max-w-[170px] block">{user.email}</span>
            </div>
          </div>

          {user.isEmailVerified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onOpenVerifyOtp('email')}
              className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-bold text-[10px] hover:bg-cyan-300 cursor-pointer"
            >
              Verify OTP
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SCAM DETECTION SENSITIVITY (SIMPLE WORDS)                  */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Scam Detection Sensitivity
            </h2>
            <span className="text-[10px] text-slate-400 block">Control how strictly scams and fake calls are blocked</span>
          </div>
        </div>

        {/* Auto-Block Sensitivity Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-200 text-[11px] font-medium">Auto-Block Dangerous Scams</span>
            <span className="font-mono font-bold text-red-400">Above {autoBlockThreshold}% Risk</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={autoBlockThreshold}
            onChange={(e) => setAutoBlockThreshold(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>50% (High Protection)</span>
            <span>85% (Balanced)</span>
            <span>95% (Only Definite Scams)</span>
          </div>
        </div>

        {/* Fake Caller ID / Spoofing Rule */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <label className="text-[10px] font-mono text-slate-300 block font-medium">
            Fake Caller ID & Spoofed Number Check
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            {[
              { id: 'level-a', label: 'Strict (Block Spoofed)' },
              { id: 'level-b', label: 'Normal' },
              { id: 'permissive', label: 'Allow All' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAttestationLevel(opt.id)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  attestationLevel === opt.id
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Cloned Voice Detection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-300 block font-medium">
            AI Cloned Voice Detection
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            {[
              { id: 'strict', label: 'Strict (90%+)' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'relaxed', label: 'Relaxed' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setVocoderSensitivity(opt.id)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  vocoderSensitivity === opt.id
                    ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simple Everyday Toggles */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-200 text-[11px] block font-medium">Panic & Fear Warning</span>
              <span className="text-[9px] text-slate-400 block">Alert when caller says "Police", "Digital Arrest", or "Account Blocked"</span>
            </div>
            <button
              type="button"
              onClick={() => setNlpUrgencyFilter(!nlpUrgencyFilter)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                nlpUrgencyFilter ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${nlpUrgencyFilter ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-200 text-[11px] block font-medium">Block OTP & Password Theft</span>
              <span className="text-[9px] text-slate-400 block">Instantly flag calls and messages demanding one-time passwords</span>
            </div>
            <button
              type="button"
              onClick={() => setQuarantineMfaDemands(!quarantineMfaDemands)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                quarantineMfaDemands ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${quarantineMfaDemands ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. FAMILY & EMERGENCY ALERTS (EASY WORDS)                     */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Users className="w-4 h-4 text-amber-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Family & Emergency Alerts
            </h2>
            <span className="text-[10px] text-slate-400 block">Share warnings with family when a scam is detected</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-200 text-[11px] block font-medium">Notify Family or Emergency Contact</span>
              <span className="text-[9px] text-slate-400 block">Sends a quick WhatsApp/SMS notice if an extortion call is intercepted</span>
            </div>
            <button
              type="button"
              onClick={() => setFamilyAlerts(!familyAlerts)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                familyAlerts ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${familyAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-200 text-[11px] block font-medium">Auto-Report to Cyber Crime Helpline (1930)</span>
              <span className="text-[9px] text-slate-400 block">Sends anonymous scam phone number to National Cyber Crime portal</span>
            </div>
            <button
              type="button"
              onClick={() => setCyberCrimeReport(!cyberCrimeReport)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                cyberCrimeReport ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cyberCrimeReport ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. THEME & DISPLAY PREFERENCES                               */}
      {/* ============================================================ */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Appearance Theme
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                currentTheme === t.id
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
              <span className="text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. CREDENTIALS & AUDIT LOG                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenChangePassword}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
        >
          <KeyRound className="w-4 h-4 text-cyan-400 mb-1" />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Password</span>
            <span className="text-[9px] text-slate-400 font-mono">Update master code</span>
          </div>
        </button>

        <button
          onClick={onOpenChangeNumber}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
        >
          <Phone className="w-4 h-4 text-blue-400 mb-1" />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Phone Line</span>
            <span className="text-[9px] text-cyan-300 font-mono">Verify SIM & Caller ID Protection</span>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onExportAuditLog}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-cyan-500/40 hover:bg-slate-900 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Scam History & Audit Log (PDF)</span>
      </button>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-[0.99]"
      >
        <Save className="w-4 h-4" />
        <span>{isSaved ? 'Settings Saved Successfully' : 'Save Protection Settings'}</span>
      </button>

      {/* ============================================================ */}
      {/* 7. FIXED BOTTOM NAVIGATION BAR (5 TABS)                      */}
      {/* ============================================================ */}
      {!hideBottomNav && (
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
      )}

    </div>
  );
};
