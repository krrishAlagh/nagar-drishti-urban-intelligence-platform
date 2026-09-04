import React, { useState } from 'react';
import { DefectItem, Language, AutoRoutingRule } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface TicketsWorkOrdersViewProps {
  language: Language;
  tickets: DefectItem[];
  rules: AutoRoutingRule[];
  onSelectTicket: (ticketId: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: DefectItem['status']) => void;
  onOpenNewTicketModal: () => void;
  onToggleRuleActive: (ruleId: string) => void;
  onAddRule: (rule: AutoRoutingRule) => void;
}

type ViewMode = 'kanban' | 'table';
type StatusFilter = 'ALL' | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export const TicketsWorkOrdersView: React.FC<TicketsWorkOrdersViewProps> = ({
  language,
  tickets,
  rules,
  onSelectTicket,
  onUpdateTicketStatus,
  onOpenNewTicketModal,
  onToggleRuleActive,
  onAddRule
}) => {
  const t = TRANSLATIONS[language];
  const [showRuleDrawer, setShowRuleDrawer] = useState(false);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [ticketSearch, setTicketSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [quickAssignTicketId, setQuickAssignTicketId] = useState<string | null>(null);

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const [newRuleAction, setNewRuleAction] = useState('');
  const [newRuleDept, setNewRuleDept] = useState('Roads & Bridges');
  const [newRuleSla, setNewRuleSla] = useState('12 hrs');

  // Automation & Batch Multi-select State
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [autoDispatchToast, setAutoDispatchToast] = useState<string | null>(null);

  const handleAutoDispatchAll = () => {
    const unassigned = tickets.filter((t) => t.status === 'NEW');
    if (unassigned.length === 0) {
      setAutoDispatchToast('✨ All defect tickets are already assigned and dispatched!');
      setTimeout(() => setAutoDispatchToast(null), 4000);
      return;
    }
    unassigned.forEach((t) => {
      onUpdateTicketStatus(t.id, 'ASSIGNED');
    });
    setAutoDispatchToast(`⚡ AI Auto-Routing Engine successfully dispatched ${unassigned.length} new work orders to assigned municipal squads!`);
    setTimeout(() => setAutoDispatchToast(null), 5000);
  };

  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedTicketIds.length === filteredTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredTickets.map((t) => t.id));
    }
  };

  const handleBulkUpdateStatus = (newStatus: DefectItem['status']) => {
    selectedTicketIds.forEach((id) => onUpdateTicketStatus(id, newStatus));
    setSelectedTicketIds([]);
  };

  const filteredTickets = tickets.filter((tk) => {
    if (filterSeverity !== 'ALL' && tk.severity !== filterSeverity) return false;
    if (filterDepartment !== 'ALL' && tk.department !== filterDepartment) return false;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'RESOLVED') {
        if (tk.status !== 'RESOLVED' && tk.status !== 'VERIFIED_CLOSED') return false;
      } else if (tk.status !== filterStatus) {
        return false;
      }
    }
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const match =
        (tk.ticketNumber || '').toLowerCase().includes(q) ||
        (tk.title || '').toLowerCase().includes(q) ||
        (tk.locationName || '').toLowerCase().includes(q) ||
        (tk.ward || '').toLowerCase().includes(q) ||
        (tk.category || '').toLowerCase().includes(q) ||
        (tk.department || '').toLowerCase().includes(q) ||
        (tk.assignedTo?.name && tk.assignedTo.name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const newTickets = filteredTickets.filter((tk) => tk.status === 'NEW');
  const assignedTickets = filteredTickets.filter((tk) => tk.status === 'ASSIGNED');
  const inProgressTickets = filteredTickets.filter((tk) => tk.status === 'IN_PROGRESS');
  const resolvedTickets = filteredTickets.filter(
    (tk) => tk.status === 'RESOLVED' || tk.status === 'VERIFIED_CLOSED'
  );

  const totalNew = tickets.filter((tk) => tk.status === 'NEW').length;
  const totalAssigned = tickets.filter((tk) => tk.status === 'ASSIGNED').length;
  const totalInProgress = tickets.filter((tk) => tk.status === 'IN_PROGRESS').length;
  const totalResolved = tickets.filter(
    (tk) => tk.status === 'RESOLVED' || tk.status === 'VERIFIED_CLOSED'
  ).length;

  const hasActiveFilters =
    filterSeverity !== 'ALL' ||
    filterDepartment !== 'ALL' ||
    filterStatus !== 'ALL' ||
    ticketSearch.trim() !== '';

  const resetAllFilters = () => {
    setFilterSeverity('ALL');
    setFilterDepartment('ALL');
    setFilterStatus('ALL');
    setTicketSearch('');
  };

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const rule: AutoRoutingRule = {
      id: `RULE-${String(rules.length + 1).padStart(3, '0')}`,
      name: newRuleName.trim(),
      condition: newRuleCondition.trim() || 'AI Severity >= HIGH',
      action: newRuleAction.trim() || `Auto-assign to ${newRuleDept} Rapid Squad`,
      department: newRuleDept,
      severity: 'HIGH',
      sla: newRuleSla,
      isActive: true
    };

    onAddRule(rule);
    setNewRuleName('');
    setNewRuleCondition('');
    setNewRuleAction('');
    setIsCreatingRule(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F8] dark:bg-black overflow-hidden relative">
      {/* Auto-Dispatch AI Toast Banner */}
      {autoDispatchToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#0071E3] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 border border-white/20">
          <span className="material-symbols-outlined text-[18px] animate-bounce">auto_awesome</span>
          <span>{autoDispatchToast}</span>
        </div>
      )}

      {/* Compact & Functional Top Action & Filter Toolbar */}
      <div className="bg-white dark:bg-[#1c1c1e] border-b border-[#E0E4E8] dark:border-white/10 px-4 sm:px-6 py-2.5 flex flex-col gap-2.5 shrink-0 shadow-2xs">
        {/* Row 1: Title, Search, View Mode, Primary Action */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Title & Count */}
          <div className="flex items-center gap-2 shrink-0">
            <h2 className="text-[15px] sm:text-[16px] font-bold text-[#002746] dark:text-white flex items-center gap-1.5">
              <span>{t.ticketsWorkOrders}</span>
              <span className="text-[11px] bg-blue-50 dark:bg-blue-900/30 text-[#005FAF] dark:text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold border border-blue-100 dark:border-blue-800">
                {filteredTickets.length} / {tickets.length}
              </span>
            </h2>
          </div>

          {/* Center: Inline Fast Filter Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-[17px] text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder={language === 'hi' ? 'आईडी, सड़क, समस्या या कर्मचारी खोजें...' : 'Filter by ID, road, defect, crew...'}
                className="w-full bg-[#F1F4F8] dark:bg-white/10 hover:bg-[#EAEFF5] dark:hover:bg-white/15 focus:bg-white dark:focus:bg-[#2c2c2e] text-xs text-slate-800 dark:text-white placeholder-slate-400 pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#005FAF] focus:ring-2 focus:ring-[#005FAF]/15 transition-all outline-none"
              />
              {ticketSearch && (
                <button
                  onClick={() => setTicketSearch('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: View Mode Toggle & Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Kanban vs Table */}
            <div className="bg-slate-100 dark:bg-white/10 p-0.5 rounded-full border border-slate-200 dark:border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-2xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                <span className="hidden sm:inline text-[11px]">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-2xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List / Table View"
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span className="hidden sm:inline text-[11px]">Table</span>
              </button>
            </div>

            {/* AI Auto-Dispatch Engine Action */}
            <button
              type="button"
              onClick={handleAutoDispatchAll}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#0071E3] to-[#40A9FF] hover:opacity-90 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
              title="Auto-dispatch all unassigned NEW defects using AI Rules"
            >
              <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
              <span className="hidden lg:inline text-[11px]">Auto-Dispatch (AI)</span>
              {totalNew > 0 && (
                <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold">
                  {totalNew}
                </span>
              )}
            </button>

            {/* Auto Routing Rules Engine Toggle */}
            <button
              type="button"
              onClick={() => setShowRuleDrawer(!showRuleDrawer)}
              className={`btn-apple-secondary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                showRuleDrawer ? 'bg-[#0071E3] text-white' : ''
              }`}
              title="AI Auto-Routing Rules"
            >
              <span className="material-symbols-outlined text-[15px] text-[#0071E3]">tune</span>
              <span className="hidden md:inline text-[11px]">{t.autoRoutingRules}</span>
              <span className="bg-[#0071E3] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {rules.filter((r) => r.isActive).length}
              </span>
            </button>

            {/* New Ticket Action */}
            <button
              type="button"
              onClick={onOpenNewTicketModal}
              className="btn-apple-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>+ New Ticket</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Quick Filter Tabs & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Status Quick Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'ALL'
                  ? 'bg-[#0071E3] text-white shadow-2xs'
                  : 'bg-black/5 dark:bg-white/10 text-[#86868b] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({tickets.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('NEW')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === 'NEW'
                  ? 'bg-[#FF3B30] text-white shadow-2xs'
                  : 'bg-[#FF3B30]/10 text-[#FF3B30]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>New ({totalNew})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('ASSIGNED')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === 'ASSIGNED'
                  ? 'bg-[#FF9F0A] text-white shadow-2xs'
                  : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>Assigned ({totalAssigned})</span>
            </button>

            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === 'IN_PROGRESS'
                  ? 'bg-[#005FAF] text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>In Progress ({totalInProgress})</span>
            </button>

            <button
              onClick={() => setFilterStatus('RESOLVED')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === 'RESOLVED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>Resolved ({totalResolved})</span>
            </button>
          </div>

          {/* Severity & Department Filter Dropdowns */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Severity Pill */}
            <div className="relative flex items-center">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="appearance-none text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold rounded-lg pl-2.5 pr-6 py-1 border border-transparent dark:border-white/10 transition-all cursor-pointer outline-none"
              >
                <option value="ALL" className="dark:bg-[#1c1c1e] dark:text-white">All Severities</option>
                <option value="CRITICAL" className="dark:bg-[#1c1c1e] dark:text-white">🔥 Critical</option>
                <option value="HIGH" className="dark:bg-[#1c1c1e] dark:text-white">⚠️ High</option>
                <option value="MED" className="dark:bg-[#1c1c1e] dark:text-white">⚡ Medium</option>
              </select>
              <span className="material-symbols-outlined text-[13px] text-slate-400 dark:text-slate-400 absolute right-1.5 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Department Pill */}
            <div className="relative flex items-center">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="appearance-none text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold rounded-lg pl-2.5 pr-6 py-1 border border-transparent dark:border-white/10 transition-all cursor-pointer outline-none"
              >
                <option value="ALL" className="dark:bg-[#1c1c1e] dark:text-white">All Depts</option>
                <option value="Roads & Bridges" className="dark:bg-[#1c1c1e] dark:text-white">Roads & Bridges</option>
                <option value="Electrical & Lighting" className="dark:bg-[#1c1c1e] dark:text-white">Electrical</option>
                <option value="Water Supply & Sanitation" className="dark:bg-[#1c1c1e] dark:text-white">Water & Sanit.</option>
              </select>
              <span className="material-symbols-outlined text-[13px] text-slate-400 dark:text-slate-400 absolute right-1.5 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Reset Filters Chip */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Batch Multi-Select Action Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1d1d1f]/95 dark:bg-[#2c2c2e]/95 backdrop-blur-2xl text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 animate-in slide-in-from-bottom-5">
          <span className="text-xs font-mono font-bold bg-[#0071E3] px-2.5 py-1 rounded-full text-white">
            {selectedTicketIds.length} Selected
          </span>

          <button
            onClick={() => handleBulkUpdateStatus('ASSIGNED')}
            className="px-3 py-1 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">assignment_ind</span>
            <span>Batch Dispatch</span>
          </button>

          <button
            onClick={() => handleBulkUpdateStatus('RESOLVED')}
            className="px-3 py-1 bg-[#34C759] hover:bg-[#34C759]/90 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">task_alt</span>
            <span>Mark Resolved</span>
          </button>

          <button
            onClick={() => setSelectedTicketIds([])}
            className="text-[#86868b] hover:text-white text-xs font-semibold p-1 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Main Content Area: Kanban Board or High-Density Table */}
      {viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
          <div className="flex gap-3.5 min-w-[1050px] h-full items-start">
            {/* Column 1: NEW */}
            {(filterStatus === 'ALL' || filterStatus === 'NEW') && (
              <div className="flex-1 bg-[#EBEEF2] dark:bg-white/[0.03] rounded-xl flex flex-col max-h-[calc(100vh-165px)] border border-[#CFD8DC]/60 dark:border-white/10 overflow-hidden shadow-2xs">
                <div className="p-2.5 border-b border-[#CFD8DC] dark:border-white/10 flex items-center justify-between bg-[#E0E4E8] dark:bg-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]"></span>
                    <span className="text-xs font-bold text-[#002746] dark:text-white uppercase tracking-wider">
                      NEW ({newTickets.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Unassigned</span>
                </div>

                <div className="p-2.5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
                  {newTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-[#1c1c1e] border border-[#E0E4E8] dark:border-white/10 hover:border-[#005FAF] dark:hover:border-[#0071E3] rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#005FAF] dark:text-[#40A9FF]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="bg-[#BA1A1A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                            {ticket.severity}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{ticket.timeAgo}</span>
                      </div>

                      <div className="flex gap-2.5">
                        {ticket.imageUrl && (
                          <img
                            src={ticket.imageUrl}
                            alt={ticket.title}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer shrink-0"
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                            className="text-xs font-bold text-[#071E27] dark:text-white group-hover:text-[#005FAF] dark:group-hover:text-[#40A9FF] cursor-pointer hover:underline truncate"
                          >
                            {ticket.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {ticket.locationName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900 font-mono">
                              AI: {ticket.confidence}%
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{ticket.ward}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="material-symbols-outlined text-[13px] text-[#BA1A1A]">timer</span>
                          <span>SLA: {ticket.slaRemaining}</span>
                        </div>
                        <button
                          onClick={() => onUpdateTicketStatus(ticket.id, 'ASSIGNED')}
                          className="btn-action px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>{t.createWorkOrder}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {newTickets.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-emerald-500 text-[24px]">task_alt</span>
                      <span>All new defects have been dispatched!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Column 2: ASSIGNED */}
            {(filterStatus === 'ALL' || filterStatus === 'ASSIGNED') && (
              <div className="flex-1 bg-[#EBEEF2] dark:bg-white/[0.03] rounded-xl flex flex-col max-h-[calc(100vh-165px)] border border-[#CFD8DC]/60 dark:border-white/10 overflow-hidden shadow-2xs">
                <div className="p-2.5 border-b border-[#CFD8DC] dark:border-white/10 flex items-center justify-between bg-[#E0E4E8] dark:bg-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]"></span>
                    <span className="text-xs font-bold text-[#002746] dark:text-white uppercase tracking-wider">
                      ASSIGNED ({assignedTickets.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Dispatched</span>
                </div>

                <div className="p-2.5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
                  {assignedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-[#1c1c1e] border border-[#E0E4E8] dark:border-white/10 hover:border-[#005FAF] dark:hover:border-[#0071E3] rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#005FAF] dark:text-[#40A9FF]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                            {ticket.severity}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{ticket.timeAgo}</span>
                      </div>

                      <div className="flex gap-2.5">
                        {ticket.imageUrl && (
                          <img
                            src={ticket.imageUrl}
                            alt={ticket.title}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer shrink-0"
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                            className="text-xs font-bold text-[#071E27] dark:text-white group-hover:text-[#005FAF] dark:group-hover:text-[#40A9FF] cursor-pointer hover:underline truncate"
                          >
                            {ticket.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {ticket.locationName}
                          </p>
                          {ticket.assignedTo && (
                            <div className="flex items-center gap-1 mt-1.5 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                              <span className="material-symbols-outlined text-[12px] text-slate-500 dark:text-slate-400">
                                engineering
                              </span>
                              <span className="text-[10px] font-semibold text-[#002746] dark:text-slate-200 truncate">
                                {ticket.assignedTo.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          SLA: {ticket.slaRemaining}
                        </span>
                        <button
                          onClick={() => onUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                        >
                          Start Work
                        </button>
                      </div>
                    </div>
                  ))}
                  {assignedTickets.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">No assigned tickets</div>
                  )}
                </div>
              </div>
            )}

            {/* Column 3: IN PROGRESS */}
            {(filterStatus === 'ALL' || filterStatus === 'IN_PROGRESS') && (
              <div className="flex-1 bg-[#EBEEF2] dark:bg-white/[0.03] rounded-xl flex flex-col max-h-[calc(100vh-165px)] border border-[#CFD8DC]/60 dark:border-white/10 overflow-hidden shadow-2xs">
                <div className="p-2.5 border-b border-[#CFD8DC] dark:border-white/10 flex items-center justify-between bg-[#E0E4E8] dark:bg-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#005FAF] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#002746] dark:text-white uppercase tracking-wider">
                      IN PROGRESS ({inProgressTickets.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Active Repair</span>
                </div>

                <div className="p-2.5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
                  {inProgressTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-[#1c1c1e] border border-[#005FAF]/30 dark:border-white/10 hover:border-[#005FAF] dark:hover:border-[#0071E3] rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#005FAF] dark:text-[#40A9FF]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="bg-[#BA1A1A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                            {ticket.severity}
                          </span>
                        </div>
                        {ticket.isOverdue && (
                          <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[9px] font-bold px-1.5 py-0.2 rounded animate-pulse font-mono">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2.5">
                        {ticket.imageUrl && (
                          <img
                            src={ticket.imageUrl}
                            alt={ticket.title}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer shrink-0"
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectTicket(ticket.ticketNumber)}
                            className="text-xs font-bold text-[#071E27] dark:text-white group-hover:text-[#005FAF] dark:group-hover:text-[#40A9FF] cursor-pointer hover:underline truncate"
                          >
                            {ticket.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {ticket.locationName}
                          </p>
                          {ticket.assignedTo && (
                            <div className="flex items-center gap-1 mt-1.5 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                              <span className="material-symbols-outlined text-[12px] text-blue-600 dark:text-blue-400">
                                engineering
                              </span>
                              <span className="text-[10px] font-semibold text-blue-900 dark:text-blue-200 truncate">
                                {ticket.assignedTo.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-bold">
                          SLA: {ticket.slaRemaining}
                        </span>
                        <button
                          onClick={() => onUpdateTicketStatus(ticket.id, 'RESOLVED')}
                          className="btn-success px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[13px]">done</span>
                          <span>Mark Done</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {inProgressTickets.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">No tickets in progress</div>
                  )}
                </div>
              </div>
            )}

            {/* Column 4: RESOLVED */}
            {(filterStatus === 'ALL' || filterStatus === 'RESOLVED') && (
              <div className="flex-1 bg-[#EBEEF2] dark:bg-white/[0.03] rounded-xl flex flex-col max-h-[calc(100vh-165px)] border border-[#CFD8DC]/60 dark:border-white/10 overflow-hidden shadow-2xs">
                <div className="p-2.5 border-b border-[#CFD8DC] dark:border-white/10 flex items-center justify-between bg-[#E0E4E8] dark:bg-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#138808]"></span>
                    <span className="text-xs font-bold text-[#002746] dark:text-white uppercase tracking-wider">
                      RESOLVED ({resolvedTickets.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Verified</span>
                </div>

                <div className="p-2.5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2.5">
                  {resolvedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-[#1c1c1e] border border-[#E0E4E8] dark:border-white/10 rounded-xl p-3 shadow-2xs opacity-90 hover:opacity-100 transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {ticket.ticketNumber}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                          {ticket.status === 'VERIFIED_CLOSED' ? 'CLOSED' : 'RESOLVED'}
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectTicket(ticket.ticketNumber)}
                        className="text-xs font-semibold text-[#071E27] dark:text-white cursor-pointer hover:underline truncate"
                      >
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{ticket.locationName}</p>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        <span>{ticket.department}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Fixed</span>
                      </div>
                    </div>
                  ))}
                  {resolvedTickets.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">No resolved tickets</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HIGH-DENSITY DATA TABLE VIEW WITH MULTI-SELECT */
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-3 text-center w-8">
                    <input
                      type="checkbox"
                      checked={selectedTicketIds.length > 0 && selectedTicketIds.length === filteredTickets.length}
                      onChange={handleSelectAllFiltered}
                      className="rounded accent-[#0071E3] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3.5 font-mono text-[11px]">Ticket ID</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Title & Location</th>
                  <th className="py-3 px-3">Category / Ward</th>
                  <th className="py-3 px-3">AI Confidence</th>
                  <th className="py-3 px-3">Assigned Squad</th>
                  <th className="py-3 px-3">SLA Status</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filteredTickets.map((ticket) => {
                  const isSelected = selectedTicketIds.includes(ticket.id);
                  return (
                    <tr
                      key={ticket.id}
                      className={`transition-colors group cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-900/20'
                          : 'hover:bg-slate-50/80 dark:hover:bg-white/5'
                      }`}
                      onClick={() => onSelectTicket(ticket.ticketNumber)}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTicket(ticket.id)}
                          className="rounded accent-[#0071E3] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-[#005FAF] dark:text-[#40A9FF]">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            ticket.severity === 'CRITICAL'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : ticket.severity === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {ticket.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[240px]">
                        <p className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-[#005FAF] dark:group-hover:text-[#40A9FF]">
                          {ticket.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{ticket.locationName}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{ticket.category}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-1.5">({ticket.ward})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {ticket.confidence}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {ticket.assignedTo ? (
                          <span className="font-medium">{ticket.assignedTo.name}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className={ticket.isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                          {ticket.slaRemaining}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.status === 'NEW'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : ticket.status === 'ASSIGNED'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ticket.status === 'NEW' && (
                          <button
                            onClick={() => onUpdateTicketStatus(ticket.id, 'ASSIGNED')}
                            className="btn-action px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Dispatch
                          </button>
                        )}
                        {ticket.status === 'ASSIGNED' && (
                          <button
                            onClick={() => onUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Start
                          </button>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => onUpdateTicketStatus(ticket.id, 'RESOLVED')}
                            className="btn-success px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                        {(ticket.status === 'RESOLVED' || ticket.status === 'VERIFIED_CLOSED') && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Done ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No matching tickets found. Try resetting filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auto-Routing Side Drawer (Slide-out panel) */}
      {showRuleDrawer && (
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-[440px] bg-white dark:bg-[#1c1c1e] border-l border-[#CFD8DC] dark:border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-[#E0E4E8] dark:border-white/10 bg-[#F4F6F8] dark:bg-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005FAF] dark:text-[#40A9FF]">rule</span>
              <h3 className="font-bold text-[15px] text-[#002746] dark:text-white">Auto-Routing Rules Engine</h3>
            </div>
            <button
              onClick={() => setShowRuleDrawer(false)}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-4 text-xs text-[#42474E] dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900">
            Rules automatically triage and dispatch AI-detected defects straight to municipal squads based on confidence, severity, and location tags.
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 custom-scrollbar">
            {isCreatingRule && (
              <form onSubmit={handleCreateRuleSubmit} className="bg-blue-50/80 dark:bg-blue-950/40 border-2 border-[#005FAF] dark:border-blue-500 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#002746] dark:text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#005FAF] dark:text-[#40A9FF]">add_circle</span>
                    New Auto-Dispatch Rule
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingRule(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="e.g., Critical Pothole Fast Track"
                    className="w-full bg-white dark:bg-[#2c2c2e] text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:border-[#005FAF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Condition (IF)</label>
                  <input
                    type="text"
                    value={newRuleCondition}
                    onChange={(e) => setNewRuleCondition(e.target.value)}
                    placeholder="e.g., Confidence >= 90% AND Severity == CRITICAL"
                    className="w-full bg-white dark:bg-[#2c2c2e] text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-white/10 font-mono text-[11px] focus:outline-none focus:border-[#005FAF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                    <select
                      value={newRuleDept}
                      onChange={(e) => setNewRuleDept(e.target.value)}
                      className="w-full bg-white dark:bg-[#2c2c2e] text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-white/10"
                    >
                      <option value="Roads & Bridges">Roads & Bridges</option>
                      <option value="Electrical & Lighting">Electrical & Lighting</option>
                      <option value="Water Supply & Sanitation">Water & Sanitation</option>
                      <option value="Traffic Police">Traffic Police</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target SLA</label>
                    <input
                      type="text"
                      value={newRuleSla}
                      onChange={(e) => setNewRuleSla(e.target.value)}
                      placeholder="e.g., 6 hrs"
                      className="w-full bg-white dark:bg-[#2c2c2e] text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-white/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#005FAF] hover:bg-[#004A8A] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer mt-1"
                >
                  Save & Activate Rule
                </button>
              </form>
            )}

            {rules.map((rule) => (
              <div
                key={rule.id}
                className="border border-[#CFD8DC] dark:border-white/10 rounded-xl p-3 bg-[#FAFBFD] dark:bg-white/[0.03] flex flex-col gap-2 hover:border-[#005FAF] dark:hover:border-[#0071E3] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#005FAF] dark:text-[#40A9FF]">
                      {rule.id}
                    </span>
                    <span className="font-semibold text-[13px] text-[#071E27] dark:text-white">{rule.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={() => onToggleRuleActive(rule.id)}
                    className="w-4 h-4 text-[#005FAF] rounded cursor-pointer accent-[#005FAF]"
                  />
                </div>

                <div className="bg-slate-900 dark:bg-black text-slate-100 p-2.5 rounded-lg font-mono text-[11px] leading-relaxed border border-white/10">
                  <span className="text-amber-400 font-bold">IF:</span> {rule.condition}
                  <br />
                  <span className="text-emerald-400 font-bold">THEN:</span> {rule.action}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#73777F] dark:text-slate-400 pt-1">
                  <span>Target: {rule.department}</span>
                  <span className="font-mono font-bold text-[#002746] dark:text-slate-200">SLA: {rule.sla}</span>
                </div>
              </div>
            ))}
          </div>

          {!isCreatingRule && (
            <div className="p-4 border-t border-[#E0E4E8] dark:border-white/10 bg-[#F4F6F8] dark:bg-white/[0.05]">
              <button
                onClick={() => setIsCreatingRule(true)}
                className="btn-primary w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Create New AI Rule</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
