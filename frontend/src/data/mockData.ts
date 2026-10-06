import { AnalysisRecord, QuickAnalysisCategory, TrustOverviewMetric } from '../types';

export const QUICK_ANALYSIS_CATEGORIES: QuickAnalysisCategory[] = [
  {
    id: 'call',
    title: 'CALL',
    subtitle: 'Analyze incoming caller',
    description: 'Verify phone number origin, telecom carrier routing, and STIR/SHAKEN caller ID spoofing indicators in real time.',
    actionText: 'Analyze Caller',
    badge: 'Telephony Engine',
    iconName: 'PhoneCall',
    analyzers: ['Carrier Route Inspection', 'VoIP Spoof Detector', 'Acoustic Environment Check']
  },
  {
    id: 'voice',
    title: 'VOICE',
    subtitle: 'Analyze voice recording',
    description: 'Inspect voice notes and call recordings for synthetic AI cloning, neural vocoder artifacts, and formant shifts.',
    actionText: 'Analyze Voice',
    badge: 'Neural Spectral',
    iconName: 'Mic',
    analyzers: ['Diffusion Vocoder Probe', 'Biometric Pitch Baseline', 'Phase Discontinuity']
  },
  {
    id: 'message',
    title: 'MESSAGE',
    subtitle: 'Check suspicious text',
    description: 'Evaluate SMS, WhatsApp, Slack or email text for social engineering pressure, urgent wire requests, and deception cues.',
    actionText: 'Check Message',
    badge: 'Linguistic NLP',
    iconName: 'MessageSquareText',
    analyzers: ['Psychological Urgency Score', 'Authority Impersonation', 'Coercion Matrix']
  },
  {
    id: 'media',
    title: 'MEDIA',
    subtitle: 'Analyze image or video',
    description: 'Detect deepfake facial swaps, synthetic GAN/diffusion generators, lighting incoherence, and metadata tampering.',
    actionText: 'Scan Media',
    badge: 'Visual Forensics',
    iconName: 'Film',
    analyzers: ['Facial Boundary Artifacts', 'Pupil & Corneal Reflection', 'Frame Blending Analysis']
  },
  {
    id: 'url',
    title: 'URL',
    subtitle: 'Check suspicious link',
    description: 'Analyze domains for Unicode homograph spoofing, lookalike brands, malicious credential harvesting, and zero-day redirects.',
    actionText: 'Inspect Link',
    badge: 'Sandbox Probe',
    iconName: 'Link2',
    analyzers: ['Homograph De-obfuscation', 'SSL Certificate Lineage', 'Credential Sandbox']
  }
];

export const TRUST_OVERVIEW_METRICS: TrustOverviewMetric[] = [
  {
    id: 'identity-trust',
    label: 'Identity Trust',
    score: 94.2,
    maxScore: 100,
    unit: '%',
    status: 'optimal',
    statusText: 'Strong Baseline',
    delta: '+3.1% this week',
    deltaPositive: true,
    description: 'Verified caller profiles and authenticated counterparty contacts.',
    breakdown: [
      { name: 'STIR/SHAKEN Passed', value: '98.6%' },
      { name: 'Known Enterprise Baselines', value: '412 contacts' },
      { name: 'Spoof Attempts Intercepted', value: '14 today' }
    ]
  },
  {
    id: 'communication-risk',
    label: 'Communication Risk',
    score: 18.5,
    maxScore: 100,
    unit: '%',
    status: 'nominal',
    statusText: 'Low Pressure Detected',
    delta: '-4.2% vs last week',
    deltaPositive: true,
    description: 'Linguistic urgency index and artificial social engineering pressure.',
    breakdown: [
      { name: 'Urgency Spike Alerts', value: '2 active' },
      { name: 'Executive Impersonation', value: '0 pending' },
      { name: 'Average Pressure Index', value: '14/100' }
    ]
  },
  {
    id: 'media-authenticity',
    label: 'Media Authenticity',
    score: 99.1,
    maxScore: 100,
    unit: '%',
    status: 'optimal',
    statusText: 'Clean Stream',
    delta: '+0.4% verified',
    deltaPositive: true,
    description: 'Integrity score across analyzed voice memos, executive video clips, and documents.',
    breakdown: [
      { name: 'Synthetic Audio Detected', value: '1 flagged' },
      { name: 'Deepfake Videos Quarantined', value: '2 this month' },
      { name: 'Model Confidence', value: '99.4%' }
    ]
  },
  {
    id: 'action-risk',
    label: 'Requested Action Risk',
    score: 87.0,
    maxScore: 100,
    unit: 'pts',
    status: 'warning',
    statusText: 'High Threat Intercepted',
    delta: '1 critical threat blocked',
    deltaPositive: false,
    description: 'Risk evaluation of wire instructions, MFA overrides, and credentials demanded.',
    breakdown: [
      { name: 'Unauthorized Wire Attempt', value: '$45,000 intercepted' },
      { name: 'MFA Bypass Blocked', value: '3 incidents' },
      { name: 'Risk Mitigation Rate', value: '100%' }
    ]
  }
];

