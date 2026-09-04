import React, { useState } from 'react';
import { Language, UserRole, Theme } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface SettingsViewProps {
  language: Language;
  onToggleLanguage: () => void;
  userRole: UserRole;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onToggleLanguage,
  userRole,
  theme = 'light',
  onToggleTheme
}) => {
  const t = TRANSLATIONS[language];
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [criticalSlaHours, setCriticalSlaHours] = useState(2);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [liveStreamRate, setLiveStreamRate] = useState('30 FPS');

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Apple Header */}
      <section className="glass-card p-6 sm:p-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.settings} & System Preferences
            </h1>
            <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 border border-[#0071E3]/20 px-2.5 py-0.5 rounded-full font-mono">
              Pro Config
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Adjust AI vision thresholds, automated SLA dispatch rules, and municipal notifications.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Card 1: AI Vision Model Parameters */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
            <span className="material-symbols-outlined text-[#0071E3]">psychology</span>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Edge AI Vision Parameters</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">Minimum AI Confidence Trigger</span>
              <span className="font-mono font-bold text-[#0071E3]">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="accent-[#0071E3] cursor-pointer"
            />
            <span className="text-[11px] text-[#86868b]">
              Detections below this threshold are marked as 'Probable' and require manual review.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-800 dark:text-slate-200">Dashcam Stream Framerate</label>
            <select
              value={liveStreamRate}
              onChange={(e) => setLiveStreamRate(e.target.value)}
              className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer outline-none border border-transparent focus:border-[#0071E3]"
            >
              <option value="15 FPS (Bandwidth Saver)">15 FPS (Bandwidth Saver)</option>
              <option value="30 FPS (Standard Resolution)">30 FPS (Standard Resolution)</option>
              <option value="60 FPS (High Precision)">60 FPS (High Precision)</option>
            </select>
          </div>
        </div>

        {/* Card 2: SLA & Auto-Dispatch */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
            <span className="material-symbols-outlined text-[#0071E3]">timer</span>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Municipal SLA & Automation</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200">Critical Defect SLA Cap</span>
              <span className="font-mono font-bold text-[#FF3B30]">{criticalSlaHours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={criticalSlaHours}
              onChange={(e) => setCriticalSlaHours(Number(e.target.value))}
              className="accent-[#FF3B30] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Auto-Dispatch Work Orders</p>
              <p className="text-[11px] text-[#86868b]">Immediately assign nearest field crew on critical AI detection</p>
            </div>
            <input
              type="checkbox"
              checked={autoDispatch}
              onChange={(e) => setAutoDispatch(e.target.checked)}
              className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Emergency SMS Alerts</p>
              <p className="text-[11px] text-[#86868b]">Notify Zonal Engineer on severe cabin SOS & gas line leaks</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
