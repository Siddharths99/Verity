export type ModalityType = 'call' | 'voice' | 'message' | 'media' | 'url';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionType = 'Verify' | 'Block' | 'Review' | 'Safe' | 'Blocked';

export interface ForensicDetails {
  verdict: 'REAL' | 'AI_GENERATED' | 'MANIPULATED' | 'UNCERTAIN' | 'SUSPICIOUS' | 'SAFE' | 'SPAM' | 'MALICIOUS' | 'UNKNOWN';
  confidence: number;
  threatLevel: RiskLevel;
  manipulationType: string;
  evidence: string[];
  recommendedAction: string;
}

export interface AnalysisRecord {
  id: string;
  time: string;
  timestamp: number;
  type: ModalityType;
  subject: string;
  risk: RiskLevel;
  score: number; // 0 - 100
  action: ActionType;
  forensicDetails?: ForensicDetails;
  // Multimodal Correlation Breakdown
  identityDetails: {
    callerOrSender: string;
    verifiedIdentity: string | null;
    identityTrustScore: number; // 0 - 100
    spoofingIndicators: string[];
    isKnownContact: boolean;
    stirShakenStatus?: 'PASSED' | 'FAILED' | 'UNVERIFIED';
  };
  communicationDetails: {
    medium: string;
    syntheticProbability: number; // 0 - 100
    linguisticUrgency: 'Normal' | 'Elevated' | 'Extreme Pressure';
    coercionTactics: string[];
    syntheticMarkers?: string[];
  };
  requestedActionDetails: {
    actionType: string; // e.g. "Wire Transfer $45,000", "2FA Passcode Input", "Credential Login"
    sensitivityLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    financialRiskUsd?: number;
    destinationRisk: 'Legitimate' | 'Unverified Domain' | 'High-Risk Account' | 'Known Mules';
  };
  veritySummary: string;
}

export interface QuickAnalysisCategory {
  id: ModalityType;
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  badge: string;
  iconName: 'PhoneCall' | 'Mic' | 'MessageSquareText' | 'Film' | 'Link2';
  analyzers: string[];
}

export interface TrustOverviewMetric {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  unit?: string;
  status: 'optimal' | 'warning' | 'critical' | 'nominal';
  statusText: string;
  delta: string;
  deltaPositive: boolean;
  description: string;
  breakdown: {
    name: string;
    value: string | number;
  }[];
}
