import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
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
import { IndependentVerifyModal } from './components/IndependentVerifyModal';
import { BlockSenderModal } from './components/BlockSenderModal';
import { ReportFraudModal } from './components/ReportFraudModal';
import { AIChatbot } from './components/AIChatbot';
import { RECENT_ANALYSIS_RECORDS } from './data/mockData';
import { AnalysisRecord, ModalityType } from './types';
import { ThemeMode, UserProfile, INITIAL_USER_PROFILE } from './types/user';
import { exportAuditLogToPdf } from './utils/pdfExport';
import { apiService, mapBackendIncidentToAnalysisRecord } from './utils/apiService';
import { CallPermissionModal } from './components/CallPermissionModal';
import { IncomingCallBanner } from './components/IncomingCallBanner';
import { callDetectionService, IncomingCallPayload } from './utils/callDetectionService';
import { Smartphone, Monitor, CheckCircle2, AlertTriangle, Info, X, PhoneCall } from 'lucide-react';

const STORAGE_KEY = 'verity_analysis_records_v3';

function isMockRecord(id?: string): boolean {
  if (!id) return false;
  return (
    id.startsWith('an-00') ||
    id.startsWith('mb-') ||
    id === 'an-001' ||
    id === 'an-002' ||
    id === 'an-003' ||
    id === 'an-004' ||
    id === 'an-005'
  );
}

function loadInitialRecords(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('verity_analysis_records_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const real = parsed.filter((r) => !isMockRecord(r.id));
        if (real.length > 0) {
          return real;
        }
      }
    }
  } catch (err) {
    console.error('Failed to parse records from localStorage', err);
  }
  return [];
}

