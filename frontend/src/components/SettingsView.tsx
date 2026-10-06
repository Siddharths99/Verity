import React, { useState, useEffect } from 'react';
import { UserProfile, ThemeMode } from '../types/user';
import { 
  Shield, 
  KeyRound, 
  Phone, 
  Palette, 
  Radio, 
  Cpu, 
  Sliders, 
  Bell, 
  Lock, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Server,
  Globe,
  SlidersHorizontal,
  Smartphone,
  Mail,
  Users,
  Flag,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Trash2,
  Plus,
  Download,
  Send,
  Check
} from 'lucide-react';
import { lookupCarrierDetails } from '../utils/telecomLookup';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';
import { 
  getUserSettings, 
  saveUserSettings, 
  UserSettings, 
  DEFAULT_USER_SETTINGS,
  addBlacklistedNumber,
  removeBlacklistedNumber
} from '../utils/userSettings';

interface SettingsViewProps {
  user: UserProfile;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onOpenVerifyOtp?: (type: 'phone' | 'email') => void;
  onSaveSettings: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  currentTheme,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onOpenVerifyOtp = () => {},
  onSaveSettings
}) => {
  // Load persistent user settings from localStorage
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testAlertNotice, setTestAlertNotice] = useState<string | null>(null);
  const [familyPingNotice, setFamilyPingNotice] = useState<string | null>(null);
  const [newBlacklistInput, setNewBlacklistInput] = useState<string>('');

  // Auto-detect network provider / SIM details based on the user's phone number
  const carrierInfo = lookupCarrierDetails(user.phoneNumber);
  const isFullyVerified = user.isPhoneVerified && user.isEmailVerified;

  const handleUpdate = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveUserSettings(next);
      return next;
    });
  };

  const handleSave = () => {
    saveUserSettings(settings);
    setIsSaved(true);
    onSaveSettings();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_USER_SETTINGS);
    saveUserSettings(DEFAULT_USER_SETTINGS);
    setIsSaved(true);
    setTestAlertNotice('All security defense thresholds reset to recommended defaults.');
    setTimeout(() => {
      setIsSaved(false);
      setTestAlertNotice(null);
    }, 3500);
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistInput.trim()) return;
    const updated = addBlacklistedNumber(newBlacklistInput.trim());
    setSettings(updated);
    setNewBlacklistInput('');
  };

  const handleRemoveBlacklist = (item: string) => {
    const updated = removeBlacklistedNumber(item);
    setSettings(updated);
  };

  const handleTestScamAlarm = () => {
    setTestAlertNotice('🚨 [VERITY SIREN SIMULATED] Immediate High-Urgency Voice Impersonation Warning Dispatched!');
    setTimeout(() => setTestAlertNotice(null), 4000);
  };

  const handleTestFamilyPing = () => {
    if (!settings.familyPhone.trim()) {
      setFamilyPingNotice('Please enter a valid family emergency phone number first.');
      setTimeout(() => setFamilyPingNotice(null), 3000);
      return;
    }
    setFamilyPingNotice(`✅ Verification ping dispatched to ${settings.familyPhone} via secure carrier gateway.`);
    setTimeout(() => setFamilyPingNotice(null), 4000);
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verity-security-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const themes: { id: ThemeMode; label: string; dot: string; description: string }[] = [
    { id: 'light', label: 'Light Mode', dot: 'bg-amber-600', description: 'Warm paper canvas, terracotta accent, and high contrast' },
    { id: 'dark', label: 'Dark Mode (Inverted)', dot: 'bg-orange-400', description: 'Warm charcoal & obsidian inverted palette, gentle on eyes' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-7 animate-fadeIn py-2">
      
      {/* Header — 100% Free Citizen & Family Shield */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Protection & Safety Settings</span>
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              Active Defense Configured
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure real-time carrier blocking, synthetic vocoder sensitivity, emergency family alerts, and blacklist rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Reset to recommended defense settings"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportConfig}
            title="Export config JSON"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
            <span>{isSaved ? 'Settings Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Live Notice Banners */}
      {testAlertNotice && (
        <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <span>{testAlertNotice}</span>
          <button onClick={() => setTestAlertNotice(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}
      {familyPingNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <span>{familyPingNotice}</span>
          <button onClick={() => setFamilyPingNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* USER VERIFICATION & TELECOM SIM PROVIDER STATUS CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400/60 bg-slate-800 shrink-0 shadow-lg">
              <img
                src={avatarImg}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">{user.name}</h3>
                {isFullyVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    VERIFIED CITIZEN PROTECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Verification Incomplete
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.role} · Free Lifetime Personal Account
              </p>
            </div>
          </div>

          {/* Quick OTP Verification Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Phone Verification */}
            <div className="p-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">Mobile Number</span>
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <span>{carrierInfo.flag}</span>
                  <span>{user.phoneNumber}</span>
                </span>
              </div>
              {user.isPhoneVerified ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  OTP Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenVerifyOtp('phone')}
                  className="px-2 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] cursor-pointer"
                >
                  Verify Phone
                </button>
              )}
            </div>

            {/* Email Verification */}
            <div className="p-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">Registered Email</span>
                <span className="text-xs font-mono text-slate-200">{user.email}</span>
              </div>
              {user.isEmailVerified ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  OTP Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenVerifyOtp('email')}
                  className="px-2 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] cursor-pointer"
                >
                  Verify Email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SIM Provider & Carrier Network Information */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Network / SIM Provider</span>
            <span className="font-bold text-emerald-400">{carrierInfo.operator}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Telecom Circle / Region</span>
            <span className="font-medium text-slate-200">{carrierInfo.circle}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Line Connection Type</span>
            <span className="font-medium text-cyan-300">{carrierInfo.lineType}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Detection Sensitivity & Phone Line */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Phone Line & Caller ID Protection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  1. Caller ID & SIM Protection
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                STIR/SHAKEN Active
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Fake Caller ID & Number Spoofing Shield
                </label>
                <select
                  value={settings.attestationLevel}
                  onChange={(e) => handleUpdate('attestationLevel', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                >
                  <option value="level-a">Strict Protection — Block all spoofed and unverified fake callers (Level A)</option>
                  <option value="level-b">Normal Protection — Warn when an incoming call appears suspicious (Level B)</option>
                  <option value="level-c">Permissive — Ring normally for all calls (Level C)</option>
                </select>
                <span className="text-[11px] text-slate-400 block leading-relaxed">
                  {settings.attestationLevel === 'level-a' && 'Active Mode: Unsigned VoIP gateway calls impersonating government, banks, or emergency contacts are dropped immediately.'}
                  {settings.attestationLevel === 'level-b' && 'Active Mode: Inbound calls without verified carrier signatures will display an on-screen warning alert.'}
                  {settings.attestationLevel === 'level-c' && 'Active Mode: Permissive gateway bypass; all calls ring with standard caller ID.'}
                </span>
              </div>

              {/* Auto Block Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-200 font-medium">Auto-Block Scam Risk Threshold</span>
                  <span className="text-red-400 font-bold">{settings.autoBlockThreshold}% Risk</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={settings.autoBlockThreshold}
                  onChange={(e) => handleUpdate('autoBlockThreshold', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>50% (High Security)</span>
                  <span>85% (Recommended for Families)</span>
                  <span>95% (Only Definite Scams)</span>
                </div>
                <span className="text-[11px] text-slate-400 block pt-1 leading-relaxed">
                  Incoming communications evaluated with a composite risk score at or above <strong className="text-cyan-300 font-mono">{settings.autoBlockThreshold}%</strong> are automatically blocked before reaching your device.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Scam & Fake Voice Detection Sensitivity */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  2. Scam & Fake Voice Detection Sensitivity
                </h3>
              </div>
              <button
                type="button"
                onClick={handleTestScamAlarm}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Simulate Scam Alarm</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">AI Cloned Voice Detection</span>
                  <span className="text-[11px] text-slate-400">Tuning: Neural vocoder formant jitter, pitch micro-cadence & phase discontinuities</span>
                </div>
                <select
                  value={settings.vocoderSensitivity}
                  onChange={(e) => handleUpdate('vocoderSensitivity', e.target.value as any)}
                  className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 font-mono cursor-pointer"
                >
                  <option value="strict">Strict (High sensitivity)</option>
                  <option value="balanced">Balanced</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Panic & High-Pressure Scam Alarm</span>
                  <span className="text-[11px] text-slate-400">Warns immediately when callers threaten "Digital Arrest", "Police Warrant", or "Account Freeze"</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.nlpUrgencyFilter}
                  onChange={(e) => handleUpdate('nlpUrgencyFilter', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Block Passcode & OTP Demands</span>
                  <span className="text-[11px] text-slate-400">Automatically isolate callers demanding one-time passwords, UPI PINs, or CVVs</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.quarantineMfaDemands}
                  onChange={(e) => handleUpdate('quarantineMfaDemands', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Audio & Siren Alarm Notifications</span>
                  <span className="text-[11px] text-slate-400">Play distinctive audible warning sound when critical deepfake threats are intercepted</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) => handleUpdate('soundAlerts', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Carrier & SIM Blacklist Manager (Live Interactive Registry) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  3. Carrier & Device Blacklist Registry
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 font-bold">
                {settings.blacklistedNumbers.length} Blocked
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                These numbers and domains are blocked at the SIM gateway level and immediately dropped before ringing.
              </p>

              {/* Add Number Input */}
              <form onSubmit={handleAddBlacklist} className="flex gap-2">
                <input
                  type="text"
                  value={newBlacklistInput}
                  onChange={(e) => setNewBlacklistInput(e.target.value)}
                  placeholder="Enter phone number or domain to block..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={!newBlacklistInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Block</span>
                </button>
              </form>

              {/* Blacklisted Numbers List */}
              <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                {settings.blacklistedNumbers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-2">No numbers currently blacklisted</p>
                ) : (
                  settings.blacklistedNumbers.map((num) => (
                    <div 
                      key={num}
                      className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300 font-mono text-xs"
                    >
                      <span className="truncate max-w-[320px]">{num}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlacklist(num)}
                        title="Unblock number"
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Safety Alerts, Phone Line & Themes */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 4: Safety Alerts & Connected Services */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                4. Emergency Family Alerts
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Option 1: Family Warning */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Family Scam Warning Alerts</span>
                    <span className="text-[11px] text-slate-400">Instant SMS/WhatsApp alerts if a scammer targets you or your family</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.familyScamAlerts}
                    onChange={(e) => handleUpdate('familyScamAlerts', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                {settings.familyScamAlerts && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase">
                      Family Emergency Contact Number:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={settings.familyPhone}
                        onChange={(e) => handleUpdate('familyPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestFamilyPing}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: National Cybercrime Helpline 1930 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Report Scams to Cyber Crime (1930)</span>
                  <span className="text-[11px] text-slate-400">Compile formal evidence packets for the National Cybercrime Portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.cyberCrimeHelplineReport}
                  onChange={(e) => handleUpdate('cyberCrimeHelplineReport', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Phone Line & Account Protection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Account & Line Protection
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Protected Phone Line</span>
                  <span className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>{carrierInfo.flag}</span>
                    <span>{user.phoneNumber}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    {carrierInfo.operator} · Active Protection
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenChangeNumber}
                  className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Verify SIM Line
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Account Password</span>
                  <span className="text-slate-200 font-medium font-mono">••••••••••••••</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Theme Appearance */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Theme Appearance
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">{currentTheme}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onThemeChange(t.id)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    currentTheme === t.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold mb-1">
                    <span className={`w-3 h-3 rounded-full ${t.dot}`} />
                    <span className="text-sm">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed pl-5.5">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
