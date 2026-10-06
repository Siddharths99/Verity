import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES, CountryCodeItem, parsePhoneNumber } from '../utils/countryCodes';

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullNumber: string, country: CountryCodeItem, localNumber: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  placeholder = '98401 24590',
  className = '',
  autoFocus = false
}) => {
  const initial = parsePhoneNumber(value || '+91');
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem>(initial.country);
  const [localNumber, setLocalNumber] = useState<string>(initial.localNumber);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync state if value prop changes externally
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
      setLocalNumber(parsed.localNumber);
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCountrySelect = (country: CountryCodeItem) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const full = `${country.dialCode} ${localNumber}`.trim();
    onChange(full, country, localNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalNumber(raw);
    const full = `${selectedCountry.dialCode} ${raw}`.trim();
    onChange(full, selectedCountry, raw);
  };

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500 transition-colors overflow-hidden">
        
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border-r border-slate-800 transition-colors shrink-0 cursor-pointer select-none"
          title="Select Country & Dial Code"
        >
          <span className="text-lg leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-mono font-semibold text-cyan-300">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
        </button>

        {/* Local Phone Number Input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder || selectedCountry.example}
          autoFocus={autoFocus}
          className="w-full px-3 py-2.5 text-xs bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-mono tracking-wide"
        />
      </div>

      {/* Country Dropdown Menu with Flags & Search */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/50 text-cyan-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base leading-none shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-cyan-400/90 font-medium">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
