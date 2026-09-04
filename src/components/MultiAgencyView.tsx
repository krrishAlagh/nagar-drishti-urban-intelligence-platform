import React, { useState } from 'react';
import { Language, CrossAgencyTicket } from '../types';
import { 
  CROSS_AGENCY_TICKETS, 
  AGENCY_CONTACTS, 
  SYSTEM_ALERTS, 
  TRANSLATIONS 
} from '../data/mockData';

interface MultiAgencyViewProps {
  language: Language;
}

export const MultiAgencyView: React.FC<MultiAgencyViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [tickets, setTickets] = useState<CrossAgencyTicket[]>(CROSS_AGENCY_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<CrossAgencyTicket | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: string; time: string; text: string; isMine?: boolean }>
  >([
    {
      sender: 'Roads & Highways (R. Sharma)',
      time: '10:15 AM',
      text: 'Water pipeline leak discovered right beneath our freshly resurfaced MG Road stretch. Need isolation before road collapse.'
    },
    {
      sender: 'Water Board (Duty Hydrologist)',
      time: '10:22 AM',
      text: 'Valve squad dispatched to isolate 400mm main. ETA 20 mins.'
    },
    {
      sender: 'Traffic Police Control',
      time: '10:28 AM',
      text: 'Lane 1 diverted toward flyover underpass to prevent congestion.'
    }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'Municipal Admin (Rajesh K.)',
        time: 'Just now',
        text: newMsg.trim(),
        isMine: true
      }
    ]);
    setNewMsg('');
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Apple Header */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.crossAgencyCollab}
            </h1>
            <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 border border-[#0071E3]/20 px-2.5 py-0.5 rounded-full font-mono">
              Inter-Agency Grid
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Synchronized civic response across PWD, Jal Board, Discoms, and Traffic Police.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewRequestModal(true)}
          className="btn-apple-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>{t.newRequest}</span>
        </button>
      </section>

      {/* Grid: Tickets Table & Right Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Cross-Agency Tickets Table (8 cols) */}
        <div className="lg:col-span-8 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-[16px] text-[#0071E3]">sync_alt</span>
              Active Inter-Department Hand-Offs
            </span>
            <span className="text-xs text-[#86868b] font-mono">
              {tickets.length} Active
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-[#86868b] uppercase text-[10px] font-mono">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Compound Civic Issue</th>
                  <th className="py-3 px-4">Origin ➔ Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Coordination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {tickets.map((tck) => (
                  <tr key={tck.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0071E3]">{tck.ticketCode}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{tck.issue}</p>
                      <span className="text-[11px] text-[#86868b]">{tck.lastUpdated}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-mono text-[#86868b]">
                      {tck.originatingDept} ➔ {tck.receivingDept}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold bg-[#FF9F0A]/10 text-[#FF9F0A] px-2.5 py-0.5 rounded-full font-mono">
                        {tck.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(tck)}
                        className="btn-apple-secondary px-3 py-1 text-[11px] font-semibold cursor-pointer"
                      >
                        Open Comms
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agency Directory (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Emergency Duty Roster</h3>
            <span className="text-xs text-[#86868b] font-mono">Live Comms</span>
          </div>

          <div className="flex flex-col gap-3">
            {AGENCY_CONTACTS.map((contact) => (
              <div key={contact.name} className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                  <span className="text-[11px] text-[#86868b]">{contact.designation} • {contact.officer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Connecting directly to ${contact.name} (${contact.phone})...`)}
                  className="btn-apple-secondary p-2 rounded-full cursor-pointer"
                  title="Direct Call"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#34C759]">call</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apple Messages / Inter-Agency Collaboration Channel */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              National Cross-Agency Emergency Radio Channel
            </h3>
          </div>
          <span className="text-[11px] text-[#86868b] font-mono">Channel #01 - Urban Incident Control</span>
        </div>

        {/* Message Stream */}
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col max-w-[80%] ${msg.isMine ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-900 dark:text-white">{msg.sender}</span>
                <span className="text-[10px] text-[#86868b] font-mono">{msg.time}</span>
              </div>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.isMine
                    ? 'bg-[#0071E3] text-white rounded-br-none'
                    : 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Send Input */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type message to all agency coordinators..."
            className="flex-1 p-3 bg-black/5 dark:bg-white/10 rounded-full text-xs outline-none focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-1 focus:ring-[#0071E3] transition-all text-slate-900 dark:text-white placeholder-[#86868b]"
          />
          <button
            type="submit"
            className="btn-apple-primary px-5 py-3 rounded-full text-xs font-semibold cursor-pointer shadow-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