function saveRecordsToStorage(newRecords: AnalysisRecord[]) {
  try {
    const realOnly = newRecords.filter((r) => !isMockRecord(r.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
  } catch (err) {
    console.error('Failed to save records to localStorage', err);
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [protectionActive, setProtectionActive] = useState<boolean>(true);
  const [records, setRecords] = useState<AnalysisRecord[]>(loadInitialRecords);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [mobileSubView, setMobileSubView] = useState<'dashboard' | 'new-analysis' | 'history' | 'result' | 'call-protection' | 'settings'>('dashboard');
  const [activeCallNumber, setActiveCallNumber] = useState<string>('+91 98401 24590');
  const [activeCallClaimed, setActiveCallClaimed] = useState<string>('Bank Representative');

  // Telecom & Call Screening Permission Modal state (Must ask user before proceeding into app)
  const [hasCallPermission, setHasCallPermission] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('verity_call_logs_permission') !== null;
    }
    return false;
  });

  // Real-time Incoming Call Detection State
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);

  // Subscribe to real-time incoming call detection: auto-routes to Call Protection
  useEffect(() => {
    callDetectionService.startListening();
    const unsubscribe = callDetectionService.subscribe((call) => {
      setIncomingCall(call);
      if (call) {
        // DIRECT USER IMMEDIATELY TO CALL PROTECTION PAGE
        setActiveCallNumber(call.phoneNumber);
        setActiveCallClaimed(call.claimedIdentity);
        if (isMobileMode) {
          setMobileSubView('call-protection');
        } else {
          setActiveTab('call-protection');
        }
        showToast(`🚨 Inbound call detected from ${call.phoneNumber}! Directing to Call Protection...`, 'alert');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isMobileMode]);

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [isQuickAnalysisOpen, setIsQuickAnalysisOpen] = useState<boolean>(false);
  const [activeModality, setActiveModality] = useState<ModalityType>('voice');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isChangeNumberOpen, setIsChangeNumberOpen] = useState<boolean>(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [otpModalType, setOtpModalType] = useState<'phone' | 'email'>('phone');

  // Dedicated Action Modals State (Verify Independently, Block Sender, Report Fraud 1930)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [modalTargetRecord, setModalTargetRecord] = useState<AnalysisRecord | null>(null);

  const handleOpenVerify = (record?: AnalysisRecord) => {
    const rec = record || selectedRecord || (records.length > 0 ? records[0] : null);
    setModalTargetRecord(rec);
    setIsVerifyModalOpen(true);
  };

  const handleOpenBlock = (record?: AnalysisRecord) => {
    const rec = record || selectedRecord || (records.length > 0 ? records[0] : null);
    setModalTargetRecord(rec);
    setIsBlockModalOpen(true);
  };

  const handleOpenReport = (record?: AnalysisRecord) => {
    const rec = record || selectedRecord || (records.length > 0 ? records[0] : null);
    setModalTargetRecord(rec);
    setIsReportModalOpen(true);
  };

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

  // Check live FastAPI backend connection on mount & synchronize scan records
  useEffect(() => {
    let mounted = true;
    apiService.checkHealth().then((isHealthy) => {
      if (mounted && isHealthy) {
        // Fetch and merge scan history from backend SQLite database
        apiService.fetchIncidents(100, 0).then((incidents) => {
          if (!mounted || !incidents || incidents.length === 0) return;
          const backendRecords = incidents.map(mapBackendIncidentToAnalysisRecord);
          setRecords((current) => {
            const realCurrent = current.filter((r) => !isMockRecord(r.id));
            const currentMap = new Map(realCurrent.map((r) => [r.id, r]));
            for (const bRecord of backendRecords) {
              if (!currentMap.has(bRecord.id)) {
                currentMap.set(bRecord.id, bRecord);
              } else {
                const existing = currentMap.get(bRecord.id)!;
                if (bRecord.action === 'Verified' || bRecord.action === 'Rejected' || bRecord.action === 'Blocked' || bRecord.action === 'Quarantined') {
                  existing.action = bRecord.action;
                  existing.risk = bRecord.risk;
                }
              }
            }
            const merged = Array.from(currentMap.values());
            merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            saveRecordsToStorage(merged);
            return merged;
          });
        }).catch(() => {});
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // State persistence, save status & visual toast notifications
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message?: string, type: 'success' | 'alert' | 'info' = 'info') => {
    if (!message) return;
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSaveAllState = () => {
    setSaveStatus('saving');
    try {
      saveRecordsToStorage(records);
      localStorage.setItem('verity_user_profile', JSON.stringify(user));
      localStorage.setItem('verity_protection_active', JSON.stringify(protectionActive));
      localStorage.setItem('verity_theme', theme);
      exportAuditLogToPdf(records, user.email);
      setSaveStatus('saved');
      showToast('✓ Protection state saved & forensic audit report exported!', 'success');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    } catch (err) {
      console.error('Error saving state:', err);
      setSaveStatus('idle');
      showToast('Failed to save state to local storage', 'alert');
    }
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
    setRecords((prev) => {
      const real = prev.filter((r) => !isMockRecord(r.id) && r.id !== newRecord.id);
      const updated = [newRecord, ...real];
      saveRecordsToStorage(updated);
      return updated;
    });
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
    const normalizedAction = actionType as any;
    let newRisk: any;
    if (actionType === 'Blocked' || actionType === 'Rejected' || actionType === 'Quarantined') {
      newRisk = 'CRITICAL';
    } else if (actionType === 'Verified' || actionType === 'Safe' || actionType === 'Approved') {
      newRisk = 'LOW';
    }

    setRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              action: normalizedAction,
              risk: newRisk || r.risk
            }
          : r
      );
      saveRecordsToStorage(updated);
      return updated;
    });

    setSelectedRecord((prev) =>
      prev && prev.id === recordId
        ? {
            ...prev,
            action: normalizedAction,
            risk: newRisk || prev.risk
          }
        : prev
    );

    showToast(`Action applied: ${actionType} on record #${recordId}`, 'success');

    // Sync feedback with backend SQLite database if scan ID was generated by backend
    if (recordId.startsWith('vrt_')) {
      const feedbackType =
        actionType === 'Blocked' || actionType === 'Rejected'
          ? 'CONFIRMED_SCAM'
          : actionType === 'Verified' || actionType === 'Safe' || actionType === 'Approved'
          ? 'CONFIRMED_SAFE'
          : 'USER_ACTION';
      apiService.submitFeedback(recordId, feedbackType, `User executed action: ${actionType}`).catch(() => {});
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
      
      {/* Real-time Status Notification Toast */}
      {toast && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw] text-xs font-mono select-none bg-slate-950/95 border-slate-700 text-slate-200"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span className="truncate">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar: Desktop Header or Mobile Header */}
      {!isMobileMode ? (
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
          onSaveState={handleSaveAllState}
          saveStatus={saveStatus}
        />
      ) : (
        <MobileHeader
          onBack={mobileSubView !== 'dashboard' ? () => setMobileSubView('dashboard') : undefined}
          currentViewTitle={
            mobileSubView === 'dashboard'
              ? 'Overview'
              : mobileSubView === 'new-analysis'
              ? 'New Analysis'
              : mobileSubView === 'history'
              ? 'Audit Log'
              : mobileSubView === 'result'
              ? 'Scam Dossier'
              : mobileSubView === 'call-protection'
              ? 'Active Call'
              : 'Settings'
          }
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
          onExportAuditLog={handleExportAuditLog}
          onSaveState={handleSaveAllState}
          protectionActive={protectionActive}
          onToggleProtection={handleToggleProtection}
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
          saveStatus={saveStatus}
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

        {/* Quick Simulator for Inbound Threat Calls */}
        <button
          type="button"
          onClick={() => {
            const call = callDetectionService.triggerIncomingCall();
            showToast(`🚨 Inbound call detected: ${call.phoneNumber} (${call.claimedIdentity})`, 'alert');
          }}
          className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-500/50 font-bold active:scale-[0.98] shadow-sm ml-1"
          title="Simulate incoming threat call to test real-time detection & auto-routing"
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="hidden sm:inline">Simulate Call</span>
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
              onLaunchCallProtection={(phone, claimed) => {
                setActiveCallNumber(phone);
                setActiveCallClaimed(claimed);
                setMobileSubView('call-protection');
                showToast(`Live Call Protection Shield active for ${phone}`, 'info');
              }}
              activeMobileTab="analyze"
              hideHeader={true}
              hideBottomNav={true}
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
              hideHeader={true}
            />
          ) : mobileSubView === 'result' ? (
            <MobileAnalysisResultView
              record={selectedRecord || (records.length > 0 ? records[0] : undefined)}
              onBack={() => setMobileSubView('dashboard')}
              onBlockCaller={() => handleOpenBlock(selectedRecord || records[0])}
              onReportFraud={() => handleOpenReport(selectedRecord || records[0])}
              onVerifyIndependently={() => handleOpenVerify(selectedRecord || records[0])}
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
              hideHeader={true}
              hideBottomNav={true}
            />
          ) : mobileSubView === 'call-protection' ? (
            <CallProtectionView
              isMobile={true}
              initialPhoneNumber={activeCallNumber}
              initialClaimedIdentity={activeCallClaimed}
              isDemoMode={true}
              onEndCall={() => {
                showToast('Inbound call terminated immediately by user', 'alert');
                callDetectionService.dismissIncomingCall();
                setMobileSubView('dashboard');
              }}
              onBlockCaller={() => {
                handleOpenBlock(selectedRecord || records[0]);
                callDetectionService.dismissIncomingCall();
              }}
              onReportFraud={() => handleOpenReport(selectedRecord || records[0])}
              onVerifyIndependently={() => handleOpenVerify(selectedRecord || records[0])}
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
              onSaveSettings={handleSaveAllState}
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
              hideHeader={true}
              hideBottomNav={true}
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
              records={records}
              activeMobileTab="home"
              currentTheme={theme}
              onThemeChange={handleThemeChange}
              onOpenChangePassword={() => setIsChangePasswordOpen(true)}
              onOpenChangeNumber={() => setIsChangeNumberOpen(true)}
              onExportAuditLog={handleExportAuditLog}
              onSaveState={handleSaveAllState}
              saveStatus={saveStatus}
              hideHeader={true}
              hideBottomNav={true}
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
                    setSelectedRecord(record);
                  }}
                  onTakeAction={handleTakeAction}
                  onNewAnalysis={() => setIsQuickAnalysisOpen(true)}
                />
              </div>
            )}

            {/* TAB 2: ANALYZE VIEW */}
            {activeTab === 'analyze' && (
              <AnalyzeHubView
                onRunAnalysis={(newRecord) => {
                  setRecords((prev) => {
                    const real = prev.filter((r) => !isMockRecord(r.id) && r.id !== newRecord.id);
                    const updated = [newRecord, ...real];
                    saveRecordsToStorage(updated);
                    return updated;
                  });
                  setSelectedRecord(newRecord);
                  setUser((prev) => ({
                    ...prev,
                    threatsBlockedCount: newRecord.risk === 'CRITICAL' || newRecord.risk === 'HIGH' ? prev.threatsBlockedCount + 1 : prev.threatsBlockedCount
                  }));
                }}
                onViewResultScreen={() => {
                  setActiveTab('dashboard');
                }}
                onLaunchCallProtection={(phone, claimed) => {
                  setActiveCallNumber(phone);
                  setActiveCallClaimed(claimed);
                  setActiveTab('call-protection');
                  showToast('Initiating Live Call Protection Session...', 'info');
                }}
              />
            )}

            {/* TAB 3: HISTORY VIEW */}
            {activeTab === 'history' && (
              <HistoryView
                records={records}
                onSelectRecord={(record) => {
                  setSelectedRecord(record);
                  if (record.score >= 80) {
                    setActiveTab('incidents');
                  }
                }}
                onExportAuditLog={handleExportAuditLog}
              />
            )}

            {/* TAB 4: INCIDENTS VIEW */}
            {activeTab === 'incidents' && (
              <AnalysisResultView
                record={selectedRecord || (records.length > 0 ? records[0] : undefined)}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onBlockCaller={() => handleOpenBlock(selectedRecord || records[0])}
                onReportFraud={() => handleOpenReport(selectedRecord || records[0])}
                onVerifyIndependently={() => handleOpenVerify(selectedRecord || records[0])}
                onVerifySafe={() => {
                  const recId = selectedRecord?.id || records[0]?.id;
                  if (recId) handleTakeAction(recId, 'Verified');
                  showToast('Record verified and marked Safe', 'success');
                }}
                onRejectThreat={() => {
                  const recId = selectedRecord?.id || records[0]?.id;
                  if (recId) handleTakeAction(recId, 'Rejected');
                  showToast('Record confirmed as fraudulent and Rejected', 'alert');
                }}
              />
            )}

            {/* TAB 5: CALL PROTECTION VIEW */}
            {activeTab === 'call-protection' && (
              <CallProtectionView
                initialPhoneNumber={activeCallNumber}
                initialClaimedIdentity={activeCallClaimed}
                isDemoMode={true}
                onEndCall={() => {
                  showToast('Inbound call terminated immediately by user', 'alert');
                  setActiveTab('dashboard');
                }}
                onBlockCaller={() => handleOpenBlock(selectedRecord || records[0])}
                onReportFraud={() => handleOpenReport(selectedRecord || records[0])}
                onVerifyIndependently={() => handleOpenVerify(selectedRecord || records[0])}
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

      {/* Mobile Mode Unified Bottom Navigation (6 Tabs) */}
      {isMobileMode && (
        <MobileBottomNav
          activeTab={
            mobileSubView === 'dashboard'
              ? 'home'
              : mobileSubView === 'new-analysis'
              ? 'analyze'
              : mobileSubView === 'history'
              ? 'history'
              : mobileSubView === 'result'
              ? 'alerts'
              : mobileSubView === 'call-protection'
              ? 'calls'
              : 'settings'
          }
          onSelectTab={(tabId) => {
            if (tabId === 'home' || tabId === 'dashboard') setMobileSubView('dashboard');
            else if (tabId === 'analyze') setMobileSubView('new-analysis');
            else if (tabId === 'history') setMobileSubView('history');
            else if (tabId === 'alerts' || tabId === 'incidents') setMobileSubView('result');
            else if (tabId === 'calls' || tabId === 'call-protection') setMobileSubView('call-protection');
            else if (tabId === 'settings') setMobileSubView('settings');
          }}
          alertCount={records.filter((r) => r.risk === 'CRITICAL' || r.risk === 'HIGH').length}
        />
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
      {selectedRecord && !isMobileMode && activeTab !== 'incidents' && (
        <AnalysisDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onTakeAction={handleTakeAction}
          onViewIncidentDossier={() => setActiveTab('incidents')}
          onVerifyIndependently={(rec) => handleOpenVerify(rec)}
          onBlockCaller={(rec) => handleOpenBlock(rec)}
          onReportFraud={(rec) => handleOpenReport(rec)}
        />
      )}

      {/* Dedicated Interactive Protection Action Modals */}
      {isVerifyModalOpen && (
        <IndependentVerifyModal
          callerNumber={modalTargetRecord?.identityDetails?.callerOrSender || '+1 (555) 932-8411'}
          onClose={() => setIsVerifyModalOpen(false)}
          onConfirmVerified={() => {
            if (modalTargetRecord) {
              handleTakeAction(modalTargetRecord.id, 'Verified');
            }
            showToast('Marked as Verified via official directory contact', 'success');
          }}
        />
      )}

      {isBlockModalOpen && (
        <BlockSenderModal
          senderIdentifier={modalTargetRecord?.identityDetails?.callerOrSender || '+1 (555) 932-8411'}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirmBlock={(sender, reason) => {
            if (modalTargetRecord) {
              handleTakeAction(modalTargetRecord.id, 'Blocked');
            }
            showToast(`Permanently blocked ${sender} across carrier gateways (${reason})`, 'success');
          }}
        />
      )}

      {isReportModalOpen && (
        <ReportFraudModal
          record={modalTargetRecord || undefined}
          onClose={() => setIsReportModalOpen(false)}
          onConfirmReport={(complaintRef) => {
            if (modalTargetRecord) {
              handleTakeAction(modalTargetRecord.id, 'Flagged');
            }
            showToast(`Evidence packet logged to National Cyber Crime Helpline (Ref: ${complaintRef})`, 'success');
          }}
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

      {/* Real-time Incoming Call Heads-up Intercept Banner */}
      {incomingCall && (
        <IncomingCallBanner
          call={incomingCall}
          onAcceptAndOpenShield={() => {
            callDetectionService.answerCall();
            setActiveCallNumber(incomingCall.phoneNumber);
            setActiveCallClaimed(incomingCall.claimedIdentity);
            if (isMobileMode) {
              setMobileSubView('call-protection');
            } else {
              setActiveTab('call-protection');
            }
            setIncomingCall(null);
          }}
          onDeclineCall={() => {
            callDetectionService.dismissIncomingCall();
            setIncomingCall(null);
            showToast('Incoming call declined by user', 'info');
          }}
        />
      )}

      {/* Telephony & Call Logs Permission Modal (Required before proceeding into application) */}
      {!hasCallPermission && (
        <CallPermissionModal
          onGrantPermission={(mode) => {
            localStorage.setItem('verity_call_logs_permission', mode);
            setHasCallPermission(true);
            showToast(
              mode === 'full' 
                ? '✓ Real-Time Call Screening & Log Access Granted' 
                : '✓ Running in Simulated Call Protection Sandbox',
              'success'
            );
          }}
        />
      )}

    </div>
  );
}
