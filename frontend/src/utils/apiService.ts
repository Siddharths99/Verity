import { AnalysisRecord, ModalityType, RiskLevel, ActionType } from '../types';

// Use env var for the API base URL — configure VITE_API_BASE_URL in .env for each environment.
const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_BASE = RAW_API_BASE + '/api/v1';

export interface VerityEvaluation {
  who_trusted: boolean;
  what_communicated: string;
  requested_action: string;
  overall_trust: string;
}

export interface VeritySignalBreakdown {
  identity_score: number;
  intent_pressure_score: number;
  media_synthetic_score: number;
  link_reputation_score: number;
}

export interface VerityResult {
  scan_id: string;
  timestamp: string;
  modality: string;
  risk_score: number;
  risk_level: RiskLevel;
  evaluation: VerityEvaluation;
  signal_breakdown: VeritySignalBreakdown;
  flags: string[];
  evidence: string[];
  recommended_actions: string[];
  raw_telemetry?: Record<string, any>;
  verdict?: 'REAL' | 'AI_GENERATED' | 'MANIPULATED' | 'UNCERTAIN';
  confidence?: number;
  threat_level?: RiskLevel;
  manipulation_type?: string;
}

export interface IncidentSummaryResponse {
  id: string;
  created_at: string;
  modality: string;
  sender_info?: string;
  input_summary?: string;
  risk_score: number;
  risk_level: RiskLevel;
  flags: string[];
  feedback?: string;
}

export interface IncidentDetailResponse extends IncidentSummaryResponse {
  who_trusted: boolean;
  what_communicated?: string;
  requested_action?: string;
  overall_trust: string;
  signal_breakdown?: Record<string, number>;
  evidence: string[];
  recommended_actions: string[];
  notes?: string;
}

