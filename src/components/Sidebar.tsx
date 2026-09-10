import React, { useMemo } from 'react';
import { ActiveView, Language, UserRole, ROLE_ALLOWED_VIEWS } from '../types';
import { ASSETS, TRANSLATIONS } from '../data/mockData';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView, filterParam?: string) => void;
  language: Language;
  onLogout: () => void;
  unreadAlertsCount?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  language,
  onLogout,
  unreadAlertsCount = 3,
  isOpenOnMobile = false,
  onCloseMobile,
  userRole = 'Municipal Admin'
}) => {
  const t = TRANSLATIONS[language];

  interface NavItem {
    id: ActiveView;
    label: string;
    icon: string;
    badge?: number | string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const rawNavGroups: NavGroup[] = [
    {
      title: language === 'hi' ? 'कमान एवं अवलोकन' : 'Command & Portals',
      items: [
        { id: 'dashboard', label: t.dashboard, icon: 'dashboard' },
        {
          id: 'public-transit',
          label: language === 'hi' ? 'सार्वजनिक बस ट्रैकर' : 'Public Bus Tracker',
          icon: 'directions_bus',
          badge: language === 'hi' ? 'लाइव' : 'Public'
        },
        {
          id: 'services-directory',
          label: language === 'hi' ? 'सेवा श्रेणियां' : 'Service Directory',
          icon: 'account_tree',
          badge: '6'
        },
        { id: 'live-map', label: t.liveMap, icon: 'map' }
      ]
    },
    {
      title: language === 'hi' ? 'सुरक्षा एवं कार्य आदेश' : 'Safety & Operations',
      items: [
        { id: 'safety-complaints', label: t.safetyComplaints, icon: 'videocam' },
        { id: 'accident-analytics', label: t.accidentBlackspots, icon: 'crisis_alert' },
        { id: 'tickets', label: t.ticketsWorkOrders, icon: 'assignment' }
      ]
    },
    {
      title: language === 'hi' ? 'विश्लेषण एवं वाहन बेड़ा' : 'Intelligence & Fleet',
      items: [
        { id: 'analytics', label: t.analyticsReports, icon: 'analytics' },
        { id: 'fleet', label: t.fleetMonitoring, icon: 'local_shipping' },
        { id: 'multi-agency', label: t.multiAgency, icon: 'groups' }
      ]
    },
    {
      title: language === 'hi' ? 'प्रणाली एवं सेटिंग्स' : 'System',
      items: [
        {
          id: 'notifications',
          label: t.notifications,
          icon: 'notifications',
          badge: unreadAlertsCount
        },
        { id: 'settings', label: t.settings, icon: 'settings' }
      ]
    }
  ];

  const allowedViews = ROLE_ALLOWED_VIEWS[userRole] || ROLE_ALLOWED_VIEWS['Municipal Admin'];

  const navGroups = useMemo(() => {
    return rawNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => allowedViews.includes(item.id))
      }))
      .filter((group) => group.items.length > 0);
  }, [rawNavGroups, allowedViews]);

  const roleProfile = useMemo(() => {
    switch (userRole) {
      case 'Public Commuter':
        return {
          name: language === 'hi' ? 'आम नागरिक यात्री' : 'Verified Commuter',
          roleTitle: language === 'hi' ? 'नागरिक पोर्टल • DEL-8921' : 'Citizen Portal • DEL-8921',
          avatar: ASSETS.adminAvatar,
          badgeBorder: 'border-emerald-400',
          textColor: 'text-emerald-400'
        };
      case 'Repair Crew Lead':
        return {
          name: 'Vikram Singh',
          roleTitle: language === 'hi' ? 'फील्ड टीम प्रमुख (पीडब्ल्यूडी वार्ड 14)' : 'Field Ops Lead (PWD Ward 14)',
          avatar: ASSETS.adminAvatar,
          badgeBorder: 'border-amber-400',
          textColor: 'text-amber-400'
        };
      case 'Transport Authority':
        return {
          name: 'Anita Deshmukh',
          roleTitle: language === 'hi' ? 'डीटीसी बेड़ा संचालन प्रमुख' : 'DTC Fleet Operations Chief',
          avatar: ASSETS.adminAvatar,
          badgeBorder: 'border-cyan-400',
          textColor: 'text-cyan-400'
        };
      case 'Zonal Officer':
        return {
          name: 'S. K. Verma',
          roleTitle: language === 'hi' ? 'क्षेत्रीय नगर अधिकारी (जोन 4)' : 'Zonal Municipal Officer (Zone 4)',
          avatar: ASSETS.adminAvatar,
          badgeBorder: 'border-purple-400',
          textColor: 'text-purple-400'
        };
      case 'Municipal Admin':
      default:
        return {
          name: 'Rajesh Kumar, IAS',
          roleTitle: language === 'hi' ? 'नगर आयुक्त' : 'Municipal Commissioner',
          avatar: ASSETS.adminAvatar,
          badgeBorder: 'border-[#FF9F0A]',
          textColor: 'text-[#FF9F0A]'
        };
    }
  }, [userRole, language]);

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#00172A]/70 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Apple-Style Sidebar Dock */}
      <aside
        className={`bg-[#161617]/95 dark:bg-[#161617]/95 backdrop-blur-2xl w-[280px] max-w-[85vw] h-screen fixed left-0 top-0 border-r border-white/10 flex flex-col z-50 select-none transition-transform duration-300 ease-in-out lg:hidden ${
          isOpenOnMobile ? 'translate-x-0 shadow-2xl pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.emblem}
              alt="National Emblem"
              className="h-7 w-auto object-contain brightness-110 shrink-0"
            />
            <div>
              <h1 className="font-semibold text-[14px] leading-tight text-white tracking-tight flex items-center gap-1.5">
                <span>{language === 'hi' ? 'नगर दृष्टि' : 'Nagar Drishti'}</span>
                <span className="text-[9px] font-mono bg-[#FF9F0A] text-black px-1.5 py-0.2 rounded font-bold">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-[#86868b] font-normal">
                {userRole === 'Public Commuter' 
                  ? (language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal')
                  : (language === 'hi' ? 'शहरी कमान केंद्र' : 'Urban Intelligence')}
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-full text-[#86868b] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close navigation"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Dynamic Role Profile Card */}
        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={roleProfile.avatar}
              alt={roleProfile.name}
              className={`w-8 h-8 rounded-full object-cover border ${roleProfile.badgeBorder} ring-1 ring-white/20 shrink-0`}
            />
            <div className="min-w-0">
              <p className="text-xs text-white font-semibold truncate">{roleProfile.name}</p>
              <p className={`text-[10px] font-medium truncate ${roleProfile.textColor}`}>
                {roleProfile.roleTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            title={language === 'hi' ? 'लॉगआउट करें' : 'Sign out'}
            className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>

        {/* Grouped Navigation List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 flex flex-col gap-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-0.5">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868b] font-mono">
                {group.title}
              </div>

              {group.items.map((item) => {
                const isActive =
                  activeView === item.id || (activeView === 'ticket-detail' && item.id === 'tickets');
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-200 text-xs font-medium cursor-pointer group ${
                      isActive
                        ? 'bg-[#0071E3] text-white shadow-sm'
                        : 'text-[#d2d2d7] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-110 ${
                          isActive ? 'icon-fill text-white' : 'text-[#86868b] group-hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                          item.id === 'services-directory'
                            ? 'bg-[#FF9F0A] text-black'
                            : 'bg-[#FF3B30] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Explicit Sign Out / Logout Option in Sidebar Drawer */}
        <div className="px-3 pt-2 pb-1 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>{language === 'hi' ? 'लॉगआउट (साइन आउट)' : 'Sign Out / Logout'}</span>
          </button>
        </div>

        {/* Ambient Footer Info */}
        <div className="p-3 border-t border-white/10 bg-black/30 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#86868b]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
              </span>
              <span className="text-[11px] font-normal text-white">
                {language === 'hi' ? '48 बसें AI सक्रिय' : '48 Edge AI Buses'}
              </span>
            </div>
            <span className="font-mono text-[9.5px] text-[#FF9F0A] font-semibold">24x7 Active</span>
          </div>

          <div className="bg-white/5 rounded-xl px-2.5 py-1.5 text-[10.5px] text-[#d2d2d7] flex items-center justify-between border border-white/5">
            <span className="font-normal text-[#86868b]">
              {language === 'hi' ? 'हेल्पलाइन:' : 'Helpline:'}
            </span>
            <span className="font-mono font-semibold text-[#FF9F0A]">1800-300-1947</span>
          </div>
        </div>
      </aside>
    </>
  );
};
