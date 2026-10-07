import { LogoDropdown } from './LogoDropdown';
import { ThemeMode, UserProfile } from '../types/user';
import { ChevronDown, Save, Check } from 'lucide-react';
import avatarImg from '../assets/images/avatar_security_analyst_1791195961743.jpg';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickAnalysisOpen: () => void;
  protectionActive: boolean;
  onToggleProtection: () => void;
  user: UserProfile;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenChangePassword: () => void;
  onOpenChangeNumber: () => void;
  onOpenProfile: () => void;
  onExportAuditLog: () => void;
  onSaveState?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickAnalysisOpen,
  protectionActive,
  onToggleProtection,
  user,
  currentTheme,
  onThemeChange,
  onOpenChangePassword,
  onOpenChangeNumber,
  onOpenProfile,
  onExportAuditLog,
  onSaveState,
  saveStatus = 'idle'
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'history', label: 'History' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'call-protection', label: 'Call Protection' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 dark:bg-[#080B11]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Zone 1: Interactive Logo Dropdown */}
        <div className="shrink-0">
          <LogoDropdown
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            onOpenChangePassword={onOpenChangePassword}
            onOpenChangeNumber={onOpenChangeNumber}
            onExportAuditLog={onExportAuditLog}
          />
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink min-w-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'analyze') {
                    onQuickAnalysisOpen();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`relative px-2.5 py-1.5 lg:px-3 text-xs lg:text-sm font-medium transition-all rounded-md whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.id === 'call-protection' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mr-1.5 animate-pulse" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Interactive Protection Toggle Button + Clickable Profile Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Interactive Protection Active Toggle Button with clear Pause / Enable Callout */}
          <button
            onClick={onToggleProtection}
            title={protectionActive ? "Click to pause real-time protection" : "Click to enable real-time protection"}
            className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98] ${
              protectionActive
                ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-amber-950/40 border-amber-500/40 hover:bg-amber-900/40 hover:border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {protectionActive ? (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              )}
            </span>
            
            <span className="font-semibold hidden lg:inline">
              {protectionActive ? 'Protection Active' : 'Protection Paused'}
            </span>

            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold transition-all ${
              protectionActive 
                ? 'bg-emerald-500/20 text-emerald-200 group-hover:bg-red-500/20 group-hover:text-red-300' 
                : 'bg-amber-500/20 text-amber-200 group-hover:bg-emerald-500/20 group-hover:text-emerald-300'
            }`}>
              {protectionActive ? 'Pause' : 'Enable'}
            </span>
          </button>

          {/* Button beside photo logo: Acts as Save option */}
          <button 
            type="button"
            onClick={onSaveState || onExportAuditLog}
            title="Save System State & Export Audit Dossier"
            aria-label="Save System State"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              saveStatus === 'saved'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300'
            }`}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300">Save</span>
              </>
            )}
          </button>

          {/* Unified Profile Control: [ Profile Avatar + Chevron ] */}
          <button
            onClick={onOpenProfile}
            title="Click to view user profile & verification details"
            className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg border border-transparent hover:border-slate-700/60 hover:bg-slate-800/40 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] shrink-0"
          >
            {/* Perfectly Circular Centered Avatar Image */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 dark:border-slate-700 bg-slate-800 shadow-sm shrink-0 flex items-center justify-center">
              <img
                src={avatarImg}
                alt={user.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Tightly aligned, vertically centered Chevron */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
          </button>

        </div>

      </div>
    </header>
  );
};
