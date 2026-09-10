import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Language, ActiveView, DefectItem, Theme, FontSizeScale, UserRole, ROLE_ALLOWED_VIEWS } from '../types';
import { TRANSLATIONS, ASSETS, GOV_TICKER_BULLETINS } from '../data/mockData';

interface TopHeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  fontSizeScale?: FontSizeScale;
  onSetFontSizeScale?: (scale: FontSizeScale) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView, filterParam?: string) => void;
  ticketId?: string;
  tickets?: DefectItem[];
  onSelectTicket?: (ticketNumber: string) => void;
  onNavigate?: (view: ActiveView, filterParam?: string) => void;
  onOpenHelp?: () => void;
  onOpenNewTicket?: () => void;
  onOpenAiCopilot?: () => void;
  onLogout?: () => void;
  onOpenMenu?: () => void;
  isConnected?: boolean;
  latestEvent?: { type: string; message: string; timestamp: string } | null;
  userRole?: UserRole;
}


type SearchFilterTab = 'ALL' | 'CRITICAL' | 'POTHOLES' | 'STREETLIGHTS' | 'SANITATION' | 'ACTIONS';

export const TopHeader: React.FC<TopHeaderProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  fontSizeScale = 'md',
  onSetFontSizeScale,
  searchTerm,
  onSearchChange,
  onNotificationsClick,
  onProfileClick,
  activeView,
  setActiveView,
  ticketId,
  tickets = [],
  onSelectTicket,
  onNavigate,
  onOpenHelp,
  onOpenNewTicket,
  onOpenAiCopilot,
  onLogout,
  onOpenMenu,
  isConnected = true,
  latestEvent = null,
  userRole = 'Municipal Admin'
}) => {

  const t = TRANSLATIONS[language];
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<SearchFilterTab>('ALL');
  const [currentBulletinIndex, setCurrentBulletinIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Government Bulletin auto-cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBulletinIndex((prev) => (prev + 1) % GOV_TICKER_BULLETINS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apple Horizontal Navigation Bar Items - Strictly Bifurcated by Role
  const navItems = useMemo(
    () => {
      const allItems = [
        { id: 'dashboard' as ActiveView, label: language === 'hi' ? 'डैशबोर्ड' : 'Overview', icon: 'dashboard' },
        { id: 'public-transit' as ActiveView, label: language === 'hi' ? 'सार्वजनिक बस' : 'Bus Tracker', icon: 'directions_bus', badge: 'Public' },
        { id: 'services-directory' as ActiveView, label: language === 'hi' ? 'सेवा निर्देशिका' : 'Services', icon: 'account_tree', badge: '6' },
        { id: 'tickets' as ActiveView, label: language === 'hi' ? 'कार्य आदेश' : 'Work Orders', icon: 'assignment', badge: '4' },
        { id: 'live-map' as ActiveView, label: language === 'hi' ? 'लाइव मैप' : 'Live Map', icon: 'map', badge: 'Live' },
        { id: 'safety-complaints' as ActiveView, label: language === 'hi' ? 'बस सुरक्षा' : 'Cabin SOS', icon: 'videocam', badge: 'SOS' },
        { id: 'accident-analytics' as ActiveView, label: language === 'hi' ? 'ब्लैकस्पॉट' : 'Blackspots', icon: 'crisis_alert', badge: 'GIS' },
        { id: 'fleet' as ActiveView, label: language === 'hi' ? 'एआई बसें' : 'Fleet AI', icon: 'local_shipping', badge: '48' },
        { id: 'analytics' as ActiveView, label: language === 'hi' ? 'सांख्यिकी' : 'Analytics', icon: 'analytics' },
        { id: 'multi-agency' as ActiveView, label: language === 'hi' ? 'समन्वय' : 'Multi-Agency', icon: 'hub' },
        { id: 'notifications' as ActiveView, label: language === 'hi' ? 'सूचनाएं' : 'Notifications', icon: 'notifications' },
        { id: 'settings' as ActiveView, label: language === 'hi' ? 'सेटिंग्स' : 'Settings', icon: 'settings' }
      ];

      const allowed = ROLE_ALLOWED_VIEWS[userRole] || ROLE_ALLOWED_VIEWS['Municipal Admin'];
      return allItems.filter(item => allowed.includes(item.id));
    },
    [language, userRole]
  );

  // Quick system actions for command palette behavior tailored per role
  const systemActions = useMemo(
    () => {
      if (userRole === 'Public Commuter') {
        return [
          {
            id: 'act-bus-tracker',
            title: language === 'hi' ? 'सार्वजनिक बस ट्रैकर और लाइव आगमन' : 'Live DTC Bus Tracker & ETAs',
            subtitle: 'Track nearby public buses and live stop schedules in Delhi',
            icon: 'directions_bus',
            badge: 'Transit',
            action: () => setActiveView('public-transit')
          },
          {
            id: 'act-safety-sos',
            title: language === 'hi' ? 'बस केबिन सुरक्षा SOS और शिकायत निवारण' : 'Bus Cabin Safety SOS & Grievances',
            subtitle: 'Report driver misconduct, harassment or onboard passenger safety',
            icon: 'videocam',
            badge: 'SOS',
            action: () => setActiveView('safety-complaints')
          },
          {
            id: 'act-services-commuter',
            title: language === 'hi' ? 'आपातकालीन नागरिक निर्देशिका व हेल्पलाइन' : 'Emergency Civic Directory & Helplines',
            subtitle: 'DJB 1916, BSES 19123, MCD 155304 direct official lines',
            icon: 'account_tree',
            badge: 'Helpline',
            action: () => setActiveView('services-directory')
          },
          {
            id: 'act-notif-commuter',
            title: language === 'hi' ? 'मौसम एवं पारगमन सार्वजनिक अलर्ट' : 'Public Transit & Weather Alerts',
            subtitle: 'Delhi traffic police, route diversion and monsoon alerts',
            icon: 'notifications',
            badge: 'Alerts',
            action: () => setActiveView('notifications')
          }
        ];
      }

      const actions = [
        {
          id: 'act-services',
          title: language === 'hi' ? 'समस्त सेवा श्रेणियां एवं निर्देशिका' : 'All Service Categories & Directory',
          subtitle: 'Browse 6 civic portals: Roads, Lighting, Cabin Safety, Blackspots',
          icon: 'account_tree',
          badge: 'Directory',
          action: () => setActiveView('services-directory')
        },
        {
          id: 'act-map',
          title: language === 'hi' ? 'लाइव जीआईएस मानचित्र खोलें' : 'Open Live City GIS Map',
          subtitle: 'View live defect hotspots, transit buses & road conditions',
          icon: 'map',
          badge: 'GIS Live',
          action: () => setActiveView('live-map')
        },
        {
          id: 'act-tickets',
          title: language === 'hi' ? 'कार्य आदेश और टिकट देखें' : 'View Work Orders & Kanban Queue',
          subtitle: 'Triage, assign crews and track repair status',
          icon: 'assignment',
          badge: 'Kanban',
          action: () => setActiveView('tickets')
        },
        {
          id: 'act-new-ticket',
          title: language === 'hi' ? '+ नया दोष टिकट दर्ज करें' : '+ Create New Defect Work Order',
          subtitle: 'Manual civic defect logging with GPS coordinates',
          icon: 'add_circle',
          badge: 'Fast Entry',
          action: () => onOpenNewTicket && onOpenNewTicket()
        },
        {
          id: 'act-safety',
          title: language === 'hi' ? 'बस सुरक्षा और दुर्व्यवहार शिकायतें' : 'Bus Cabin Safety & SOS Alerts',
          subtitle: 'Passenger reports, driver/conductor conduct, camera alerts',
          icon: 'videocam',
          badge: 'Cabin AI',
          action: () => setActiveView('safety-complaints')
        },
        {
          id: 'act-accident',
          title: language === 'hi' ? 'दुर्घटना प्रवण क्षेत्र और ब्लैकस्पॉट' : 'Accident Blackspots & Crash Zones',
          subtitle: 'High-risk collision corridors, fatality analytics & remedial works',
          icon: 'crisis_alert',
          badge: 'Safety GIS',
          action: () => setActiveView('accident-analytics')
        },
        {
          id: 'act-fleet',
          title: language === 'hi' ? '48 बस AI कैमरों की स्थिति' : 'Inspect 48 AI Connected Buses',
          subtitle: 'Live dashcam edge-detection feeds and stream status',
          icon: 'local_shipping',
          badge: 'Fleet Nodes',
          action: () => setActiveView('fleet')
        }
      ];

      const allowed = ROLE_ALLOWED_VIEWS[userRole] || [];
      return actions.filter(act => {
        if (act.id === 'act-new-ticket') return true;
        const target = act.id.replace('act-', '');
        if (target === 'services') return allowed.includes('services-directory');
        if (target === 'map') return allowed.includes('live-map');
        if (target === 'tickets') return allowed.includes('tickets');
        if (target === 'safety') return allowed.includes('safety-complaints');
        if (target === 'accident') return allowed.includes('accident-analytics');
        if (target === 'fleet') return allowed.includes('fleet');
        return true;
      });
    },
    [language, setActiveView, onOpenNewTicket, userRole]
  );

  // Filtered tickets based on search
  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tickets.filter((tck) => {
      if (activeFilterTab === 'CRITICAL' && tck.severity !== 'CRITICAL') return false;
      if (activeFilterTab === 'POTHOLES' && tck.category !== 'Potholes') return false;
      if (activeFilterTab === 'STREETLIGHTS' && tck.category !== 'Streetlights') return false;
      if (activeFilterTab === 'SANITATION' && tck.category !== 'Sanitation') return false;
      if (activeFilterTab === 'ACTIONS') return false;

      if (!term) return true;

      const loc = (tck.locationName || '').toLowerCase();
      const num = (tck.ticketNumber || '').toLowerCase();
      const title = (tck.title || '').toLowerCase();
      const cat = (tck.category || '').toLowerCase();
      const ward = (tck.ward || '').toLowerCase();
      const sev = (tck.severity || '').toLowerCase();

      return (
        num.includes(term) ||
        title.includes(term) ||
        loc.includes(term) ||
        cat.includes(term) ||
        ward.includes(term) ||
        sev.includes(term)
      );
    });
  }, [tickets, searchTerm, activeFilterTab]);

  const matchingActions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return systemActions;
    return systemActions.filter(
      (act) =>
        act.title.toLowerCase().includes(term) ||
        act.subtitle.toLowerCase().includes(term) ||
        act.badge.toLowerCase().includes(term)
    );
  }, [systemActions, searchTerm]);

  return (
    <header className="sticky top-0 z-40 apple-nav transition-all select-none shadow-sm">
      <div className="h-[2.5px] tricolor-ribbon w-full"></div>

      <div className="px-3 sm:px-8 lg:px-10 py-2.5 sm:py-3 max-w-[1800px] mx-auto w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div
            onClick={() => {
              if (userRole === 'Public Commuter') {
                setActiveView('public-transit');
              } else if (userRole === 'Repair Crew Lead') {
                setActiveView('tickets');
              } else if (userRole === 'Transport Authority') {
                setActiveView('fleet');
              } else {
                setActiveView('dashboard');
              }
            }}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer shrink-0 group py-1"
          >
            <img
              src={ASSETS.emblem}
              alt="National Emblem"
              className="h-8 sm:h-9 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="font-extrabold text-[15px] sm:text-[19px] text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight whitespace-nowrap">
                {language === 'hi' ? 'नगर दृष्टि' : 'Nagar Drishti'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 font-mono shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
                48 AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Authenticated Role Identity Badge (Visible on sm+ screens) */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md shadow-2xs select-none ${
                userRole === 'Public Commuter'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : userRole === 'Municipal Admin'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                  : userRole === 'Repair Crew Lead'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : userRole === 'Transport Authority'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
              }`}
              title={`Logged in as: ${userRole}`}
            >
              <span className={`w-2 h-2 rounded-full ${
                userRole === 'Public Commuter' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
              <span className="max-w-[130px] sm:max-w-none truncate font-medium">
                {userRole === 'Public Commuter' 
                  ? (language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal')
                  : userRole}
              </span>
            </div>

            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-[11px] font-mono shadow-2xs"
              title={isConnected ? 'Real-time WebSocket Telemetry Connected (Port 5005)' : 'Connecting to Realtime Telemetry...'}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#34C759] animate-ping' : 'bg-[#FF9F0A]'}`}></span>
              <span className="font-bold text-slate-900 dark:text-white">
                {isConnected ? (language === 'hi' ? 'लाइव सिंक' : 'LIVE TELEMETRY') : 'CONNECTING'}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 sm:p-1 rounded-full border border-black/5 dark:border-white/10 shadow-2xs cursor-pointer hover:border-[#0071E3] transition-all group"
              title={language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
            >
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs'
                    : 'text-[#86868b] group-hover:text-[#1d1d1f] dark:group-hover:text-white'
                }`}
              >
                EN
              </span>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all ${
                  language === 'hi'
                    ? 'bg-[#0071E3] text-white shadow-2xs'
                    : 'text-[#86868b] group-hover:text-[#1d1d1f] dark:group-hover:text-white'
                }`}
              >
                हिन्दी
              </span>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[19px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={onNotificationsClick}
              className="relative p-2 sm:p-2.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[19px]">notifications</span>
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#FF3B30] rounded-full ring-2 ring-white dark:ring-[#161617]"></span>
            </button>

            {/* Action CTA Button (Hidden on small mobile screens to prevent overflow; available in bottom bar / drawer) */}
            {userRole === 'Public Commuter' ? (
              <button
                type="button"
                onClick={() => setActiveView('safety-complaints')}
                className="hidden md:flex px-3.5 sm:px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md hover:brightness-110 active:scale-95 transition-all items-center gap-1.5 cursor-pointer"
                title={language === 'hi' ? 'केबिन सुरक्षा SOS' : 'Passenger Cabin SOS'}
              >
                <span className="material-symbols-outlined text-[16px] animate-pulse">crisis_alert</span>
                <span className="hidden sm:inline">{language === 'hi' ? 'नागरिक SOS' : 'Cabin SOS'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenNewTicket}
                className="hidden md:flex btn-apple-primary px-4 sm:px-5 py-2.5 text-xs font-semibold items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
              >
                <span className="material-symbols-outlined text-[17px]">add</span>
                <span className="hidden sm:inline">
                  {language === 'hi' ? 'नया टिकट' : 'New Ticket'}
                </span>
              </button>
            )}

            {/* Logout Option - Clearly Visible on Mobile & Desktop Navbar */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 transition-all cursor-pointer shadow-2xs shrink-0"
                title={language === 'hi' ? 'लॉगआउट करें' : 'Sign out'}
                aria-label="Sign out"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[18px]">logout</span>
                <span className="text-[11px] sm:text-xs font-bold hidden xs:inline">
                  {language === 'hi' ? 'लॉगआउट' : 'Logout'}
                </span>
              </button>
            )}

            {/* Mobile Hamburger Menu Button (Top Navbar) */}
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="lg:hidden p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title={language === 'hi' ? 'मेन्यू खोलें' : 'Open Menu'}
                aria-label="Open Navigation Menu"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-black/5 dark:border-white/10 pt-3 px-4 sm:px-8 lg:px-10 max-w-[1800px] mx-auto w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-[11px] font-mono shadow-2xs"
              title={isConnected ? 'Real-time WebSocket Telemetry Connected (Port 5005)' : 'Connecting to Realtime Telemetry...'}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#34C759] animate-ping' : 'bg-[#FF9F0A]'}`}></span>
              <span className="font-bold text-slate-900 dark:text-white">
                {isConnected ? (language === 'hi' ? 'लाइव सिंक' : 'LIVE TELEMETRY') : 'CONNECTING'}
              </span>
            </div>
          </div>

          <div ref={searchContainerRef} className="flex-1 max-w-[820px] mx-3 relative min-w-0">
            <div className={`search-shell ${isSearchFocused ? 'search-shell--focused' : ''} relative flex items-center`}>
              <span
                className="material-symbols-outlined pointer-events-none text-[#86868b]"
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, zIndex: 1 }}
              >
                search
              </span>

              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={
                  language === 'hi'
                    ? 'खोजें: टिकट, वार्ड, GPS, ब्लैकस्पॉट...'
                    : 'Search tickets, wards, GPS, blackspots…'
                }
                style={{ paddingLeft: 40 }}
                className="search-input w-full pr-14 py-2.5 text-xs sm:text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none transition-all"
              />

              <div className="absolute right-3 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white p-1 rounded-full cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                )}
                {!searchTerm && (
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#86868b] bg-white/75 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-md shadow-sm">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-[#1d1d1f]/95 backdrop-blur-2xl rounded-[26px] shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-black/10 dark:border-white/15 overflow-hidden z-50 max-h-[480px] flex flex-col">
                <div className="px-4 pt-3 pb-2.5 border-b border-black/5 dark:border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-black/[0.02] dark:bg-white/[0.02]">
                  {(['ALL', 'CRITICAL', 'POTHOLES', 'STREETLIGHTS', 'SANITATION', 'ACTIONS'] as SearchFilterTab[]).map(
                    (tab) => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setActiveFilterTab(tab)}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          activeFilterTab === tab
                            ? 'bg-[#0071E3] text-white shadow-2xs'
                            : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                <div className="overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1.5">
                  {(activeFilterTab === 'ALL' || activeFilterTab === 'ACTIONS') && matchingActions.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                        {language === 'hi' ? 'त्वरित नेविगेशन एवं क्रियाएं' : 'Quick Actions & Views'}
                      </div>
                      {matchingActions.map((act) => (
                        <button
                          type="button"
                          key={act.id}
                          onClick={() => {
                            act.action();
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[20px] text-[#0071E3] group-hover:scale-110 transition-transform">
                              {act.icon}
                            </span>
                            <div className="min-w-0 truncate">
                              <p className="text-xs sm:text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                                {act.title}
                              </p>
                              <p className="text-[11px] text-[#86868b] truncate">
                                {act.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#86868b] bg-black/5 dark:bg-white/10 px-2.5 py-0.5 rounded-full shrink-0 font-mono">
                            {act.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeFilterTab !== 'ACTIONS' && userRole !== 'Public Commuter' && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                        {language === 'hi' ? 'दोष टिकट एवं कार्य आदेश' : 'Defect Tickets'} ({filteredTickets.length})
                      </div>
                      {filteredTickets.length === 0 ? (
                        <p className="text-xs text-[#86868b] p-4 text-center">
                          {language === 'hi' ? 'कोई मेल नहीं मिला' : 'No matching results found'}
                        </p>
                      ) : (
                        filteredTickets.slice(0, 8).map((tk) => (
                          <button
                            type="button"
                            key={tk.id}
                            onClick={() => {
                              onSelectTicket && onSelectTicket(tk.ticketNumber);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">report_problem</span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-[#0071E3]">{tk.ticketNumber}</span>
                                  <span className="text-xs sm:text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{tk.title}</span>
                                </div>
                                <p className="text-[11px] text-[#86868b] truncate mt-0.5">{tk.locationName}</p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-[#86868b] group-hover:text-[#0071E3] group-hover:translate-x-1 transition-all shrink-0">
                              chevron_right
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-black/5 dark:border-white/10 pt-3 px-4 sm:px-8 lg:px-10 max-w-[1800px] mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id || (activeView === 'ticket-detail' && item.id === 'tickets');
            return (
              <button
                type="button"
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.id);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-md font-semibold'
                    : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[17px] sm:text-[18px] transition-transform group-hover:scale-110 ${
                    isActive ? 'icon-fill text-white' : 'text-[#86868b]'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.id === 'safety-complaints'
                        ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                        : item.id === 'live-map'
                        ? 'bg-[#34C759]/10 text-[#34C759]'
                        : 'bg-black/5 dark:bg-white/10 text-[#86868b]'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
