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

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Context-aware intelligent response generation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = '';
      let suggestedActions: { label: string; action: () => void }[] | undefined;

      if (lower.includes('voice') || lower.includes('audio') || lower.includes('clone') || lower.includes('deepfake voice')) {
        replyText = KNOWLEDGE_RESPONSES['voice'];
        suggestedActions = [
          {
            label: '🎙️ Run Voice Clone Analysis',
            action: () => onOpenQuickAnalysis('voice')
          },
          {
            label: '📞 Check Live Call Protection',
            action: () => onOpenQuickAnalysis('call')
          }
        ];
      } else if (lower.includes('wire') || lower.includes('money') || lower.includes('transfer') || lower.includes('payment') || lower.includes('bank')) {
        replyText = KNOWLEDGE_RESPONSES['wire'];
        suggestedActions = [
          {
            label: '⚠️ Analyze Suspicious Message',
            action: () => onOpenQuickAnalysis('message')
          }
        ];
      } else if (lower.includes('stir') || lower.includes('shaken') || lower.includes('caller') || lower.includes('spoof') || lower.includes('number')) {
        replyText = KNOWLEDGE_RESPONSES['stir'];
        suggestedActions = [
          {
            label: '📞 Inspect Inbound Number',
            action: () => onOpenQuickAnalysis('call')
          }
        ];
      } else if (lower.includes('link') || lower.includes('url') || lower.includes('website') || lower.includes('homograph') || lower.includes('phish')) {
        replyText = KNOWLEDGE_RESPONSES['homograph'];
        suggestedActions = [
          {
            label: '🔗 Verify URL Legitimacy',
            action: () => onOpenQuickAnalysis('url')
          }
        ];
      } else if (lower.includes('how') || lower.includes('framework') || lower.includes('pillars') || lower.includes('work')) {
        replyText = KNOWLEDGE_RESPONSES['how does verity evaluate'];
      } else {
        replyText = `I have analyzed your query regarding **"${text}"** against the VERITY Threat Intelligence database.\n\n` +
          `**Zero-Trust Recommendation:**\n` +
          `• **Never disclose credentials, OTPs, or authorize funds** without independent verification.\n` +
          `• If this involves an inbound phone call or voice memo, submit the audio or number for real-time acoustic & STIR/SHAKEN correlation.\n` +
          `• Would you like me to open a multi-modal analysis scan right now?`;
        suggestedActions = [
          {
            label: '🛡️ Start Multi-Vector Scan',
            action: () => onOpenQuickAnalysis('call')
          }
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
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 700);
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
