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
  Zap
} from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onToggleLanguage: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  onLogin: (role: UserRole) => void;
}

interface PseudoProfile {
  role: UserRole;
  labelEn: string;
  labelHi: string;
  id: string;
  passkey: string;
  descEn: string;
  descHi: string;
  icon: any;
  badge: string;
  colorClass: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onToggleLanguage,
  theme = 'light',
  onToggleTheme,
  onLogin
}) => {
  const isHi = language === 'hi';

  const pseudoProfiles: PseudoProfile[] = [
    {
      role: 'Public Commuter',
      labelEn: 'Public Commuter',
      labelHi: 'आम नागरिक / यात्री',
      id: 'CITIZEN-DEL-8921',
      passkey: 'commuter2026',
      descEn: 'Track nearby buses, view live ETAs, and submit incident feedback.',
      descHi: 'निकटतम बसों को ट्रैक करें, आगमन समय देखें एवं शिकायत दर्ज करें।',
      icon: Bus,
      badge: 'Public Portal',
      colorClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      role: 'Municipal Admin',
      labelEn: 'Municipal Admin',
      labelHi: 'नगर निगम प्रशासक',
      id: 'MUNI-ADMIN-001',
      passkey: 'admin2026',
      descEn: 'Full command dashboard, multi-agency SLA control, and analytics.',
      descHi: 'संपूर्ण कमांड डैशबोर्ड, बहु-एजेंसी समन्वय एवं सांख्यिकी नियंत्रण।',
      icon: ShieldCheck,
      badge: 'Level 1 Core',
      colorClass: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400'
    },
    {
      role: 'Zonal Officer',
      labelEn: 'Zonal Officer',
      labelHi: 'क्षेत्रीय वार्ड अधिकारी',
      id: 'ZONAL-DEL-WEST-42',
      passkey: 'zonal2026',
      descEn: 'Ward-level defect inspection, triage, and SLA enforcement.',
      descHi: 'वार्ड स्तर के नागरिक दोषों का निरीक्षण, प्राथमिकता एवं आवंटन।',
      icon: Building2,
      badge: 'Ward Control',
      colorClass: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      role: 'Repair Crew Lead',
      labelEn: 'Repair Crew Lead',
      labelHi: 'रखरखाव मरम्मत दल प्रमुख',
      id: 'CREW-LEAD-R8',
      passkey: 'crew2026',
      descEn: 'Field work order execution, rapid repairs, and photo evidence update.',
      descHi: 'मैदानी कार्य आदेश निष्पादन, त्वरित सुधार एवं फोटो साक्ष्य अपलोड।',
      icon: Wrench,
      badge: 'Field Ops',
      colorClass: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400'
    },
    {
      role: 'Transport Authority',
      labelEn: 'Transport Authority',
      labelHi: 'परिवहन प्राधिकरण अधिकारी',
      id: 'DTC-TRANS-AUTH-10',
      passkey: 'trans2026',
      descEn: 'AI fleet telemetry monitoring, CCTV streams, and depot alerts.',
      descHi: 'एआई बस बेड़ा टेलीमेट्री निगरानी, सीसीटीवी लाइव स्ट्रीम एवं डिपो अलर्ट।',
      icon: Compass,
      badge: 'Transit Fleet',
      colorClass: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400'
    }
  ];

  const [selectedRole, setSelectedRole] = useState<UserRole>('Public Commuter');
  const activeProfile = pseudoProfiles.find((p) => p.role === selectedRole) || pseudoProfiles[0];
  const [serviceId, setServiceId] = useState(activeProfile.id);
  const [password, setPassword] = useState(activeProfile.passkey);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (profile: PseudoProfile) => {
    setSelectedRole(profile.role);
    setServiceId(profile.id);
    setPassword(profile.passkey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  const handleQuickLogin = (role: UserRole) => {
    onLogin(role);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F5F7] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 select-none overflow-x-hidden">
      {/* Left Brand Panel with Apple Dark Aesthetic */}
      <div className="lg:w-1/2 bg-[#161617] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Tricolor Government Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="relative z-10 space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.emblem}
              alt="National Emblem"
              className="h-12 w-auto object-contain brightness-110"
            />
            <div>
              <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                Ministry of Housing & Urban Affairs
              </div>
              <div className="text-xs font-medium text-slate-400">
                Government Civic Command Portal
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {isHi ? 'एआई-संचालित शहरी इंटेलिजेंस' : 'AI-Powered Urban Intelligence'}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              नगर दृष्टि <span className="text-blue-500 font-mono text-2xl lg:text-3xl block lg:inline">PRO</span>
            </h1>
          </div>

          <p className="text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed font-normal">
            {isHi
              ? 'एआई-आधारित नागरिक दोष पहचान, बस बेड़ा टेलीमेट्री, स्वचालित कार्य आदेश आवंटन एवं सार्वजनिक यात्री ट्रैकिंग पोर्टल।'
              : 'Unified Smart Governance Command & Public Transit Portal with automated edge detection, fleet monitoring, and real-time civic triage.'}
          </p>
        </div>

        {/* Pseudo Role Quick Access Bar */}
        <div className="relative z-10 pt-8 mt-6 border-t border-white/10 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHi ? 'एक-क्लिक त्वरित भूमिका प्रवेश' : 'One-Click Quick Role Switch'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {pseudoProfiles.map((p) => {
              const ProfileIcon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p.role)}
                  className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left flex flex-col justify-between hover:border-blue-400/60"
                >
                  <div className="flex items-center justify-between">
                    <ProfileIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">Quick Login</span>
                  </div>
                  <span className="text-xs font-semibold text-white mt-2 truncate block">
                    {isHi ? p.labelHi : p.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form & Credentials Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-100 dark:bg-[#0B1120]">
        {/* Top Header Utilities */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-300 dark:border-slate-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className={`px-3 py-1 rounded-full transition-all ${language === 'en' ? 'bg-blue-600 text-white' : ''}`}>
              EN
            </span>
            <span className={`px-3 py-1 rounded-full transition-all ${language === 'hi' ? 'bg-blue-600 text-white' : ''}`}>
              हिन्दी
            </span>
          </button>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isHi ? 'सुरक्षित प्रमाणीकरण प्रवेश' : 'Secure Single Sign-On'}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isHi ? 'पोर्टल में प्रवेश करें' : 'Sign In to Nagar Drishti'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHi ? 'अपनी भूमिका चुनें एवं संबंधित डैशबोर्ड तक पहुँचें।' : 'Select a user role to auto-populate pseudo credentials.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isHi ? 'उपयोगकर्ता भूमिका चुनें (Select User Role)' : 'Select User Role Profile'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pseudoProfiles.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedRole === p.role;
                  return (
                    <div
                      key={p.role}
                      onClick={() => handleRoleSelect(p)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate text-slate-900 dark:text-slate-100">
                            {isHi ? p.labelHi : p.labelEn}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{p.badge}</span>
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Profile Info Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                <span>{isHi ? activeProfile.labelHi : activeProfile.labelEn}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {activeProfile.badge}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {isHi ? activeProfile.descHi : activeProfile.descEn}
              </p>
            </div>

            {/* Pseudo ID Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {isHi ? 'आईडी / यूजरनेम' : 'Pseudo Official ID / User Code'}
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Pseudo Security Passkey */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                {isHi ? 'सुरक्षा पासकोड' : 'Pseudo Security Passcode'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                required
              />
            </div>

            {/* Submit / Sign In Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>{isHi ? `${selectedRole} के रूप में प्रवेश करें` : `Enter Portal as ${selectedRole}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