export const RECENT_ANALYSIS_RECORDS: AnalysisRecord[] = [
  {
    id: 'an-001',
    time: '10:42 AM',
    timestamp: Date.now() - 1000 * 60 * 42,
    type: 'voice',
    subject: 'Unknown Caller',
    risk: 'HIGH',
    score: 87,
    action: 'Verify',
    identityDetails: {
      callerOrSender: '+1 (555) 932-8411 (Unassigned VOIP)',
      verifiedIdentity: null,
      identityTrustScore: 18,
      spoofingIndicators: ['Virtual Carrier Relay', 'No STIR/SHAKEN attestation', 'Number registered 48h ago'],
      isKnownContact: false,
      stirShakenStatus: 'FAILED'
    },
    communicationDetails: {
      medium: 'Voicemail Audio (.m4a, 28s)',
      syntheticProbability: 92,
      linguisticUrgency: 'Extreme Pressure',
      coercionTactics: ['Authority Coercion (claiming CEO executive directive)', 'Immediate Deadline (15 minutes)'],
      syntheticMarkers: ['Neural Vocoder Pitch Jitter', 'Inconsistent Room Reverberation', 'Unnatural Glottal Stops']
    },
    requestedActionDetails: {
      actionType: 'Urgent Wire Transfer ($48,500)',
      sensitivityLevel: 'Critical',
      financialRiskUsd: 48500,
      destinationRisk: 'High-Risk Account'
    },
    veritySummary: 'Synthetic AI voice clone impersonating CEO requesting immediate offshore wire transfer with artificial time constraint.'
  },
  {
    id: 'an-002',
    time: '09:18 AM',
    timestamp: Date.now() - 1000 * 60 * 126,
    type: 'url',
    subject: 'Bank Login',
    risk: 'CRITICAL',
    score: 96,
    action: 'Block',
    identityDetails: {
      callerOrSender: 'SMS Shortcode spoof (Sender: "JPM-ALERT")',
      verifiedIdentity: null,
      identityTrustScore: 4,
      spoofingIndicators: ['Punycode Domain (cháse-security-verify[.]com)', 'Untrusted SSL Root Authority'],
      isKnownContact: false
    },
    communicationDetails: {
      medium: 'Inbound SMS Message',
      syntheticProbability: 84,
      linguisticUrgency: 'Extreme Pressure',
      coercionTactics: ['Account Suspension Threat', 'Unauthorized Device Warning'],
      syntheticMarkers: ['Automated Phishing Template v3.2']
    },
    requestedActionDetails: {
      actionType: 'Enter Corporate Banking Credentials & 6-Digit MFA',
      sensitivityLevel: 'Critical',
      destinationRisk: 'Known Mules'
    },
    veritySummary: 'Deceptive credential harvesting portal masquerading as commercial banking portal with real-time OTP intercept harness.'
  },
  {
    id: 'an-003',
    time: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
    type: 'message',
    subject: 'Unknown Sender',
    risk: 'HIGH',
    score: 71,
    action: 'Review',
    identityDetails: {
      callerOrSender: 'alex.morgan.internal@outlook-mail-corp.net',
      verifiedIdentity: 'Lookalike of VP Alex Morgan (alex.morgan@company.com)',
      identityTrustScore: 29,
      spoofingIndicators: ['Domain Impersonation (outlook-mail-corp.net)', 'DMARC Fail'],
      isKnownContact: false
    },
    communicationDetails: {
      medium: 'Email Thread / Slack Direct Message',
      syntheticProbability: 62,
      linguisticUrgency: 'Elevated',
      coercionTactics: ['Confidentiality Demand ("Do not discuss with team")', 'Vendor Invoice Exception'],
      syntheticMarkers: ['LLM-generated stylistic imitation of executive tone']
    },
    requestedActionDetails: {
      actionType: 'Change Vendor ACH Remittance Account',
      sensitivityLevel: 'High',
      financialRiskUsd: 12400,
      destinationRisk: 'Unverified Domain'
    },
    veritySummary: 'Vendor email compromise attempt attempting banking remittance switch with synthetic persona framing.'
  },
  {
    id: 'an-004',
    time: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
    type: 'media',
    subject: 'CEO Video Note',
    risk: 'LOW',
    score: 12,
    action: 'Safe',
    identityDetails: {
      callerOrSender: 'sarah.chen@enterprise.internal',
      verifiedIdentity: 'Sarah Chen (CEO)',
      identityTrustScore: 99,
      spoofingIndicators: [],
      isKnownContact: true
    },
    communicationDetails: {
      medium: 'All-Hands Video Briefing (.mp4, 2m 14s)',
      syntheticProbability: 3,
      linguisticUrgency: 'Normal',
      coercionTactics: [],
      syntheticMarkers: []
    },
    requestedActionDetails: {
      actionType: 'Review Q4 Strategic Priorities Document',
      sensitivityLevel: 'Low',
      destinationRisk: 'Legitimate'
    },
    veritySummary: 'Authentic video broadcast verified against CEO biometric signature and organizational key registry.'
  },
  {
    id: 'an-005',
    time: 'Oct 03',
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    type: 'call',
    subject: 'Alleged Tax Dept',
    risk: 'CRITICAL',
    score: 94,
    action: 'Blocked',
    identityDetails: {
      callerOrSender: '+1 (800) 829-1040 (Spoofed IRS Toll-Free)',
      verifiedIdentity: null,
      identityTrustScore: 2,
      spoofingIndicators: ['STIR/SHAKEN Red Attestation', 'PBX Gateway from foreign ASN', 'Caller ID mismatch'],
      isKnownContact: false,
      stirShakenStatus: 'FAILED'
    },
    communicationDetails: {
      medium: 'Inbound Automated Interactive Voice Response (IVR)',
      syntheticProbability: 97,
      linguisticUrgency: 'Extreme Pressure',
      coercionTactics: ['Law Enforcement Threat', 'Immediate Arrest Warrant Claim', 'Prepaid Gift Card Demand'],
      syntheticMarkers: ['Synthesized Text-to-Speech Engine with simulated noise backdrop']
    },
    requestedActionDetails: {
      actionType: 'Direct Settlement via Cryptocurrency / Electronic Voucher',
      sensitivityLevel: 'Critical',
      financialRiskUsd: 7800,
      destinationRisk: 'High-Risk Account'
    },
    veritySummary: 'Known government agency impersonation scam with spoofed caller ID and coercive automated speech system.'
  }
];

