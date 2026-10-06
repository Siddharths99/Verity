import React, { useState, useRef, useEffect } from 'react';
import { ThemeMode } from '../types/user';
import { 
  Shield, 
  ChevronDown, 
  Palette, 
  KeyRound, 
  Phone, 
  FileText, 
  Zap, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface LogoDropdownProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onExportAuditLog: () => void;
}

export const LogoDropdown: React.FC<LogoDropdownProps> = ({
  currentTheme,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onExportAuditLog
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsThemeSubmenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsThemeSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const themes: { id: ThemeMode; label: string; dotColor: string }[] = [
    { id: 'light', label: 'Light Mode', dotColor: 'bg-amber-600' },
    { id: 'dark', label: 'Dark Mode (Inverted)', dotColor: 'bg-orange-400' }
  ];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      
      {/* Brand & Interactive Emblem Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Click for VERITY system options & settings"
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/40 transition-all group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
      >
        {/* Shield Logo with glowing halo & dropdown indicator */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:border-cyan-400 group-hover:scale-105 transition-all">
          <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
          
          {/* Subtle micro chevron on the emblem */}
          <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-700 rounded-full p-0.5 shadow-sm text-cyan-400">
            <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex items-baseline gap-1.5 text-left">
          <span className="text-xl font-bold tracking-tight text-white font-sans group-hover:text-cyan-100 transition-colors">
            VERITY
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30 uppercase tracking-widest">
            PRO
          </span>
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700/90 shadow-2xl py-2 z-50 animate-fadeIn backdrop-blur-md">
          
          {/* Menu Header */}
          <div className="px-3.5 py-2 border-b border-slate-800 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
              VERITY System Menu
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Preferences & Lineage
            </span>
          </div>

          <div className="p-1 space-y-0.5 text-xs">
            
            {/* 1. Theme Switcher Option */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeSubmenuOpen(!isThemeSubmenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Switch Theme</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 capitalize">
                    {currentTheme}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isThemeSubmenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Nested Theme Selector */}
              {isThemeSubmenuOpen && (
                <div className="mt-1 p-1 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onThemeChange(t.id);
                        setIsThemeSubmenuOpen(false);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        currentTheme === t.id
                          ? 'bg-cyan-950/60 text-cyan-300 font-semibold'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
                        <span>{t.label}</span>
                      </div>
                      {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Change Password Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenChangePassword();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Change My Password</span>
            </button>

            {/* 3. Change Number Option */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenChangeNumber();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
            >
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Change My Number</span>
            </button>

            {/* 4. Export Audit Log as PDF */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportAuditLog();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export Forensic Audit (PDF)</span>
            </button>

          </div>

          {/* Quick Info Footer */}
          <div className="px-3.5 py-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>STIR/SHAKEN Active</span>
            <span className="text-emerald-400">99.9% Uptime</span>
          </div>

        </div>
      )}

    </div>
  );
};
