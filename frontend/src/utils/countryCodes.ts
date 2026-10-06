export interface CountryCodeItem {
  code: string;       // e.g. "IN"
  name: string;       // e.g. "India"
  dialCode: string;   // e.g. "+91"
  flag: string;       // Unicode flag e.g. "🇮🇳"
  example: string;    // e.g. "98401 24590"
  formatHint: string; // e.g. "10 digits"
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', example: '98401 24590', formatHint: '10 digits' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', example: '(555) 019-2834', formatHint: '10 digits' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', example: '7911 123456', formatHint: '10-11 digits' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', example: '(416) 555-0199', formatHint: '10 digits' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', example: '50 123 4567', formatHint: '9 digits' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', example: '50 123 4567', formatHint: '9 digits' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', example: '8123 4567', formatHint: '8 digits' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', example: '412 345 678', formatHint: '9 digits' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', example: '151 23456789', formatHint: '10-11 digits' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', example: '6 12 34 56 78', formatHint: '9 digits' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', example: '90 1234 5678', formatHint: '10 digits' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', example: '138 0013 8000', formatHint: '11 digits' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', example: '(11) 98765-4321', formatHint: '11 digits' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', example: '55 1234 5678', formatHint: '10 digits' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', example: '82 123 4567', formatHint: '9 digits' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', example: '802 123 4567', formatHint: '10 digits' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', example: '1712 345678', formatHint: '10 digits' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', example: '300 1234567', formatHint: '10 digits' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', example: '77 123 4567', formatHint: '9 digits' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', example: '984 1234567', formatHint: '10 digits' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', example: '812 3456 7890', formatHint: '10-12 digits' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', example: '12 345 6789', formatHint: '9-10 digits' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', example: '917 123 4567', formatHint: '10 digits' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', example: '81 234 5678', formatHint: '9 digits' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', example: '91 234 5678', formatHint: '9-10 digits' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', example: '10 1234 5678', formatHint: '10 digits' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', example: '9123 4567', formatHint: '8 digits' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', example: '912 345 678', formatHint: '9 digits' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', example: '3312 3456', formatHint: '8 digits' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', example: '9123 4567', formatHint: '8 digits' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', example: '9123 4567', formatHint: '8 digits' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', example: '10 1234 5678', formatHint: '10 digits' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', example: '712 345678', formatHint: '9 digits' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', example: '24 123 4567', formatHint: '9 digits' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', example: '21 123 4567', formatHint: '8-10 digits' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', example: '85 123 4567', formatHint: '9 digits' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', example: '320 123 4567', formatHint: '10 digits' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', example: '612 34 56 78', formatHint: '9 digits' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', example: '6 12345678', formatHint: '9 digits' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', example: '78 123 45 67', formatHint: '9 digits' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', example: '70 123 45 67', formatHint: '9 digits' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', example: '412 34 567', formatHint: '8 digits' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', example: '21 23 45 67', formatHint: '8 digits' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', example: '41 2345678', formatHint: '9-10 digits' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', example: '512 345 678', formatHint: '9 digits' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', example: '912 345 678', formatHint: '9 digits' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', example: '691 234 5678', formatHint: '10 digits' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', example: '532 123 4567', formatHint: '10 digits' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', example: '50 123 4567', formatHint: '9 digits' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', example: '11 1234 5678', formatHint: '10 digits' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', example: '300 123 4567', formatHint: '10 digits' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', example: '9 1234 5678', formatHint: '9 digits' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', example: '912 345-67-89', formatHint: '10 digits' }
];

export function findCountryByDialCode(dialCode: string): CountryCodeItem {
  return COUNTRY_CODES.find(c => c.dialCode === dialCode) || COUNTRY_CODES[0];
}

export function parsePhoneNumber(fullPhone: string): { country: CountryCodeItem; localNumber: string } {
  const trimmed = fullPhone.trim();
  for (const country of COUNTRY_CODES) {
    if (trimmed.startsWith(country.dialCode)) {
      const rest = trimmed.slice(country.dialCode.length).trim();
      return { country, localNumber: rest };
    }
  }
  // Default to India (+91)
  return {
    country: COUNTRY_CODES[0],
    localNumber: trimmed.replace(/^\+/, '')
  };
}
