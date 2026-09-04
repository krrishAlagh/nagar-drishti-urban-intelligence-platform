import React, { useState, useMemo } from 'react';
import { Language, ActiveView, UIDAIStylePortalSection } from '../types';
import { UIDAI_PORTAL_SECTIONS, TRANSLATIONS } from '../data/mockData';

interface ServicesDirectoryViewProps {
  language: Language;
  onNavigate: (view: ActiveView, filterParam?: string) => void;
  onOpenNewTicketModal?: () => void;
}

export const ServicesDirectoryView: React.FC<ServicesDirectoryViewProps> = ({
  language,
  onNavigate,
  onOpenNewTicketModal
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');

  const filteredSections = useMemo(() => {
    return UIDAI_PORTAL_SECTIONS.map((sec) => {
      const matchesSection =
        selectedSectionId === 'all' || sec.id === selectedSectionId;
      if (!matchesSection) return null;

      const filteredItems = sec.items.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.titleHi.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.descHi.toLowerCase().includes(q) ||
          item.descEn.toLowerCase().includes(q) ||
          item.subCategory.toLowerCase().includes(q)
        );
      });

      if (filteredItems.length === 0) return null;

      return {
        ...sec,
        items: filteredItems
      };
    }).filter(Boolean) as UIDAIStylePortalSection[];
  }, [searchQuery, selectedSectionId]);

  const handleItemClick = (item: UIDAIStylePortalSection['items'][0], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (item.actionType === 'modal' && onOpenNewTicketModal) {
      onOpenNewTicketModal();
    } else {
      onNavigate(item.targetView, item.filterKey);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Top Apple Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/90 via-white/70 to-slate-50/50 dark:from-[#1d1d1f]/90 dark:via-[#161617]/80 dark:to-black/90 p-8 sm:p-10 border border-black/5 dark:border-white/10 shadow-lg">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#0071E3]/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px]">
                account_tree
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-[#0071E3] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Service Directory
                </span>
                <span className="text-xs text-[#86868b]">
                  {language === 'hi'
                    ? 'राष्ट्रीय शहरी सेवा पोर्टल • 6 प्रमुख श्रेणियां'
                    : 'National Urban Service Portal • 6 Primary Categories'}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'hi'
                  ? 'नागरिक सेवा श्रेणियां एवं डिजिटल कमान निर्देशिका'
                  : 'Civic Service Categories & Command Directory'}
              </h1>
              <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-2xl leading-relaxed">
                {language === 'hi'
                  ? 'सड़क दोष, स्ट्रीटलाइट, सीवरेज, बस सुरक्षा, दुर्घटना ब्लैकस्पॉट और अंतर-विभागीय समन्वय की सभी सेवाएं एक ही स्थान पर।'
                  : 'Access automated defect triage, public transit safety, blackspot mitigation, and cross-agency workflows.'}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 glass-card px-5 py-3 rounded-2xl text-xs shrink-0">
            <div className="text-center border-r border-black/5 dark:border-white/10 pr-4">
              <div className="text-xl font-bold text-[#0071E3] font-mono">6</div>
              <div className="text-[10px] text-[#86868b] uppercase font-mono">
                {language === 'hi' ? 'श्रेणियां' : 'Portals'}
              </div>
            </div>
            <div className="text-center border-r border-black/5 dark:border-white/10 pr-4">
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">16+</div>
              <div className="text-[10px] text-[#86868b] uppercase font-mono">
                {language === 'hi' ? 'सेवाएं' : 'Services'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#34C759] font-mono">24x7</div>
              <div className="text-[10px] text-[#86868b] uppercase font-mono">
                {language === 'hi' ? 'एआई सक्रिय' : 'AI Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'सेवा का नाम, विभाग या दोष प्रकार खोजें (उदा. गड्ढे, स्ट्रीटलाइट, बस सुरक्षा, ब्लैकस्पॉट)...'
                  : 'Search by service name, defect category, or department...'
              }
              className="w-full pl-10 pr-8 py-2.5 bg-black/5 dark:bg-white/10 focus:bg-white dark:focus:bg-[#1d1d1f] text-slate-900 dark:text-white placeholder-[#86868b] text-xs sm:text-sm rounded-full border border-transparent focus:border-[#0071E3] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto shrink-0 py-0.5">
            <button
              type="button"
              onClick={() => setSelectedSectionId('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedSectionId === 'all'
                  ? 'bg-[#0071E3] text-white shadow-2xs'
                  : 'bg-black/5 dark:bg-white/10 text-[#86868b] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'hi' ? 'सभी (All)' : 'All Portals'}
            </button>
            {UIDAI_PORTAL_SECTIONS.map((sec) => (
              <button
                type="button"
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedSectionId === sec.id
                    ? 'bg-[#0071E3] text-white shadow-2xs'
                    : 'bg-black/5 dark:bg-white/10 text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{sec.icon}</span>
                <span>{language === 'hi' ? sec.headingHi.split(' ')[0] : sec.headingEn.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid: 6 Categorized Civic Service Portals */}
      <div className="flex flex-col gap-8">
        {filteredSections.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#86868b] mb-2">
              search_off
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No matching services found'}
            </h3>
            <p className="text-xs text-[#86868b] mt-1">
              {language === 'hi'
                ? 'कृपया अन्य खोज शब्द का प्रयास करें अथवा फ़िल्टर रीसेट करें।'
                : 'Try adjusting your search term or clear the active category filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSectionId('all');
              }}
              className="mt-4 btn-apple-secondary text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div
              key={section.id}
              className="glass-card p-6 sm:p-8 flex flex-col gap-6"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">
                      {section.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {language === 'hi' ? section.headingHi : section.headingEn}
                      </h2>
                      <span className="text-[11px] font-semibold bg-black/5 dark:bg-white/10 text-[#86868b] px-2 py-0.5 rounded-full font-mono">
                        {section.items.length} {language === 'hi' ? 'सेवाएं' : 'Services'}
                      </span>
                    </div>
                    <p className="text-xs text-[#86868b] mt-0.5">
                      {language === 'hi' ? section.subheadingHi : section.subheadingEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={(e) => handleItemClick(section.items[0], e)}
                    className="btn-apple-secondary text-xs font-semibold px-3.5 py-1.5 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{language === 'hi' ? 'त्वरित एक्सेस' : 'Quick Access'}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Service Cards Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => handleItemClick(item, e)}
                    className="p-5 rounded-2xl border border-black/5 dark:border-white/10 hover:border-[#0071E3]/40 bg-white/50 dark:bg-white/[0.02] hover:bg-white/80 dark:hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] group-hover:bg-[#0071E3] group-hover:text-white transition-all flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-[#86868b] px-2 py-0.5 rounded-full font-mono">
                          {item.subCategory}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0071E3] transition-colors leading-snug">
                        {language === 'hi' ? item.titleHi : item.titleEn}
                      </h3>
                      <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed line-clamp-2">
                        {language === 'hi' ? item.descHi : item.descEn}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-[#0071E3]">
                      <span>{language === 'hi' ? 'सेवा खोलें' : 'Open Service'}</span>
                      <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