export const PRESET_SAMPLE_SCENARIOS = [
  {
    id: 'preset-voice-ceo',
    name: '🔴 CEO Urgent Wire Clone (High Risk)',
    type: 'voice' as const,
    sender: 'CFO / CEO Private Line (+1 415 802-9912)',
    content: '"Hey, I am boarding a flight to London right now and our vendor agreement for the cloud migration will default unless we wire $48,500 to their clearing escrow in the next 30 minutes. Do not ping the Slack channel, just push the approval through now."',
    action: 'Approve $48,500 Wire Transfer',
    score: 89,
    risk: 'HIGH' as const,
    analysis: 'High synthetic vocal spectral anomaly (94%), extreme urgency coercion, unauthorized financial transfer requested.'
  },
  {
    id: 'preset-url-bank',
    name: '🔴 Bank MFA Phishing Link (Critical Risk)',
    type: 'url' as const,
    sender: 'SMS from "VERIFIED-BANK" shortcode',
    content: 'https://security-chase-auth-corp.net/reset-mfa?token=928410',
    action: 'Submit Login Credentials & Authenticator 6-digit Code',
    score: 97,
    risk: 'CRITICAL' as const,
    analysis: 'Homograph spoofing domain registered 12 hours ago, unverified SSL authority, credential harvesting payload.'
  },
  {
    id: 'preset-msg-vendor',
    name: '🟡 Suspicious Vendor ACH Invoice (High Risk)',
    type: 'message' as const,
    sender: 'billing@supplies-techn0logy.com (Spoofed 0 for o)',
    content: 'Attached is our updated invoice #8841. Please note our corporate bank has transitioned to Wells Fargo; update your routing records immediately.',
    action: 'Change Accounting Remittance Routing',
    score: 76,
    risk: 'HIGH' as const,
    analysis: 'Typosquat domain, out-of-band banking alteration request, lacking cryptographic signature.'
  },
  {
    id: 'preset-call-legit',
    name: '🟢 Legitimate IT Desk Callback (Low Risk)',
    type: 'call' as const,
    sender: 'Internal IT Helpdesk (+1 650 555-0199)',
    content: 'Hi Alex, this is David from Internal IT following up on ticket #4492 regarding your monitor dock firmware update. Please submit your confirmation in ServiceNow.',
    action: 'Confirm Ticket Resolution on Internal Portal',
    score: 8,
    risk: 'LOW' as const,
    analysis: 'STIR/SHAKEN attestation A passed, verified internal extension, no sensitive credential or funds requested.'
  }
];
