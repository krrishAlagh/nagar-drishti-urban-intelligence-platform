import React, { useState } from 'react';
import { Language } from '../types';
import {
  DEPARTMENT_METRICS,
  RECURRING_HOTSPOTS,
  TRANSLATIONS
} from '../data/mockData';

interface AnalyticsViewProps {
  language: Language;
  analyticsKpi?: {
    totalIngestedDetections: number;
    activeFleetBuses: number;
    totalFleetBuses: number;
    resolvedTodayCount: number;
    criticalPotholesCount: number;
    avgAiConfidence: number;
    avgEdgeLatencyMs: number;
  };
  onNavigateToHotspot?: (locationName: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  language,
  analyticsKpi,
  onNavigateToHotspot
}) => {
  const t = TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const activeDetections = analyticsKpi?.totalIngestedDetections ?? 5843;
  const liveBuses = analyticsKpi?.activeFleetBuses ?? 48;
  const resolvedToday = analyticsKpi?.resolvedTodayCount ?? 142;
  const criticalPotholes = analyticsKpi?.criticalPotholesCount ?? 19;
  const avgConfidence = analyticsKpi?.avgAiConfidence ?? 94.6;
  const avgLatency = analyticsKpi?.avgEdgeLatencyMs ?? 18.4;

  const handleExport = (type: 'PDF' | 'CSV') => {
    alert(`Exporting Municipal Urban Intelligence Report (${type})... Download started.`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Apple Header Section */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.analyticsReports}
            </h1>
            <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 border border-[#0071E3]/20 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
              Real-time Telemetry Active
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Aggregated civic intelligence, cross-department SLA compliance, and predictive road health. Live telemetry refreshed in near real time over WebSocket.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2.5 bg-black/5 dark:bg-white/10 text-xs font-semibold rounded-full border border-transparent focus:border-[#0071E3] outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Current Fiscal Quarter">Current Quarter</option>
            <option value="Year to Date (2024)">Year to Date (2024)</option>
          </select>

          <button
            type="button"
            onClick={() => handleExport('CSV')}
            className="btn-apple-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0071E3]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('PDF')}
            className="btn-apple-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Municipal PDF</span>
          </button>
        </div>
      </section>

      {/* Real-time Analytics KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">AI Detections</span>
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white transition-all">
              {activeDetections.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold">+12% live velocity</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Active Fleet</span>
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {liveBuses}/48
            </div>
            <span className="text-[10px] text-[#86868b] font-mono">100% Edge AI online</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Auto-Resolved</span>
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#34C759]">
              {resolvedToday}
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold">Today closed</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Critical SLA</span>
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#FF3B30]">
              {criticalPotholes}
            </div>
            <span className="text-[10px] text-[#FF3B30] font-mono font-semibold">1-Hour SLA breaches</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">AI Confidence</span>
            <span className="w-2 h-2 rounded-full bg-[#AF52DE]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {avgConfidence}%
            </div>
            <span className="text-[10px] text-[#86868b] font-mono">YOLOv8 Multi-Task</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-[#86868b]">Edge Latency</span>
            <span className="w-2 h-2 rounded-full bg-[#5856D6]"></span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {avgLatency}ms
            </div>
            <span className="text-[10px] text-[#34C759] font-mono font-semibold">Jetson TensorRT</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Multi-Category Defect Trends (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Defect Detection Velocity</h3>
              <p className="text-[11px] text-[#86868b]">Daily incidents captured via edge AI transit cameras</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono font-medium">
              <span className="flex items-center gap-1 text-[#0071E3]">
                <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> Potholes
              </span>
              <span className="flex items-center gap-1 text-[#FF9F0A]">
                <span className="w-2 h-2 rounded-full bg-[#FF9F0A]"></span> Sanitation
              </span>
              <span className="flex items-center gap-1 text-[#34C759]">
                <span className="w-2 h-2 rounded-full bg-[#34C759]"></span> Streetlights
              </span>
            </div>
          </div>

          <div className="h-56 relative border-b border-l border-black/10 dark:border-white/10 pb-2 pl-2 flex items-end">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 60">
              {/* Potholes line */}
              <polyline
                fill="none"
                stroke="#0071E3"
                strokeWidth="2.5"
                points="0,48 15,40 30,50 45,28 60,35 75,20 90,25 100,12"
              />
              {/* Sanitation line */}
              <polyline
                fill="none"
                stroke="#FF9F0A"
                strokeWidth="2"
                strokeDasharray="2,2"
                points="0,52 20,44 40,48 60,30 80,32 100,18"
              />
              {/* Streetlights line */}
              <polyline
                fill="none"
                stroke="#34C759"
                strokeWidth="2"
                points="0,55 25,48 50,42 75,38 100,22"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-3 font-mono">
            <span>Aug 01</span>
            <span>Aug 07</span>
            <span>Aug 14</span>
            <span>Aug 21</span>
            <span>Aug 29</span>
          </div>
        </div>

        {/* Card 2: SLA Adherence Scorecard (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">SLA Resolution Rate</h3>
              <p className="text-[11px] text-[#86868b]">Turnaround time vs citizen charter</p>
            </div>
            <span className="text-xl font-bold text-[#34C759] font-mono">88.4%</span>
          </div>

          <div className="flex flex-col gap-3 my-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-800 dark:text-slate-200 font-medium">Critical (1 hr SLA)</span>
                <span className="font-mono text-[#FF3B30] font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF3B30] rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-800 dark:text-slate-200 font-medium">High (4 hrs SLA)</span>
                <span className="font-mono text-[#FF9F0A] font-bold">86%</span>
              </div>
              <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF9F0A] rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-800 dark:text-slate-200 font-medium">Medium (24 hrs SLA)</span>
                <span className="font-mono text-[#0071E3] font-bold">89%</span>
              </div>
              <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0071E3] rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-[11px] text-[#86868b] flex items-center justify-between">
            <span>Average Dispatch Latency:</span>
            <strong className="text-slate-900 dark:text-white font-mono">{avgLatency.toFixed(1)} mins</strong>
          </div>
        </div>
      </div>

      {/* Row 2: Department Workload Matrix & Recurrent Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Compliance Table (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department Performance Matrix</h3>
            <span className="text-[11px] text-[#86868b] font-mono">5 Municipal Bodies</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-[#86868b] uppercase text-[10px] font-mono">
                  <th className="py-2.5 pr-2">Department</th>
                  <th className="py-2.5 px-2">Assigned</th>
                  <th className="py-2.5 px-2">Closed</th>
                  <th className="py-2.5 px-2">Avg Hours</th>
                  <th className="py-2.5 pl-2 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {DEPARTMENT_METRICS.map((dept) => (
                  <tr key={dept.department} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2 font-medium text-slate-900 dark:text-white">{dept.department}</td>
                    <td className="py-3 px-2 font-mono text-[#86868b]">{dept.assigned}</td>
                    <td className="py-3 px-2 font-mono text-[#34C759] font-bold">{dept.resolved}</td>
                    <td className="py-3 px-2 font-mono text-[#86868b]">{dept.avgResTimeHrs}h</td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-[#0071E3]">{dept.slaCompliance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recurrent Defect Hotspots (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chronic Recurrence Hotspots</h3>
              <span className="text-[10px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-0.5 rounded-full font-mono">
                Pavement Fatigue
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {RECURRING_HOTSPOTS.map((hotspot) => (
                <div
                  key={hotspot.id}
                  onClick={() => onNavigateToHotspot && onNavigateToHotspot(hotspot.name)}
                  className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#0071E3]/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0071E3] truncate">
                        {hotspot.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#86868b] block">{hotspot.primaryIssue}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#FF3B30] font-mono block">
                      {hotspot.repeatCount}x Defect
                    </span>
                    <span className="text-[10px] text-[#86868b] font-mono">{hotspot.lastDetected}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-[#0071E3] font-semibold cursor-pointer">
            <span>View Full GIS Hotspot Correlation</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};
