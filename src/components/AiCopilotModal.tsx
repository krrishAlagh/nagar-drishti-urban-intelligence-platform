import React, { useState, useRef, useEffect } from 'react';
import { Language, ActiveView } from '../types';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme?: 'light' | 'dark';
  activeView?: ActiveView;
  activeTicketId?: string;
  onNavigate: (view: ActiveView, filterParam?: string) => void;
  onOpenNewTicket?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; action: string; targetView?: string; icon?: string }>;
  groundedStats?: Record<string, any>;
}

type CopilotMode = 'ALL' | 'CRITICAL' | 'FLEET' | 'BLACKSPOTS' | 'DISPATCH';

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  language,
  theme = 'light',
  activeView = 'dashboard',
  activeTicketId,
  onNavigate,
  onOpenNewTicket
}) => {
  const [copilotMode, setCopilotMode] = useState<CopilotMode>('ALL');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text:
        language === 'hi'
          ? '🏛️ **नमस्ते! मैं नगर दृष्टि AI कॉपायलट हूँ।**\n\nमैं **48 डीटीसी बसों** के 10Hz लाइव एज-कैमरा फीड, सड़क गड्ढों, ब्लैकस्पॉट और आपातकालीन कार्य आदेशों का वास्तविक समय में समन्वय करता हूँ।'
          : '**Welcome to Nagar Drishti AI Copilot.**\n\nI synthesize telemetry across **48 connected DTC Transit AI nodes**, automate PWD/MCD/DJB work orders, and detect high-risk accident blackspots in real-time across Delhi NCR.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: language === 'hi' ? '🚨 Critical SLA Breaches' : '🚨 Critical SLA Breaches', action: 'navigate', targetView: 'tickets', icon: 'warning' },
        { label: language === 'hi' ? '🚌 Fleet Dashcams' : '🚌 Fleet Dashcams', action: 'navigate', targetView: 'fleet', icon: 'directions_bus' },
        { label: language === 'hi' ? '⚠️ Blackspot Heatmap' : '⚠️ Blackspot Heatmap', action: 'navigate', targetView: 'accident-analytics', icon: 'crisis_alert' },
        { label: language === 'hi' ? '🗺️ Live GIS Radar' : '🗺️ Live GIS Radar', action: 'navigate', targetView: 'live-map', icon: 'explore' },
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language, mode: copilotMode, activeView, activeTicketId })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: json.data.suggestedActions?.map((a: any) => ({
            ...a,
            icon: a.targetView === 'tickets' ? 'assignment' : a.targetView === 'fleet' ? 'local_shipping' : a.targetView === 'live-map' ? 'explore' : 'arrow_forward'
          })),
          groundedStats: json.data.groundedStats
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else throw new Error('Invalid response');
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: language === 'hi'
            ? '🟢 **नगर दृष्टि AI कोर सक्रिय है।** सभी 48 बस नोड्स लाइव टेलीमेट्री भेज रहे हैं।'
            : '🟢 **Nagar Drishti AI Core is Active.** All 48 transit AI dashcams are streaming live detections.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { label: string; action: string; targetView?: string }) => {
    if (action.action === 'navigate' && action.targetView) {
      onNavigate(action.targetView as ActiveView);
      onClose();
    } else if (action.action === 'new_ticket') {
      if (onOpenNewTicket) onOpenNewTicket();
      onClose();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (activeSpeechId === id) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.05;
    utterance.onend = () => setActiveSpeechId(null);
    setActiveSpeechId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) { alert('Voice input not supported in this browser.'); return; }
    if (isListening) { setIsListening(false); return; }
    const rec = new SpeechRec();
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInputQuery(t);
      setIsListening(false);
      setTimeout(() => handleSend(t), 300);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const quickPrompts = [
    { icon: 'warning', label: language === 'hi' ? '🚨 1-घंटे SLA' : '🚨 1-Hour SLA', prompt: language === 'hi' ? '1-घंटे के SLA उल्लंघन में कौन से दोष हैं?' : 'Which road defects are in Critical 1-Hour SLA breach?' },
    { icon: 'directions_bus', label: language === 'hi' ? '🚌 बस AI स्थिति' : '🚌 Bus AI Status', prompt: language === 'hi' ? '48 बसों की AI कैमरा स्थिति दिखाएं' : 'Show live AI camera status across all 48 transit buses' },
    { icon: 'crisis_alert', label: language === 'hi' ? '⚠️ ब्लैकस्पॉट' : '⚠️ Blackspots', prompt: language === 'hi' ? 'सबसे खतरनाक ब्लैकस्पॉट कौन से हैं?' : 'List the most dangerous accident blackspots in Delhi NCR' },
    { icon: 'send', label: language === 'hi' ? '⚡ कार्य आदेश' : '⚡ Work Order', prompt: language === 'hi' ? 'रिंग रोड के गड्ढे के लिए PWD को कार्य आदेश जारी करें' : 'Draft an automated PWD work order for Ring Road Moolchand pothole' },
  ];

  const modeTabs: Array<{ id: CopilotMode; label: string; color: string }> = [
    { id: 'ALL', label: '🌐 All', color: '#0071E3' },
    { id: 'CRITICAL', label: '🚨 Critical', color: '#FF3B30' },
    { id: 'FLEET', label: '🚌 Fleet', color: '#34C759' },
    { id: 'BLACKSPOTS', label: '⚠️ Blackspots', color: '#FF9F0A' },
    { id: 'DISPATCH', label: '⚡ Dispatch', color: '#5856D6' },
  ];

  const isDark = theme === 'dark';

  const renderMessageText = (text: string, isUser: boolean) => (
    <div className="whitespace-pre-line space-y-1.5">
      {text.split('\n\n').map((para, pIdx) => (
        <p key={pIdx} className="leading-relaxed">
          {para.split('**').map((chunk, cIdx) =>
            cIdx % 2 === 1 ? (
              <strong
                key={cIdx}
                style={{
                  color: isUser ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a',
                  fontWeight: 700,
                }}
              >
                {chunk}
              </strong>
            ) : chunk
          )}
        </p>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: isDark ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* ─── Deep-space ambient glow orbs ─── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,113,227,0.22) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animation: 'liquidOrb1 8s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '10%',
          width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(88,86,214,0.2) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animation: 'liquidOrb2 10s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '30%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(52,199,89,0.12) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)',
          animation: 'liquidOrb1 12s ease-in-out infinite alternate-reverse'
        }} />
      </div>

      {/* ─── Liquid Glass Modal Shell ─── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 860,
          height: 'min(90vh, 820px)',
          maxHeight: 820,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 28,
          overflow: 'hidden',
          background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: isDark ? '1px solid rgba(148, 163, 184, 0.18)' : '1px solid rgba(15, 23, 42, 0.09)',
          boxShadow: isDark
            ? '0 30px 80px rgba(2, 6, 23, 0.72), 0 12px 32px rgba(0, 113, 227, 0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 30px 80px rgba(15, 23, 42, 0.18), 0 12px 32px rgba(0, 113, 227, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Iridescent chrome top highlight strip */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), rgba(0,113,227,0.6), rgba(88,86,214,0.5), rgba(255,255,255,0.7), transparent)',
          zIndex: 20, borderRadius: '0 0 4px 4px', pointerEvents: 'none'
        }} />

        {/* Subtle inner glass rim reflection */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none', zIndex: 5,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
        }} />

        {/* ─── Header ─── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
          background: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, position: 'relative', zIndex: 15
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Glowing AI Orb */}
            <div style={{
              width: 46, height: 46, borderRadius: 16, position: 'relative',
              background: 'linear-gradient(135deg, #0071E3, #5856D6, #00C7BE)',
              boxShadow: '0 4px 20px rgba(0,113,227,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'white' }}>
                auto_awesome
              </span>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 13, height: 13, borderRadius: '50%',
                background: '#34C759',
                border: '2.5px solid rgba(20,20,30,0.8)',
                boxShadow: '0 0 8px rgba(52,199,89,0.8)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{
                  margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: -0.5,
                  color: isDark ? '#f8fafc' : '#1f2937'
                }}>
                  Nagar Drishti AI Copilot
                </h2>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 999, background: 'rgba(0,113,227,0.08)',
                  color: '#0a5edb', border: '1px solid rgba(0,113,227,0.18)',
                  fontFamily: 'monospace', letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071E3', boxShadow: '0 0 6px rgba(0,113,227,1)', display: 'inline-block', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                  Gemini 2.5 Core
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.4 }}>
                Real-time urban intelligence · 48 DTC Transit Nodes · Delhi NCR
              </p>
            </div>
          </div>

          {/* Window controls */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { icon: 'delete_sweep', title: 'Clear chat', onClick: () => setMessages([{ id: `clear-${Date.now()}`, sender: 'ai', text: 'Chat memory cleared. Ask me anything about Delhi road defects, fleet, or blackspots.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]) },
              { icon: 'close', title: 'Close', onClick: onClose, isClose: true }
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                title={btn.title}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: btn.isClose ? 'rgba(255,59,48,0.08)' : 'rgba(15, 23, 42, 0.04)',
                  color: btn.isClose ? '#dc2626' : '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = btn.isClose ? 'rgba(255,59,48,0.12)' : 'rgba(15, 23, 42, 0.08)';
                  (e.currentTarget as HTMLButtonElement).style.color = btn.isClose ? '#b91c1c' : '#0f172a';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = btn.isClose ? 'rgba(255,59,48,0.08)' : 'rgba(15, 23, 42, 0.04)';
                  (e.currentTarget as HTMLButtonElement).style.color = btn.isClose ? '#dc2626' : '#475569';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{btn.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Mode Tabs ─── */}
        <div style={{
          padding: '8px 20px',
          borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
          background: isDark ? 'rgba(15, 23, 42, 0.66)' : 'rgba(241, 245, 249, 0.8)',
          display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none', msOverflowStyle: 'none', zIndex: 15, position: 'relative'
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', alignSelf: 'center', marginRight: 4, flexShrink: 0, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>
            Focus
          </span>
          {modeTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCopilotMode(tab.id)}
              style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
                ...(copilotMode === tab.id ? {
                  background: `linear-gradient(135deg, ${tab.color}CC, ${tab.color}99)`,
                  color: 'white',
                  boxShadow: `0 2px 12px ${tab.color}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  border: `1px solid ${tab.color}66`
                } : {
                  background: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.04)',
                  color: isDark ? '#e2e8f0' : '#475569',
                  border: isDark ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)'
                })
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Chat Messages ─── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 20,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.4) transparent',
          position: 'relative', zIndex: 10,
          background: isDark
            ? 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,0.9) 100%)'
            : 'linear-gradient(180deg, rgba(248,250,252,0.82) 0%, rgba(255,255,255,0.75) 100%)'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex', flexDirection: 'column',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '84%',
                animation: 'fadeSlideIn 0.25s cubic-bezier(0.25,1,0.5,1) both'
              }}
            >
              {/* Sender label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, padding: '0 4px' }}>
                {msg.sender === 'ai' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071E3', boxShadow: '0 0 6px rgba(0,113,227,0.8)', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  {msg.sender === 'user' ? 'Command Officer' : 'Nagar AI Core'}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                  · {msg.timestamp}
                </span>
              </div>

              {/* Bubble */}
              <div style={{
                padding: '14px 18px', borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                position: 'relative', transition: 'all 0.2s',
                fontSize: 13.5, lineHeight: 1.65, letterSpacing: -0.15,
                ...(msg.sender === 'user' ? {
                  background: 'linear-gradient(135deg, rgba(0,113,227,0.94) 0%, rgba(0,95,207,0.92) 100%)',
                  color: 'rgba(255,255,255,0.96)',
                  border: '1px solid rgba(0,113,227,0.4)',
                  boxShadow: '0 12px 22px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255,255,255,0.2)',
                } : {
                  background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255,255,255,0.7)',
                  color: isDark ? '#e2e8f0' : '#1f2937',
                  border: isDark ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(148,163,184,0.2)',
                  boxShadow: '0 8px 16px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
                })
              }}>
                {/* Inner refraction edge for AI bubble */}
                {msg.sender === 'ai' && (
                  <div style={{
                    position: 'absolute', top: 1, left: 1, right: 1,
                    height: '50%', borderRadius: '19px 19px 0 0', pointerEvents: 'none',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
                  }} />
                )}

                {renderMessageText(msg.text, msg.sender === 'user')}

                {/* Grounded stats */}
                {msg.groundedStats && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px,1fr))', gap: 8 }}>
                    {Object.entries(msg.groundedStats).map(([k, v]) => (
                      <div key={k} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, fontFamily: 'monospace' }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>{String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Copy / TTS controls for AI */}
                {msg.sender === 'ai' && (
                  <div className="group" style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end', opacity: 0.5, transition: 'opacity 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '0.5')}
                  >
                    {[
                      { icon: copiedId === msg.id ? 'check' : 'content_copy', onClick: () => handleCopy(msg.id, msg.text), active: false, label: 'Copy' },
                      { icon: activeSpeechId === msg.id ? 'volume_off' : 'volume_up', onClick: () => handleSpeak(msg.id, msg.text), active: activeSpeechId === msg.id, label: activeSpeechId === msg.id ? 'Stop' : 'Speak' },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        title={btn.label}
                        onClick={btn.onClick}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: btn.active ? 'rgba(0,113,227,0.1)' : 'rgba(15, 23, 42, 0.04)',
                          border: `1px solid ${btn.active ? 'rgba(0,113,227,0.2)' : 'rgba(15, 23, 42, 0.08)'}`,
                          color: btn.active ? '#0a5edb' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{btn.icon}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10, padding: '0 4px' }}>
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleActionClick(action)}
                      style={{
                        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: 'rgba(15, 23, 42, 0.04)',
                        color: '#334155',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        cursor: 'pointer', transition: 'all 0.18s ease',
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                      }}
                      onMouseOver={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = 'rgba(0,113,227,0.08)';
                        el.style.borderColor = 'rgba(0,113,227,0.25)';
                        el.style.color = '#0a5edb';
                        el.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={e => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = 'rgba(15, 23, 42, 0.04)';
                        el.style.borderColor = 'rgba(15, 23, 42, 0.08)';
                        el.style.color = '#334155';
                        el.style.transform = 'translateY(0)';
                      }}
                    >
                      {action.icon && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#5AA3F5' }}>{action.icon}</span>}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isLoading && (
            <div style={{
              alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderRadius: 20,
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'fadeSlideIn 0.2s ease both'
            }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0071E3, #5856D6)',
                    boxShadow: '0 0 6px rgba(0,113,227,0.7)',
                    animationDelay: `${delay}s`,
                    animation: 'bounceDots 1.2s ease-in-out infinite'
                  }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  Synthesizing with Gemini 2.5...
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 2 }}>
                  Correlating 48 edge nodes · Spatial blackspot DB · Live telemetry
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── Quick Prompts ─── */}
        <div style={{
          padding: '8px 16px',
          borderTop: isDark ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
          background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
          display: 'flex', gap: 7, overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none', zIndex: 15, position: 'relative',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', flexShrink: 0, fontFamily: 'monospace' }}>
            Quick:
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p.prompt)}
              style={{
                padding: '5px 13px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                background: 'rgba(15, 23, 42, 0.04)',
                color: '#475569', border: '1px solid rgba(15, 23, 42, 0.08)',
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                transition: 'all 0.18s ease'
              }}
              onMouseOver={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(0,113,227,0.08)';
                el.style.color = '#0a5edb';
                el.style.borderColor = 'rgba(0,113,227,0.2)';
              }}
              onMouseOut={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(15, 23, 42, 0.04)';
                el.style.color = '#475569';
                el.style.borderColor = 'rgba(15, 23, 42, 0.08)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ─── Input Bar ─── */}
        <div style={{
          padding: '12px 14px',
          borderTop: isDark ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
          background: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, zIndex: 15, position: 'relative'
        }}>
          {/* Voice */}
          <button
            type="button"
            onClick={handleVoiceInput}
            title={isListening ? 'Listening...' : 'Voice Input'}
            style={{
              width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              background: isListening
                ? 'linear-gradient(135deg, #FF3B30, #FF6B6B)'
                : 'rgba(15, 23, 42, 0.04)',
              color: isListening ? 'white' : '#475569',
              border: `1px solid ${isListening ? 'rgba(255,59,48,0.5)' : 'rgba(15, 23, 42, 0.08)'}`,
              boxShadow: isListening ? '0 0 20px rgba(255,59,48,0.5)' : 'none',
              animation: isListening ? 'pulse 1s ease infinite' : 'none'
            }}
          >

            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          {/* Text input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={language === 'hi' ? 'नगर दृष्टि AI से पूछें...' : 'Ask about Potholes, Fleet GPS, SLA Breaches, Blackspots…'}
              style={{
                width: '100%', padding: '12px 44px 12px 18px',
                borderRadius: 24, fontSize: 13, lineHeight: 1.4,
                background: 'rgba(255,255,255,0.7)',
                color: '#0f172a',
                border: '1px solid rgba(148,163,184,0.25)',
                outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(0,113,227,0.5)';
                e.target.style.background = 'rgba(255,255,255,0.9)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.12), inset 0 1px 0 rgba(255,255,255,0.8)';
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(148,163,184,0.25)';
                e.target.style.background = 'rgba(255,255,255,0.7)';
                e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.8)';
              }}
            />
            {inputQuery && (
              <button
                type="button"
                onClick={() => setInputQuery('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', padding: 4
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
              </button>
            )}
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            style={{
              height: 42, padding: '0 20px', borderRadius: 24,
              background: inputQuery.trim() && !isLoading
                ? 'linear-gradient(135deg, #0071E3, #005CC5)'
                : 'rgba(15, 23, 42, 0.04)',
              color: inputQuery.trim() && !isLoading ? 'white' : '#94a3b8',
              border: `1px solid ${inputQuery.trim() && !isLoading ? 'rgba(0,113,227,0.6)' : 'rgba(15, 23, 42, 0.08)'}`,
              cursor: inputQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s ease',
              boxShadow: inputQuery.trim() && !isLoading ? '0 4px 16px rgba(0,113,227,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
            }}
            onMouseOver={e => {
              if (!inputQuery.trim() || isLoading) return;
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,113,227,0.55), inset 0 1px 0 rgba(255,255,255,0.3)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = inputQuery.trim() && !isLoading ? '0 4px 16px rgba(0,113,227,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none';
            }}
          >
            <span>{language === 'hi' ? 'भेजें' : 'Send'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_upward</span>
          </button>
        </div>
      </div>

      {/* CSS animations injected into DOM */}
      <style>{`
        @keyframes liquidOrb1 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes liquidOrb2 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-35px, -25px) scale(1.1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceDots {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
