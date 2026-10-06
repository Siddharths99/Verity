import React, { useEffect } from 'react';
import { UserProfile, ThemeMode } from '../types/user';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Palette, 
  CheckCircle2, 
  Clock, 
  Radio, 
  SlidersHorizontal,
  Download,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { lookupCarrierDetails } from '../utils/telecomLookup';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onOpenVerifyOtp: (type: 'phone' | 'email') => void;
  onOpenSettings?: () => void;
  onExportAuditLog?: () => void;
  onSignOut: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  currentTheme,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onOpenVerifyOtp,
  onOpenSettings,
  onExportAuditLog,
  onSignOut
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themes: { id: ThemeMode; label: string; bgBadge: string }[] = [
    { id: 'light', label: 'Light Mode', bgBadge: 'bg-[#FAF8F5] border-[#D5CEBF]' },
    { id: 'dark', label: 'Dark Mode (Inverted)', bgBadge: 'bg-[#1E1D1B] border-[#4A453F]' }
  ];

  const carrierInfo = lookupCarrierDetails(user.phoneNumber);
  const isFullyVerified = user.isPhoneVerified && user.isEmailVerified;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/60 bg-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 flex items-center justify-center">
                <img
                  src={avatarImg}
                  alt={user.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {user.name}
                  </h3>
                  {isFullyVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>Protected Citizen ID</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-[11px]">{user.role}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable details container */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            
            {/* Active Protection Tier Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/40 border border-cyan-500/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                  Account Status
                </span>
                <p className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>{isFullyVerified ? '🛡️ Verified Protection Active' : 'VERITY Citizen Shield'}</span>
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            {/* User Account Info Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Verified Contacts & SIM Carrier
              </h4>
              
              <div className="space-y-2 text-xs">
                {/* Phone & Carrier Details */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[10px] block font-mono">Protected Phone Number</span>
                        <span className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                          <span>{carrierInfo.flag}</span>
                          <span>{user.phoneNumber}</span>
                        </span>
                      </div>
                    </div>
                    {user.isPhoneVerified ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenVerifyOtp('phone');
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Verify OTP
                      </button>
                    )}
                  </div>

                  {/* Detected SIM Details */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block">SIM Provider:</span>
                      <span className="text-emerald-400 font-bold">{carrierInfo.operator}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Region / Country:</span>
                      <span className="text-slate-200 truncate block">{carrierInfo.circle} ({carrierInfo.country})</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block font-mono">Registered Email</span>
                      <span className="font-mono text-slate-200 font-medium">{user.email}</span>
                    </div>
                  </div>
                  {user.isEmailVerified ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVerifyOtp('email');
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Verify OTP
                    </button>
                  )}
                </div>

                {/* Account Type */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block font-mono">Account Category</span>
                    <span className="text-slate-200 font-medium">Free Citizen Account (Open to Everyone)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Security Actions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Security & Phone Line
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onClose();
                    onOpenChangePassword();
                  }}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all hover:bg-slate-800/50 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold text-slate-200 block">Password</span>
                    <span className="text-[10px] text-slate-400">Update passcode</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenChangeNumber();
                  }}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all hover:bg-slate-800/50 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold text-slate-200 block">Phone Line</span>
                    <span className="text-[10px] text-slate-400">Update number & SIM</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Theme Switcher in Profile */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Theme Mode
                </h4>
                <span className="text-[10px] font-mono text-cyan-400 capitalize">{currentTheme}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      currentTheme === t.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.bgBadge}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Drawer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Settings</span>
              </button>
            )}

            {onExportAuditLog && (
              <button
                onClick={onExportAuditLog}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export PDF</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
