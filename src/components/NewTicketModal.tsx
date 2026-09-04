import React, { useState } from 'react';
import { DefectItem, TicketPriority } from '../types';
import { ASSETS } from '../data/mockData';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket: (ticket: DefectItem) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onAddTicket
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DefectItem['category']>('Potholes');
  const [severity, setSeverity] = useState<TicketPriority>('HIGH');
  const [locationName, setLocationName] = useState('');
  const [ward, setWard] = useState('Ward C - Central');
  const [department, setDepartment] = useState('Roads & Bridges');
  const [description, setDescription] = useState('');
  const [isAiTriaging, setIsAiTriaging] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiAutoTriage = async () => {
    if (!title.trim() && !description.trim()) {
      alert('Please enter a brief title or description first for AI to analyze.');
      return;
    }

    setIsAiTriaging(true);
    try {
      const res = await fetch('/api/ai/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || title.trim(),
          location: locationName.trim() || ward,
          category
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.category) setCategory(d.category);
        if (d.severity) setSeverity(d.severity);
        if (d.recommendedDepartment) setDepartment(d.recommendedDepartment);
        if (d.confidence) setAiConfidence(d.confidence);
        if (d.actionPlan) setAiSummary(d.actionPlan);
      }
    } catch (err) {
      console.warn('AI Triage request fallback:', err);
    } finally {
      setIsAiTriaging(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    const newTicket: DefectItem = {
      id: `tk-${Date.now()}`,
      ticketNumber: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      severity,
      confidence: aiConfidence || 95.0,
      locationName: locationName.trim(),
      coordinates: {
        lat: 28.6139 + (Math.random() - 0.5) * 0.05,
        lng: 77.2090 + (Math.random() - 0.5) * 0.05,
        formatted: '28.6139° N, 77.2090° E'
      },
      ward,
      timestamp: 'Just now',
      timeAgo: 'Just now',
      imageUrl: ASSETS.potholeClose,
      department,
      slaRemaining: severity === 'CRITICAL' ? '01h 00m' : severity === 'HIGH' ? '04h 00m' : '24h 00m',
      isOverdue: false,
      description: description.trim() || 'Civic defect triaged via Nagar Drishti AI Core.',
      status: 'NEW',
      timeline: [
        { title: 'Reported & Triaged', subtitle: 'Nagar AI Core', time: 'Just now', completed: true, active: true },
        { title: 'Assigned', subtitle: 'Pending Dispatch', time: 'Pending', completed: false },
        { title: 'In Progress', subtitle: 'Crew on route', time: 'Pending', completed: false },
        { title: 'Resolved', subtitle: 'Field sign-off', time: 'Pending', completed: false }
      ]
    };

    onAddTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-black/10 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white/95 dark:bg-[#1c1c1e]/95">
        {/* Apple-Style Modal Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Create Work Order</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-mono">
                  AI-Powered
                </span>
              </div>
              <p className="text-[11px] text-[#86868b]">Manual defect entry with real-time Gemini AI triage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#86868b] hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-xs custom-scrollbar">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-slate-200">Defect Title / Problem</label>
              <button
                type="button"
                onClick={handleAiAutoTriage}
                disabled={isAiTriaging}
                className="text-[11px] font-bold text-[#0071E3] hover:text-[#0071E3]/80 flex items-center gap-1 bg-[#0071E3]/10 px-2.5 py-1 rounded-full cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>{isAiTriaging ? 'Triaging...' : '✨ AI Auto-Triage'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Pothole after rain on Ring Road"
              className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:outline-none transition-all text-xs"
            />
          </div>

          {/* AI Banner if triaged */}
          {aiConfidence !== null && (
            <div className="p-3 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] flex items-center justify-between text-xs font-semibold animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>AI Confidence: {aiConfidence}%</span>
              </div>
              <span className="text-[10px] text-slate-700 dark:text-slate-300 font-normal truncate max-w-[200px]">
                {aiSummary || 'Triage complete'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DefectItem['category'])}
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] text-xs outline-none cursor-pointer"
              >
                <option value="Potholes">Potholes</option>
                <option value="Streetlights">Streetlights</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Water Logging">Water Logging</option>
                <option value="Encroachment">Encroachment</option>
                <option value="Electrical">Electrical</option>
                <option value="Manhole Hazard">Manhole Hazard</option>
                <option value="Traffic Signal">Traffic Signal</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">Severity (SLA)</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as TicketPriority)}
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] text-xs outline-none cursor-pointer font-semibold"
              >
                <option value="CRITICAL">CRITICAL (1h SLA)</option>
                <option value="HIGH">HIGH (4h SLA)</option>
                <option value="MED">MEDIUM (24h SLA)</option>
                <option value="LOW">LOW (48h SLA)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800 dark:text-slate-200">Location Landmark</label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Ring Road near AIIMS Flyover Pillar 14"
              className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:outline-none transition-all text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] text-xs outline-none cursor-pointer"
              >
                <option value="Ward A - North">Ward A - North</option>
                <option value="Ward B - South">Ward B - South</option>
                <option value="Ward C - Central">Ward C - Central</option>
                <option value="Ward D - East">Ward D - East</option>
                <option value="Ward E - West">Ward E - West</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800 dark:text-slate-200">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800 dark:text-slate-200">Description & Field Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical dimensions, water depth, or immediate road safety hazard..."
              className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-transparent focus:border-[#0071E3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:outline-none transition-all text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-apple-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-apple-primary px-5 py-2 text-xs font-semibold cursor-pointer shadow-md"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