export function mapBackendIncidentToAnalysisRecord(incident: IncidentDetailResponse): AnalysisRecord {
  const modalityUpper = (incident.modality || '').toUpperCase();
  let modality: ModalityType = 'call';
  if (modalityUpper === 'AUDIO') modality = 'voice';
  else if (modalityUpper === 'TEXT') modality = 'message';
  else if (modalityUpper === 'IMAGE' || modalityUpper === 'VIDEO') modality = 'media';
  else if (modalityUpper === 'URL') modality = 'url';
  else if (modalityUpper === 'MULTIMODAL') {
    const sum = (incident.input_summary || '').toLowerCase();
    if (sum.includes('video') || sum.includes('image')) modality = 'media';
    else if (sum.includes('audio') || sum.includes('voice')) modality = 'voice';
    else if (sum.includes('link') || sum.includes('url')) modality = 'url';
    else if (sum.includes('sms') || sum.includes('message')) modality = 'message';
    else modality = 'call';
  }

  const score = Math.round(incident.risk_score);
  let action: ActionType = 'Safe';
  let risk: RiskLevel = incident.risk_level;

  if (incident.feedback === 'CONFIRMED_SCAM') {
    action = 'Rejected';
    risk = 'CRITICAL';
  } else if (incident.feedback === 'CONFIRMED_SAFE' || incident.feedback === 'FALSE_ALARM') {
    action = 'Verified';
    risk = 'LOW';
  } else if (incident.feedback === 'USER_ACTION') {
    action = 'Verified';
  } else if (incident.feedback === 'BLOCKED') {
    action = 'Blocked';
    risk = 'CRITICAL';
  } else if (incident.feedback === 'QUARANTINED') {
    action = 'Quarantined';
    risk = 'CRITICAL';
  } else {
    if (incident.risk_level === 'CRITICAL') action = 'Block';
    else if (incident.risk_level === 'HIGH') action = 'Verify';
    else if (incident.risk_level === 'MEDIUM') action = 'Review';
    else action = 'Safe';
  }

  const rawCreated = (incident.created_at || '').replace(' ', 'T');
  const isoString = rawCreated.endsWith('Z') || rawCreated.includes('+') ? rawCreated : rawCreated + 'Z';
  const parsedTime = new Date(isoString).getTime();
  const validTimestamp = !isNaN(parsedTime) ? parsedTime : Date.now();
  const dateObj = new Date(validTimestamp);
  const now = new Date();
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60)));
  let timeStr = 'Just now';
  if (diffMinutes > 1440) {
    timeStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else if (diffMinutes > 60) {
    timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffMinutes >= 1) {
    timeStr = `${diffMinutes}m ago`;
  }

  let subject = incident.input_summary || `${modality.toUpperCase()} Forensics Scan`;
  if (subject.length > 60) {
    subject = subject.slice(0, 57) + '...';
  }
  if (incident.input_summary?.startsWith('File: ')) {
    const fileNameMatch = incident.input_summary.match(/File:\s*([^,]+)/);
    if (fileNameMatch) {
      subject = `Media Forensics: ${fileNameMatch[1].trim()}`;
    }
  } else if (incident.input_summary?.startsWith('Transcript: ')) {
    subject = `Voice Analysis: ${incident.sender_info || '+91 Telemetry'}`;
  }

  const flags = Array.isArray(incident.flags) ? incident.flags : [];
  const evidence = Array.isArray(incident.evidence) ? incident.evidence : [];

  let verdict: 'REAL' | 'AI_GENERATED' | 'MANIPULATED' | 'UNCERTAIN' | 'SUSPICIOUS' | 'SAFE' | 'SPAM' | 'MALICIOUS' | 'UNKNOWN' = 'SAFE';
  if (risk === 'CRITICAL' || risk === 'HIGH') {
    verdict = modality === 'media' ? 'AI_GENERATED' : modality === 'url' ? 'MALICIOUS' : 'SUSPICIOUS';
  } else if (risk === 'MEDIUM') {
    verdict = 'UNCERTAIN';
  } else {
    verdict = modality === 'url' ? 'SAFE' : 'REAL';
  }

  const forensicDetails = {
    verdict,
    confidence: Math.min(0.99, Math.max(0.65, score / 100)),
    threatLevel: risk,
    manipulationType: flags[0] || (risk === 'LOW' ? 'Authentic' : 'Suspicious Indicator'),
    evidence: evidence.length > 0 ? evidence : [incident.what_communicated || 'Evaluated by multimodal model.'],
    recommendedAction: incident.recommended_actions?.[0] || 'Verify independently.'
  };

  return {
    id: incident.id,
    time: timeStr,
    timestamp: dateObj.getTime() || Date.now(),
    type: modality,
    subject: subject,
    risk: risk,
    score: score,
    action: action,
    forensicDetails: forensicDetails,
    identityDetails: {
      callerOrSender: incident.sender_info || 'Unknown Origin',
      verifiedIdentity: incident.who_trusted ? (incident.sender_info || null) : null,
      identityTrustScore: Math.round(100 - (incident.signal_breakdown?.identity_score || 0)),
      spoofingIndicators: flags.filter((f: string) => f.includes('SPOOF') || f.includes('CARRIER') || f.includes('ROUTING') || f.includes('IMPERSONATION')),
      isKnownContact: !!incident.who_trusted,
      stirShakenStatus: modality === 'call' ? (incident.who_trusted ? 'PASSED' : 'FAILED') : undefined
    },
    communicationDetails: {
      medium: `${modalityUpper} Forensic Stream`,
      syntheticProbability: Math.round(incident.signal_breakdown?.media_synthetic_score ?? (score > 60 ? score : 5)),
      linguisticUrgency: (incident.signal_breakdown?.intent_pressure_score || 0) >= 70 ? 'Extreme Pressure' : 'Normal',
      coercionTactics: evidence,
      syntheticMarkers: flags.filter((f: string) => f.includes('SYNTHETIC') || f.includes('ARTIFACT') || f.includes('VOICE'))
    },
    requestedActionDetails: {
      actionType: incident.requested_action || 'Inspect Interaction',
      sensitivityLevel: risk === 'CRITICAL' ? 'Critical' : risk === 'HIGH' ? 'High' : risk === 'MEDIUM' ? 'Moderate' : 'Low',
      financialRiskUsd: score >= 80 ? 25000 : 0,
      destinationRisk: score >= 80 ? 'High-Risk Account' : 'Legitimate'
    },
    veritySummary: evidence.slice(0, 2).join(' ') || incident.what_communicated || incident.input_summary || 'Evaluated interaction.'
  };
}

export interface DashboardStatsResponse {
  total_scans: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  average_risk_score: number;
  top_flags: Record<string, number>;
  scans_by_modality: Record<string, number>;
}

/**
 * Converts a backend VerityResult into the frontend AnalysisRecord structure
 */
