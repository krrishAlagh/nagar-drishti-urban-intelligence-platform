import React, { useState } from 'react';
import { SystemAlert, Language } from '../types';
import { SYSTEM_ALERTS, TRANSLATIONS } from '../data/mockData';

interface NotificationsViewProps {
  language: Language;
  onSelectAlert?: (alert: SystemAlert) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [alertsList, setAlertsList] = useState<SystemAlert[]>(SYSTEM_ALERTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all');

  const handleMarkAllRead = () => {
    setAlertsList((prev) => prev.map((a) => ({ ...a, unread: false })));
  };

  const filteredAlerts = alertsList.filter((a) => {
    if (filter === 'critical') return a.type === 'critical';
    if (filter === 'unread') return a.unread;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Apple Header */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.notifications}
            </h1>
            <span className="text-[10px] font-semibold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 px-2.5 py-0.5 rounded-full font-mono">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Real-time telemetry pings, AI edge defect warnings, and SLA breach escalations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Filter Pills */}
          <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs font-bold' : 'text-[#86868b]'
              }`}
            >
              All ({alertsList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'critical' ? 'bg-white dark:bg-[#1d1d1f] text-[#FF3B30] shadow-2xs font-bold' : 'text-[#86868b]'
              }`}
            >
              Critical ({alertsList.filter((a) => a.type === 'critical').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filter === 'unread' ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs font-bold' : 'text-[#86868b]'
              }`}
            >
              Unread ({alertsList.filter((a) => a.unread).length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn-apple-secondary px-4 py-1.5 text-xs font-semibold cursor-pointer"
          >
            Mark All Read
          </button>
        </div>
      </section>

      {/* Notifications Cards */}
      <div className="flex flex-col gap-3.5 max-w-4xl mx-auto w-full">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`glass-card p-5 flex items-start gap-4 transition-all ${
              alert.unread ? 'border-l-4 border-l-[#FF3B30]' : 'opacity-80'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                alert.type === 'critical'
                  ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                  : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{alert.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                  {alert.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#86868b]">{alert.time}</span>
              </div>
              <p className="text-xs text-[#86868b] mt-1 leading-relaxed">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
