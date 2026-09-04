import React, { useState } from 'react';
import { AccidentZoneBlackspot, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface AccidentBlackspotAnalyticsViewProps {
  language: Language;
  blackspots: AccidentZoneBlackspot[];
  onSelectBlackspotOnMap?: (spotCode: string) => void;
}

type PeriodFilter = '30d' | '6m' | '1y';

export const AccidentBlackspotAnalyticsView: React.FC<AccidentBlackspotAnalyticsViewProps> = ({
  language,
  blackspots,
  onSelectBlackspotOnMap
}) => {
  const t = TRANSLATIONS[language];
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('6m');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedSpot, setSelectedSpot] = useState<AccidentZoneBlackspot | null>(blackspots[0] || null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const filteredSpots = blackspots.filter((spot) => {
    if (selectedRisk !== 'ALL' && spot.riskLevel !== selectedRisk) return false;
    return true;
  });

  const totalAccidentsPeriod = blackspots.reduce((acc, spot) => {
    if (selectedPeriod === '30d') return acc + spot.accidentsPast30Days;
    if (selectedPeriod === '6m') return acc + spot.accidentsPast6Months;
    return acc + spot.accidentsPast1Year;
  }, 0);

  const totalFatalities = blackspots.reduce((acc, spot) => acc + spot.fatalitiesCount, 0);
  const totalInjuries = blackspots.reduce((acc, spot) => acc + spot.injuriesCount, 0);
  const extremeRiskCount = blackspots.filter((s) => s.riskLevel === 'EXTREME_RISK').length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full pb-24">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 glass-card px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-[18px] text-[#34C759]">check_circle</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white">{feedbackToast}</span>
        </div>
      )}

      {/* Apple Header Showcase */}
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">crisis_alert</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.accidentBlackspots}
              </h1>
              <span className="text-[10px] font-semibold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 px-2.5 py-0.5 rounded-full font-mono">
                AI Vision + GIS Grounding
              </span>
            </div>
            <p className="text-xs text-[#86868b] mt-1">
              {language === 'hi'
                ? 'दुर्घटना संभावित ब्लैकस्पॉट, समय अनुसार हादसों का विश्लेषण व सुरक्षा उपाय'
                : 'Identified crash zones, collision frequencies, and corrective infrastructure safety actions'}
            </p>
          </div>
        </div>

        {/* Period Selector Tabs in Apple Glass */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setSelectedPeriod('30d')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedPeriod === '30d'
                ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? 'पिछले 30 दिन' : 'Past 30 Days'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriod('6m')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedPeriod === '6m'
                ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? 'पिछले 6 माह' : 'Past 6 Months'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriod('1y')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedPeriod === '1y'
                ? 'bg-white dark:bg-[#1d1d1f] text-[#0071E3] shadow-2xs'
                : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? '1 वर्ष का रिकॉर्ड' : 'Past 1 Year'}
          </button>
        </div>
      </section>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">
              {selectedPeriod === '30d' ? 'Accidents (30d)' : selectedPeriod === '6m' ? 'Accidents (6m)' : 'Accidents (1 Year)'}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#FF3B30] mt-1 font-mono">{totalAccidentsPeriod}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">car_crash</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">Fatalities</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#FF3B30] mt-1 font-mono">{totalFatalities}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">heart_broken</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">Injuries Logged</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#FF9F0A] mt-1 font-mono">{totalInjuries}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">healing</span>
          </span>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#86868b] font-mono uppercase tracking-wider">Extreme Risk Zones</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#0071E3] mt-1 font-mono">{extremeRiskCount}</p>
          </div>
          <span className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left Blackspots List | Right Selected Blackspot Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Corridor List */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedRisk('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedRisk === 'ALL'
                    ? 'bg-[#0071E3] text-white shadow-2xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Corridors ({blackspots.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedRisk('EXTREME_RISK')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedRisk === 'EXTREME_RISK'
                    ? 'bg-[#FF3B30] text-white shadow-2xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Extreme Risk ({extremeRiskCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedRisk('HIGH_RISK')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedRisk === 'HIGH_RISK'
                    ? 'bg-[#FF9F0A] text-white shadow-2xs'
                    : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                High Risk
              </button>
            </div>
          </div>

          {filteredSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            const isExtreme = spot.riskLevel === 'EXTREME_RISK';

            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`glass-card p-5 cursor-pointer transition-all flex flex-col gap-3 ${
                  isSelected ? 'border-[#0071E3] shadow-md' : 'hover:border-[#0071E3]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                        {spot.spotCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                          isExtreme
                            ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                            : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                        }`}
                      >
                        {spot.riskLevel.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#86868b]">• {spot.ward}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {spot.corridorName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-[#FF3B30] font-mono block">
                      {selectedPeriod === '30d' ? spot.accidentsPast30Days : selectedPeriod === '6m' ? spot.accidentsPast6Months : spot.accidentsPast1Year}
                    </span>
                    <span className="text-[10px] text-[#86868b] uppercase font-mono">Crashes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#86868b] pt-2 border-t border-black/5 dark:border-white/10">
                  <span>Danger Score: <strong className="text-slate-900 dark:text-white font-mono">{spot.dangerScore}/100</strong></span>
                  <span className="text-[#0071E3] font-semibold flex items-center gap-0.5">
                    <span>Inspect Details</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Corridor Inspection Card */}
        {selectedSpot && (
          <div className="lg:col-span-5 glass-card p-6 flex flex-col gap-5 sticky top-24">
            <div className="pb-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                  {selectedSpot.spotCode}
                </span>
                <span className="text-[10px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] px-2.5 py-0.5 rounded-full font-mono">
                  {selectedSpot.riskLevel.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {selectedSpot.corridorName}
              </h2>
              <p className="text-xs text-[#86868b] mt-1">{selectedSpot.description}</p>
            </div>

            {/* Crash Frequency Meters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-lg font-bold text-[#FF3B30] font-mono">{selectedSpot.accidentsPast30Days}</div>
                <div className="text-[10px] text-[#86868b] font-mono">30 Days</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-lg font-bold text-[#FF3B30] font-mono">{selectedSpot.accidentsPast6Months}</div>
                <div className="text-[10px] text-[#86868b] font-mono">6 Months</div>
              </div>
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <div className="text-lg font-bold text-[#FF3B30] font-mono">{selectedSpot.accidentsPast1Year}</div>
                <div className="text-[10px] text-[#86868b] font-mono">1 Year</div>
              </div>
            </div>

            {/* Recommended Corrective Engineering Action */}
            <div className="p-4 rounded-2xl bg-[#0071E3]/10 border border-[#0071E3]/20 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[#0071E3] font-semibold text-xs">
                <span className="material-symbols-outlined text-[18px]">engineering</span>
                <span>Corrective Safety Action:</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200">
                {selectedSpot.recommendedAction}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectBlackspotOnMap) onSelectBlackspotOnMap(selectedSpot.spotCode);
                }}
                className="btn-apple-primary flex-1 py-2.5 text-xs font-semibold cursor-pointer shadow-md"
              >
                Focus on Live GIS Map
              </button>
              <button
                type="button"
                onClick={() => showToast(`Work order triggered for ${selectedSpot.spotCode}`)}
                className="btn-apple-secondary px-4 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Dispatch Crew
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