export function mapBackendResultToAnalysisRecord(
  result: VerityResult,
  fallbackInputs: {
    modality: ModalityType;
    sender?: string;
    medium?: string;
    subject?: string;
  }
): AnalysisRecord {
  const score = Math.round(result.risk_score);
  let action: ActionType = 'Safe';
  if (result.risk_level === 'CRITICAL') action = 'Block';
  else if (result.risk_level === 'HIGH') action = 'Verify';
  else if (result.risk_level === 'MEDIUM') action = 'Review';

  const rawVerdict = result.verdict || result.raw_telemetry?.verdict;
  const rawConfidence = result.confidence ?? result.raw_telemetry?.confidence;
  const rawThreatLevel = result.threat_level || result.raw_telemetry?.threat_level || result.risk_level;
  const rawManipulationType = result.manipulation_type || result.raw_telemetry?.manipulation_type;
  const rawRecommendedAction = (result.recommended_actions && result.recommended_actions[0]) || result.raw_telemetry?.recommended_action;

  let forensicDetails;
  if (fallbackInputs.modality === 'media' || fallbackInputs.modality === 'voice' || fallbackInputs.modality === 'url' || rawVerdict) {
    const validVerdicts = ['REAL', 'AI_GENERATED', 'MANIPULATED', 'UNCERTAIN', 'SUSPICIOUS', 'SAFE', 'SPAM', 'MALICIOUS', 'UNKNOWN'] as const;
    const finalVerdict = (validVerdicts.includes(rawVerdict as any)
      ? rawVerdict
      : (result.risk_level === 'LOW'
          ? (fallbackInputs.modality === 'url' ? 'SAFE' : 'REAL')
          : result.risk_level === 'MEDIUM'
          ? (fallbackInputs.modality === 'url' ? 'SUSPICIOUS' : 'UNCERTAIN')
          : (fallbackInputs.modality === 'url' ? 'MALICIOUS' : 'AI_GENERATED'))) as any;

    forensicDetails = {
      verdict: finalVerdict,
      confidence: typeof rawConfidence === 'number' ? rawConfidence : 0.85,
      threatLevel: (rawThreatLevel as RiskLevel) || result.risk_level,
      manipulationType: rawManipulationType || (finalVerdict === 'REAL' ? 'None (Authentic Voice/Capture)' : finalVerdict === 'SAFE' ? 'Legitimate Domain' : finalVerdict === 'UNCERTAIN' || finalVerdict === 'UNKNOWN' ? 'Inconclusive' : 'Suspicious / Synthetic Indicator'),
      evidence: result.evidence && result.evidence.length > 0 ? result.evidence : [result.evaluation.what_communicated],
      recommendedAction: rawRecommendedAction || (result.recommended_actions?.[0] || 'Verify through independent official channels.')
    };
  }

  const identityIndicators = result.flags.filter(
    (f) => f.includes('IDENTITY') || f.includes('IMPERSONATION') || f.includes('TYPO') || f.includes('BRAND')
  );

  const syntheticMarkers = result.flags.filter(
    (f) => f.includes('SYNTHETIC') || f.includes('VOICE') || f.includes('ARTIFACT') || f.includes('CLONE')
  );

  const urgencyTactics = result.evidence.length > 0 ? result.evidence : [result.evaluation.what_communicated];

  let destinationRisk: 'Legitimate' | 'Unverified Domain' | 'High-Risk Account' | 'Known Mules' = 'Legitimate';
  if (result.flags.some((f) => f.includes('TYPO') || f.includes('MULE'))) {
    destinationRisk = 'Known Mules';
  } else if (result.flags.some((f) => f.includes('URL') || f.includes('TLD') || f.includes('IP'))) {
    destinationRisk = 'Unverified Domain';
  } else if (score >= 60) {
    destinationRisk = 'High-Risk Account';
  }

  const callerOrSender = fallbackInputs.sender || (result.evaluation.who_trusted ? 'Verified Counterparty' : 'Unverified Sender');

  return {
    id: result.scan_id,
    time: 'Just now',
    timestamp: new Date(result.timestamp).getTime() || Date.now(),
    type: fallbackInputs.modality,
    subject: fallbackInputs.subject || `${fallbackInputs.modality.toUpperCase()} Security Scan`,
    risk: result.risk_level,
    score: score,
    action: action,
    forensicDetails,
    identityDetails: {
      callerOrSender: callerOrSender,
      verifiedIdentity: result.evaluation.who_trusted ? callerOrSender : null,
      identityTrustScore: Math.max(0, Math.min(100, Math.round(100 - (result.signal_breakdown?.identity_score || 0)))),
      spoofingIndicators: identityIndicators.length > 0 ? identityIndicators : ['No explicit spoofing tags'],
      isKnownContact: result.evaluation.who_trusted,
      stirShakenStatus: fallbackInputs.modality === 'call' ? (result.evaluation.who_trusted ? 'PASSED' : 'FAILED') : undefined,
    },
    communicationDetails: {
      medium: fallbackInputs.medium || `${fallbackInputs.modality.toUpperCase()} Payload`,
      syntheticProbability: Math.round(result.signal_breakdown?.media_synthetic_score ?? 0),
      linguisticUrgency:
        (result.signal_breakdown?.intent_pressure_score || 0) >= 70
          ? 'Extreme Pressure'
          : (result.signal_breakdown?.intent_pressure_score || 0) >= 40
          ? 'Elevated'
          : 'Normal',
      coercionTactics: urgencyTactics,
      syntheticMarkers: syntheticMarkers.length > 0 ? syntheticMarkers : undefined,
    },
    requestedActionDetails: {
      actionType: forensicDetails?.recommendedAction || result.evaluation.requested_action || 'Inspect Interaction',
      sensitivityLevel:
        result.risk_level === 'CRITICAL'
          ? 'Critical'
          : result.risk_level === 'HIGH'
          ? 'High'
          : result.risk_level === 'MEDIUM'
          ? 'Moderate'
          : 'Low',
      financialRiskUsd: score >= 80 ? 25000 : score >= 50 ? 5000 : 0,
      destinationRisk: destinationRisk,
    },
    veritySummary: forensicDetails
      ? `${forensicDetails.verdict.replace('_', ' ')} (${Math.round(forensicDetails.confidence * 100)}% Confidence) — ${forensicDetails.evidence.join(' ')}`
      : (result.evidence.slice(0, 3).join(' ') || result.evaluation.what_communicated),
  };
}

