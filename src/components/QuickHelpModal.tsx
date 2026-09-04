import React from 'react';
import { Language } from '../types';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenNewTicket?: () => void;
  onNavigate?: (view: any) => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenNewTicket,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-black/10 dark:border-white/15 flex flex-col">
        {/* Apple Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">help</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {language === 'hi' ? 'त्वरित मार्गदर्शिका एवं उपयोग सहायता' : 'Quick Guide & Architecture'}
              </h2>
              <p className="text-[11px] text-[#86868b]">
                {language === 'hi'
                  ? 'नगर दृष्टि प्लेटफ़ॉर्म को सरलता से समझें'
                  : 'How Nagar Drishti automatically operates 24x7'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#86868b] hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-800 dark:text-slate-200 custom-scrollbar">
          {/* 1. What is Nagar Drishti */}
          <div className="bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0071E3] text-2xl shrink-0 mt-0.5">
                psychology
              </span>
              <div>
                <h3 className="font-bold text-[#0071E3] text-sm mb-1">
                  {language === 'hi' ? 'नगर दृष्टि क्या है?' : 'What is Nagar Drishti?'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? 'नगर दृष्टि एक स्वचालित शहरी बुद्धिमत्ता प्रणाली है। शहर की सरकारी बसों पर लगे AI कैमरे और नागरिकों की रिपोर्ट सीधे गड्ढों और नागरिक समस्याओं को पहचानकर स्वचालित वर्क ऑर्डर बनाते हैं।'
                    : 'Nagar Drishti is an automated civic intelligence platform. AI cameras mounted on city transport buses continuously detect road defects (potholes, garbage, broken streetlights) and automatically route repair work orders to the right municipal crew.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Three Simple Steps */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#86868b] mb-3 font-mono">
              {language === 'hi' ? 'सरल 3-चरणीय कार्यप्रवाह' : 'The Simple 3-Step Workflow'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs mb-2">
                    1
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">AI Detection</h5>
                  <p className="text-[11px] text-[#86868b] leading-snug">
                    Buses scan roads in real time and categorize severity (Critical, High, Medium).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs mb-2">
                    2
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">Crew Dispatch</h5>
                  <p className="text-[11px] text-[#86868b] leading-snug">
                    Click "Create Work Order" or "Dispatch" to assign the nearest repair team.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-6 h-6 rounded-full bg-[#34C759] text-white flex items-center justify-center font-bold text-xs mb-2">
                    3
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">Verification</h5>
                  <p className="text-[11px] text-[#86868b] leading-snug">
                    Repair photos are uploaded and subsequent bus passes confirm the road is fixed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Severity & SLA guide */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#86868b] mb-3 font-mono">
              {language === 'hi' ? 'प्राथमिकता स्तर एवं समय सीमा (SLA)' : 'Priority Levels & Resolution SLA'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl">
                <span className="inline-block px-2 py-0.5 bg-[#FF3B30] text-white font-bold text-[10px] rounded-full mb-1 font-mono">
                  CRITICAL
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">1 Hour SLA</p>
                <p className="text-[10.5px] text-[#86868b] mt-0.5">Deep potholes, live wires</p>
              </div>

              <div className="p-3 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-2xl">
                <span className="inline-block px-2 py-0.5 bg-[#FF9F0A] text-white font-bold text-[10px] rounded-full mb-1 font-mono">
                  HIGH
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">4 Hours SLA</p>
                <p className="text-[10.5px] text-[#86868b] mt-0.5">Severe cracks & debris</p>
              </div>

              <div className="p-3 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-2xl">
                <span className="inline-block px-2 py-0.5 bg-[#0071E3] text-white font-bold text-[10px] rounded-full mb-1 font-mono">
                  MEDIUM
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">24 Hours SLA</p>
                <p className="text-[10.5px] text-[#86868b] mt-0.5">Streetlights, overflowing bins</p>
              </div>

              <div className="p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl">
                <span className="inline-block px-2 py-0.5 bg-[#86868b] text-white font-bold text-[10px] rounded-full mb-1 font-mono">
                  LOW
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">48 Hours SLA</p>
                <p className="text-[10.5px] text-[#86868b] mt-0.5">Scheduled maintenance</p>
              </div>
            </div>
          </div>

          {/* 4. Quick Actions */}
          <div className="border-t border-black/5 dark:border-white/10 pt-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#86868b] mb-3 font-mono">
              {language === 'hi' ? 'त्वरित कार्य' : 'Instant Shortcuts'}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenNewTicket) onOpenNewTicket();
                }}
                className="btn-apple-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Report Road Defect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('live-map');
                }}
                className="btn-apple-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0071E3]">map</span>
                <span>Open Live Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('tickets');
                }}
                className="btn-apple-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0071E3]">assignment</span>
                <span>Manage Work Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/40 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <p className="text-xs text-[#86868b]">
            Need assistance? Dial: <strong className="text-[#0071E3]">1800-300-1947</strong>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn-apple-primary px-5 py-2 text-xs font-semibold rounded-full cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
