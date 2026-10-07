import React from 'react';
import { 
  Home, 
  Plus, 
  FileText, 
  AlertTriangle, 
  PhoneCall, 
  SlidersHorizontal 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string; // 'dashboard' | 'new-analysis' | 'history' | 'result' | 'call-protection' | 'settings'
  onNavigateTab: (tab: 'dashboard' | 'new-analysis' | 'history' | 'result' | 'call-protection' | 'settings') => void;
  threatCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigateTab,
  threatCount = 0
}) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Home',
      icon: Home
    },
    {
      id: 'new-analysis' as const,
      label: 'Analyze',
      icon: Plus
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: FileText
    },
    {
      id: 'result' as const,
      label: 'Alerts',
      icon: AlertTriangle,
      hasBadge: threatCount > 0
    },
    {
      id: 'call-protection' as const,
      label: 'Calls',
      icon: PhoneCall,
      isPulse: true
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: SlidersHorizontal
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md px-2 py-1.5 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'dashboard' && activeTab === 'home');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigateTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-lg text-[9px] font-mono transition-all cursor-pointer relative active:scale-95 ${
                isActive
                  ? 'text-cyan-300 font-bold bg-cyan-950/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}

                {tab.isPulse && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>

              <span className="truncate leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
