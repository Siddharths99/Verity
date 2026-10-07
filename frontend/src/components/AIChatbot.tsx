import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Bot, 
  User, 
  ChevronDown, 
  Minimize2, 
  Maximize2,
  RefreshCw,
  HelpCircle,
  PhoneCall,
  Mic,
  Film,
  Link2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ModalityType } from '../types';
import { apiService } from '../utils/apiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: () => void }[];
}

interface AIChatbotProps {
  onOpenQuickAnalysis: (modality: ModalityType) => void;
  isMobile?: boolean;
}

const FAQ_SUGGESTIONS = [
  '🛡️ How does VERITY evaluate interactions?',
  '🎙️ How to check if an executive voice note is AI-cloned?',
  '⚠️ I received an urgent wire transfer request via WhatsApp',
  '📞 What does STIR/SHAKEN caller verification mean?',
  '🔗 How does homograph domain spoofing work?'
];

const KNOWLEDGE_RESPONSES: Record<string, string> = {
  'how does verity evaluate': 
    `**VERITY's 4-Pillar Evaluation Framework:**\n\nVERITY is not merely a deepfake scanner; it calculates a **weighted multidimensional risk score** by evaluating:\n\n1. **WHO is contacting you**: Carrier routing, STIR/SHAKEN cryptographic phone attestation, email DMARC/DKIM/SPF lineage, and baseline identity matches.\n2. **WHAT is communicated**: Audio spectral artifacts (neural vocoder anomalies, formant jitter), visual facial blending artifacts, and NLP linguistic urgency exploitation.\n3. **WHAT is requested**: Financial wire demands, MFA passcodes, credential input, or high-risk authorization overrides.\n4. **WHETHER it can be trusted**: A composite risk score from 0 to 100 with clear preventative mitigation steps.`,

  'voice':
    `**Defending Against AI Voice Cloning Scams:**\n\nModern neural vocoders (like diffusion voice models) can clone executive voices from under 5 seconds of audio. VERITY detects:\n\n* **Phase Discontinuities**: Artificial stitching between synthetic phonemes.\n* **Pitch Jitter Anomalies**: Unnatural micro-cadence and robotic formant resonance.\n* **Missing Environmental Room Noise**: Synthesized speech often lacks coherent physical room reverberation.\n\n**Immediate Rule**: Never authorize funds or send passcodes based solely on an inbound voice call or audio memo. Always call the verified contact back on their primary number.`,

  'wire':
    `**EMERGENCY WIRE TRANSFER PROTOCOL:**\n\n⚠️ **High Risk Pattern Detected**: Social engineering attacks frequently combine AI voice memos or urgent lookalike emails with tight deadlines (*"Transfer in 30 minutes before vendor default"*).\n\n**Mandatory Safety Steps:**\n1. **Halt the transaction immediately.**\n2. **Enforce Dual-Authorization**: Require two independent signatories.\n3. **Perform Out-of-Band Verification**: Phone the authorized counterparty on a pre-established landline or secure internal channel.\n4. **Inspect the recipient bank account**: Fraudulent requests redirect to newly generated mule clearing accounts.`,

  'stir':
    `**STIR/SHAKEN Telephony Attestation Explained:**\n\nSTIR/SHAKEN is a suite of cryptographic protocols that verify whether the telephone number displayed on Caller ID is authentic:\n\n* **Attestation Level A (Full)**: The carrier knows the customer and verifies their right to use the specific phone number.\n* **Attestation Level B (Partial)**: The carrier knows the originating customer, but cannot verify if they own the specific caller ID number.\n* **Attestation Level C (Gateway)**: The call originated internationally or across unverified VoIP gateways (Highest spoofing risk!).`,

  'homograph':
    `**Unicode Homograph & Lookalike URL Spoofing:**\n\nAttackers use identical-looking Cyrillic or Greek characters (e.g., replacing 'a' with Cyrillic 'а', or 'o' with '0') to create lookalike domains (e.g., \`cháse-verify-portal[.]com\`).\n\nVERITY decompiles Punycode representations, inspects SSL certificate lineage, and verifies domain registration age in an isolated sandbox before you interact with it.`
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ onOpenQuickAnalysis, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello Visal! I am **VERITY AI Security Copilot**.\n\nI can help you evaluate suspicious phone calls, voice recordings, phishing messages, deepfake media, or explain your risk scores and prevention protocols.\n\nHow can I assist you right now?`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyPayload = newHistory.map((m) => ({ sender: m.sender, text: m.text }));
      const response = await apiService.chatCopilot(text, historyPayload);

      const suggestedActions: { label: string; action: () => void }[] = [];
      if (response.suggested_actions && response.suggested_actions.length > 0) {
        response.suggested_actions.forEach((sa) => {
          suggestedActions.push({
            label: sa.label,
            action: () => onOpenQuickAnalysis((sa.modality as ModalityType) || 'call')
          });
        });
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Copilot live query failed, using local security heuristics fallback:', err);
      // Context-aware intelligent fallback response generation
      const lower = text.toLowerCase().trim();
      let replyText = '';
      let suggestedActions: { label: string; action: () => void }[] | undefined;

      // 1. Digital Arrest / Law Enforcement / Customs / CBI / Narcotics Pretext
      if (
        lower.includes('digital arrest') || lower.includes('cbi') || lower.includes('police') ||
        lower.includes('customs') || lower.includes('courier') || lower.includes('fedex') ||
        lower.includes('dhl') || lower.includes('parcel') || lower.includes('narcotics') ||
        lower.includes('arrest') || lower.includes('warrant')
      ) {
        replyText =
          `### 🚨 Digital Arrest & Law Enforcement Impersonation Alert\n\n` +
          `**Official Fact**: **There is NO legal concept of 'Digital Arrest' anywhere in India or internationally.**\n\n` +
          `Neither the Police, CBI, Customs, ED, nor Judges ever conduct interrogations, make arrests, or demand 'verification deposits' over WhatsApp, Skype, Zoom, or cellular calls.\n\n` +
          `**How Attackers Operate:**\n` +
          `1. **Pretext**: Scammers claim a parcel containing illegal items (passports/narcotics) in your name was seized, or your identity was used in money laundering.\n` +
          `2. **Psychological Coercion**: They use forged digital letterheads, police uniforms, and demand you stay on continuous video call.\n` +
          `3. **Extortion**: They instruct you to transfer your savings to a 'Court Clearance' or 'RBI verification' account.\n\n` +
          `**What You Must Do Immediately:**\n` +
          `• **Hang up the call immediately.** Do not argue or attempt to explain.\n` +
          `• **Do not send any money.** No authentic agency ever asks for fund transfers for verification.\n` +
          `• **Report to National Cyber Crime Helpline**: Dial **1930** or log an incident on **cybercrime.gov.in**.\n` +
          `• **Block the caller number** using VERITY's Call Protection.`;
        suggestedActions = [
          { label: '📞 Inspect Caller in Call Protection', action: () => onOpenQuickAnalysis('call') },
          { label: '⚠️ Document Incident in Message Scanner', action: () => onOpenQuickAnalysis('message') }
        ];
      }
      // 2. Voice Cloning / Audio Deepfakes / Kidnapping / Family Emergency Calls
      else if (
        lower.includes('voice') || lower.includes('audio') || lower.includes('clone') ||
        lower.includes('deepfake voice') || lower.includes('kidnap') || lower.includes('mimic')
      ) {
        replyText =
          `### 🎙️ AI Voice Cloning & Audio Deepfake Countermeasures\n\n` +
          `**How Attackers Clone Voices:**\n` +
          `Generative neural vocoders can replicate an executive or family member's vocal timbre from just **3 to 5 seconds** of audio sample extracted from social media clips or voicemail.\n\n` +
          `**Acoustic Indicators Flagged by VERITY:**\n` +
          `• **Vocoder Pitch Formants**: Unnatural robotic micro-jitter and synthetic phoneme stitching.\n` +
          `• **Room Acoustic Discontinuity**: Synthesized audio typically lacks natural room reverberation, ambient breath pauses, or realistic background noise.\n\n` +
          `**Zero-Trust Rule of Engagement:**\n` +
          `1. **Establish a Secret Family Safe Word**: A private verbal phrase that cannot be scraped online.\n` +
          `2. **Out-of-Band Callback**: Hang up immediately and call the individual back on their verified primary phone number, never on the inbound line.\n` +
          `3. **Submit Recording**: Upload the audio file to VERITY's **Voice Scan** tool to inspect spectral anomalies.`;
        suggestedActions = [
          { label: '🎙️ Run Voice Clone Forensic Scan', action: () => onOpenQuickAnalysis('voice') },
          { label: '📞 Launch In-Call Protection', action: () => onOpenQuickAnalysis('call') }
        ];
      }
      // 3. Deepfake Video / Video Calls / Face Swap / Video Blackmail
      else if (
        lower.includes('video') || lower.includes('face swap') || lower.includes('webcam') ||
        lower.includes('sextortion') || lower.includes('blackmail') || lower.includes('morph')
      ) {
        replyText =
          `### 📹 Deepfake Video & Synthetic Media Defense\n\n` +
          `**How Video Deepfakes Operate:**\n` +
          `Attackers use real-time generative models to swap faces during live video calls or create synthetic compromising footage for extortion.\n\n` +
          `**Visual Markers to Look For:**\n` +
          `• **Facial Boundary Blending**: Blurring, color mismatches, or pixel artifacts around the jawline, ears, and hairline.\n` +
          `• **Unnatural Eye & Blink Dynamics**: Irregular blinking frequency, lack of synchronous micro-saccades, and flat light reflections in pupils.\n` +
          `• **Head Turning Anomalies**: When the person turns sideways or passes their hand in front of their face, the mask will briefly glitch or warp.\n\n` +
          `**Protective Protocol:**\n` +
          `1. **Challenge on Video**: Ask the caller to turn their head 90 degrees or wave their hand across their face; real-time video masks will distort.\n` +
          `2. **Do Not Pay Extortion**: Complying with blackmail demands guarantees repeated demands. Cease all contact immediately.\n` +
          `3. **Preserve Evidence & Report**: Capture screen recordings and report immediately to **1930 / cybercrime.gov.in**.`;
        suggestedActions = [
          { label: '🎬 Inspect Video in Media Scanner', action: () => onOpenQuickAnalysis('media') },
          { label: '⚠️ Report Blackmail to Cybercrime', action: () => onOpenQuickAnalysis('message') }
        ];
      }
      // 4. Compromised Incident Response ("I already sent money / gave OTP / clicked link")
      else if (
        lower.includes('already sent') || lower.includes('already paid') || lower.includes('gave otp') ||
        lower.includes('transferred money') || lower.includes('scammed') || lower.includes('hacked') ||
        lower.includes('lost money') || lower.includes('compromised')
      ) {
        replyText =
          `### 🚨 EMERGENCY COMPROMISE RESPONSE CHECKLIST (Act Immediately)\n\n` +
          `**Every minute counts during a financial or credential incident. Execute these steps right now:**\n\n` +
          `1. **Contact Your Bank Emergency Hotline Immediately (Golden Hour)**:\n` +
          `   • Request an immediate **emergency freeze on all debits, UPI IDs, credit/debit cards, and NetBanking**.\n` +
          `   • Report the beneficiary account details and transaction reference number (UTR/Txn ID).\n` +
          `2. **Dial 1930 (National Cyber Crime Reporting Helpline)**:\n` +
          `   • The Indian Citizen Financial Cyber Fraud Reporting System can freeze fraudulent mule accounts across Indian banks if reported quickly.\n` +
          `3. **Change All Passwords from a Clean Device**:\n` +
          `   • Immediately change your primary email, banking passwords, and revoke active sessions.\n` +
          `4. **Disconnect Compromised Devices**:\n` +
          `   • If an APK or remote tool was installed, immediately turn on **Airplane Mode** to prevent data exfiltration.\n` +
          `5. **Save All Evidence**: Screenshot SMS messages, transaction IDs, phone numbers, and WhatsApp chats for the police FIR.`;
        suggestedActions = [
          { label: '⚠️ Document Incident in Ledger', action: () => onOpenQuickAnalysis('message') },
          { label: '📞 Dial 1930 Helpline Assistance', action: () => onOpenQuickAnalysis('call') }
        ];
      }
      // 5. Malicious APK / Android Trojan / Screen Share / AnyDesk
      else if (
        lower.includes('apk') || lower.includes('download app') || lower.includes('anydesk') ||
        lower.includes('teamviewer') || lower.includes('rustdesk') || lower.includes('screen share') ||
        lower.includes('trojan') || lower.includes('malware')
      ) {
        replyText =
          `### ⚠️ Malicious APK & Remote Access Trojan Warning\n\n` +
          `**The Threat:**\n` +
          `Scammers send direct \`.apk\` files or instruct you to download remote support tools (AnyDesk, TeamViewer, RustDesk) under pretexts like 'Bill Update', 'Bank KYC', or 'Courier Redelivery'.\n\n` +
          `**Technical Impact:**\n` +
          `• **SMS & OTP Interception**: Sideloaded APKs obtain accessibility and SMS permissions to silently read 2FA codes.\n` +
          `• **Screen Mirroring**: Remote support apps let attackers view your banking credentials, UPI PIN, and balance in real-time.\n\n` +
          `**Immediate Action Protocol:**\n` +
          `1. **NEVER install \`.apk\` files sent over messaging channels.** Legitimate institutions only publish to Google Play Store / Apple App Store.\n` +
          `2. **If Installed: Enable Airplane Mode Instantly**: Cut off cellular data and Wi-Fi to sever the attacker's command-and-control connection.\n` +
          `3. **Boot in Safe Mode & Uninstall**: Remove the rogue app under *Settings > Apps > Manage Apps*.\n` +
          `4. **Revoke Remote Access Permissions**: Uninstall any remote sharing software immediately.`;
        suggestedActions = [
          { label: '⚠️ Scan Suspicious Message & Link', action: () => onOpenQuickAnalysis('message') },
          { label: '🔗 Analyze Download Link in Sandbox', action: () => onOpenQuickAnalysis('url') }
        ];
      }
      // 6. Utility Bill / Electricity Disconnection
      else if (
        lower.includes('electricity') || lower.includes('power') || lower.includes('bill') ||
        lower.includes('disconnected') || lower.includes('disconnection tonight') || lower.includes('meter')
      ) {
        replyText =
          `### ⚡ Electricity Bill Disconnection Scam Alert\n\n` +
          `**The Scam Scenario:**\n` +
          `You receive an SMS: *'Dear Customer, your electricity power will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Please call Electricity Officer at 98XXXXXX immediately.'*\n\n` +
          `**The Trap:**\n` +
          `When you call, the fake officer instructs you to pay ₹10 or download an app for bill reconciliation. This gives them remote access or captures your card credentials.\n\n` +
          `**The Truth:**\n` +
          `• State electricity boards **never** send disconnection notices from standard 10-digit mobile numbers; authentic notices come from official government SMS headers (e.g., \`AD-TNEB\`, \`VM-BESCOM\`, \`VK-MAHAVITARAN\`).\n` +
          `• Disconnections require formal statutory written notices, not same-night threats.\n\n` +
          `**Defensive Steps:**\n` +
          `1. Do not call the number listed in the SMS.\n` +
          `2. Check your balance directly on your official state electricity board app or website.\n` +
          `3. Block and report the fraudulent sender number.`;
        suggestedActions = [
          { label: '⚠️ Scan Message Content in VERITY', action: () => onOpenQuickAnalysis('message') },
          { label: '📞 Inspect Caller ID in Call Protection', action: () => onOpenQuickAnalysis('call') }
        ];
      }
      // 7. Bank Account Blocked / KYC Expiry / NetBanking Alert
      else if (
        lower.includes('kyc') || lower.includes('account blocked') || lower.includes('account suspended') ||
        lower.includes('pan card') || lower.includes('credit card') || lower.includes('reward points') ||
        lower.includes('debit card') || lower.includes('bank') || lower.includes('wire') || lower.includes('transfer')
      ) {
        replyText =
          `### 🏦 Bank Account Suspension & KYC Phishing Alert\n\n` +
          `**The Pretext:**\n` +
          `Messages claiming: *'Your bank account has been blocked today due to pending PAN KYC. Update immediately at [fake link] to avoid permanent closure.'*\n\n` +
          `**Zero-Trust Reality:**\n` +
          `• Banks **never** provide links in SMS to update KYC or link PAN cards.\n` +
          `• The links lead to deceptive credential-harvesting phishing portals designed to clone the bank's login UI.\n\n` +
          `**What You Should Do:**\n` +
          `1. **Never click the link in the message.**\n` +
          `2. Log in only via your official banking app installed from the verified app store or type your bank's URL directly into your browser.\n` +
          `3. If in doubt, call your relationship manager or branch using the number printed on the back of your debit card.\n` +
          `4. Forward the phishing SMS to **1909** (Do Not Disturb reporting) and the cyber helpline.`;
        suggestedActions = [
          { label: '🔗 Inspect Phishing Link in Sandbox', action: () => onOpenQuickAnalysis('url') },
          { label: '⚠️ Analyze SMS Text in Message Scanner', action: () => onOpenQuickAnalysis('message') }
        ];
      }
      // 8. Part-Time Job / YouTube Likes / Telegram Task Scams
      else if (
        lower.includes('part time') || lower.includes('job offer') || lower.includes('work from home') ||
        lower.includes('youtube like') || lower.includes('telegram task') || lower.includes('crypto investment')
      ) {
        replyText =
          `### 💼 Part-Time Job & 'Task Completion' Investment Fraud\n\n` +
          `**How the Scheme Unfolds (Task / Pig Butchering Scam):**\n` +
          `1. **Bait**: You receive an unsolicited message offering ₹2,000–₹10,000 daily for liking YouTube videos or reviewing hotels.\n` +
          `2. **Initial Payoff**: They pay you a small real amount (₹150–₹500) to build trust and lower your guard.\n` +
          `3. **The Trap (Prepaid Tasks)**: They add you to a VIP Telegram group and ask you to invest ₹5,000 to earn ₹8,000, then ₹50,000 to earn ₹80,000.\n` +
          `4. **The Exit**: When you try to withdraw your funds, they freeze your 'account' and demand a 30% tax clearance deposit before disappearing completely.\n\n` +
          `**Defensive Actions:**\n` +
          `• No legitimate enterprise hires employees over anonymous Telegram channels to click like buttons.\n` +
          `• Never send money to 'earn' money back from tasks.\n` +
          `• Exit and block the group immediately.`;
        suggestedActions = [
          { label: '⚠️ Analyze Message in VERITY Scanner', action: () => onOpenQuickAnalysis('message') },
          { label: '🔗 Check Telegram Link in URL Sandbox', action: () => onOpenQuickAnalysis('url') }
        ];
      }
      // 9. OTP / 2FA / Passcode / PIN Protection
      else if (
        lower.includes('otp') || lower.includes('mfa') || lower.includes('2fa') ||
        lower.includes('passcode') || lower.includes('cvv') || lower.includes('pin')
      ) {
        replyText =
          `### 🔒 Golden Rule: OTP & Authentication Passcode Security\n\n` +
          `**Absolute Zero-Trust Rule**: **Legitimate banks, telecom operators, government entities, and support teams NEVER ask for OTPs, CVVs, or passwords over the phone or chat.**\n\n` +
          `**Common OTP Theft Excuses:**\n` +
          `• *'I am bank fraud control. Read the 6-digit code to cancel an unauthorized transaction.'* (The code is actually authorizing the transaction!)\n` +
          `• *'Share OTP to verify delivery of your courier.'*\n` +
          `• *'Provide code to upgrade your SIM to 5G without interruption.'*\n\n` +
          `**Defensive Protocol:**\n` +
          `• Read the SMS carefully: does it say *'OTP for transaction of ₹...' * or *'OTP for NetBanking registration'*? Disclosing it grants instant access to your funds.\n` +
          `• If pressured, disconnect the call immediately.`;
        suggestedActions = [
          { label: '⚠️ Scan Suspicious Request in Message Tool', action: () => onOpenQuickAnalysis('message') }
        ];
      }
      // 10. STIR/SHAKEN / Telecom Spoofing / Caller ID Verification
      else if (
        lower.includes('stir') || lower.includes('shaken') || lower.includes('caller') ||
        lower.includes('spoof') || lower.includes('number') || lower.includes('voip')
      ) {
        replyText =
          `### 📞 STIR/SHAKEN Telecom Attestation & Spoofing Defense\n\n` +
          `**What STIR/SHAKEN Means:**\n` +
          `STIR/SHAKEN is the cryptographic telecom framework that validates whether incoming caller IDs are authentic or spoofed:\n\n` +
          `• **Level A (Full Attestation)**: The originating carrier verifies the caller's identity AND confirms they own the rights to display that phone number (Legitimate).\n` +
          `• **Level B (Partial Attestation)**: The carrier knows who is calling, but cannot verify if they own the caller ID displayed (Elevated Risk).\n` +
          `• **Level C (Gateway Attestation)**: The call originated outside verified carrier routes, such as international VoIP gateways or unregulated SIP trunks (**Highest Spoofing Risk**).\n\n` +
          `**How VERITY Helps:**\n` +
          `VERITY inspects SIP routing telemetry and caller carrier reputation in real-time, alerting you before you pick up.`;
        suggestedActions = [
          { label: '📞 Launch In-Call Protection Session', action: () => onOpenQuickAnalysis('call') }
        ];
      }
      // 11. Homograph / Punycode / URL & Link Phishing
      else if (
        lower.includes('link') || lower.includes('url') || lower.includes('homograph') ||
        lower.includes('website') || lower.includes('phish') || lower.includes('punycode')
      ) {
        replyText =
          `### 🔗 Homograph Attacks & Malicious URL Detection\n\n` +
          `**How Homograph Spoofing Works:**\n` +
          `Attackers register domains using internationalized characters that look identical to regular letters (e.g., Cyrillic 'а' instead of Latin 'a', so \`chаse.com\` renders identically but routes to \`xn--chse-43d.com\`).\n\n` +
          `**Key Indicators Inspected by VERITY URL Sandbox:**\n` +
          `• **Punycode Decompilation**: Exposes hidden Cyrillic/Greek Unicode homoglyphs.\n` +
          `• **SSL Issuer & Domain Age**: Flags domains registered within the last 14–30 days with free automated certificates.\n` +
          `• **Credential Harvest Traps**: Checks for forged password input fields and spoofed bank branding.\n\n` +
          `**Action**: Paste any suspicious URL into VERITY's **URL Scanner** to safely inspect it in an isolated sandbox without opening it on your device.`;
        suggestedActions = [
          { label: '🔗 Scan URL in VERITY Sandbox', action: () => onOpenQuickAnalysis('url') }
        ];
      }
      // 12. VERITY Platform Capabilities / Features / How it Works
      else if (
        lower.includes('how') || lower.includes('framework') || lower.includes('pillars') ||
        lower.includes('work') || lower.includes('score') || lower.includes('verity')
      ) {
        replyText =
          `### 🛡️ VERITY Zero-Trust Multimodal Fraud Defense\n\n` +
          `**VERITY** is a free, citizen-focused multi-modal security platform engineered to defeat modern AI-driven impersonation and fraud:\n\n` +
          `**The 4-Pillar Verification Model:**\n` +
          `1. **WHO (Identity Trust)**: STIR/SHAKEN Level A attestation, carrier lineage, and biometric verification.\n` +
          `2. **WHAT (Communication Authenticity)**: Acoustic neural vocoder spectral analysis, visual deepfake artifact detection, and NLP coercion detection.\n` +
          `3. **ACTION (Sensitive Risk)**: Detects OTP harvesting, unauthorized fund transfers, credential theft, and extortion threats.\n` +
          `4. **VERDICT (Composite Score 0–100)**:\n` +
          `   • **0–30 (Low Risk)**: Verified and nominal.\n` +
          `   • **31–69 (Medium Risk)**: Caution required; verify out-of-band.\n` +
          `   • **70–84 (High Risk)**: Severe synthetic or coercion markers.\n` +
          `   • **85–100 (Critical Risk)**: Active attack; auto-block recommended.\n\n` +
          `**Key Modules Available:**\n` +
          `• **Call Protection**: Live in-call telemetry defense\n` +
          `• **Voice Forensic Scan**: AI synthetic audio inspection\n` +
          `• **Message & URL Sandbox**: Phishing and malicious domain deconstruction\n` +
          `• **Forensic Audit Ledger**: Cryptographic PDF generation for police & bank reporting.`;
        suggestedActions = [
          { label: '📞 Open Call Protection', action: () => onOpenQuickAnalysis('call') },
          { label: '🎙️ Open Voice Scan', action: () => onOpenQuickAnalysis('voice') },
          { label: '⚠️ Check Suspicious Message', action: () => onOpenQuickAnalysis('message') }
        ];
      }
      // 13. Dynamic Custom Scenario Synthesizer
      else {
        replyText =
          `### 🛡️ VERITY AI Security Analysis: "${text}"\n\n` +
          `**Threat Assessment & Zero-Trust Advisory:**\n` +
          `Any inbound interaction demanding urgency, emotional pressure, financial action, or credential verification must be treated as **Untrusted** until independently verified.\n\n` +
          `**Core Defensive Rules:**\n` +
          `1. **Out-of-Band Verification**: Never trust inbound caller ID, SMS headers, or message sender names. Initiate contact yourself using a verified official telephone number.\n` +
          `2. **Zero Credential Sharing**: Never disclose OTPs, UPI PINs, banking passwords, or remote desktop codes over any channel.\n` +
          `3. **Dual Authorization**: Enforce secondary independent sign-off before making unexpected wire transfers or sensitive account changes.\n` +
          `4. **Audit & Report**: If this interaction seemed suspicious, log it in VERITY's Forensic Ledger and report caller numbers to **1930 / cybercrime.gov.in**.\n\n` +
          `You can paste the exact message, phone number, or URL here to evaluate it directly, or launch one of VERITY's specialized scan engines below.`;
        suggestedActions = [
          { label: '📞 Live Call Protection', action: () => onOpenQuickAnalysis('call') },
          { label: '🎙️ Voice Forensic Scan', action: () => onOpenQuickAnalysis('voice') },
          { label: '⚠️ Message Analysis', action: () => onOpenQuickAnalysis('message') },
          { label: '🔗 URL Sandbox Check', action: () => onOpenQuickAnalysis('url') }
        ];
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-new',
        sender: 'assistant',
        text: `Chat session refreshed. How can I help secure your interactions today?`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Anchored with safe margins on desktop and mobile) */}
      {!isOpen && (
        <div className={`fixed z-40 pointer-events-none transition-all duration-300 ${
          isMobile 
            ? 'inset-x-0 bottom-20 pointer-events-none' 
            : 'bottom-6 right-6 sm:bottom-8 sm:right-8'
        }`}>
          <div className={isMobile ? 'max-w-md mx-auto px-4 flex justify-end' : ''}>
            <button
              onClick={() => {
                setIsOpen(true);
                setUnreadCount(0);
              }}
              title="VERITY AI Security Copilot"
              aria-label="Open VERITY Copilot"
              className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-cyan-400 to-sky-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.65)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] border-2 border-cyan-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all duration-200 cursor-pointer"
            >
              {/* Outer pulsing ring for high visibility */}
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping pointer-events-none -z-10" />

              {/* High-visibility Copilot Logo */}
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950 text-cyan-400 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-500 text-white shadow-lg border border-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive Chatbot Modal Widget */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div 
            ref={chatContainerRef}
            className={`flex flex-col rounded-2xl shadow-2xl border border-slate-700/90 bg-slate-900 overflow-hidden w-full transition-all duration-300 ${
              isMobile 
                ? 'max-w-md h-[82vh] max-h-[640px]' 
                : 'max-w-[420px] ' + (isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]')
            }`}
          >
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white tracking-tight leading-tight font-sans">
                      VERITY Copilot
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      AI Active
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    Multimodal Fraud & Security Assistant
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {!isMobile && (
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    title={isMinimized ? "Expand" : "Minimize"}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/60 font-sans text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 border border-cyan-500/40 text-cyan-400'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>

                      {/* Message Bubble */}
                      <div className={`max-w-[85%] rounded-2xl p-3 shadow-md space-y-2 ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-normal">
                          {msg.text}
                        </div>

                        {/* Suggested Action Chips inside message */}
                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="pt-1.5 flex flex-wrap gap-1.5 border-t border-slate-800/80">
                            {msg.suggestedActions.map((act, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  act.action();
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 transition-colors cursor-pointer"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ))}
                          </div>
                        )}

                        <span className={`text-[9px] block text-right font-mono ${
                          msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing animation indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-slate-400 p-2">
                      <Bot className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span className="text-[11px] font-mono">VERITY Copilot is thinking...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* FAQ Chips suggestions */}
                <div className="p-2 border-t border-slate-800/80 bg-slate-900/90 overflow-x-auto">
                  <div className="flex items-center gap-1.5 min-w-max pb-0.5">
                    {FAQ_SUGGESTIONS.map((faq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(faq)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-200 border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask a question or describe an interaction..."
                    className="flex-1 px-3 py-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};
