import React, { useState } from 'react';
import { Language, BusFleetItem, SystemAlert } from '../types';
import { FLEET_BUSES, SYSTEM_ALERTS, TRANSLATIONS, INITIAL_DEFECTS } from '../data/mockData';
import { OpenStreetMapViewer } from './OpenStreetMapViewer';
import { CctvFootageModal, DATASET_CCTV_VIDEOS, CctvFootageItem } from './CctvFootageModal';

interface FleetMonitoringViewProps {
  language: Language;
  fleet?: BusFleetItem[];
  alerts?: SystemAlert[];
}

export const FleetMonitoringView: React.FC<FleetMonitoringViewProps> = ({
  language,
  fleet = FLEET_BUSES,
  alerts = SYSTEM_ALERTS
}) => {
  const t = TRANSLATIONS[language];
  const fleetList = fleet;
  const [selectedBus, setSelectedBus] = useState<BusFleetItem | null>(fleetList[0] || null);
  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);
  const [activeCctvItem, setActiveCctvItem] = useState<CctvFootageItem | null>(null);

  const handlePingBus = (busId: string) => {
    alert(`Heartbeat ping dispatched to edge vehicle AI unit [${busId}]. Latency: 38ms. Edge firmware: v4.1.8-Edge.`);
  };

  const handleOpenCctv = (item?: CctvFootageItem) => {
    setActiveCctvItem(item || DATASET_CCTV_VIDEOS[0]);
    setIsCctvModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Apple Header */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.fleetMonitoring}
            </h1>
            <span className="text-[10px] font-semibold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 px-2.5 py-0.5 rounded-full font-mono">
              Edge AI Telemetry Active
            </span>
          </div>
          <p className="text-xs text-[#86868b] mt-1">
            Real-time GIS live bus map, onboard CCTV video streams, and spatial scan coverage across municipal transit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenCctv(DATASET_CCTV_VIDEOS[0])}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">videocam</span>
            <span>Watch Dataset CCTV Streams</span>
          </button>

          <div className="glass-card px-4 py-2 text-xs font-mono text-slate-900 dark:text-white flex items-center gap-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
            <span>48/48 Transit Nodes Active</span>
          </div>
        </div>
      </section>

      {/* Top Split: Live GIS Leaflet Map & System Alerts with CCTV Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive OpenStreetMap Leaflet Canvas */}
        <div className="lg:col-span-7 glass-card overflow-hidden flex flex-col h-[420px] relative">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between z-10 bg-white/40 dark:bg-white/[0.02]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-[16px] text-[#0071E3]">satellite_alt</span>
              Live Transit Fleet GIS Map
            </span>
            <span className="text-[10px] font-mono text-[#86868b]">OpenStreetMap Engine • 10 Hz Telemetry</span>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <OpenStreetMapViewer
              language={language}
              tickets={INITIAL_DEFECTS}
              height="100%"
              showControls={true}
            />
          </div>
        </div>

        {/* System Alerts & CCTV Clips Panel */}
        <div className="lg:col-span-5 glass-card overflow-hidden flex flex-col h-[420px]">
          <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-[16px] text-[#FF3B30]">error</span>
              {t.systemAlerts} ({alerts.length})
            </span>
            <span className="text-[10px] bg-[#FF3B30]/10 text-[#FF3B30] font-bold px-2 py-0.5 rounded-full font-mono">
              CCTV Dataset Integrated
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] flex items-start gap-3 hover:border-[#0071E3]/30 transition-all group"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.type === 'critical'
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                      : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{alert.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{alert.title}</h4>
                    <span className="text-[10px] text-[#86868b] font-mono shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-[#86868b] mt-0.5 line-clamp-2">{alert.description}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
                    <span className="text-[10px] font-mono text-slate-500">Bus: DTC-BUS-402</span>
                    <button
                      type="button"
                      onClick={() => handleOpenCctv(DATASET_CCTV_VIDEOS[idx % DATASET_CCTV_VIDEOS.length])}
                      className="px-2.5 py-1 bg-[#0071E3]/10 hover:bg-[#0071E3] text-[#0071E3] hover:text-white rounded-full text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">videocam</span>
                      <span>Play CCTV Footage</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Device Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Transit AI Nodes Inventory</h3>
          <span className="text-xs text-[#86868b] font-mono">48 Connected Units</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-[#86868b] uppercase text-[10px] font-mono">
                <th className="py-3 pr-2">Bus Identifier</th>
                <th className="py-3 px-2">Assigned Route</th>
                <th className="py-3 px-2">Edge Camera</th>
                <th className="py-3 px-2">GPS Signal</th>
                <th className="py-3 px-2">Km Scanned</th>
                <th className="py-3 px-2">Depot</th>
                <th className="py-3 pl-2 text-right">CCTV & Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {fleetList.map((bus, idx) => (
                <tr key={bus.busId} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-2 font-mono font-bold text-[#0071E3]">{bus.busId}</td>
                  <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{bus.route}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                        bus.cameraStatus === 'Online'
                          ? 'bg-[#34C759]/10 text-[#34C759]'
                          : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                      }`}
                    >
                      {bus.cameraStatus}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[#86868b] font-mono">{bus.gpsSignal}</td>
                  <td className="py-3 px-2 font-mono text-slate-900 dark:text-white">{bus.kmScanned} km</td>
                  <td className="py-3 px-2 text-[#86868b]">{bus.depot}</td>
                  <td className="py-3 pl-2 text-right flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCctv(DATASET_CCTV_VIDEOS[idx % DATASET_CCTV_VIDEOS.length])}
                      className="px-2.5 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">videocam</span>
                      CCTV
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePingBus(bus.busId)}
                      className="btn-apple-secondary px-3 py-1 text-[11px] font-semibold cursor-pointer"
                    >
                      Ping Node
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset CCTV Footage Modal */}
      <CctvFootageModal
        isOpen={isCctvModalOpen}
        onClose={() => setIsCctvModalOpen(false)}
        language={language}
        item={activeCctvItem}
      />
    </div>
  );
};
