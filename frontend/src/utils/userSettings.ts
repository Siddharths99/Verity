// Verity User Settings Persistence & Blacklist Registry Management
export interface UserSettings {
  attestationLevel: 'level-a' | 'level-b' | 'level-c';
  autoBlockThreshold: number; // 50 to 95
  vocoderSensitivity: 'strict' | 'balanced' | 'relaxed';
  nlpUrgencyFilter: boolean;
  quarantineMfaDemands: boolean;
  familyScamAlerts: boolean;
  familyPhone: string;
  cyberCrimeHelplineReport: boolean;
  soundAlerts: boolean;
  autoExportPdf: boolean;
  blacklistedNumbers: string[];
  trustedContacts: string[];
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  attestationLevel: 'level-a',
  autoBlockThreshold: 85,
  vocoderSensitivity: 'strict',
  nlpUrgencyFilter: true,
  quarantineMfaDemands: true,
  familyScamAlerts: true,
  familyPhone: '+91 98401 24590',
  cyberCrimeHelplineReport: true,
  soundAlerts: true,
  autoExportPdf: false,
  blacklistedNumbers: [
    '+1 (555) 932-8411',
    '+1 (800) 492-1102',
    '+1 (888) 293-1002',
    'auth-security-chase.corp-verify.net'
  ],
  trustedContacts: [
    '+91 98210 93821 (Airtel)',
    'accountspayable@acme-corp.net'
  ]
};

const STORAGE_KEY = 'verity_user_settings_v1';

export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_USER_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed,
      blacklistedNumbers: Array.isArray(parsed.blacklistedNumbers)
        ? parsed.blacklistedNumbers
        : DEFAULT_USER_SETTINGS.blacklistedNumbers,
      trustedContacts: Array.isArray(parsed.trustedContacts)
        ? parsed.trustedContacts
        : DEFAULT_USER_SETTINGS.trustedContacts
    };
  } catch (err) {
    console.error('Failed to load user settings from localStorage:', err);
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save user settings to localStorage:', err);
  }
}

export function addBlacklistedNumber(item: string): UserSettings {
  const settings = getUserSettings();
  const trimmed = item.trim();
  if (trimmed && !settings.blacklistedNumbers.includes(trimmed)) {
    settings.blacklistedNumbers = [trimmed, ...settings.blacklistedNumbers];
    saveUserSettings(settings);
  }
  return settings;
}

export function removeBlacklistedNumber(item: string): UserSettings {
  const settings = getUserSettings();
  settings.blacklistedNumbers = settings.blacklistedNumbers.filter(
    (n) => n.trim().toLowerCase() !== item.trim().toLowerCase()
  );
  saveUserSettings(settings);
  return settings;
}

export function isBlacklisted(identifier: string): boolean {
  const settings = getUserSettings();
  const cleanId = identifier.trim().toLowerCase();
  return settings.blacklistedNumbers.some(
    (n) => cleanId.includes(n.trim().toLowerCase()) || n.trim().toLowerCase().includes(cleanId)
  );
}
