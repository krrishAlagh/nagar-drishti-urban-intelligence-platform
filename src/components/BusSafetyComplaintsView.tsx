import React, { useState } from 'react';
import { BusCabinIncident, CabinIncidentCategory, Language } from '../types';
import { TRANSLATIONS, ASSETS } from '../data/mockData';

interface BusSafetyComplaintsViewProps {
  language: Language;
  incidents: BusCabinIncident[];
  onAddIncident: (incident: BusCabinIncident) => void;
  onUpdateIncidentStatus: (id: string, status: BusCabinIncident['status']) => void;
}

export const BusSafetyComplaintsView: React.FC<BusSafetyComplaintsViewProps> = ({
  language,
  incidents,
  onAddIncident,
  onUpdateIncidentStatus
}) => {
  const t = TRANSLATIONS[language];
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<BusCabinIncident | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form State for new Citizen / Officer Complaint
  const [busNumber, setBusNumber] = useState('DTC-BUS-402');
  const [routeNumber, setRouteNumber] = useState('Route 522 (Inderlok ⇄ Ambedkar Nagar)');
  const [category, setCategory] = useState<CabinIncidentCategory>('Driver Misconduct / Phone Use');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [location, setLocation] = useState('Ring Road near Moolchand');
  const [ward, setWard] = useState('Ward B - South');
  const [description, setDescription] = useState('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast(language === 'hi' ? 'कृपया घटना का विवरण दर्ज करें' : 'Please provide details of the incident.');
      return;
    }

    const newInc: BusCabinIncident = {
      id: `inc-${Date.now()}`,
      ticketCode: `CABIN-${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber,
      routeNumber,
      category,
      severity: category.includes('Harassment') ? 'CRITICAL' : category.includes('Driver') ? 'HIGH' : 'MED',
      detectedBy: passengerName.trim() ? 'Citizen Passenger' : 'AI Cabin Camera',
      status: 'NEW',
      timestamp: 'Just now',
      timeAgo: 'Just now',
      location: location || 'Delhi Transit Route',
      ward: ward || 'Ward Central',
      driverName: 'Assigned Driver on Shift',
      conductorName: 'Assigned Conductor on Shift',
      description: description.trim(),
      passengerName: passengerName.trim() || undefined,
      passengerPhone: passengerPhone.trim() || undefined,
      hasCctvClip: true,
      cctvSnapshotUrl: ASSETS.blueprintLogin
    };

    onAddIncident(newInc);
    setIsComplaintModalOpen(false);
    setDescription('');
    setPassengerName('');
    setPassengerPhone('');
    showToast(
      language === 'hi'
        ? `शिकायत #${newInc.ticketCode} सफलतापूर्वक दर्ज हो गई है!`
        : `Complaint #${newInc.ticketCode} recorded and sent to enforcement team!`
    );
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter === 'DRIVER' && !inc.category.includes('Driver')) return false;
    if (activeFilter === 'CONDUCTOR' && !inc.category.includes('Conductor')) return false;
    if (activeFilter === 'WOMEN_SAFETY' && !inc.category.includes('Harassment')) return false;
    if (activeFilter === 'OVERCROWD' && !inc.category.includes('Overcrowd')) return false;
    if (activeFilter === 'RESOLVED' && inc.status !== 'RESOLVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.ticketCode.toLowerCase().includes(q) ||
        inc.busNumber.toLowerCase().includes(q) ||
        inc.routeNumber.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.driverName.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 glass-card px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-[18px] text-[#34C759]">check_circle</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white">{feedbackToast}</span>
        </div>
      )}

      {/* Apple Header Banner */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">videocam</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.safetyComplaints}
              </h1>
              <span className="text-[10px] font-semibold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
                <span>Inside Cabin AI Active</span>
              </span>
            </div>
            <p className="text-xs text-[#86868b] mt-1">
              {language === 'hi'
                ? 'बस केबिन कैमरा से ड्राइवर/कंडक्टर आचरण, यात्री सुरक्षा व शिकायत निवारण'
                : 'Real-time transit cabin safety AI & citizen passenger grievance portal'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsComplaintModalOpen(true)}
          className="btn-apple-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">report_problem</span>
          <span>{language === 'hi' ? '+ यात्री शिकायत दर्ज करें' : '+ File Safety Report'}</span>
        </button>
      </section>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">
              {language === 'hi' ? 'सक्रिय केबिन मामले' : 'Active Cabin Alerts'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{activeCount}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">emergency</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">
              {language === 'hi' ? 'महिला सुरक्षा SOS' : 'Cabin Safety SOS'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#FF3B30] mt-1 font-mono">{criticalCount}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">
              {language === 'hi' ? 'चालक निगरानी' : 'Crew Misconduct'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#FF9F0A] mt-1 font-mono">
              {incidents.filter((i) => i.category.includes('Driver') || i.category.includes('Conductor')).length}
            </p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">
              {language === 'hi' ? 'हल की गई शिकायतें' : 'Resolved Logs'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#34C759] mt-1 font-mono">{resolvedCount}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-[#0071E3] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'सभी मामले' : 'All Logs'} ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('DRIVER')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'DRIVER'
                ? 'bg-[#FF9F0A] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'ड्राइवर लापरवाही' : 'Driver Conduct'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('CONDUCTOR')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'CONDUCTOR'
                ? 'bg-[#0071E3] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'कंडक्टर विवाद' : 'Conductor Dispute'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('WOMEN_SAFETY')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'WOMEN_SAFETY'
                ? 'bg-[#FF3B30] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'महिला व यात्री सुरक्षा SOS' : 'Women Safety SOS'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('OVERCROWD')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'OVERCROWD'
                ? 'bg-[#AF52DE] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'भीड़ व गेट ब्लॉकिंग' : 'Overcrowding'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              activeFilter === 'RESOLVED'
                ? 'bg-[#34C759] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {language === 'hi' ? 'हल हो चुके' : 'Resolved'} ({resolvedCount})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <span className="material-symbols-outlined text-[16px] text-[#86868b] absolute left-3 top-2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'बस नंबर, रूट, शिकायत खोजें...' : 'Search bus #, route, crew...'}
            className="w-full text-xs bg-black/5 dark:bg-white/10 focus:bg-white dark:focus:bg-[#1d1d1f] pl-9 pr-3 py-1.5 rounded-full border border-transparent focus:border-[#0071E3] outline-none transition-all"
          />
        </div>
      </div>

      {/* Main List of Cabin Incidents */}
      <div className="flex flex-col gap-3.5">
        {filteredIncidents.map((incident) => {
          const isCritical = incident.severity === 'CRITICAL';
          const isResolved = incident.status === 'RESOLVED';

          return (
            <div
              key={incident.id}
              className={`glass-card p-5 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${
                isCritical && !isResolved
                  ? 'border-l-4 border-l-[#FF3B30]'
                  : isResolved
                  ? 'opacity-80'
                  : ''
              }`}
            >
              {/* Left Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                    {incident.ticketCode}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                    {incident.busNumber}
                  </span>
                  <span className="text-[11px] text-[#86868b] font-medium truncate max-w-xs">
                    • {incident.routeNumber}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono ${
                      isCritical
                        ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                        : incident.severity === 'HIGH'
                        ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                        : 'bg-[#0071E3]/10 text-[#0071E3]'
                    }`}
                  >
                    {incident.category}
                  </span>
                  <span className="text-[10px] bg-black/5 dark:bg-white/10 text-[#86868b] px-2 py-0.5 rounded-full font-mono">
                    Source: {incident.detectedBy}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-1">
                  {incident.description}
                </p>

                {/* Crew & Passenger Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#86868b] pt-2 border-t border-black/5 dark:border-white/10 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    <span>Driver: <strong className="text-slate-900 dark:text-white">{incident.driverName}</strong></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">badge</span>
                    <span>Conductor: <strong className="text-slate-900 dark:text-white">{incident.conductorName}</strong></span>
                  </span>
                  {incident.passengerName && (
                    <span className="flex items-center gap-1 text-[#0071E3]">
                      <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
                      <span>Complainant: <strong>{incident.passengerName}</strong> ({incident.passengerPhone})</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto text-[#86868b]">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    <span>{incident.location}</span>
                  </span>
                </div>
              </div>

              {/* Right Action & Status Button */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono ${
                    incident.status === 'NEW'
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                      : incident.status === 'INVESTIGATING'
                      ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                      : incident.status === 'DISPATCHED_ENFORCEMENT'
                      ? 'bg-[#AF52DE]/10 text-[#AF52DE]'
                      : 'bg-[#34C759]/10 text-[#34C759]'
                  }`}
                >
                  {incident.status === 'NEW'
                    ? 'Pending Review'
                    : incident.status === 'INVESTIGATING'
                    ? 'Depot Inquiry'
                    : incident.status === 'DISPATCHED_ENFORCEMENT'
                    ? 'Squad Dispatched'
                    : 'Resolved ✓'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(incident)}
                    className="btn-apple-secondary px-3 py-1 text-[11px] font-semibold cursor-pointer"
                  >
                    View CCTV Clip
                  </button>

                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateIncidentStatus(incident.id, 'RESOLVED');
                        showToast(`Incident #${incident.ticketCode} marked resolved.`);
                      }}
                      className="btn-apple-primary px-3 py-1 text-[11px] font-semibold cursor-pointer shadow-2xs"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredIncidents.length === 0 && (
          <div className="glass-card py-12 text-center text-[#86868b] flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[36px]">verified_user</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {language === 'hi' ? 'कोई सक्रिय केबिन समस्या नहीं है' : 'No cabin safety issues found'}
            </p>
            <p className="text-xs text-[#86868b]">All passenger cabins are operating normally.</p>
          </div>
        )}
      </div>

      {/* CCTV Snapshot Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-black/10 dark:border-white/15 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Inside Bus CCTV Footage • {selectedIncident.ticketCode}
                </h3>
                <p className="text-xs text-[#86868b]">
                  {selectedIncident.busNumber} • {selectedIncident.timestamp}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="p-1 text-[#86868b] hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black border border-black/10 dark:border-white/10 aspect-video flex items-center justify-center">
              <img
                src={selectedIncident.cctvSnapshotUrl || ASSETS.blueprintLogin}
                alt="Cabin CCTV"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-3 left-3 bg-black/70 text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-white/20">
                CAM-02 [CABIN INTERIOR] • 1080p 30FPS
              </div>
              <div className="absolute bottom-3 left-3 bg-[#FF3B30] text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                INCIDENT: {selectedIncident.category}
              </div>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl text-xs text-slate-800 dark:text-slate-200 flex flex-col gap-1">
              <span className="font-semibold text-slate-900 dark:text-white">Incident Description:</span>
              <p className="text-[#86868b]">{selectedIncident.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="btn-apple-primary px-5 py-2 text-xs font-semibold rounded-full"
              >
                Close Clip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl border border-black/10 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">report_problem</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {language === 'hi' ? 'यात्री दुर्व्यवहार / सुरक्षा शिकायत दर्ज करें' : 'File Passenger Safety Report'}
                  </h3>
                  <p className="text-[11px] text-[#86868b]">Logged directly to Transport Vigilance Squad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComplaintModalOpen(false)}
                className="text-[#86868b] hover:text-slate-900 dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-xs custom-scrollbar">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Bus Registration #</label>
                  <input
                    type="text"
                    required
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Route Corridor</label>
                  <input
                    type="text"
                    required
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Violation Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  <option value="Driver Misconduct / Phone Use">Driver Misconduct / Phone Use While Driving</option>
                  <option value="Conductor Refused Ticket / Overcharging">Conductor Refused Ticket / Overcharging</option>
                  <option value="Harassment / Eve-teasing">🔴 Harassment / Eve-teasing (Emergency SOS)</option>
                  <option value="Overcrowding / Footboard Traveling">Overcrowding / Footboard Traveling Hazard</option>
                  <option value="Over-speeding / Rash Driving">Over-speeding / Red Light Jumping</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Incident Details & Observations</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, time, and conductor/driver badge details..."
                  className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="btn-apple-secondary px-5 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-apple-primary px-6 py-2 text-xs font-semibold cursor-pointer shadow-md"
                >
                  Submit to Vigilance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
