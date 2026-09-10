import React, { useState } from 'react';
import { LiveFeedDetection, Language } from '../types';
import { LIVE_FEED_ITEMS, TRANSLATIONS } from '../data/mockData';
import { CctvFootageModal, DATASET_CCTV_VIDEOS, CctvFootageItem } from './CctvFootageModal';

interface LiveDetectionFeedProps {
  language: Language;
  items?: LiveFeedDetection[];
  onSelectTicket?: (ticketId: string) => void;
  className?: string;
}

export const LiveDetectionFeed: React.FC<LiveDetectionFeedProps> = ({
  language,
  items = LIVE_FEED_ITEMS,
  onSelectTicket,
  className = ''
}) => {
  const t = TRANSLATIONS[language];
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isCctvOpen, setIsCctvOpen] = useState(false);
  const [activeCctv, setActiveCctv] = useState<CctvFootageItem | null>(null);

  const categories = [
    { id: 'ALL', label: language === 'hi' ? 'सभी' : 'All' },
    { id: 'Roads', label: language === 'hi' ? 'सड़कें' : 'Roads' },
    { id: 'Sanitation', label: language === 'hi' ? 'सफाई' : 'Sanitation' },
    { id: 'Streetlights', label: language === 'hi' ? 'लाइट्स' : 'Lights' },
    { id: 'Drainage', label: language === 'hi' ? 'जल निकासी' : 'Drainage' }
  ];

  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'ALL' && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleOpenCctv = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCctv(DATASET_CCTV_VIDEOS[idx % DATASET_CCTV_VIDEOS.length]);
    setIsCctvOpen(true);
  };

  return (
    <div className={`glass-card flex flex-col overflow-hidden ${className}`}>
      {/* Feed Header */}
      <div className="border-b border-black/5 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between shrink-0 bg-white/40 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
              <span>{t.liveFeed}</span>
              <span className="text-[10px] font-mono bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full font-semibold">
                48 Nodes
              </span>
            </h3>
            <p className="text-[11px] text-[#86868b] mt-0.5">
              {language === 'hi' ? 'डीटीसी बसों द्वारा स्वतः लाइव पहचान' : 'Live dashcam Edge-AI streams'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => handleOpenCctv(0, e)}
          className="text-[11px] font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px] animate-pulse">videocam</span>
          <span>CCTV Clips</span>
        </button>
      </div>

      {/* Category Filters Strip */}
      <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-[#0071E3] text-white shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Detection Cards List */}
      <div className="overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3 max-h-[480px]">
        {filteredItems.map((item, idx) => {
          const isCritical = item.severity === 'error';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              onClick={() => item.ticketId && onSelectTicket && onSelectTicket(item.ticketId)}
              className="p-3.5 rounded-2xl border border-black/5 dark:border-white/10 hover:border-[#0071E3]/40 bg-white/60 dark:bg-white/[0.02] flex items-center gap-3.5 cursor-pointer transition-all group shadow-2xs hover:shadow-md"
            >
              {/* Photo Thumbnail with Bounding Box Overlay */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/10">
                {item.hasImage ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#86868b]">
                    <span className="material-symbols-outlined text-[20px]">image_not_supported</span>
                  </div>
                )}
                {item.bbox && (
                  <div className="absolute inset-2 border border-[#FF3B30] bg-[#FF3B30]/15 rounded pointer-events-none"></div>
                )}
                {item.id === 'feed-1' && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-red-400 rounded-full w-4 h-4 flex items-center justify-center pointer-events-none shadow">
                    <span className="material-symbols-outlined text-[11px]">play_arrow</span>
                  </div>
                )}
              </div>

              {/* Details & Location */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0071E3] truncate">
                    {item.title}
                  </h4>

                  {/* Status Tag */}
                  <span
                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                      isCritical
                        ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                        : isWarning
                        ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                        : 'bg-[#0071E3]/10 text-[#0071E3]'
                    }`}
                  >
                    {isCritical
                      ? language === 'hi' ? 'गंभीर' : 'Critical'
                      : isWarning
                      ? language === 'hi' ? 'चेतावनी' : 'Medium'
                      : language === 'hi' ? 'सामान्य' : 'Normal'}
                  </span>
                </div>

                {/* Location & Bus ID */}
                <div className="flex items-center gap-1 text-xs text-[#86868b] truncate mt-1">
                  <span className="material-symbols-outlined text-[14px] text-[#0071E3] shrink-0">
                    location_on
                  </span>
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Footer Timestamp, Confidence & CCTV Action */}
                <div className="flex items-center justify-between text-[11px] text-[#86868b] mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">directions_bus</span>
                    <span>{item.busNode || 'BUS-402'}</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenCctv(idx, e)}
                      className="text-[10px] text-red-500 hover:text-red-600 font-sans font-bold underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[12px]">play_circle</span>
                      <span>CCTV</span>
                    </button>
                    <span className="text-[#34C759] font-semibold">{item.confidence}% AI</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CCTV Modal */}
      <CctvFootageModal
        isOpen={isCctvOpen}
        onClose={() => setIsCctvOpen(false)}
        language={language}
        item={activeCctv}
      />
    </div>
  );
};
