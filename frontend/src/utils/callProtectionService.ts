export interface QuadrantDetail {
  state: string;
  badge_color: string;
  title: string;
  headline: string;
  detail: string;
  is_flagged: boolean;
}

export interface CallSignalData {
  id: string;
  category: string;
  text: string;
  detail: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score_impact?: number;
  timestamp?: string;
}

export interface CallProtectionSession {
  id: string;
  created_at: string;
  ended_at?: string;
  phone_number: string;
  claimed_identity?: string;
  status: 'ACTIVE' | 'ENDED' | 'BLOCKED' | 'REPORTED';
  verification_state: 'VERIFIED' | 'SUSPICIOUS' | 'UNVERIFIED' | 'HIGH RISK' | 'UNKNOWN';
  carrier_info?: {
    operator: string;
    circle: string;
    country: string;
    flag: string;
    lineType: string;
    isValid: boolean;
  };
  attestation?: {
    stir_shaken?: string;
    provider?: string;
  };
  reputation?: {
    reputation_score?: number;
    spam_reports?: number;
    spoofing_indicators?: string[];
  };
  threat_score: number;
  threat_level: 'TRUSTED' | 'CAUTION' | 'SUSPICIOUS' | 'HIGH RISK';
  confidence?: number;
  audio_analysis_status: 'UNAVAILABLE' | 'ACTIVE' | 'COMPLETED';
  signals: CallSignalData[];
  quadrants?: {
    who: QuadrantDetail;
    what: QuadrantDetail;
    voice: QuadrantDetail;
    request: QuadrantDetail;
  };
  actions_taken: string[];
  is_demo: boolean;
  notes?: string;
}

export interface CallerIdVerification {
  phone_number: string;
  normalized_number: string;
  country: string;
  country_code: string;
  country_flag: string;
  is_valid_format: boolean;
  carrier?: string;
  circle_or_region?: string;
  line_type?: string;
  stir_shaken_attestation?: string;
  verification_state: 'VERIFIED' | 'SUSPICIOUS' | 'UNVERIFIED' | 'HIGH RISK' | 'UNKNOWN';
  reputation_score?: number;
  spam_reports_count: number;
  spoofing_indicators: string[];
  claimed_identity?: string;
  claimed_identity_match?: boolean;
  is_simulated: boolean;
  provider_name: string;
  diagnostic_notes: string[];
}

export interface CallProtectionEvent {
  session_id: string;
  event_type: string;
  timestamp: string;
  payload?: any;
  threat_score?: number;
  threat_level?: 'TRUSTED' | 'CAUTION' | 'SUSPICIOUS' | 'HIGH RISK';
  confidence?: number;
  is_simulated: boolean;
  simulation_notice?: string;
}

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '') + '/api/v1';

function getWsUrl(sessionId: string): string {
  const base = RAW_API_BASE.replace(/\/+$/, '');
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const urlObj = new URL(base, window.location.href);
  return `${wsProtocol}//${urlObj.host}/api/v1/call-protection/session/${encodeURIComponent(sessionId)}/ws`;
}

export const callProtectionService = {
  /**
   * Verify caller ID with legitimate telecom & carrier metadata.
   */
  async verifyCallerId(params: {
    phoneNumber: string;
    claimedIdentity?: string;
    demoMode?: boolean;
  }): Promise<CallerIdVerification> {
    const res = await fetch(`${API_BASE}/call-protection/verify-caller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: params.phoneNumber,
        claimed_identity: params.claimedIdentity,
        demo_mode: params.demoMode ?? false
      })
    });
    if (!res.ok) {
      throw new Error(`Caller ID check failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Starts a new Call Protection session on incoming call detection.
   */
  async startProtectionSession(params: {
    phoneNumber: string;
    claimedIdentity?: string;
    demoMode?: boolean;
  }): Promise<CallProtectionSession> {
    const res = await fetch(`${API_BASE}/call-protection/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: params.phoneNumber,
        claimed_identity: params.claimedIdentity,
        demo_mode: params.demoMode ?? false,
        is_incoming: true
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to start protection session: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get current session data.
   */
  async getSession(sessionId: string): Promise<CallProtectionSession> {
    const res = await fetch(`${API_BASE}/call-protection/session/${encodeURIComponent(sessionId)}`);
    if (!res.ok) {
      throw new Error(`Session fetch failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get chronological session events log.
   */
  async getSessionEvents(sessionId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/call-protection/session/${encodeURIComponent(sessionId)}/events`);
    if (!res.ok) {
      throw new Error(`Events fetch failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Perform protective actions: END_CALL, BLOCK_CALLER, REPORT_FRAUD, VERIFY_INDEPENDENTLY.
   */
  async performCallAction(
    sessionId: string,
    action: 'END_CALL' | 'BLOCK_CALLER' | 'REPORT_FRAUD' | 'VERIFY_INDEPENDENTLY',
    reason?: string
  ): Promise<{ status: string; action: string; session_status: string; actions_taken: string[] }> {
    const res = await fetch(`${API_BASE}/call-protection/session/${encodeURIComponent(sessionId)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason })
    });
    if (!res.ok) {
      throw new Error(`Call action ${action} failed: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Connect to live stream (WebSocket with auto fallback to SSE).
   * Returns a cleanup function.
   */
  connectLiveStream(
    sessionId: string,
    onEvent: (event: CallProtectionEvent) => void,
    onError?: (err: any) => void
  ): () => void {
    let ws: WebSocket | null = null;
    let eventSource: EventSource | null = null;
    let isCleanedUp = false;

    try {
      const wsUrl = getWsUrl(sessionId);
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onEvent(parsed);
        } catch (e) {
          console.warn('Failed to parse WebSocket event payload', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket stream error, engaging SSE fallback:', err);
        if (ws) {
          try { ws.close(); } catch {}
          ws = null;
        }
        if (!isCleanedUp) {
          startSseFallback();
        }
      };

      ws.onclose = () => {
        if (!isCleanedUp && !eventSource) {
          startSseFallback();
        }
      };
    } catch (err) {
      console.warn('WebSocket initiation error, using SSE fallback:', err);
      startSseFallback();
    }

    function startSseFallback() {
      if (isCleanedUp || eventSource) return;
      try {
        const sseUrl = `${API_BASE}/call-protection/session/${encodeURIComponent(sessionId)}/stream`;
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            onEvent(data);
          } catch (err) {
            console.warn('Failed to parse SSE payload', err);
          }
        };

        eventSource.onerror = (err) => {
          console.warn('SSE stream error:', err);
          if (onError) onError(err);
        };
      } catch (err) {
        if (onError) onError(err);
      }
    }

    return () => {
      isCleanedUp = true;
      if (ws) {
        try { ws.close(); } catch {}
        ws = null;
      }
      if (eventSource) {
        try { eventSource.close(); } catch {}
        eventSource = null;
      }
    };
  }
};
