import React, { useState } from 'react';
import { X, ShieldCheck, Smartphone, Mail, CheckCircle2, RefreshCw, KeyRound, Radio } from 'lucide-react';
import { lookupCarrierDetails } from '../utils/telecomLookup';

interface OtpVerificationModalProps {
  type: 'phone' | 'email';
  targetValue: string;
  onClose: () => void;
  onSuccess: (type: 'phone' | 'email') => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  type,
  targetValue,
  onClose,
  onSuccess
}) => {
  const [otp, setOtp] = useState<string>('7294');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(30);

  const carrier = type === 'phone' ? lookupCarrierDetails(targetValue) : null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(type);
      onClose();
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              {type === 'phone' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {type === 'phone' ? 'Verify Mobile Number' : 'Verify Email Address'}
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">OTP Security Check</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Info */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Sent OTP Code to:</span>
            <span className="font-mono text-cyan-300 font-bold">{targetValue}</span>
          </div>

          {/* SIM Provider / Network details for Phone */}
          {carrier && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
              <div className="flex items-center justify-between">
                <span>SIM Network:</span>
                <span className="text-emerald-400 font-bold">{carrier.operator}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Telecom Circle:</span>
                <span className="text-slate-300">{carrier.circle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Line Type:</span>
                <span className="text-cyan-400">{carrier.lineType}</span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 block font-medium">
              Enter 4 or 6-digit OTP Code:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="7294"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono text-base font-bold text-white tracking-widest focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono block text-center">
              (Demo OTP auto-filled: 7294)
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length < 4}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Activate Protection</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setResendCountdown(30)}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Didn't receive code? Resend OTP ({resendCountdown}s)
          </button>
        </div>
      </div>
    </div>
  );
};
