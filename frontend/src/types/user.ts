export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phoneNumber: string;
  organization: string;
  plan: string;
  mfaEnabled: boolean;
  activeDevicesCount: number;
  threatsBlockedCount: number;
  lastLogin: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  carrierName?: string;
  carrierCircle?: string;
  carrierLineType?: string;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Visal J. K.',
  role: 'Protected Citizen / Personal & Family Account',
  email: 'visaljk07@gmail.com',
  phoneNumber: '+91 98401 24590',
  organization: 'Personal & Family Account (Free for Everyone)',
  plan: 'VERITY Free Citizen Shield (100% Free Lifetime)',
  mfaEnabled: true,
  activeDevicesCount: 2,
  threatsBlockedCount: 142,
  lastLogin: 'Today, 05:42 PM',
  isPhoneVerified: true,
  isEmailVerified: true,
  carrierName: 'Bharti Airtel 5G',
  carrierCircle: 'Tamil Nadu & Chennai Circle',
  carrierLineType: 'Mobile (5G VoLTE & VoWiFi Active)'
};