export const apiService = {
  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/healthz`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Analyze plain text or SMS
   */
  async analyzeText(payload: {
    content: string;
    sender_identity?: string;
    sender_channel?: string;
    claimed_organization?: string;
  }): Promise<VerityResult> {
    const res = await fetch(`${API_BASE}/analyze/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to analyze text');
    }
    return res.json();
  },

  /**
   * Analyze suspicious URL
   */
  async analyzeUrl(payload: { url: string; target_brand?: string }): Promise<VerityResult> {
    const res = await fetch(`${API_BASE}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to analyze URL');
    }
    return res.json();
  },

  /**
   * Analyze audio voice file
   */
  async analyzeAudio(file: File, callerInfo?: string, claimedOrg?: string): Promise<VerityResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (callerInfo) formData.append('caller_info', callerInfo);
    if (claimedOrg) formData.append('claimed_organization', claimedOrg);

    const res = await fetch(`${API_BASE}/analyze/audio`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to analyze audio');
    }
    return res.json();
  },

  /**
   * Analyze visual media (image/document/video)
   */
  async analyzeMedia(file: File, caption?: string, claimedSource?: string): Promise<VerityResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (claimedSource) formData.append('claimed_source', claimedSource);

    const res = await fetch(`${API_BASE}/analyze/media`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to analyze media');
    }
    return res.json();
  },

  /**
   * Unified multimodal analysis
   */
  async analyzeMultimodal(data: {
    messageText?: string;
    senderIdentity?: string;
    claimedOrg?: string;
    url?: string;
    mediaFile?: File;
  }): Promise<VerityResult> {
    const formData = new FormData();
    if (data.messageText) formData.append('message_text', data.messageText);
    if (data.senderIdentity) formData.append('sender_identity', data.senderIdentity);
    if (data.claimedOrg) formData.append('claimed_organization', data.claimedOrg);
    if (data.url) formData.append('url', data.url);
    if (data.mediaFile) formData.append('media_file', data.mediaFile);

    const res = await fetch(`${API_BASE}/analyze/multimodal`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to run multimodal analysis');
    }
    return res.json();
  },

  /**
   * Fetch recent incidents from SQLite
   */
  async fetchIncidents(limit = 50, offset = 0): Promise<IncidentDetailResponse[]> {
    const res = await fetch(`${API_BASE}/incidents?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return res.json();
  },

  /**
   * Fetch aggregate statistics
   */
  async fetchStats(): Promise<DashboardStatsResponse> {
    const res = await fetch(`${API_BASE}/incidents/stats`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  },

  /**
   * Submit human feedback for a scan
   */
  async submitFeedback(scanId: string, feedback: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${scanId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, notes }),
    });
    if (!res.ok) {
      throw new Error('Failed to submit feedback');
    }
    return res.json();
  },
};
