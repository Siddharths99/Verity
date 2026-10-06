export interface CarrierInfo {
  operator: string;
  circle: string;
  lineType: string;
  country: string;
  flag: string;
  signalBand: string;
  isRegistered: boolean;
}

/**
 * Intelligent telecom carrier & SIM provider lookup simulator
 * Identifies network provider, telecom circle/region, and line type
 * based on phone number prefix and international formatting.
 */
export function lookupCarrierDetails(phoneNumber: string, countryCode?: string): CarrierInfo {
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

  // If India (+91)
  if (countryCode === '+91' || cleanNumber.startsWith('91') || (cleanNumber.length === 10 && ['6', '7', '8', '9'].includes(cleanNumber[0]))) {
    const localPart = cleanNumber.startsWith('91') ? cleanNumber.slice(2) : cleanNumber;
    const prefix2 = localPart.slice(0, 2);
    const prefix3 = localPart.slice(0, 3);

    let operator = 'Reliance Jio 5G';
    let circle = 'National Telecom Circle';

    if (['98', '99', '97', '96', '95', '91', '81', '70'].includes(prefix2)) {
      if (['981', '982', '983', '984', '985', '986', '987', '988', '989'].includes(prefix3)) {
        operator = 'Bharti Airtel 5G';
      } else if (['971', '972', '973', '974', '975', '976'].includes(prefix3)) {
        operator = 'Vodafone Idea (Vi)';
      } else {
        operator = 'Reliance Jio 5G';
      }
    } else if (['94', '93', '84', '85'].includes(prefix2)) {
      operator = 'BSNL Mobile (Bharat Sanchar Nigam Ltd)';
    } else if (['63', '62', '79', '89', '78'].includes(prefix2)) {
      operator = 'Reliance Jio 5G';
    } else if (['80', '82', '83', '88'].includes(prefix2)) {
      operator = 'Vodafone Idea (Vi)';
    } else {
      operator = 'Bharti Airtel 5G';
    }

    if (['9840', '9841', '9444', '9884', '7358'].some(p => localPart.startsWith(p))) {
      circle = 'Tamil Nadu & Chennai Circle';
    } else if (['9820', '9821', '9819', '9833', '9867'].some(p => localPart.startsWith(p))) {
      circle = 'Mumbai / Maharashtra Circle';
    } else if (['9811', '9810', '9871', '9899', '9818'].some(p => localPart.startsWith(p))) {
      circle = 'Delhi NCR Circle';
    } else if (['9845', '9886', '9844', '9448'].some(p => localPart.startsWith(p))) {
      circle = 'Karnataka & Bengaluru Circle';
    } else if (['9830', '9831', '9832', '9433'].some(p => localPart.startsWith(p))) {
      circle = 'West Bengal & Kolkata Circle';
    } else if (['9824', '9825', '9898', '9426'].some(p => localPart.startsWith(p))) {
      circle = 'Gujarat Circle';
    } else {
      circle = 'All-India Primary Telecom Circle';
    }

    return {
      operator,
      circle,
      lineType: 'Mobile (4G/5G VoLTE & VoWiFi)',
      country: 'India',
      flag: '🇮🇳',
      signalBand: 'Band 78 (3500 MHz) / Band 28 (700 MHz)',
      isRegistered: true
    };
  }

  // United States & Canada (+1)
  if (countryCode === '+1' || cleanNumber.startsWith('1')) {
    const isCanada = ['416', '647', '514', '604', '403'].some(p => cleanNumber.includes(p));
    return {
      operator: isCanada ? 'Rogers Wireless 5G' : 'Verizon Wireless / AT&T 5G',
      circle: isCanada ? 'Ontario / Canada Network' : 'North America Carrier Network',
      lineType: 'Mobile (5G Ultra Wideband & VoLTE)',
      country: isCanada ? 'Canada' : 'United States',
      flag: isCanada ? '🇨🇦' : '🇺🇸',
      signalBand: 'C-Band (3.7 GHz) & mmWave',
      isRegistered: true
    };
  }

  // United Kingdom (+44)
  if (countryCode === '+44' || cleanNumber.startsWith('44')) {
    return {
      operator: 'EE / Vodafone UK 5G',
      circle: 'Greater London & UK Telecom Region',
      lineType: 'Mobile (5G Standalone & VoLTE)',
      country: 'United Kingdom',
      flag: '🇬🇧',
      signalBand: 'Band 7 (2600 MHz) & Band 78 (3.5 GHz)',
      isRegistered: true
    };
  }

  // UAE (+971)
  if (countryCode === '+971' || cleanNumber.startsWith('971')) {
    return {
      operator: 'e& (Etisalat) / du Telecom',
      circle: 'Dubai & Abu Dhabi Telecom Circle',
      lineType: 'Mobile (5G Advanced & VoWiFi)',
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      signalBand: 'Band 78 (3.5 GHz) Ultra-speed',
      isRegistered: true
    };
  }

  // Singapore (+65)
  if (countryCode === '+65' || cleanNumber.startsWith('65')) {
    return {
      operator: 'Singtel 5G / StarHub',
      circle: 'Singapore National Cellular Grid',
      lineType: 'Mobile (5G Standalone)',
      country: 'Singapore',
      flag: '🇸🇬',
      signalBand: 'Band 78 (3.5 GHz) / 2.1 GHz',
      isRegistered: true
    };
  }

  // Australia (+61)
  if (countryCode === '+61' || cleanNumber.startsWith('61')) {
    return {
      operator: 'Telstra / Optus 5G',
      circle: 'NSW / Victoria Cellular Grid',
      lineType: 'Mobile (5G VoLTE)',
      country: 'Australia',
      flag: '🇦🇺',
      signalBand: 'Band 78 (3.6 GHz) & 850 MHz',
      isRegistered: true
    };
  }

  // Germany (+49)
  if (countryCode === '+49' || cleanNumber.startsWith('49')) {
    return {
      operator: 'Deutsche Telekom 5G',
      circle: 'Bundesnetzagentur Grid (Germany)',
      lineType: 'Mobile (5G VoLTE)',
      country: 'Germany',
      flag: '🇩🇪',
      signalBand: 'Band 78 (3.6 GHz)',
      isRegistered: true
    };
  }

  // Default international GSM fallback
  return {
    operator: 'International Cellular Carrier',
    circle: 'Global Telecom Network',
    lineType: 'Cellular Line (VoLTE)',
    country: 'International',
    flag: '🌐',
    signalBand: 'Standard LTE/5G Multi-Band',
    isRegistered: true
  };
}
