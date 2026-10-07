/**
 * VERITY Real-Time Inbound Call Detection & Telecom Telemetry Service
 * Monitors incoming voice sessions, manages caller ID verification,
 * triggers audio/haptic ring chimes, and directs users to the Call Protection shield.
 */

export interface IncomingCallPayload {
  id: string;
  phoneNumber: string;
  claimedIdentity: string;
  carrier: string;
  circle: string;
  lineType: string;
  attestationGrade: 'LEVEL_A' | 'LEVEL_B' | 'LEVEL_C_SPOOFED' | 'UNAUTHENTICATED';
  riskScore: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  pretext: string;
  timestamp: number;
}

export const PRESET_INCOMING_SCENARIOS: IncomingCallPayload[] = [
  {
    id: 'inc-cbi-01',
    phoneNumber: '+91 98401 24590',
    claimedIdentity: 'CBI Officer Suresh Patel',
    carrier: 'Unverified VoIP SIP Trunk',
    circle: 'Mumbai PBX Gateway',
    lineType: 'VoIP / Internet Call',
    attestationGrade: 'LEVEL_C_SPOOFED',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    pretext: 'Claims Digital Arrest warrant issued for money laundering. Demands Skype interrogation.',
    timestamp: Date.now()
  },
  {
    id: 'inc-bank-02',
    phoneNumber: '+91 91234 56789',
    claimedIdentity: 'SBI Fraud Investigation Cell',
    carrier: 'Private Cloud PBX',
    circle: 'Delhi NCR Circle',
    lineType: 'Virtual PRI Trunk',
    attestationGrade: 'UNAUTHENTICATED',
    riskScore: 88,
    threatLevel: 'CRITICAL',
    pretext: 'Claims bank card blocked due to unauthorized Dubai transaction. Demands verbal OTP verification.',
    timestamp: Date.now()
  },
  {
    id: 'inc-clone-03',
    phoneNumber: '+91 98765 43210',
    claimedIdentity: 'Family Emergency (Deepfake Voice)',
    carrier: 'Cellular SIM Proxy',
    circle: 'Bangalore Metro',
    lineType: 'Mobile GSM',
    attestationGrade: 'LEVEL_B',
    riskScore: 94,
    threatLevel: 'CRITICAL',
    pretext: 'Crying relative claiming road accident hospital bail. Demands Rs 50,000 UPI transfer.',
    timestamp: Date.now()
  },
  {
    id: 'inc-trai-04',
    phoneNumber: '+91 80012 34567',
    claimedIdentity: 'TRAI / DoT Telecom Office',
    carrier: 'Auto-Dialer Botnet',
    circle: 'Hyderabad Hub',
    lineType: 'VoIP Gateway',
    attestationGrade: 'UNAUTHENTICATED',
    riskScore: 84,
    threatLevel: 'HIGH',
    pretext: 'Threatens SIM card disconnection in 2 hours for spam complaints unless fee is paid.',
    timestamp: Date.now()
  }
];

type CallListener = (call: IncomingCallPayload | null) => void;

class CallDetectionService {
  private activeCall: IncomingCallPayload | null = null;
  private listeners: Set<CallListener> = new Set();
  private audioCtx: AudioContext | null = null;
  private ringInterval: any = null;
  private isListening: boolean = false;

  constructor() {
    // Attempt to resume audio context on first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        try {
          if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              this.audioCtx = new AudioContextClass();
            }
          }
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
        } catch {
          // ignore
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  public subscribe(listener: CallListener): () => void {
    this.listeners.add(listener);
    listener(this.activeCall);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.activeCall);
      } catch (err) {
        console.error('Error notifying call listener:', err);
      }
    }
  }

  public getActiveCall(): IncomingCallPayload | null {
    return this.activeCall;
  }

  /**
   * Play realistic incoming ringtone sound via Web Audio API synthesizer
   */
  public playRingTone() {
    this.stopRingTone();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx && AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const ringPulse = () => {
        if (!this.audioCtx || !this.activeCall) return;
        try {
          const now = this.audioCtx.currentTime;
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, now); // 440 Hz
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, now); // 480 Hz (standard telephone ring frequencies)

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
          gain.gain.setValueAtTime(0.15, now + 1.2);
          gain.gain.linearRampToValueAtTime(0, now + 1.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.4);
          osc2.stop(now + 1.4);
        } catch {
          // audio error fallback
        }
      };

      ringPulse();
      this.ringInterval = setInterval(ringPulse, 3200);
    } catch (err) {
      console.warn('Could not play ring audio:', err);
    }

    // Trigger haptic vibration on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([400, 200, 400, 200, 400]);
      } catch {
        // vibration error fallback
      }
    }
  }

  public stopRingTone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  /**
   * Trigger an incoming call event across the app.
   */
  public triggerIncomingCall(customCall?: Partial<IncomingCallPayload>) {
    const scenario = PRESET_INCOMING_SCENARIOS[Math.floor(Math.random() * PRESET_INCOMING_SCENARIOS.length)];
    const newCall: IncomingCallPayload = {
      id: customCall?.id || `inc-${Date.now().toString(36)}`,
      phoneNumber: customCall?.phoneNumber || scenario.phoneNumber,
      claimedIdentity: customCall?.claimedIdentity || scenario.claimedIdentity,
      carrier: customCall?.carrier || scenario.carrier,
      circle: customCall?.circle || scenario.circle,
      lineType: customCall?.lineType || scenario.lineType,
      attestationGrade: customCall?.attestationGrade || scenario.attestationGrade,
      riskScore: customCall?.riskScore || scenario.riskScore,
      threatLevel: customCall?.threatLevel || scenario.threatLevel,
      pretext: customCall?.pretext || scenario.pretext,
      timestamp: Date.now()
    };

    this.activeCall = newCall;
    this.playRingTone();
    this.notify();
    return newCall;
  }

  /**
   * Dismiss or decline the incoming call.
   */
  public dismissIncomingCall() {
    this.stopRingTone();
    this.activeCall = null;
    this.notify();
  }

  /**
   * Accept / inspect the call in Call Protection.
   */
  public answerCall(): IncomingCallPayload | null {
    this.stopRingTone();
    const call = this.activeCall;
    // Don't null out activeCall immediately, let the consumer transfer it to the active session
    return call;
  }

  /**
   * Start listening for incoming calls (polling / simulation readiness).
   */
  public startListening() {
    this.isListening = true;
  }

  public stopListening() {
    this.isListening = false;
    this.stopRingTone();
  }
}

export const callDetectionService = new CallDetectionService();
