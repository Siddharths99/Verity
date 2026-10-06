import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Radio, Sparkles } from 'lucide-react';
import { lookupCarrierDetails } from '../utils/telecomLookup';
import { CountryPhoneInput } from './CountryPhoneInput';
import { CountryCodeItem } from '../utils/countryCodes';

interface ChangeNumberModalProps {
  currentNumber: string;
  onClose: () => void;
  onSuccess: (newNumber: string) => void;
}

export const ChangeNumberModal: React.FC<ChangeNumberModalProps> = ({
  currentNumber,
  onClose,
  onSuccess
}) => {
  const [newNumber, setNewNumber] = useState('+91 ');
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Live auto-detected carrier information
  const detectedCarrier = newNumber.replace(/\D/g, '').length >= 4 
    ? lookupCarrierDetails(newNumber, selectedCountry?.dialCode) 
    : null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = newNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError(null);
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep('verify');
    }, 500);
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the 6-digit SMS verification code sent to your phone.');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSuccess(newNumber);
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Update Protected Phone Number
              </h3>
              <p className="text-xs text-slate-400">
                Live SIM & Scam Protection Routing
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

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Current Number Display */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 text-[11px] block">Current Protected Number</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-cyan-300 font-bold">{currentNumber}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Protection Active
                </span>
              </div>
            </div>

            {/* New Number with Country Code and Flag Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  New Phone Number
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Select country flag & code
                </span>
              </div>
              
              <CountryPhoneInput
                value={newNumber}
                onChange={(full, country) => {
                  setNewNumber(full);
                  setSelectedCountry(country);
                }}
                autoFocus
              />

              <span className="text-[11px] text-slate-500 block">
                Incoming call spam detection and fake voice shield will be enabled for this line.
              </span>
            </div>

            {/* Automatic Network / SIM Provider Detection */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  SIM & Network Provider
                </span>
                <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto-Detected
                </span>
              </div>
              
              {detectedCarrier ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>{detectedCarrier.flag}</span>
                      <span>{detectedCarrier.operator}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {detectedCarrier.lineType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Region: {detectedCarrier.circle}</span>
                    <span className="text-cyan-400/90 font-mono text-[10px]">{detectedCarrier.country}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Select your country flag and enter phone number to identify your SIM network provider.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send SMS OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmOtp} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 space-y-1">
              <span className="font-semibold block">SMS OTP Sent</span>
              <p className="text-[11px] text-slate-300">
                A 6-digit confirmation code was sent to <strong className="font-mono text-cyan-200">{newNumber}</strong>.
              </p>
            </div>

            {/* Code Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Enter 6-Digit SMS Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="482910"
                className="w-full px-3.5 py-2.5 text-center text-lg tracking-widest bg-slate-950/80 border border-slate-800 rounded-lg text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono font-bold"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Back to edit number
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSending ? 'Verifying...' : 'Verify & Enable Protection'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
