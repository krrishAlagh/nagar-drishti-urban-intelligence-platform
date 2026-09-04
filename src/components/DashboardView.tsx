import React, { useState } from 'react';
import { Language, ActiveView, DefectItem, LiveFeedDetection } from '../types';
import { ASSETS, LIVE_FEED_ITEMS, TRANSLATIONS, UIDAI_PORTAL_SECTIONS, INITIAL_DEFECTS } from '../data/mockData';
import { LiveDetectionFeed } from './LiveDetectionFeed';
import { OpenStreetMapViewer } from './OpenStreetMapViewer';
import { BelShowcaseSection } from './BelShowcaseSection';
import { ProjectImageSlider } from './ProjectImageSlider';

interface DashboardViewProps {
  language: Language;
  onSelectTicket: (ticketId: string) => void;
  onNavigateToMap: () => void;
  onNavigate?: (view: ActiveView, filterParam?: string) => void;
  onOpenNewTicket?: () => void;
  onOpenAiCopilot?: () => void;
  tickets?: DefectItem[];
  liveFeed?: LiveFeedDetection[];
  analyticsKpi?: {
    totalIngestedDetections: number;
    activeFleetBuses: number;
    totalFleetBuses: number;
    resolvedTodayCount: number;
    criticalPotholesCount: number;
    avgAiConfidence: number;
    avgEdgeLatencyMs: number;
  };
  isConnected?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  onSelectTicket,
  onNavigateToMap,
  onNavigate,
  onOpenNewTicket,
  onOpenAiCopilot,
  tickets = INITIAL_DEFECTS,
  liveFeed = LIVE_FEED_ITEMS,
  analyticsKpi,
  isConnected = true
}) => {
  const t = TRANSLATIONS[language];
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [selectedWard, setSelectedWard] = useState('All Wards');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Critical items needing instant triage from live tickets
  const criticalDefects = tickets.filter((d) => d.severity === 'CRITICAL');
  const activeTicketsCount = tickets.filter((d) => d.status !== 'RESOLVED' && d.status !== 'VERIFIED_CLOSED').length;
  const resolvedCount = tickets.filter((d) => d.status === 'RESOLVED' || d.status === 'VERIFIED_CLOSED').length;


  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* 1. Apple Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/90 via-white/70 to-slate-50/50 dark:from-[#1d1d1f]/90 dark:via-[#161617]/80 dark:to-black/90 p-8 sm:p-12 border border-black/5 dark:border-white/10 shadow-lg">
        {/* Subtle Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#0071E3]/15 dark:bg-[#0071E3]/25 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Apple Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 mb-5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
            <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              {language === 'hi'
                ? 'राष्ट्रीय नगरीय दृष्टि • 48 डीटीसी बसें एआई सक्रिय'
                : 'National Urban Intelligence • 48 DTC AI Transit Nodes'}
            </span>
          </div>

          {/* Apple Hero Typography Headline */}
          <h1 className="apple-headline text-slate-900 dark:text-white tracking-tight">
            {language === 'hi' ? (
              <>स्मार्ट सड़क दृष्टि। <span className="apple-gradient-text">नागरिक सुरक्षा।</span></>
            ) : (
              <>Urban Intelligence. <span className="apple-gradient-text">Pure Precision.</span></>
            )}
          </h1>

          <p className="apple-subheadline text-[#86868b] mt-3.5 max-w-2xl text-center">
            {language === 'hi'
              ? 'डीटीसी बसों के AI कैमरों द्वारा सड़क गड्ढे, स्ट्रीटलाइट दोष और नागरिक शिकायतों का स्वतः संज्ञान एवं त्वरित निवारण।'
              : 'Automated civic defect triage, live GPS transit telemetry, accident blackspot mitigation, and instant multi-agency dispatch.'}
          </p>

          {/* Apple Hero Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToMap();
              }}
              className="btn-apple-primary text-xs font-semibold px-5 py-2.5 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">explore</span>
              <span>{language === 'hi' ? 'लाइव जीआईएस मैप' : 'Explore Live Map'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigate && onNavigate('services-directory');
              }}
              className="btn-apple-secondary text-xs font-semibold px-5 py-2.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">account_tree</span>
              <span>{language === 'hi' ? 'सेवा निर्देशिका' : 'Service Directory'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigate && onNavigate('safety-complaints');
              }}
              className="btn-apple-secondary text-xs font-semibold px-5 py-2.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">videocam</span>
              <span>{language === 'hi' ? 'बस सुरक्षा SOS' : 'Cabin Safety SOS'}</span>
            </button>

            {onOpenAiCopilot && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAiCopilot();
                }}
                className="px-5 py-2.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#0071E3] to-[#40A9FF] text-white flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-95 active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined text-[17px] animate-pulse">auto_awesome</span>
                <span>{language === 'hi' ? '✨ नगर AI कॉपायलट' : '✨ Ask Nagar AI'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenNewTicket && onOpenNewTicket();
              }}
              className="btn-apple-saffron text-xs font-bold px-5 py-2.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              <span>{language === 'hi' ? '+ नया टिकट' : '+ New Work Order'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Custom Project Thematic Image Slider (1270.4 x 423.74) */}
      <ProjectImageSlider
        language={language}
        onNavigate={onNavigate}
        onOpenAiCopilot={onOpenAiCopilot}
      />

      {/* 3. BEL India Style Strategic Capabilities Image Gallery */}
      <BelShowcaseSection
        language={language}
        onNavigate={onNavigate}
        onOpenNewTicket={onOpenNewTicket}
        onOpenAiCopilot={onOpenAiCopilot}
      />

      {/* 2. Apple Bento 4-KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active Defects */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                  {language === 'hi' ? 'सक्रिय दोष टिकट' : 'Active Defect Tickets'}
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                {activeTicketsCount > 0 ? activeTicketsCount.toLocaleString() : (1428).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-black/5 dark:border-white/10">
            <span className="text-[#FF3B30] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +{tickets.length} live
            </span>
            <span className="text-[#86868b] text-[11px] font-mono">{criticalDefects.length} CRITICAL</span>
          </div>
        </div>

        {/* KPI 2: Resolved Today */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                {language === 'hi' ? 'आज निस्तारित' : 'Resolved Today'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                {analyticsKpi?.resolvedTodayCount ? (analyticsKpi.resolvedTodayCount + resolvedCount).toLocaleString() : (342 + resolvedCount).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-black/5 dark:border-white/10">
            <span className="text-[#34C759] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span> 89.2% SLA
            </span>
            <span className="text-[#86868b] text-[11px] font-mono">Avg: 2.8h</span>
          </div>
        </div>

        {/* KPI 3: Fleet AI Scanned */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                {language === 'hi' ? 'स्कैन किए गए किमी' : 'Total AI Ingested Detections'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                {analyticsKpi?.totalIngestedDetections ? analyticsKpi.totalIngestedDetections.toLocaleString() : (5843).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-black/5 dark:border-white/10">
            <span className="text-[#0071E3] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">videocam</span> {analyticsKpi?.activeFleetBuses || 48} Buses Live
            </span>
            <span className="text-[#86868b] text-[11px] font-mono">10Hz Telemetry</span>
          </div>
        </div>

        {/* KPI 4: Blackspots Monitored */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider font-mono">
                {language === 'hi' ? 'दुर्घटना ब्लैकस्पॉट' : 'Blackspots Tracked'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                24 <span className="text-sm font-medium text-[#86868b]">Corridors</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">car_crash</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-black/5 dark:border-white/10">
            <span className="text-[#FF9F0A] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span> 18 Remedial
            </span>
            <span className="text-[#86868b] text-[11px] font-mono">NHAI / PWD</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Split Workspace: Live Radar GIS & AI Dashcam Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Interactive GIS Radar & Hotspot Map Widget */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-card p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0071E3]">
                    radar
                  </span>
                  {language === 'hi' ? 'लाइव जीआईएस सड़क दोष राडार' : 'Live GIS Road Defect Radar'}
                </h2>
                <p className="text-xs text-[#86868b] mt-0.5">
                  {language === 'hi'
                    ? 'जीपीएस निर्देशांक, बस नोड्स एवं हॉटस्पॉट का लाइव मानचित्र'
                    : 'Real-time geo-spatial cluster pins, violations and connected DTC buses'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="btn-apple-secondary text-xs font-semibold px-3.5 py-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{language === 'hi' ? 'विस्तृत मानचित्र' : 'Full GIS Map'}</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Embedded Live OpenStreetMap Display */}
            <div className="mt-4 relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 h-[420px] bg-slate-100 dark:bg-black shadow-inner">
              <OpenStreetMapViewer
                language={language}
                tickets={tickets}
                onSelectTicket={onSelectTicket}
                height="100%"
                showControls={true}
              />
            </div>
          </div>

          {/* Critical Triage Queue Panel */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'hi' ? 'अति-महत्वपूर्ण दोष कतार (CRITICAL SLA)' : 'Critical SLA Triage Queue'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('tickets')}
                className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{language === 'hi' ? 'सभी देखें' : 'View All Tickets'}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5">
              {criticalDefects.slice(0, 4).map((defect) => (
                <div
                  key={defect.id}
                  onClick={() => onSelectTicket(defect.ticketNumber)}
                  className="p-3.5 rounded-2xl border border-black/5 dark:border-white/10 hover:border-[#FF3B30]/40 bg-white/50 dark:bg-white/[0.03] hover:bg-[#FF3B30]/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#FF3B30]">
                        {defect.ticketNumber}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-0.5 rounded-full font-mono">
                        {defect.category}
                      </span>
                      <span className="text-xs text-[#86868b]">• {defect.ward}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {defect.title}
                    </p>
                    <p className="text-[11px] text-[#86868b] truncate">
                      {defect.locationName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#FF3B30] font-mono block">
                      {defect.slaRemaining}
                    </span>
                    <span className="text-[10px] text-[#86868b] uppercase font-semibold">
                      SLA Left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live AI Dashcam Edge Detection Feed */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <LiveDetectionFeed language={language} items={liveFeed} onSelectTicket={onSelectTicket} />
        </div>
      </section>


      {/* 4. Apple Bento Civic Service Portal Matrix */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                grid_view
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === 'hi'
                  ? 'नागरिक सेवाएं एवं निवारण संवर्ग निर्देशिका'
                  : 'Civic Service Portals & Category Matrix'}
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                {language === 'hi'
                  ? 'शहरी बुनियादी ढांचे के स्वचालित निरीक्षण और नागरिक सुरक्षा सेवाएं'
                  : 'Structured civic workflows, smart transit safety, and accident mitigation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('services-directory')}
            className="btn-apple-secondary text-xs font-semibold px-4 py-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <span>{language === 'hi' ? 'समस्त 16 सेवाएं देखें' : 'View Full Catalog'}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {UIDAI_PORTAL_SECTIONS.map((sec) => (
            <div
              key={sec.id}
              onClick={() => onNavigate && onNavigate(sec.items[0].targetView, sec.items[0].filterKey)}
              className="glass-card p-5 transition-all cursor-pointer flex flex-col justify-between group hover:border-[#0071E3]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] group-hover:bg-[#0071E3] group-hover:text-white transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                      {sec.icon}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-[#86868b] px-2.5 py-0.5 rounded-full font-mono">
                    {sec.items.length} {language === 'hi' ? 'सेवाएं' : 'Services'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors">
                  {language === 'hi' ? sec.headingHi : sec.headingEn}
                </h3>
                <p className="text-xs text-[#86868b] mt-1 leading-relaxed line-clamp-2">
                  {language === 'hi' ? sec.subheadingHi : sec.subheadingEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-[#0071E3]">
                <span>{language === 'hi' ? 'पोर्टल एक्सेस करें' : 'Access Portal'}</span>
                <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
