import React, { useState } from 'react';
import { 
  X, 
  PhoneOff, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Radio, 
  Trash2, 
  AlertTriangle,
  Server,
  Smartphone
} from 'lucide-react';
import { getUserSettings, addBlacklistedNumber, removeBlacklistedNumber } from '../utils/userSettings';

interface BlockSenderModalProps {
  senderIdentifier?: string;
  onClose: () => void;
  onConfirmBlock: (sender: string, reason: string) => void;
}

export const BlockSenderModal: React.FC<BlockSenderModalProps> = ({
  senderIdentifier = '+1 (555) 932-8411',
  onClose,
  onConfirmBlock
}) => {
  const [targetSender, setTargetSender] = useState<string>(senderIdentifier);
  const [selectedReason, setSelectedReason] = useState<string>('AI Voice Cloning / Neural Vocoder Impersonation');
  const [carrierEnforcement, setCarrierEnforcement] = useState<boolean>(true);
  const [deviceEnforcement, setDeviceEnforcement] = useState<boolean>(true);
  const [communitySync, setCommunitySync] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [blacklistedList, setBlacklistedList] = useState<string[]>(() => getUserSettings().blacklistedNumbers);

  const blockReasons = [
    'AI Voice Cloning / Neural Vocoder Impersonation',
    'False Authority / "Digital Arrest" Extortion',
    'Credential Harvesting / Spoofed Bank Domain',
    'Urgent Account Freeze / OTP Demand',
    'Unsolicited High-Pressure Scammer'
  ];

  const handleExecuteBlock = () => {
    if (!targetSender.trim()) return;
    addBlacklistedNumber(targetSender.trim());
    setIsSuccess(true);
    onConfirmBlock(targetSender.trim(), selectedReason);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleRemoveFromBlacklist = (item: string) => {
    const updated = removeBlacklistedNumber(item);
    setBlacklistedList(updated.blacklistedNumbers);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950 border border-red-500/40 text-red-400 shadow-md">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Carrier & SIM Blacklist Manager
              </h3>
              <span className="text-[10px] font-mono text-red-400">
                Network-Level Inbound Threat Mitigation
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-mono">Carrier Blacklist Activated</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto font-sans">
              <span className="font-mono text-cyan-300 font-bold">{targetSender}</span> has been permanently blocked across your device and telecom gateway.
            </p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
            
            {/* Target Sender Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300">
                Target Caller / Sender Identity
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetSender}
                  onChange={(e) => setTargetSender(e.target.value)}
                  placeholder="Enter phone number or domain..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300">
                Blocking Reason & Threat Classification
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-red-500 font-sans cursor-pointer"
              >
                {blockReasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Enforcement Layers */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 block">
                Active Enforcement Layers
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Carrier SIP Gateway Intercept</span>
                      <span className="text-[10px] text-slate-400">Auto-reject incoming VoIP calls before phone rings</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={carrierEnforcement}
                    onChange={(e) => setCarrierEnforcement(e.target.checked)}
                    className="w-4 h-4 accent-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Local Device & SMS Quarantine</span>
                      <span className="text-[10px] text-slate-400">Discard all incoming SMS messages and OTP requests</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={deviceEnforcement}
                    onChange={(e) => setDeviceEnforcement(e.target.checked)}
                    className="w-4 h-4 accent-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Verity Threat Intel Community Sync</span>
                      <span className="text-[10px] text-slate-400">Broadcast hash to protect family & community members</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={communitySync}
                    onChange={(e) => setCommunitySync(e.target.checked)}
                    className="w-4 h-4 accent-red-500"
                  />
                </label>
              </div>
            </div>

            {/* Currently Active Blacklist Entries */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  Currently Blocked Senders ({blacklistedList.length})
                </span>
                <span className="text-[10px] text-slate-500">Live Registry</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                {blacklistedList.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-1">No numbers currently blacklisted</p>
                ) : (
                  blacklistedList.map((num) => (
                    <div key={num} className="flex items-center justify-between text-[11px] font-mono text-slate-300 py-0.5 px-1 hover:bg-slate-900 rounded">
                      <span className="truncate max-w-[280px]">{num}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromBlacklist(num)}
                        title="Unblock number"
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExecuteBlock}
              disabled={!targetSender.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Confirm Block & Blacklist</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
