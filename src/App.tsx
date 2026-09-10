import React, { useState, useEffect } from 'react';
import { ActiveView, Language, UserRole, DefectItem, AutoRoutingRule, Theme, FontSizeScale, ROLE_ALLOWED_VIEWS } from './types';
import { INITIAL_DEFECTS, AUTO_ROUTING_RULES, BUS_CABIN_INCIDENTS, ACCIDENT_BLACKSPOTS } from './data/mockData';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ServicesDirectoryView } from './components/ServicesDirectoryView';
import { TicketsWorkOrdersView } from './components/TicketsWorkOrdersView';
import { LiveMapView } from './components/LiveMapView';
import { AnalyticsView } from './components/AnalyticsView';
import { FleetMonitoringView } from './components/FleetMonitoringView';
import { TicketDetailView } from './components/TicketDetailView';
import { MultiAgencyView } from './components/MultiAgencyView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { BusSafetyComplaintsView } from './components/BusSafetyComplaintsView';
import { AccidentBlackspotAnalyticsView } from './components/AccidentBlackspotAnalyticsView';
import { PublicBusTrackerView } from './components/PublicBusTrackerView';
import { LoginView } from './components/LoginView';
import { NewTicketModal } from './components/NewTicketModal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { AiCopilotModal } from './components/AiCopilotModal';
import { BelFooter } from './components/BelFooter';
import { BusCabinIncident, AccidentZoneBlackspot } from './types';
import { useRealtimeData } from './services/realtime';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('Municipal Admin');
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const saved = localStorage.getItem('nagar_active_view') as ActiveView;
    const validViews: ActiveView[] = [
      'dashboard',
      'services-directory',
      'tickets',
      'live-map',
      'safety-complaints',
      'accident-analytics',
      'analytics',
      'fleet',
      'ticket-detail',
      'multi-agency',
      'notifications',
      'settings',
      'public-transit'
    ];
    if (saved && validViews.includes(saved)) return saved;
    return 'dashboard';
  });

  // Realtime Live Data Synchronization Hook
  const {
    state: realtimeState,
    updateTicketStatus: realtimeUpdateTicketStatus,
    addTicket: realtimeAddTicket,
    addComment: realtimeAddComment
  } = useRealtimeData();

  // Persist active view so clicking sections never reverts back to dashboard
  useEffect(() => {
    localStorage.setItem('nagar_active_view', activeView);
  }, [activeView]);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nagar_language');
    if (saved === 'hi' || saved === 'en') return saved;
    return 'en'; // Default to English - strictly converted only by clicking language button
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nagar_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to clean, official government light theme
  });
  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>('md');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Realtime-synced collections
  const tickets = realtimeState.tickets;
  const fleet = realtimeState.fleet;
  const liveFeed = realtimeState.liveFeed;
  const alerts = realtimeState.alerts;
  const analyticsKpi = realtimeState.analyticsKpi;
  const isConnected = realtimeState.isConnected;
  const latestEvent = realtimeState.latestEvent;

  const [cabinIncidents, setCabinIncidents] = useState<BusCabinIncident[]>(BUS_CABIN_INCIDENTS);
  const [blackspots, setBlackspots] = useState<AccidentZoneBlackspot[]>(ACCIDENT_BLACKSPOTS);
  const [activeTicketId, setActiveTicketId] = useState<string>('TK-8921');
  const [rules, setRules] = useState<AutoRoutingRule[]>(AUTO_ROUTING_RULES);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


  // Persist explicit language preference
  useEffect(() => {
    localStorage.setItem('nagar_language', language);
  }, [language]);

  // Apply Theme class
  useEffect(() => {
    localStorage.setItem('nagar_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Font Size Accessibility scaling class
  useEffect(() => {
    document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.documentElement.classList.add(`font-size-${fontSizeScale}`);
  }, [fontSizeScale]);

  // Strict Role-based Access Control View Guard
  useEffect(() => {
    if (!isLoggedIn) return;
    const allowed = ROLE_ALLOWED_VIEWS[userRole];
    if (allowed && !allowed.includes(activeView)) {
      setActiveView(allowed[0]);
    }
  }, [userRole, activeView, isLoggedIn]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    if (role === 'Public Commuter') {
      setActiveView('public-transit');
    } else if (role === 'Repair Crew Lead') {
      setActiveView('tickets');
    } else if (role === 'Transport Authority') {
      setActiveView('fleet');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSelectTicket = (ticketNumber: string) => {
    const found = tickets.find(
      (t) => t.ticketNumber === ticketNumber || t.id === ticketNumber
    );
    if (found) {
      setActiveTicketId(found.ticketNumber);
      setActiveView('ticket-detail');
    }
  };

  const handleNavigateWithFilter = (view: ActiveView, filterParam?: string) => {
    if (filterParam) {
      setSearchTerm(filterParam);
    }
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    status: DefectItem['status']
  ) => {
    realtimeUpdateTicketStatus(ticketId, status);
  };

  const handleAddComment = (ticketId: string, commentText: string) => {
    realtimeAddComment(ticketId, commentText, userRole);
  };

  const handleAddTicket = (newTicket: DefectItem) => {
    realtimeAddTicket(newTicket);
    setActiveTicketId(newTicket.ticketNumber);
    setActiveView('ticket-detail');
  };

  const handleToggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleAddRule = (newRule: AutoRoutingRule) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleAddCabinIncident = (newInc: BusCabinIncident) => {
    setCabinIncidents((prev) => [newInc, ...prev]);
  };

  const handleUpdateCabinIncidentStatus = (id: string, status: BusCabinIncident['status']) => {
    setCabinIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
  };

  // If user is logged out, render the Login screen (Screen 5)
  if (!isLoggedIn) {
    return (
      <LoginView
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogin={handleLogin}
      />
    );
  }

  // Active ticket for Detail View
  const currentTicket =
    tickets.find((t) => t.ticketNumber === activeTicketId || t.id === activeTicketId) ||
    tickets[0] ||
    INITIAL_DEFECTS[0];

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans antialiased theme-transition ${theme === 'dark' ? 'dark bg-black text-[#f5f5f7]' : 'bg-[#F5F5F7] text-[#1d1d1f]'}`}>
      {/* Top Header & Apple Horizontal Navigation Subnav */}
      <TopHeader
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        fontSizeScale={fontSizeScale}
        onSetFontSizeScale={setFontSizeScale}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNotificationsClick={() => {
          setActiveView('notifications');
        }}
        onProfileClick={() => {
          setActiveView('settings');
        }}
        activeView={activeView}
        setActiveView={(v, filterParam) => handleNavigateWithFilter(v, filterParam)}
        ticketId={activeTicketId}
        tickets={tickets}
        onSelectTicket={handleSelectTicket}
        onNavigate={(v, filterParam) => handleNavigateWithFilter(v, filterParam)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onLogout={handleLogout}
        onOpenMenu={() => setIsMobileSidebarOpen(true)}
        isConnected={isConnected}
        latestEvent={latestEvent}
        userRole={userRole}
      />

      {/* Main Full-Width Content Canvas - Smooth Page Scroll Container */}
      <div className={`flex-1 ${activeView === 'live-map' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto custom-scrollbar flex flex-col justify-between'} w-full min-w-0`}>
        {/* View Switcher Container */}
        <main className={`w-full min-w-0 flex-1 relative ${activeView === 'live-map' ? 'h-full flex flex-col' : 'pb-16 lg:pb-0'}`}>
          {/* 1. Main Dashboard */}
          {activeView === 'dashboard' && (
            <DashboardView
              language={language}
              onSelectTicket={handleSelectTicket}
              onNavigateToMap={() => setActiveView('live-map')}
              onNavigate={(v, filterParam) => handleNavigateWithFilter(v, filterParam)}
              onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
              onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
              tickets={tickets}
              liveFeed={liveFeed}
              analyticsKpi={analyticsKpi}
              isConnected={isConnected}
            />
          )}

          {/* 2. UIDAI Style Service Categories Directory */}
          {activeView === 'services-directory' && (
            <ServicesDirectoryView
              language={language}
              onNavigate={(v, filterParam) => handleNavigateWithFilter(v, filterParam)}
              onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
            />
          )}

          {/* 3. Tickets & Work Orders */}
          {activeView === 'tickets' && (
            <TicketsWorkOrdersView
              language={language}
              tickets={tickets}
              rules={rules}
              onSelectTicket={handleSelectTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
              onToggleRuleActive={handleToggleRuleActive}
              onAddRule={handleAddRule}
            />
          )}

          {/* 4. Live GIS Map */}
          {activeView === 'live-map' && (
            <LiveMapView
              language={language}
              tickets={tickets}
              liveFeed={liveFeed}
              onSelectTicket={handleSelectTicket}
              onOpenWorkOrder={(id) => handleUpdateTicketStatus(id, 'ASSIGNED')}
              onNavigateToAccidents={() => setActiveView('accident-analytics')}
            />
          )}

          {/* 5. Bus Cabin Safety Complaints */}
          {activeView === 'safety-complaints' && (
            <BusSafetyComplaintsView
              language={language}
              incidents={cabinIncidents}
              onAddIncident={handleAddCabinIncident}
              onUpdateIncidentStatus={handleUpdateCabinIncidentStatus}
            />
          )}

          {/* 6. Accident Blackspots Analytics */}
          {activeView === 'accident-analytics' && (
            <AccidentBlackspotAnalyticsView
              language={language}
              blackspots={blackspots}
              onSelectBlackspotOnMap={(spotCode) => {
                setActiveView('live-map');
              }}
            />
          )}

          {/* 7. Municipal Defect Analytics */}
          {activeView === 'analytics' && (
            <AnalyticsView
              language={language}
              analyticsKpi={analyticsKpi}
              tickets={tickets}
              fleet={fleet}
              liveFeed={liveFeed}
              alerts={alerts}
              latestEvent={latestEvent}
              onNavigateToHotspot={(loc) => {
                setActiveView('live-map');
              }}
              onNavigateToTickets={(cat) => {
                setActiveView('tickets');
              }}
            />
          )}

          {/* 8. AI Fleet Monitoring */}
          {activeView === 'fleet' && (
            <FleetMonitoringView
              language={language}
              fleet={fleet}
              alerts={alerts}
            />
          )}

          {/* 8b. Public Bus Tracker & Commuter Portal */}
          {activeView === 'public-transit' && (
            <PublicBusTrackerView
              language={language}
              tickets={tickets}
              onAddTicket={realtimeAddTicket}
              onNavigateToTicket={handleSelectTicket}
            />
          )}


          {/* 9. Ticket Detail View */}
          {activeView === 'ticket-detail' && (
            <TicketDetailView
              language={language}
              ticket={currentTicket}
              onBack={() => setActiveView('tickets')}
              onUpdateStatus={handleUpdateTicketStatus}
              onAddComment={handleAddComment}
            />
          )}

          {/* 10. Multi-Agency Coordination Hub */}
          {activeView === 'multi-agency' && (
            <MultiAgencyView language={language} />
          )}

          {/* 11. Notifications View */}
          {activeView === 'notifications' && (
            <NotificationsView language={language} />
          )}

          {/* 12. Settings & Profile View */}
          {activeView === 'settings' && (
            <SettingsView
              language={language}
              onToggleLanguage={toggleLanguage}
              userRole={userRole}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
        </main>

        {/* Bharat Electronics Limited (BEL) Sovereign Footer */}
        {activeView !== 'live-map' && (
          <BelFooter
            language={language}
            onNavigate={(v) => setActiveView(v)}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          />
        )}

        {/* Mobile Apple-Style Bottom Navigation Bar */}
        {userRole === 'Public Commuter' ? (
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#161617]/90 backdrop-blur-2xl border-t border-white/10 z-40 px-2 flex items-center justify-around text-white shadow-2xl safe-area-pb"
            aria-label="Citizen Mobile Navigation"
          >
            <button
              type="button"
              onClick={() => setActiveView('public-transit')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'public-transit' ? 'text-[#34C759]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'public-transit' ? 'icon-fill' : ''}`}>
                directions_bus
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'बस ट्रैकर' : 'Bus Tracker'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('safety-complaints')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'safety-complaints' ? 'text-[#FF3B30]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'safety-complaints' ? 'icon-fill' : ''}`}>
                videocam
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'केबिन SOS' : 'Cabin SOS'}</span>
            </button>

            {/* Central Citizen Quick Grievance CTA */}
            <button
              type="button"
              onClick={() => setActiveView('safety-complaints')}
              className="flex flex-col items-center justify-center bg-gradient-to-tr from-red-600 to-rose-500 active:scale-95 text-white rounded-full px-3.5 py-1.5 shadow-md transition-all cursor-pointer font-bold"
              title="Citizen Emergency Grievance"
            >
              <span className="material-symbols-outlined text-[17px] font-bold animate-pulse">crisis_alert</span>
              <span className="text-[8px] font-semibold uppercase leading-none">{language === 'hi' ? 'SOS' : 'SOS'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('services-directory')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'services-directory' ? 'text-[#0071E3]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'services-directory' ? 'icon-fill' : ''}`}>
                account_tree
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'हेल्पलाइन' : 'Directory'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[#86868b] hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">
                menu
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'मेन्यू' : 'Menu'}</span>
            </button>
          </nav>
        ) : (
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#161617]/90 backdrop-blur-2xl border-t border-white/10 z-40 px-2 flex items-center justify-around text-white shadow-2xl safe-area-pb"
            aria-label="Officer Mobile Navigation"
          >
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'dashboard' ? 'text-[#0071E3]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'dashboard' ? 'icon-fill' : ''}`}>
                dashboard
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'डैशबोर्ड' : 'Overview'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('services-directory')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'services-directory' ? 'text-[#0071E3]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'services-directory' ? 'icon-fill' : ''}`}>
                account_tree
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'श्रेणियां' : 'Services'}</span>
            </button>

            {/* Integrated Center Action Button */}
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex flex-col items-center justify-center bg-[#0071E3] active:scale-95 text-white rounded-full px-3 py-1 shadow-md transition-all cursor-pointer font-bold"
              title="Log New Defect"
            >
              <span className="material-symbols-outlined text-[17px] font-bold">add</span>
              <span className="text-[8px] font-semibold uppercase leading-none">{language === 'hi' ? 'नया' : 'Report'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('tickets')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeView === 'tickets' || activeView === 'ticket-detail' ? 'text-[#0071E3]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'tickets' || activeView === 'ticket-detail' ? 'icon-fill' : ''}`}>
                assignment
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'टिकट' : 'Tickets'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[#86868b] hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">
                menu
              </span>
              <span className="text-[9px] font-medium mt-0.5">{language === 'hi' ? 'मेन्यू' : 'Menu'}</span>
            </button>
          </nav>
        )}
      </div>

      {/* Floating Apple AI Copilot Trigger Button (Quick Access) */}
      <button
        type="button"
        onClick={() => setIsAiCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl hover:border-[#0071E3] hover:shadow-[#0071E3]/20 hover:scale-105 transition-all text-xs font-bold cursor-pointer group"
        title="Open Nagar Drishti AI Copilot"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#40A9FF] text-white flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
        </div>
        <span className="text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors">
          {language === 'hi' ? 'नगर AI कॉपायलट' : 'Ask Nagar AI'}
        </span>
        <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
      </button>

      {/* Global New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onAddTicket={handleAddTicket}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        language={language}
        theme={theme}
        activeView={activeView}
        activeTicketId={activeTicketId}
        onNavigate={(v) => {
          setIsAiCopilotOpen(false);
          setActiveView(v);
        }}
        onOpenNewTicket={() => {
          setIsAiCopilotOpen(false);
          setIsNewTicketModalOpen(true);
        }}
        userRole={userRole}
      />

      {/* Quick Help Modal */}
      <QuickHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        language={language}
        onOpenNewTicket={() => {
          setIsHelpModalOpen(false);
          setIsNewTicketModalOpen(true);
        }}
        onNavigate={(v) => {
          setIsHelpModalOpen(false);
          setActiveView(v);
        }}
      />
      {/* Mobile Slide-Out Navigation Drawer */}
      <Sidebar
        activeView={activeView}
        setActiveView={(v, filterParam) => handleNavigateWithFilter(v, filterParam)}
        language={language}
        onLogout={handleLogout}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userRole={userRole}
      />
    </div>
  );
}
