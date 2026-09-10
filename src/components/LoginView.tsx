import React, { useState } from 'react';
import { UserRole, Language, Theme } from '../types';
import { ASSETS } from '../data/mockData';
import { 
  ShieldCheck, 
  User, 
  Bus, 
  Wrench, 
  Building2, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Compass,
  Zap,
  Shield,
  Activity,
  Sun,
  Moon,
  Radio,
  Eye
} from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onToggleLanguage: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  onLogin: (role: UserRole) => void;
}

type PortalType = 'CITIZEN' | 'OFFICER';

interface RoleOption {
  role: UserRole;
  portal: PortalType;
  titleEn: string;
  titleHi: string;
  badgeEn: string;
  badgeHi: string;
  id: string;
  passkey: string;
  scopeSummaryEn: string;
  scopeSummaryHi: string;
  accentGradient: string;
  icon: React.ElementType;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onToggleLanguage,
  theme = 'light',
  onToggleTheme,
  onLogin
}) => {
  const isHi = language === 'hi';
  const isDark = theme === 'dark';
  const [portalType, setPortalType] = useState<PortalType>('CITIZEN');

  const roleOptions: RoleOption[] = [
    {
      role: 'Public Commuter',
      portal: 'CITIZEN',
      titleEn: 'Public Commuter',
      titleHi: 'आम नागरिक / यात्री',
      badgeEn: 'Citizen Portal',
      badgeHi: 'नागरिक पोर्टल',
      id: 'CITIZEN-DEL-8921',
      passkey: 'commuter2026',
      scopeSummaryEn: 'DTC bus tracker, passenger cabin safety SOS, civic emergency helplines.',
      scopeSummaryHi: 'लाइव बस ट्रैकर, केबिन सुरक्षा SOS और 24x7 नागरिक हेल्पलाइन।',
      accentGradient: 'from-emerald-500 to-teal-600',
      icon: Bus
    },
    {
      role: 'Municipal Admin',
      portal: 'OFFICER',
      titleEn: 'Municipal Admin',
      titleHi: 'नगर निगम प्रशासक',
      badgeEn: 'Central Command',
      badgeHi: 'केंद्रीय कमान',
      id: 'MUNI-ADMIN-001',
      passkey: 'admin2026',
      scopeSummaryEn: 'City-wide triage, automated contractor routing, full 12 modules.',
      scopeSummaryHi: 'शहर-व्यापी ट्राइऐज, ऑटो-डिस्पैच एवं संपूर्ण 12 मॉड्यूल अधिकार।',
      accentGradient: 'from-indigo-600 to-blue-600',
      icon: ShieldCheck
    },
    {
      role: 'Zonal Officer',
      portal: 'OFFICER',
      titleEn: 'Zonal Officer',
      titleHi: 'क्षेत्रीय अधिकारी',
      badgeEn: 'Ward 14 Oversight',
      badgeHi: 'वार्ड 14 नियंत्रण',
      id: 'ZONE-OFFICER-04',
      passkey: 'zonal2026',
      scopeSummaryEn: 'Ward work orders, SLA countdown timers, contractor dispatch.',
      scopeSummaryHi: 'वार्ड कार्य आदेश, SLA काउंटडाउन व स्थानीय ठेकेदार निगरानी।',
      accentGradient: 'from-violet-600 to-purple-600',
      icon: Building2
    },
    {
      role: 'Repair Crew Lead',
      portal: 'OFFICER',
      titleEn: 'Repair Crew Lead',
      titleHi: 'मरम्मत दल प्रमुख',
      badgeEn: 'Field Operations',
      badgeHi: 'फील्ड ऑपरेशंस',
      id: 'CREW-LEAD-77',
      passkey: 'fieldcrew2026',
      scopeSummaryEn: 'Field repair Kanban board, before/after evidence photos, turn GPS.',
      scopeSummaryHi: 'फील्ड रिपेयर कानबन बोर्ड, फोटो साक्ष्य व सटीक जीपीएस मैप।',
      accentGradient: 'from-amber-500 to-orange-600',
      icon: Wrench
    },
    {
      role: 'Transport Authority',
      portal: 'OFFICER',
      titleEn: 'Transport Authority',
      titleHi: 'परिवहन प्राधिकरण',
      badgeEn: 'Transit AI Fleet',
      badgeHi: 'डीटीसी AI बेड़ा',
      id: 'DTC-OPS-88',
      passkey: 'transit2026',
      scopeSummaryEn: '48 live DTC dashcam streams, cabin incidents & accident blackspots.',
      scopeSummaryHi: '48 डीटीसी बस कैमरे, केबिन घटनाएं व दुर्घटना ब्लैकस्पॉट।',
      accentGradient: 'from-sky-500 to-cyan-600',
      icon: Compass
    }
  ];

  const [selectedRole, setSelectedRole] = useState<UserRole>('Public Commuter');
  const [serviceId, setServiceId] = useState('CITIZEN-DEL-8921');
  const [password, setPassword] = useState('commuter2026');

  const activeOption = roleOptions.find((r) => r.role === selectedRole) || roleOptions[0];

  const handlePortalSwitch = (portal: PortalType) => {
    setPortalType(portal);
    if (portal === 'CITIZEN') {
      const citizen = roleOptions[0];
      setSelectedRole(citizen.role);
      setServiceId(citizen.id);
      setPassword(citizen.passkey);
    } else {
      const officer = roleOptions[1];
      setSelectedRole(officer.role);
      setServiceId(officer.id);
      setPassword(officer.passkey);
    }
  };

  const handleSelectRole = (opt: RoleOption) => {
    setSelectedRole(opt.role);
    setServiceId(opt.id);
    setPassword(opt.passkey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  const handleQuickDemo = (role: UserRole) => {
    const opt = roleOptions.find((r) => r.role === role);
    if (opt) {
      setPortalType(opt.portal);
      setSelectedRole(opt.role);
      setServiceId(opt.id);
      setPassword(opt.passkey);
    }
    onLogin(role);
  };

  const visibleRoleOptions = roleOptions.filter((r) => r.portal === portalType);

  return (
    <div
      className={`h-screen w-screen flex select-none overflow-hidden relative font-sans transition-all duration-300 ${
        isDark
          ? 'bg-[#070B14] text-slate-100'
          : 'bg-gradient-to-br from-[#F6F8FD] via-[#EDF2FA] to-[#E3EBF7] text-[#0F172A]'
      }`}
    >
      {/* ─── Aurora Background Lights ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[150px] transition-colors duration-500 ${
            portalType === 'CITIZEN'
              ? isDark ? 'bg-emerald-600/15' : 'bg-emerald-300/30'
              : isDark ? 'bg-indigo-600/20' : 'bg-indigo-300/35'
          }`}
        />
        <div
          className={`absolute top-1/2 -right-32 w-[550px] h-[550px] rounded-full blur-[160px] ${
            isDark ? 'bg-blue-600/15' : 'bg-sky-200/40'
          }`}
        />
        <div
          className={`absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] ${
            isDark ? 'bg-purple-900/20' : 'bg-purple-200/30'
          }`}
        />
      </div>

      {/* Tricolor National Government Top Strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-50 shadow-xs" />

      {/* ─── Top Right Controls (Theme & Language) ─── */}
      <div className="absolute top-4 right-5 z-40 flex items-center gap-2">
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-full border transition-all cursor-pointer shadow-xs backdrop-blur-xl ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-amber-300'
                : 'bg-white/90 hover:bg-white border-black/10 text-slate-700 hover:text-black shadow-sm'
            }`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleLanguage}
          className={`flex items-center p-0.5 rounded-full border backdrop-blur-xl transition-all cursor-pointer ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 border-white/15'
              : 'bg-white/90 hover:bg-white border-black/10 shadow-sm'
          }`}
        >
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            EN
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'hi'
                ? 'bg-[#1E40AF] text-white shadow-xs'
                : isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            हिन्दी
          </span>
        </button>
      </div>

      {/* ─── Left Hero & Telemetry Canvas ─── */}
      <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-12 flex-col justify-between relative z-10">
        {/* Ministry Top Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.emblem}
              alt="National Emblem"
              className="h-11 w-auto object-contain drop-shadow-sm"
            />
            <div>
              <div className="text-[10.5px] font-mono tracking-widest text-[#D97706] dark:text-[#FBBF24] uppercase font-black">
                GOVERNMENT OF INDIA • MOHUA
              </div>
              <div className={`text-xs font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Ministry of Housing & Urban Affairs
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Smart Cities Mission • National Urban Technology Mission
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isHi ? 'एआई-संचालित शहरी कमान' : 'AI-Powered Urban Intelligence'}</span>
            </div>

            <h1 className={`text-4xl xl:text-5xl font-black tracking-tight leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              नगर दृष्टि <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono text-3xl xl:text-4xl">PRO</span>
            </h1>

            <p className={`text-xs xl:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {isHi
                ? 'दिल्ली राष्ट्रीय राजधानी क्षेत्र हेतु एकीकृत नागरिक पारगमन एवं नगर निगम कमान प्रणाली। 48 बसों के लाइव कैमरों द्वारा सड़क दोष पहचान और नागरिक सुरक्षा।'
                : 'Next-generation civic intelligence & public transit platform for Delhi NCR. 48 Edge AI connected DTC buses automating road triage and passenger safety.'}
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Preview Card */}
        <div className={`p-5 rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-xl max-w-lg ${
          isDark
            ? 'bg-white/[0.04] border-white/10 text-white'
            : 'bg-white/80 border-white/80 shadow-[0_20px_50px_rgba(30,58,138,0.08)] text-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${
                portalType === 'CITIZEN' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
              <span className="text-xs font-bold tracking-wide uppercase font-mono">
                {portalType === 'CITIZEN' ? 'Live Citizen Portal Mode' : 'Command Center Active'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-semibold">
              Edge 10Hz Telemetry
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 py-3">
            <div className="text-center p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="text-xl font-black text-[#2563EB] dark:text-[#60A5FA]">48</div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Buses</div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="text-xl font-black text-emerald-500">29.8</div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>FPS Edge</div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="text-xl font-black text-purple-500">6</div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Agencies</div>
            </div>
          </div>

          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2.5 ${
            portalType === 'CITIZEN'
              ? isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
          }`}>
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              {portalType === 'CITIZEN' ? 'directions_bus' : 'verified_user'}
            </span>
            <div>
              <span className="font-bold block mb-0.5">
                {portalType === 'CITIZEN' ? 'Public Citizen Work Scope:' : 'Officer Authority Scope:'}
              </span>
              <span>
                {portalType === 'CITIZEN'
                  ? 'Real-time DTC bus arrivals & route ETAs, passenger cabin SOS reporting, and direct 24x7 municipal helplines (DJB 1916, BSES 19123, MCD 155304).'
                  : 'Defect triage, contractor work order assignment, SLA timers, 48 edge camera dashcam feeds, and crash blackspots GIS.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-[11px] flex items-center justify-between ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <span>National Informatics & BEL Smart Infrastructure</span>
          <span className="font-mono text-[10px]">Release 2026.4</span>
        </div>
      </div>

      {/* ─── Right Glassmorphic Clean Login Card ─── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div
          className={`w-full max-w-[460px] rounded-3xl p-6 sm:p-8 border backdrop-blur-3xl shadow-2xl transition-all ${
            isDark
              ? 'bg-[#0F172A]/85 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white'
              : 'bg-white/90 border-white/80 shadow-[0_25px_60px_rgba(30,58,138,0.12),0_1px_2px_rgba(0,0,0,0.04)] text-slate-900'
          }`}
        >
          {/* Card Header */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{isHi ? 'सिंगल साइन-ऑन' : 'Single Sign-On Authentication'}</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isHi ? 'नगर दृष्टि में साइन इन करें' : 'Sign In to Nagar Drishti'}
            </h2>
          </div>

          {/* ─── Elegant Segmented Switcher ─── */}
          <div
            className={`p-1 rounded-2xl border flex items-center gap-1 mb-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => handlePortalSwitch('CITIZEN')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalType === 'CITIZEN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>{isHi ? 'नागरिक पोर्टल' : 'Citizen Access'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('OFFICER')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                portalType === 'OFFICER'
                  ? 'bg-[#1E40AF] text-white shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isHi ? 'अधिकारी कमान' : 'Officer Command'}</span>
            </button>
          </div>

          {/* ─── Role Selection Chips ─── */}
          <div className="space-y-1.5 mb-4">
            <div className={`text-[10px] font-bold uppercase tracking-wider flex justify-between ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>{isHi ? 'प्रोफाइल भूमिका:' : 'Active Role Profile:'}</span>
              <span className="font-semibold">{portalType === 'CITIZEN' ? '1 Citizen Role' : '4 Officer Roles'}</span>
            </div>

            <div className={`grid gap-1.5 ${portalType === 'CITIZEN' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {visibleRoleOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedRole === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => handleSelectRole(opt)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-white/15 border-blue-400 shadow-md ring-1 ring-blue-400/40'
                          : 'bg-white border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/20'
                        : isDark
                          ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                          : 'bg-white/60 hover:bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? opt.portal === 'CITIZEN' ? 'bg-emerald-600 text-white' : 'bg-[#1E40AF] text-white'
                            : isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p
                          className={`text-xs font-bold truncate leading-tight ${
                            isSelected
                              ? isDark ? 'text-white' : 'text-[#1E40AF]'
                              : isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {isHi ? opt.titleHi : opt.titleEn}
                        </p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {isHi ? opt.badgeHi : opt.badgeEn}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Credentials Form ─── */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <User className="w-3 h-3 text-[#2563EB]" />
                  <span>{isHi ? 'यूजर आईडी' : 'User Code'}</span>
                </label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition-all outline-none ${
                    isDark
                      ? 'bg-black/40 text-white border-white/15 focus:border-blue-400'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-[#2563EB] shadow-2xs'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Key className="w-3 h-3 text-[#2563EB]" />
                  <span>{isHi ? 'पासकोड' : 'Passcode'}</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition-all outline-none ${
                    isDark
                      ? 'bg-black/40 text-white border-white/15 focus:border-blue-400'
                      : 'bg-white text-slate-900 border-slate-300 focus:border-[#2563EB] shadow-2xs'
                  }`}
                  required
                />
              </div>
            </div>

            {/* PRIMARY SUBMIT CTA BUTTON */}
            <button
              type="submit"
              className={`w-full py-3 px-5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98 ${
                portalType === 'CITIZEN'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-105 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-[#1E40AF] via-blue-600 to-indigo-600 hover:brightness-105 shadow-blue-600/30'
              }`}
            >
              <span>
                {isHi
                  ? `${activeOption.titleHi} के रूप में प्रवेश करें`
                  : `Enter Portal as ${activeOption.titleEn}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ─── 1-Click Fast Launcher Pills ─── */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5">
            <div className={`text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isHi ? '1-क्लिक त्वरित डेमो लॉगिन:' : '1-Click Fast Login:'}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => handleQuickDemo(opt.role)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedRole === opt.role
                      ? isDark ? 'bg-white/20 border-blue-400 text-white' : 'bg-[#1E40AF] text-white border-[#1E40AF]'
                      : isDark ? 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.portal === 'CITIZEN' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <span>{isHi ? opt.titleHi : opt.titleEn}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
