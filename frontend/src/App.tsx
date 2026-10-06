import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SecurityStatusCard } from './components/SecurityStatusCard';
import { TrustOverview } from './components/TrustOverview';
import { RecentAnalysisTable } from './components/RecentAnalysisTable';
import { AnalysisDetailModal } from './components/AnalysisDetailModal';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { AnalyzeHubView } from './components/AnalyzeHubView';
import { HistoryView } from './components/HistoryView';
import { AnalysisResultView } from './components/AnalysisResultView';
import { CallProtectionView } from './components/CallProtectionView';
import { MobileDashboardView } from './components/MobileDashboardView';
import { MobileNewAnalysisView } from './components/MobileNewAnalysisView';
import { MobileAnalysisResultView } from './components/MobileAnalysisResultView';
import { MobileHistoryView } from './components/MobileHistoryView';
import { MobileSettingsView } from './components/MobileSettingsView';
import { SettingsView } from './components/SettingsView';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ChangeNumberModal } from './components/ChangeNumberModal';
import { OtpVerificationModal } from './components/OtpVerificationModal';
import { AIChatbot } from './components/AIChatbot';
import { RECENT_ANALYSIS_RECORDS } from './data/mockData';
import { AnalysisRecord, ModalityType } from './types';
import { ThemeMode, UserProfile, INITIAL_USER_PROFILE } from './types/user';
import { exportAuditLogToPdf } from './utils/pdfExport';
import { apiService } from './utils/apiService';
import { CheckCircle2, ShieldAlert, Info, Smartphone, Monitor, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [protectionActive, setProtectionActive] = useState<boolean>(true);
  const [records, setRecords] = useState<AnalysisRecord[]>(RECENT_ANALYSIS_RECORDS);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [mobileSubView, setMobileSubView] = useState<'dashboard' | 'new-analysis' | 'history' | 'result' | 'call-protection' | 'settings'>('dashboard');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [isQuickAnalysisOpen, setIsQuickAnalysisOpen] = useState<boolean>(false);
  const [activeModality, setActiveModality] = useState<ModalityType>('voice');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isChangeNumberOpen, setIsChangeNumberOpen] = useState<boolean>(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [otpModalType, setOtpModalType] = useState<'phone' | 'email'>('phone');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const handleVerifyOtpSuccess = (type: 'phone' | 'email') => {
    setUser((prev) => {
      const updated = {
        ...prev,
        isPhoneVerified: type === 'phone' ? true : prev.isPhoneVerified,
        isEmailVerified: type === 'email' ? true : prev.isEmailVerified
      };
      if (updated.isPhoneVerified && updated.isEmailVerified) {
        showToast('🎉 Both Phone and Email verified with OTP! VERIFIED CITIZEN PROTECTED STATUS granted.', 'success');
      } else {
        showToast(`${type === 'phone' ? 'Mobile number' : 'Email address'} verified successfully with OTP!`, 'success');
      }
      return updated;
    });
  };

  // Auto-adapt on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isMobileMode) {
        setIsMobileMode(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMode]);

  // Sync theme class to document body & html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    document.body.className = `theme-${theme} antialiased selection:bg-[#FCE7DB] selection:text-[#9A3412] min-h-screen font-sans`;
  }, [theme]);

  // Check live FastAPI backend connection on mount
  useEffect(() => {
    let mounted = true;
    apiService.checkHealth().then((isHealthy) => {
      if (mounted && isHealthy) {
        showToast('⚡ Live FastAPI Backend Connected (http://localhost:8000)', 'success');
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleProtection = () => {
    setProtectionActive((prev) => {
      const next = !prev;
      showToast(
        next ? 'VERITY Protection Active — Multi-Vector Defense Online' : 'VERITY Protection Paused by User',
        next ? 'success' : 'alert'
      );
      return next;
    });
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  const handleOpenQuickAnalysis = (modality: ModalityType = 'call') => {
    setActiveModality(modality);
    if (isMobileMode) {
      setMobileSubView('new-analysis');
    } else {
      setIsQuickAnalysisOpen(true);
    }
  };

  const handleAnalysisComplete = (newRecord: AnalysisRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setIsQuickAnalysisOpen(false);
    setSelectedRecord(newRecord);
    setUser((prev) => ({
      ...prev,
      threatsBlockedCount: newRecord.risk === 'CRITICAL' || newRecord.risk === 'HIGH' ? prev.threatsBlockedCount + 1 : prev.threatsBlockedCount
    }));
    
    if (isMobileMode) {
      setMobileSubView('result');
    }
    showToast(`Analysis finalized: ${newRecord.subject} (${newRecord.risk} Risk · ${newRecord.score}/100)`, 'success');
  };

  const handleTakeAction = (recordId: string, actionType: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              action: actionType as any,
              risk: actionType === 'Blocked' || actionType === 'Quarantined' ? 'CRITICAL' : r.risk
            }
          : r
      )
    );
    showToast(`Action applied: ${actionType} on record #${recordId}`, 'success');

    // Sync feedback with backend SQLite database if scan ID was generated by backend
    if (recordId.startsWith('vrt_')) {
      apiService.submitFeedback(recordId, actionType === 'Blocked' ? 'CONFIRMED_SCAM' : 'USER_ACTION', `User executed action: ${actionType}`).catch(() => {});
    }
  };

  const handleExportAuditLog = () => {
    try {
      exportAuditLogToPdf(records, user.email);
      showToast("VERITY Forensic Audit Telemetry PDF generated and downloaded successfully", "success");
    } catch (e) {
      showToast("Error generating PDF export", "alert");
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      
      {/* Top Navigation Bar (Shown on Desktop) */}
      {!isMobileMode && (
        <Header
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          onQuickAnalysisOpen={() => setActiveTab('analyze')}
          protectionActive={protectionActive}
          onToggleProtection={handleToggleProtection}
          user={user}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onExportAuditLog={handleExportAuditLog}
        />
      )}

      {/* Floating Device Mode Switcher (Desktop ↔ Mobile Viewport) */}
      <div className="fixed top-20 right-4 z-40 hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700/90 shadow-lg backdrop-blur-md text-xs font-mono">
        <button
          onClick={() => {
            setIsMobileMode(false);
            setMobileSubView('dashboard');
            showToast('Desktop Console Layout Active', 'info');
          }}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] ${
            !isMobileMode 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-medium'
          }`}
          title="Switch to Desktop View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Desktop</span>
        </button>

        <button
          onClick={() => {
            setIsMobileMode(true);
            showToast('Mobile UI Active', 'info');
          }}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98] ${
            isMobileMode 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-medium'
          }`}
          title="Switch to Mobile Dashboard / Analysis UI"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile UI</span>
        </button>
      </div>

      {/* Main Workspace Viewport */}
      <main className={`flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-28 ${isMobileMode ? 'max-w-full sm:max-w-md overflow-x-hidden' : 'max-w-7xl'}`}>
        
        {/* ============================================================ */}
        {/* MOBILE MODE: COMPACT SMARTPHONE USER INTERFACE               */}
        {/* ============================================================ */}
        {isMobileMode ? (
          mobileSubView === 'new-analysis' ? (
            <MobileNewAnalysisView
              initialModality={activeModality}
              onBack={() => setMobileSubView('dashboard')}
              onRunAnalysis={handleAnalysisComplete}
              onNavigateTab={(tab) => {
                if (tab === 'dashboard' || tab === 'home') setMobileSubView('dashboard');
                else if (tab === 'history') setMobileSubView('history');
                else if (tab === 'incidents') setMobileSubView('result');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else if (tab === 'settings') setMobileSubView('settings');
                else setMobileSubView('new-analysis');
              }}
              activeMobileTab="analyze"
            />
          ) : mobileSubView === 'history' ? (
            <MobileHistoryView
              records={records}
              onSelectRecord={(rec) => {
                setSelectedRecord(rec);
                setMobileSubView('result');
              }}
              onNavigateTab={(tab) => {
                if (tab === 'dashboard' || tab === 'home') setMobileSubView('dashboard');
                else if (tab === 'analyze') setMobileSubView('new-analysis');
                else if (tab === 'incidents') setMobileSubView('result');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else if (tab === 'settings') setMobileSubView('settings');
                else setMobileSubView('history');
              }}
              onExportAuditLog={handleExportAuditLog}
              activeMobileTab="history"
            />
          ) : mobileSubView === 'result' ? (
            <MobileAnalysisResultView
              record={selectedRecord || (records.length > 0 ? records[0] : undefined)}
              onBack={() => setMobileSubView('dashboard')}
              onBlockCaller={() => {
                const recId = selectedRecord?.id || records[0]?.id;
                if (recId) handleTakeAction(recId, 'Blocked');
                showToast('Caller blocked across carrier gateways', 'success');
              }}
              onReportFraud={() => {
                const recId = selectedRecord?.id || records[0]?.id;
                if (recId) handleTakeAction(recId, 'Flagged');
                showToast('Scam evidence dispatched to National Cybercrime Helpline (1930)', 'success');
              }}
              onVerifyIndependently={() => showToast('Safe Directory & 1930 Helpline initiated', 'info')}
              onQuarantine={() => {
                const recId = selectedRecord?.id || records[0]?.id;
                if (recId) handleTakeAction(recId, 'Quarantined');
                showToast('Interaction quarantined in isolated sandbox', 'alert');
              }}
              onApprove={() => {
                const recId = selectedRecord?.id || records[0]?.id;
                if (recId) handleTakeAction(recId, 'Approved');
                showToast('Interaction verified as safe contact', 'success');
              }}
              onNavigateTab={(tab) => {
                if (tab === 'home' || tab === 'dashboard') setMobileSubView('dashboard');
                else if (tab === 'analyze') setMobileSubView('new-analysis');
                else if (tab === 'history') setMobileSubView('history');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else if (tab === 'settings') setMobileSubView('settings');
                else setMobileSubView('result');
              }}
              activeMobileTab="incidents"
            />
          ) : mobileSubView === 'call-protection' ? (
            <CallProtectionView
              isMobile={true}
              onEndCall={() => {
                showToast('Inbound call terminated immediately by user', 'alert');
                setMobileSubView('dashboard');
              }}
              onBlockCaller={() => showToast('Caller added to carrier blacklist', 'success')}
              onReportFraud={() => showToast('Fraud report logged', 'success')}
              onVerifyIndependently={() => showToast('Safe Directory & 1930 Helpline initiated', 'info')}
              onBackToDashboard={() => setMobileSubView('dashboard')}
              onNavigateTab={(tab) => {
                if (tab === 'home' || tab === 'dashboard') setMobileSubView('dashboard');
                else if (tab === 'analyze') setMobileSubView('new-analysis');
                else if (tab === 'history') setMobileSubView('history');
                else if (tab === 'incidents') setMobileSubView('result');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else if (tab === 'settings') setMobileSubView('settings');
                else setMobileSubView('dashboard');
              }}
              activeMobileTab="home"
            />
          ) : mobileSubView === 'settings' ? (
            <MobileSettingsView
              user={user}
              currentTheme={theme}
              protectionActive={protectionActive}
              onToggleProtection={handleToggleProtection}
              onThemeChange={handleThemeChange}
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
              onOpenVerifyOtp={(type) => {
                setOtpModalType(type);
                setIsOtpModalOpen(true);
              }}
              onSaveSettings={() => showToast('Protection settings saved successfully', 'success')}
              onExportAuditLog={handleExportAuditLog}
              onNavigateTab={(tab) => {
                if (tab === 'home' || tab === 'dashboard') setMobileSubView('dashboard');
                else if (tab === 'analyze') setMobileSubView('new-analysis');
                else if (tab === 'history') setMobileSubView('history');
                else if (tab === 'incidents') setMobileSubView('result');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else setMobileSubView('settings');
              }}
              onOpenProfile={() => setIsProfileOpen(true)}
              activeMobileTab="settings"
            />
          ) : (
            <MobileDashboardView
              user={user}
              protectionActive={protectionActive}
              onToggleProtection={handleToggleProtection}
              onOpenNewAnalysis={(modality) => {
                setActiveModality(modality || 'call');
                setMobileSubView('new-analysis');
              }}
              onSelectRecord={(record) => {
                setSelectedRecord(record);
                setMobileSubView('result');
              }}
              onNavigateTab={(tab) => {
                if (tab === 'analyze') setMobileSubView('new-analysis');
                else if (tab === 'history') setMobileSubView('history');
                else if (tab === 'incidents') setMobileSubView('result');
                else if (tab === 'call-protection') setMobileSubView('call-protection');
                else if (tab === 'settings') setMobileSubView('settings');
                else setMobileSubView('dashboard');
              }}
              onOpenProfile={() => setIsProfileOpen(true)}
              activeMobileTab="home"
            />
          )
        ) : (
          /* ============================================================ */
          /* DESKTOP MODE: FULL ENTERPRISE CONSOLE VIEWPORT               */
          /* ============================================================ */
          <div className="space-y-7">
            {/* TAB 1: DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-7 animate-fadeIn">
                {/* Hero Section */}
                <HeroSection />

                {/* Security Status Card */}
                <SecurityStatusCard
                  protectionActive={protectionActive}
                  onToggleProtection={handleToggleProtection}
                  onQuickScan={() => {
                    setActiveTab('call-protection');
                  }}
                />

                {/* Trust & Risk Overview (4 Dimension Cards) */}
                <TrustOverview
                  onCardClick={() => {
                    // Navigate to breakdown without showing noisy telemetry toast
                  }}
                />

                {/* Recent Analysis Table */}
                <RecentAnalysisTable
                  records={records}
                  onSelectRecord={(record) => {
                    if (record.score >= 80) {
                      setActiveTab('incidents');
                    } else {
                      setSelectedRecord(record);
                    }
                  }}
                />
              </div>
            )}

            {/* TAB 2: ANALYZE VIEW */}
            {activeTab === 'analyze' && (
              <AnalyzeHubView
                onRunAnalysis={(newRecord) => {
                  setRecords((prev) => [newRecord, ...prev]);
                  setUser((prev) => ({
                    ...prev,
                    threatsBlockedCount: prev.threatsBlockedCount + 1
                  }));
                }}
                onViewResultScreen={() => setActiveTab('incidents')}
              />
            )}

            {/* TAB 3: HISTORY VIEW */}
            {activeTab === 'history' && (
              <HistoryView
                records={records}
                onSelectRecord={(record) => {
                  if (record.score >= 80) {
                    setActiveTab('incidents');
                  } else {
                    setSelectedRecord(record);
                  }
                }}
                onExportAuditLog={handleExportAuditLog}
              />
            )}

            {/* TAB 4: INCIDENTS VIEW */}
            {activeTab === 'incidents' && (
              <AnalysisResultView
                record={selectedRecord || (records.length > 0 ? records[0] : undefined)}
                onBackToDashboard={() => setActiveTab('history')}
                onBlockCaller={() => {
                  const recId = selectedRecord?.id || records[0]?.id;
                  if (recId) handleTakeAction(recId, 'Blocked');
                  showToast('Inbound caller blocked across carrier gateways', 'success');
                }}
                onReportFraud={() => {
                  const recId = selectedRecord?.id || records[0]?.id;
                  if (recId) handleTakeAction(recId, 'Flagged');
                  showToast('Incident telemetry dispatched to National Cybercrime Helpline (1930)', 'success');
                }}
                onVerifyIndependently={() => showToast('Independent verification protocol initiated: Initiating secondary out-of-band contact', 'info')}
              />
            )}

            {/* TAB 5: CALL PROTECTION VIEW */}
            {activeTab === 'call-protection' && (
              <CallProtectionView
                onEndCall={() => showToast('Inbound call terminated immediately by user', 'alert')}
                onBlockCaller={() => showToast('Caller +91 XXXXX XXXXX added to carrier blacklist', 'success')}
                onReportFraud={() => showToast('Fraud report logged to carrier registry and safety cell', 'success')}
                onVerifyIndependently={() => showToast('Independent verification protocol active — Official directory dialed', 'info')}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {/* TAB 6: SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                currentTheme={theme}
                onThemeChange={handleThemeChange}
                onOpenChangePassword={() => setIsChangePasswordOpen(true)}
                onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
                onOpenVerifyOtp={(type) => {
                  setOtpModalType(type);
                  setIsOtpModalOpen(true);
                }}
                onSaveSettings={() => showToast('Protection settings saved successfully', 'success')}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer (Shown on Desktop) */}
      {!isMobileMode && (
        <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">VERITY</span>
              <span aria-hidden="true">·</span>
              <span>Multimodal AI Impersonation & Fraud Prevention (Free for Everyone)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Carrier Protection</span>
              <span>·</span>
              <span>Acoustic Biometrics</span>
              <span>·</span>
              <span>Citizen Interaction Shield</span>
            </div>
          </div>
        </footer>
      )}

      {/* Interactive AI Security Copilot & Chatbot (Bottom Right) */}
      <AIChatbot 
        onOpenQuickAnalysis={(modality) => {
          setActiveModality(modality);
          if (isMobileMode) {
            setMobileSubView('new-analysis');
          } else {
            setActiveTab('analyze');
          }
        }} 
        isMobile={isMobileMode}
      />

      {/* User Profile Details Drawer */}
      {isProfileOpen && (
        <UserProfileDrawer
          isOpen={isProfileOpen}
          user={user}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
          onOpenVerifyOtp={(type) => {
            setOtpModalType(type);
            setIsOtpModalOpen(true);
          }}
          onOpenSettings={() => {
            if (isMobileMode) {
              setMobileSubView('settings');
            } else {
              setActiveTab('settings');
            }
          }}
          onExportAuditLog={handleExportAuditLog}
          onClose={() => setIsProfileOpen(false)}
          onSignOut={() => showToast('Signed out of protection session', 'info')}
        />
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <OtpVerificationModal
          type={otpModalType}
          targetValue={otpModalType === 'phone' ? user.phoneNumber : user.email}
          onClose={() => setIsOtpModalOpen(false)}
          onSuccess={handleVerifyOtpSuccess}
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {/* Change Phone Number Modal */}
      {isChangeNumberOpen && (
        <ChangeNumberModal
          currentNumber={user.phoneNumber}
          onClose={() => setIsChangeNumberOpen(false)}
          onSuccess={(newNumber) => {
            setUser((prev) => ({ ...prev, phoneNumber: newNumber }));
            showToast(`Protected line updated to ${newNumber}. STIR/SHAKEN Level A re-certified.`, 'success');
          }}
        />
      )}

      {/* Detail Inspection Modal */}
      {selectedRecord && !isMobileMode && (
        <AnalysisDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onTakeAction={handleTakeAction}
        />
      )}

      {/* Quick Analysis Modal */}
      {isQuickAnalysisOpen && (
        <NewAnalysisModal
          initialModality={activeModality}
          onClose={() => setIsQuickAnalysisOpen(false)}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {/* Centered Action Notification (Middle of the Screen) */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs pointer-events-none animate-fadeIn">
          <div className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl border-2 text-sm font-semibold shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl max-w-md w-full pointer-events-auto transition-all ${
            toastMessage.type === 'success' ? 'bg-slate-900/95 border-emerald-500 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.35)]' :
            toastMessage.type === 'alert' ? 'bg-slate-900/95 border-red-500 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.35)]' :
            'bg-slate-900/95 border-cyan-500 text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'alert' && <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-6 h-6 text-cyan-400 shrink-0" />}
            <div className="flex-1 space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400 font-bold">
                {toastMessage.type === 'success' ? 'Security Action Verified' : toastMessage.type === 'alert' ? 'Security Alert' : 'System Telemetry'}
              </span>
              <span className="text-xs sm:text-sm font-medium leading-snug block text-slate-100">{toastMessage.text}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
