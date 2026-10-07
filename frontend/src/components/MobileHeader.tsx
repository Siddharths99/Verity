import React from 'react';
import { 
  ChevronLeft, 
  Save, 
  Check, 
  ShieldCheck, 
  FileDown 
} from 'lucide-react';
import { LogoDropdown } from './LogoDropdown';
import { ThemeMode, UserProfile } from '../types/user';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';

interface MobileHeaderProps {
  onBack?: () => void;
  currentViewTitle?: string;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onExportAuditLog: () => void;
  onSaveState: () => void;
  protectionActive: boolean;
  onToggleProtection: () => void;
  user: UserProfile;
  onOpenProfile: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onBack,
  currentViewTitle,
  currentTheme,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onExportAuditLog,
  onSaveState,
  protectionActive,
  onToggleProtection,
  user,
  onOpenProfile,
  saveStatus = 'idle'
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/95 dark:bg-[#080B11]/95 backdrop-blur-md px-3 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left Zone: [Optional Back Button] + Logo Dropdown (Theme, Password, Number, Export) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to dashboard"
              title="Back to dashboard"
              className="p-1 sm:p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer active:scale-95 flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
              <span className="text-[10px] font-bold hidden xs:inline">Back</span>
            </button>
          )}

          {/* Interactive Logo with Dropdown Menu: Theme Switcher, Password, Phone Number, Export PDF */}
          <div className="shrink-0">
            <LogoDropdown
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              onOpenChangePassword={onOpenChangePassword}
              onOpenChangeNumber={onOpenChangeNumber}
              onExportAuditLog={onExportAuditLog}
            />
          </div>
        </div>

        {/* Right Zone: Protection Toggle + Save Button Beside Photo Logo + Photo Logo (Avatar) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* 1. Protection Active / Paused Toggle Pill */}
          <button
            type="button"
            onClick={onToggleProtection}
            title={protectionActive ? "Real-time Protection Active (Tap to pause)" : "Protection Paused (Tap to enable)"}
            aria-label={protectionActive ? "Pause Real-time Protection" : "Enable Real-time Protection"}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer select-none active:scale-95 ${
              protectionActive
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${protectionActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="hidden xs:inline">{protectionActive ? 'Shield' : 'Paused'}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-extrabold ${
              protectionActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
            }`}>
              {protectionActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* 2. THE BUTTON BESIDE PHOTO LOGO: ACTS AS SAVE OPTION */}
          {/* Performs complete state persistence & forensic audit log export with visual confirmation */}
          <button
            type="button"
            onClick={onSaveState}
            title="Save system state & export forensic audit log (PDF)"
            aria-label="Save State and Export Audit Report"
            className={`relative flex items-center justify-center gap-1 px-2 py-1 rounded-lg border font-mono text-[10px] font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
              saveStatus === 'saved'
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300'
            }`}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] animate-bounce" />
                <span className="text-emerald-300 font-bold">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline text-cyan-300">Save</span>
              </>
            )}
          </button>

          {/* 3. Photo Logo (User Avatar) */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="User Profile & Verification Status"
            aria-label="Open User Profile"
            className="relative p-0.5 rounded-full border-2 border-cyan-500/50 hover:border-cyan-400 bg-slate-800 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={avatarImg}
                alt={user.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* STIR/SHAKEN verification indicator badge */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </button>

        </div>

      </div>
    </header>
  );
};
