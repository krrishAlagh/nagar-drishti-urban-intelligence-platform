import React, { useState } from 'react';
import { Language, DefectItem, LiveFeedDetection } from '../types';
import { ACCIDENT_BLACKSPOTS, LIVE_FEED_ITEMS, TRANSLATIONS } from '../data/mockData';
import { OpenStreetMapViewer } from './OpenStreetMapViewer';
import { LiveDetectionFeed } from './LiveDetectionFeed';

interface LiveMapViewProps {
  language: Language;
  tickets: DefectItem[];
  liveFeed?: LiveFeedDetection[];
  onSelectTicket: (ticketId: string) => void;
  onOpenWorkOrder: (ticketId: string) => void;
  onNavigateToAccidents?: () => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  language,
  tickets,
  liveFeed = LIVE_FEED_ITEMS,
  onSelectTicket,
  onOpenWorkOrder,
  onNavigateToAccidents
}) => {
  const t = TRANSLATIONS[language];
  const [showLiveFeedDrawer, setShowLiveFeedDrawer] = useState<boolean>(false);
  const [activeDefectId, setActiveDefectId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F7] dark:bg-black relative overflow-hidden">
      {/* Top Header Floating Apple Glass Pill */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto z-30 pointer-events-none flex flex-col sm:flex-row items-start gap-3">
        <div className="pointer-events-auto glass-panel px-4 py-2 rounded-full shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
            </span>
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {language === 'hi' ? 'ओपनस्ट्रीटमैप लाइव राडार' : 'Apple Maps & OSM Live Radar'}
              </h2>
              <span className="text-[10px] text-[#86868b]">
                {language === 'hi' ? '48 बसें • गड्ढे • उल्लंघन • ब्लैकस्पॉट' : '48 Transit Nodes • Real-Time AI Streams'}
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10"></div>

          {/* Toggle Live Feed Overlay */}
          <button
            type="button"
            onClick={() => setShowLiveFeedDrawer((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showLiveFeedDrawer
                ? 'bg-[#0071E3] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">videocam</span>
            <span>{language === 'hi' ? 'लाइव AI फीड' : 'Live AI Feed'}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Height OpenStreetMap Canvas */}
      <div className="flex-1 w-full h-full relative">
        <OpenStreetMapViewer
          language={language}
          tickets={tickets}
          liveFeed={liveFeed}
          blackspots={ACCIDENT_BLACKSPOTS}
          onSelectTicket={onSelectTicket}
          height="100%"
          showControls={true}
          activeTicketId={activeDefectId}
        />
      </div>

      {/* Slide-out Live Feed Drawer with Apple Frosted Card */}
      {showLiveFeedDrawer && (
        <div className="absolute top-18 right-4 sm:right-6 z-40 w-full max-w-[380px] max-h-[calc(100vh-160px)] flex flex-col animate-in fade-in slide-in-from-right-4 duration-200 shadow-2xl">
          <div className="flex justify-end mb-1.5">
            <button
              type="button"
              onClick={() => setShowLiveFeedDrawer(false)}
              className="glass-panel text-[#86868b] hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>{language === 'hi' ? 'बंद करें' : 'Close'}</span>
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
          <LiveDetectionFeed
            language={language}
            items={liveFeed}
            onSelectTicket={onSelectTicket}
            className="h-[520px] max-h-[75vh]"
          />
        </div>
      )}
    </div>
  );
};
