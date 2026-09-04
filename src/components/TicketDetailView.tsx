import React, { useState, useEffect } from 'react';
import { DefectItem, Language } from '../types';
import { ASSETS, TRANSLATIONS } from '../data/mockData';
import { CctvFootageModal, DATASET_CCTV_VIDEOS } from './CctvFootageModal';

interface TicketDetailViewProps {
  language: Language;
  ticket: DefectItem;
  onBack: () => void;
  onUpdateStatus: (ticketId: string, status: DefectItem['status']) => void;
  onAddComment: (ticketId: string, commentText: string) => void;
}

interface CrewTeam {
  id: string;
  name: string;
  team: string;
  lead: string;
  phone: string;
  avatar: string;
  department: string;
}

interface VideoDataset {
  id: string;
  name: string;
  folder: string;
  videos: number;
  totalSize: string;
  date: string;
  description: string;
  videoUrls?: string[];
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  language,
  ticket,
  onBack,
  onUpdateStatus,
  onAddComment
}) => {
  const t = TRANSLATIONS[language];
  const [newComment, setNewComment] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<CrewTeam | null>(null);
  const [crewList, setCrewList] = useState<CrewTeam[]>([]);
  const [videoDatasets, setVideoDatasets] = useState<VideoDataset[]>([]);
  const [isAssigningWork, setIsAssigningWork] = useState(false);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    actionPlan?: string;
    detectedHazards?: string[];
    materialsEstimated?: string[];
    confidence?: number;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCctvOpen, setIsCctvOpen] = useState(false);

  // Load crew list on mount
  useEffect(() => {
    const loadCrewList = async () => {
      try {
        // Load default crew teams - in production, this would come from an API
        const crews: CrewTeam[] = [
          {
            id: 'crew-1',
            name: 'Central Roads Maintenance Team',
            team: 'Roads & Bridges - Central Zone',
            lead: 'R. Sharma',
            phone: '+91 98112 00192',
            avatar: ASSETS.sharmaAvatar,
            department: 'PWD (Roads & Bridges) - Central Zone'
          },
          {
            id: 'crew-2',
            name: 'Team B Emergency',
            team: 'Rapid Emergency Hydrology',
            lead: 'Team B Lead',
            phone: '+91 98731 99201',
            avatar: ASSETS.teamBAvatar,
            department: 'Rapid Emergency Hydrology'
          },
          {
            id: 'crew-3',
            name: 'Electrical Maintenance Div 2',
            team: 'Electrical & Lighting Department',
            lead: 'Rajesh Electrical',
            phone: '+91 98002 33456',
            avatar: ASSETS.adminAvatar,
            department: 'BSES / Electrical Dept'
          },
          {
            id: 'crew-4',
            name: 'Sanitation Squad 4',
            team: 'Water Supply & Sanitation',
            lead: 'Kumar Sani',
            phone: '+91 98765 43210',
            avatar: ASSETS.sharmaAvatar,
            department: 'Delhi Water Board'
          }
        ];
        setCrewList(crews);
        
        // Pre-select crew if already assigned
        if (ticket.assignedTo?.name) {
          const assigned = crews.find(c => c.name === ticket.assignedTo?.name);
          if (assigned) {
            setSelectedCrew(assigned);
          } else {
            setSelectedCrew(crews[0]);
          }
        } else {
          setSelectedCrew(crews[0]);
        }
      } catch (err) {
        console.warn('Error loading crew list:', err);
      }
    };
    loadCrewList();
  }, [ticket]);

  // Load video datasets
  useEffect(() => {
    const loadDatasets = async () => {
      setIsLoadingDatasets(true);
      try {
        const res = await fetch(`/api/defects/${ticket.id}/datasets`);
        if (res.ok) {
          const json = await res.json();
          setVideoDatasets(json.data || []);
        }
      } catch (err) {
        console.warn('Error loading datasets:', err);
        // Set default datasets if API fails
        setVideoDatasets([
          {
            id: 'dataset-1',
            name: '10th July - Dataset 001',
            folder: '10th July-20231125T045234Z-001',
            videos: 12,
            totalSize: '2.4GB',
            date: '2023-07-10',
            description: 'Urban defect detection and traffic analysis'
          }
        ]);
      } finally {
        setIsLoadingDatasets(false);
      }
    };
    loadDatasets();
  }, [ticket.id]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(ticket.id, newComment.trim());
    setNewComment('');
  };

  const handleAssignWork = async () => {
    if (!selectedCrew) {
      alert('Please select a crew team');
      return;
    }

    setIsAssigningWork(true);
    try {
      const res = await fetch(`/api/defects/${ticket.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewName: selectedCrew.name,
          crewTeam: selectedCrew.team,
          crewLead: {
            name: selectedCrew.lead,
            avatar: selectedCrew.avatar
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          onUpdateStatus(ticket.id, 'ASSIGNED');
          alert(`✓ Work order assigned to ${selectedCrew.name}`);
        }
      } else {
        alert('Failed to assign work order. Please try again.');
      }
    } catch (err) {
      console.error('Work assignment error:', err);
      alert('Error assigning work order');
    } finally {
      setIsAssigningWork(false);
    }
  };

  const handleFetchAiWorkOrder = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          location: ticket.locationName,
          category: ticket.category
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F7] dark:bg-black overflow-y-auto custom-scrollbar">
      {/* Top Apple Header / Breadcrumb & Actions */}
      <div className="glass-card px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 m-4 sm:m-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
            title="Back to Tickets"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white">
                {ticket.ticketNumber}
              </h2>
              <span
                className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                  ticket.severity === 'CRITICAL' || ticket.severity === 'HIGH'
                    ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                    : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                }`}
              >
                {ticket.severity}
              </span>
              <span className="bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
                {ticket.category}
              </span>
            </div>
            <p className="text-xs text-[#86868b]">{ticket.title}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCctvOpen(true)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[15px] animate-pulse">videocam</span>
            <span>View CCTV Clip</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Ticket ${ticket.ticketNumber} flagged as duplicate.`)}
            className="btn-apple-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#86868b]">content_copy</span>
            <span>{t.markDuplicate}</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Ticket ${ticket.ticketNumber} escalated to Zonal Commissioner.`)}
            className="px-3.5 py-1.5 bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">priority_high</span>
            <span>{t.escalate}</span>
          </button>

          {ticket.status === 'NEW' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'ASSIGNED')}
              className="btn-apple-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
              <span>Dispatch Work Order</span>
            </button>
          )}

          {ticket.status === 'ASSIGNED' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
              className="px-4 py-1.5 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">handyman</span>
              <span>Start On-Site Work</span>
            </button>
          )}

          {ticket.status === 'IN_PROGRESS' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')}
              className="px-4 py-1.5 bg-[#34C759] hover:bg-[#34C759]/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Mark as Resolved</span>
            </button>
          )}

          {ticket.status === 'RESOLVED' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
              className="btn-apple-secondary px-4 py-1.5 text-xs font-semibold cursor-pointer"
            >
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      {/* Visual 4-Step Progress Banner */}
      <div className="mx-4 sm:mx-6 mb-6">
        <div className="glass-card p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#34C759]/10 flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#34C759] text-white flex items-center justify-center text-[10px] font-bold mb-1">
              ✓
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">1. AI Detection</span>
            <span className="text-[10px] text-[#86868b] font-mono">Bus Dashcam</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status !== 'NEW'
                ? 'bg-[#34C759]/10'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status !== 'NEW' ? 'bg-[#34C759] text-white' : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status !== 'NEW' ? '✓' : '2'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">2. Work Order</span>
            <span className="text-[10px] text-[#86868b] font-mono">Crew Assigned</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED'
                ? 'bg-[#0071E3]/15'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status === 'RESOLVED'
                  ? 'bg-[#34C759] text-white'
                  : ticket.status === 'IN_PROGRESS'
                  ? 'bg-[#0071E3] text-white animate-pulse'
                  : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status === 'RESOLVED' ? '✓' : '3'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">3. On-Site Repair</span>
            <span className="text-[10px] text-[#86868b] font-mono">Crew Active</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status === 'RESOLVED'
                ? 'bg-[#34C759]/20'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status === 'RESOLVED' ? 'bg-[#34C759] text-white' : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status === 'RESOLVED' ? '✓' : '4'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">4. Verified & Closed</span>
            <span className="text-[10px] text-[#86868b] font-mono">Quality Sign-off</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full pb-24">
        {/* Left Col (7 cols): Evidence & Location */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* AI Evidence Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">photo_camera</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.detectionEvidence}
                </h3>
              </div>
              <span className="bg-[#34C759]/10 text-[#34C759] text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full">
                AI Match: {ticket.confidence}%
              </span>
            </div>

            {/* Photo with Bounding Box Overlay */}
            <div className="relative bg-black min-h-[320px] flex items-center justify-center overflow-hidden group">
              <img
                src={ticket.imageUrl || ASSETS.potholeClose}
                alt="Defect Evidence"
                className="w-full h-auto max-h-[440px] object-cover"
              />

              {/* Simulated AI Bounding Box */}
              <div className="absolute top-[32%] left-[28%] w-[44%] h-[38%] border-2 border-[#FF3B30] bg-[#FF3B30]/15 rounded-md pointer-events-none flex flex-col justify-between p-1.5 animate-pulse">
                <div className="bg-[#FF3B30] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full self-start shadow">
                  Pothole: {ticket.confidence}%
                </div>
                <div className="bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md self-end">
                  Est. Depth: ~12cm
                </div>
              </div>

              {/* Edge Telemetry Stamp */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white p-2.5 rounded-2xl text-[10px] font-mono leading-relaxed border border-white/10">
                <div>Source: Transit AI Dashcam (BUS-402)</div>
                <div>Timestamp: {ticket.timestamp}</div>
                <div>Vehicle Speed: 24 km/h | Heading: 142° SE</div>
              </div>
            </div>

            <div className="p-4 bg-black/5 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">Incident Analysis: </span>
              {ticket.description}
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">pin_drop</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.preciseLocation}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                {ticket.ward}
              </span>
            </div>

            <div className="relative h-48 bg-slate-900">
              <img
                src={ASSETS.mapBase}
                alt="Map Snapshot"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                </div>
              </div>
            </div>

            <div className="p-4 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{ticket.locationName}</p>
                <p className="text-[11px] text-[#86868b] font-mono">{ticket.coordinates?.formatted || '28.6139° N, 77.2090° E'}</p>
              </div>
              <button
                type="button"
                onClick={() => alert(`Coordinates copied: ${ticket.coordinates?.formatted}`)}
                className="btn-apple-secondary px-3 py-1 text-xs font-semibold cursor-pointer"
              >
                Copy GPS
              </button>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): SLA, AI Action Plan & Timeline */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SLA Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">SLA Resolution Countdown</h3>
              <span className="text-xs font-mono font-bold text-[#FF3B30]">{ticket.slaRemaining}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Department:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{ticket.department}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Assigned Crew:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{ticket.assignedTo?.name || 'Not Assigned'}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Logged Timestamp:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{ticket.timestamp}</strong>
            </div>

            {/* Work Assignment UI - Only for NEW tickets */}
            {ticket.status === 'NEW' && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2.5">
                  <span className="material-symbols-outlined text-[14px] inline mr-1">assignment</span>
                  Assign Work Order to Crew
                </label>
                <div className="flex flex-col gap-2">
                  <select
                    value={selectedCrew?.id || ''}
                    onChange={(e) => {
                      const crew = crewList.find(c => c.id === e.target.value);
                      setSelectedCrew(crew || null);
                    }}
                    className="w-full bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-3 py-2.5 border border-black/10 dark:border-white/10 focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] outline-none transition-all"
                  >
                    <option value="">Select a crew team...</option>
                    {crewList.map((crew) => (
                      <option key={crew.id} value={crew.id}>
                        {crew.name} ({crew.team})
                      </option>
                    ))}
                  </select>

                  {selectedCrew && (
                    <div className="bg-[#0071E3]/10 border border-[#0071E3]/30 rounded-lg p-2.5 text-[11px]">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={selectedCrew.avatar} alt={selectedCrew.lead} className="w-5 h-5 rounded-full object-cover" />
                        <strong className="text-slate-900 dark:text-white">{selectedCrew.lead}</strong>
                      </div>
                      <p className="text-[#86868b] text-[10px]">{selectedCrew.team}</p>
                      <p className="text-[#86868b] text-[10px] font-mono">{selectedCrew.phone}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAssignWork}
                    disabled={isAssigningWork || !selectedCrew}
                    className="w-full bg-[#0071E3] hover:bg-[#0071E3]/90 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">{isAssigningWork ? 'hourglass_empty' : 'assignment_turned_in'}</span>
                    <span>{isAssigningWork ? 'Assigning...' : 'Create & Assign Work Order'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Engineering Action Plan & Materials Estimator */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">psychology</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Engineering Repair Plan</h3>
              </div>
              <button
                type="button"
                onClick={handleFetchAiWorkOrder}
                disabled={isLoadingAi}
                className="text-[11px] font-bold text-[#0071E3] hover:text-[#0071E3]/80 flex items-center gap-1 bg-[#0071E3]/10 px-3 py-1 rounded-full cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                <span>{isLoadingAi ? 'Synthesizing...' : '✨ Refresh AI Plan'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl">
              <strong className="text-slate-900 dark:text-white block mb-1">Recommended Procedure:</strong>
              {aiAnalysis?.actionPlan || 'Excavate loose debris from defect crater, apply bitumen emulsion tack coat, fill with Type-II hot asphalt mix, and compact with vibratory roller.'}
            </div>

            <div>
              <strong className="text-xs text-slate-900 dark:text-white block mb-2">Estimated Materials Bill:</strong>
              <div className="flex flex-wrap gap-1.5">
                {(aiAnalysis?.materialsEstimated || ['Bitumen cold mix (50kg)', 'Tack coat primer', 'Vibratory compactor', 'Retroreflective hazard cones']).map((mat, i) => (
                  <span key={i} className="text-[11px] font-medium bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300">
                    • {mat}
                  </span>
                ))}
              </div>
            </div>

            {aiAnalysis?.detectedHazards && (
              <div>
                <strong className="text-xs text-[#FF3B30] block mb-1.5">Identified Road Safety Hazards:</strong>
                <ul className="list-disc pl-4 text-[11px] text-[#86868b] flex flex-col gap-1">
                  {aiAnalysis.detectedHazards.map((hz, i) => (
                    <li key={i}>{hz}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Video Datasets Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">movie</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Related Video Datasets</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full">
                {videoDatasets.length} datasets
              </span>
            </div>

            {isLoadingDatasets ? (
              <div className="text-xs text-[#86868b] py-4 text-center">
                <span className="inline-block animate-spin mr-2">⏳</span>
                Loading datasets...
              </div>
            ) : videoDatasets.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {videoDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="p-3.5 bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#0071E3] transition-colors">
                          {dataset.name}
                        </h4>
                        <p className="text-[10px] text-[#86868b] font-mono mt-0.5">{dataset.date}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                        {dataset.videos} videos
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 mb-1.5">
                      {dataset.description}
                    </p>
                    {dataset.videoUrls && dataset.videoUrls.length > 0 && (
                      <div className="mb-2 overflow-hidden rounded-md border border-black/10 dark:border-white/10 bg-black">
                        <video
                          controls
                          preload="metadata"
                          playsInline
                          className="w-full h-28 object-cover bg-black"
                          src={dataset.videoUrls[0]}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[#86868b]">
                      <span>📁 {dataset.folder}</span>
                      <span className="font-mono">{dataset.totalSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#86868b] py-4 text-center">
                No video datasets available for this location
              </div>
            )}
          </div>

          {/* Comment Stream */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-black/5 dark:border-white/10">
              Officer Notes & Field Updates
            </h3>

            <form onSubmit={handlePostComment} className="flex flex-col gap-2.5">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add inspection notes or dispatch instructions..."
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs resize-none outline-none focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-1 focus:ring-[#0071E3] transition-all text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="btn-apple-primary self-end px-4 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      </div>

      <CctvFootageModal
        isOpen={isCctvOpen}
        onClose={() => setIsCctvOpen(false)}
        language={language}
      />
    </div>
  );
};
