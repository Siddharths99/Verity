import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Building, 
  Search, 
  Copy, 
  Check, 
  PhoneForwarded,
  CheckCircle2
} from 'lucide-react';

interface IndependentVerifyModalProps {
  callerNumber?: string;
  onClose: () => void;
  onConfirmVerified: () => void;
}

export const IndependentVerifyModal: React.FC<IndependentVerifyModalProps> = ({
  callerNumber = '+91 98401 24590',
  onClose,
  onConfirmVerified
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const safeDirectories = [
    {
      name: 'National Cyber Crime Helpline (Govt of India)',
      number: '1930',
      category: 'Govt',
      timing: '24x7 Toll-Free Emergency',
      desc: 'Immediate reporting of unauthorized bank transfers, digital arrests, or scam calls.'
    },
    {
      name: 'RBI Sachet Fraud Portal & Telecom DND',
      number: '1909',
      category: 'Govt',
      timing: 'Toll-Free SMS / Voice',
      desc: 'Forward fake SMS or report unregistered telemarketers directly.'
    },
    {
      name: 'State Bank of India (SBI) Fraud Desk',
      number: '1800 1234',
      category: 'Banks',
      timing: '24x7 Verified Toll-Free',
      desc: 'Instant freezing of debit card / net banking access and staff verification.'
    },
    {
      name: 'HDFC Bank Scam Hotline',
      number: '1800 1600',
      category: 'Banks',
      timing: '24x7 Priority Support',
      desc: 'Official direct line to verify genuine bank officials and dispute transactions.'
    },
    {
      name: 'ICICI Bank Fraud Reporting',
      number: '1800 1080',
      category: 'Banks',
      timing: '24x7 Direct Gateway',
      desc: 'Direct authentication of bank executive credentials and account safety.'
    },
    {
      name: 'Axis Bank Emergency Helpline',
      number: '1860 419 5555',
      category: 'Banks',
      timing: '24x7 Verified Branch Line',
      desc: 'Authenticate requests for loan verification, KYC updates, or credentials.'
    },
    {
      name: 'Telecom Regulatory Authority (TRAI) DND',
      number: '1909',
      category: 'Telecom',
      timing: '24x7 Auto-Attendant',
      desc: 'Verify if caller is a registered telemarketer or fraudulent VoIP number.'
    }
  ];

  const filteredDirectories = safeDirectories.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleConfirm = () => {
    setIsSuccess(true);
    onConfirmVerified();
    setTimeout(() => {
      onClose();
    }, 1200);
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
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Independent Verification Protocol
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                Official Directory & Out-Of-Band Authentication
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
            <h4 className="text-lg font-bold text-white font-mono">Marked as Officially Verified</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto font-sans">
              The interaction has been validated via authentic out-of-band directory lookup.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-xs">
            
            {/* Warning Banner */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Zero-Trust Rule: Never redial the caller ID shown on your screen!
              </span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                Scammers easily spoof numbers. Hang up and dial the official verified helpline number below to independently confirm any claimed urgent emergency or bank hold.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bank, helpline, or organization..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['All', 'Govt', 'Banks', 'Telecom'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Directory Cards */}
            <div className="space-y-2">
              {filteredDirectories.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No directories found matching your search</p>
              ) : (
                filteredDirectories.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200">{item.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                        {item.timing}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-cyan-400 font-bold text-sm tracking-wide">
                        {item.number}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.number)}
                          title="Copy phone number"
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-800"
                        >
                          {copiedNumber === item.number ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{copiedNumber === item.number ? 'Copied' : 'Copy'}</span>
                        </button>

                        <a
                          href={`tel:${item.number.split('/')[0].trim().replace(/\s+/g, '')}`}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mark Verified via Official Directory</span>
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
