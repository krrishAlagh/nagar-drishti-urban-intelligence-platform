import React, { useState, useEffect } from 'react';
import { Language, ActiveView } from '../types';
import { ASSETS } from '../data/mockData';

interface BelShowcaseSectionProps {
  language: Language;
  onNavigate?: (view: ActiveView, filterParam?: string) => void;
  onOpenNewTicket?: () => void;
  onOpenAiCopilot?: () => void;
}

interface BannerSlide {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  badgeEn: string;
  badgeHi: string;
  tagline: string;
  imageUrl: string;
  targetView: ActiveView;
  metricLabelEn: string;
  metricLabelHi: string;
  metricValue: string;
}

interface StrategicDomain {
  id: string;
  titleEn: string;
  titleHi: string;
  categoryEn: string;
  categoryHi: string;
  descEn: string;
  descHi: string;
  imageUrl: string;
  icon: string;
  badge: string;
  targetView: ActiveView;
  specs: string[];
}

export const BelShowcaseSection: React.FC<BelShowcaseSectionProps> = ({
  language,
  onNavigate,
  onOpenNewTicket,
  onOpenAiCopilot
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // BEL-Style Flagship Banner Slides
  const bannerSlides: BannerSlide[] = [
    {
      id: 'slide-1',
      titleEn: 'Next-Gen Transit Edge AI & Road Surface Profiling',
      titleHi: 'अगली पीढ़ी का ट्रांजिट एज एआई एवं सड़क सतह प्रोफाइलिंग',
      subtitleEn: '48 DTC buses equipped with Jetson Orin Nano TensorRT vision pods performing continuous sub-centimeter pavement fatigue and pothole scans.',
      subtitleHi: '48 डीटीसी बसें जेटसन ओरिन नैनो टेंसरआरटी कैमरों से लैस, जो निरंतर सड़क गड्ढों और संरचनात्मक दोषों का सटीक स्कैन करती हैं।',
      badgeEn: 'Indigenous Smart City Core',
      badgeHi: 'स्वदेशी स्मार्ट सिटी कोर',
      tagline: 'Make in India • Atmanirbhar Bharat',
      imageUrl: '/assets/showcase/transit_ai_road_scan.jpg',
      targetView: 'fleet',
      metricLabelEn: 'Active Edge AI Nodes',
      metricLabelHi: 'सक्रिय एज एआई नोड्स',
      metricValue: '48 Buses Live'
    },
    {
      id: 'slide-2',
      titleEn: 'GIS Spatial Radar & Accident Blackspot Mitigation',
      titleHi: 'जीआईएस स्थानिक रडार एवं दुर्घटना प्रवण ब्लैकस्पॉट नियंत्रण',
      subtitleEn: 'Real-time multi-sensor geospatial modeling predicting collision zones, traffic bottlenecks, and remedial civil engineering works.',
      subtitleHi: 'रीयल-टाइम मल्टी-सेंसर भू-स्थानिक मॉडलिंग द्वारा टकराव क्षेत्रों, यातायात बाधाओं और सिविल इंजीनियरिंग सुधारों की पूर्व-पहचान।',
      badgeEn: 'Precision Safety Radar',
      badgeHi: 'सटीक सुरक्षा रडार',
      tagline: 'Mission Zero Fatalities • Urban Safety',
      imageUrl: '/assets/showcase/accident_blackspot_radar.jpg',
      targetView: 'accident-analytics',
      metricLabelEn: 'Blackspots Under Radar',
      metricLabelHi: 'निगरानी में ब्लैकस्पॉट',
      metricValue: '12 Monitored Corridors'
    },
    {
      id: 'slide-3',
      titleEn: 'Autonomous Inter-Agency Command & Work Order Matrix',
      titleHi: 'स्वायत्त अंतर-एजेंसी कमांड एवं कार्य आदेश मैट्रिक्स',
      subtitleEn: 'Synchronized municipal orchestration connecting PWD, Delhi Jal Board, Discoms, and Traffic Police under 1-hour critical SLA.',
      subtitleHi: 'पीडब्ल्यूडी, दिल्ली जल बोर्ड, डिस्कॉम और ट्रैफिक पुलिस को 1 घंटे के त्वरित एसएलए के तहत जोड़ने वाला एकीकृत प्लेटफॉर्म।',
      badgeEn: 'Unified Civic Command',
      badgeHi: 'एकीकृत नागरिक कमान',
      tagline: 'Multi-Agency Synchronization',
      imageUrl: '/assets/showcase/smart_city_war_room.jpg',
      targetView: 'multi-agency',
      metricLabelEn: 'SLA Compliance Rate',
      metricLabelHi: 'एसएलए अनुपालन दर',
      metricValue: '96.8% On-Time'
    }
  ];

  // BEL-Style Strategic Capabilities Grid (6 Domains)
  const strategicDomains: StrategicDomain[] = [
    {
      id: 'domain-edge',
      titleEn: 'Mobile Edge-AI Sensor Pods',
      titleHi: 'मोबाइल एज-एआई सेंसर पॉड्स',
      categoryEn: 'Embedded Computer Vision',
      categoryHi: 'एम्बेडेड कंप्यूटर विज़न',
      descEn: 'Onboard NVIDIA Jetson Orin Nano running YOLOv8-TensorRT segmentation for instant crater and road damage extraction @ 30+ FPS.',
      descHi: 'सड़क के गड्ढों और क्षति की रीयल-टाइम पहचान के लिए एनवीडिया जेटसन टेंसरआरटी संचालित एज सिस्टम।',
      imageUrl: '/assets/showcase/transit_ai_road_scan.jpg',
      icon: 'memory',
      badge: 'Edge Hardware',
      targetView: 'fleet',
      specs: ['YOLOv8 FP16 TensorRT', 'Sub-18ms Inference', '4G/5G MQTT Bandwidth Saver']
    },
    {
      id: 'domain-radar',
      titleEn: 'Accident Blackspots & LiDAR GIS',
      titleHi: 'दुर्घटना ब्लैकस्पॉट एवं लीडार जीआईएस',
      categoryEn: 'Geospatial Safety Analytics',
      categoryHi: 'भू-स्थानिक सुरक्षा विश्लेषण',
      descEn: 'Spatiotemporal collision risk mapping, historical crash pattern analysis, and automated median barrier structural warnings.',
      descHi: 'दुर्घटना संभावित क्षेत्रों की भू-स्थानिक मैपिंग और दुर्घटना रोकने के लिए स्वचालित चेतावनी प्रणाली।',
      imageUrl: '/assets/showcase/accident_blackspot_radar.jpg',
      icon: 'radar',
      badge: 'Safety GIS',
      targetView: 'accident-analytics',
      specs: ['Haversine DBSCAN Spatial AI', '10Hz Precision GPS', 'Fatality Hazard Heatmap']
    },
    {
      id: 'domain-repair',
      titleEn: 'Rapid Municipal Road Patcher',
      titleHi: 'तीव्र गति सड़क मरम्मत दस्ता',
      categoryEn: 'Automated Civil Engineering',
      categoryHi: 'स्वचालित सिविल इंजीनियरिंग',
      descEn: 'Instant work order dispatch to zonal PWD road engineering squads with automated bill of materials and vibratory roller leveling.',
      descHi: 'पीडब्ल्यूडी रोड इंजीनियरिंग दस्तों को तत्काल कार्य आदेश, सामग्री अनुमान और स्वचालित गड्ढा मरम्मत।',
      imageUrl: '/assets/showcase/rapid_road_repair_crew.jpg',
      icon: 'handyman',
      badge: 'Field Operations',
      targetView: 'tickets',
      specs: ['Jet Patcher Logistics', 'Automated Materials Bill', '1-Hour Critical SLA']
    },
    {
      id: 'domain-fleet',
      titleEn: 'Electric Transit Bus Depot',
      titleHi: 'इलेक्ट्रिक बस फ्लीट एवं डिपो',
      categoryEn: 'Clean Mobility Grid',
      categoryHi: 'स्वच्छ परिवहन ग्रिड',
      descEn: '24/7 telematics monitoring DTC electric fleet health, high-voltage battery states, route schedules, and sensor diagnostics.',
      descHi: 'डीटीसी इलेक्ट्रिक बसों के स्वास्थ्य, बैटरी स्थिति, मार्ग समय सारिणी और सेंसर डायग्नोस्टिक्स की 24/7 निगरानी।',
      imageUrl: '/assets/showcase/electric_bus_depot_ai.jpg',
      icon: 'electric_bolt',
      badge: 'Fleet Depot',
      targetView: 'fleet',
      specs: ['99.8% Fleet Uptime', 'Telemetry Gateway', 'Fast Charging Telematics']
    },
    {
      id: 'domain-copilot',
      titleEn: 'Smart City Command Center',
      titleHi: 'स्मार्ट सिटी एकीकृत कमान केंद्र',
      categoryEn: 'Generative AI & LLM Automation',
      categoryHi: 'जेनरेटिव एआई ऑटोमेशन',
      descEn: 'Autonomous structured LLM reasoning synthesizing formal municipal repair orders, material bills, and SLA escalation tracking.',
      descHi: 'सत्यापित दोषों के आधार पर स्वचालित म्यूनिसिपल रिपेयर ऑर्डर और सामग्री बिल तैयार करने वाला एआई कोर।',
      imageUrl: '/assets/showcase/smart_city_war_room.jpg',
      icon: 'smart_toy',
      badge: 'Command AI',
      targetView: 'dashboard',
      specs: ['Automated Triage Matrix', 'Dynamic SLA Rules', 'Curved 3D GIS Wall']
    },
    {
      id: 'domain-multi',
      titleEn: 'Unified Multi-Agency Grid',
      titleHi: 'एकीकृत बहु-एजेंसी ग्रिड',
      categoryEn: 'Cross-Department Governance',
      categoryHi: 'अंतर-विभागीय समन्वय',
      descEn: 'Single-pane-of-glass coordination grid for PWD Highways, Jal Board Pipelines, BSES Power, and Traffic Police.',
      descHi: 'पीडब्ल्यूडी, जल बोर्ड, विद्युत डिस्कॉम और ट्रैफिक पुलिस का केंद्रीकृत संयुक्त कार्रवाई मंच।',
      imageUrl: '/assets/showcase/accident_blackspot_radar.jpg',
      icon: 'hub',
      badge: 'Inter-Agency',
      targetView: 'multi-agency',
      specs: ['Shared Incident Comms', 'Compound Defect Handoff', 'Emergency Duty Roster']
    }
  ];

  // Auto-play banner carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, bannerSlides.length]);

  const currentSlide = bannerSlides[currentSlideIndex];

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* 1. BEL-Style Multi-Slide Image Carousel Banner */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl h-[380px] sm:h-[440px] md:h-[480px] w-full shadow-2xl border border-black/10 dark:border-white/15 group select-none bg-black"
      >
        {/* Background Image with Cinematic Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.titleEn}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-105 group-hover:scale-100 opacity-70"
          />
          {/* Multi-tier Gradient for rich readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Slide Content Overlay */}
        <div className="relative z-20 h-full p-6 sm:p-10 md:p-14 flex flex-col justify-between max-w-4xl text-white">
          {/* Top Sovereign Pill & Tagline */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0071E3] text-white shadow-md font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {language === 'hi' ? currentSlide.badgeHi : currentSlide.badgeEn}
            </span>
            <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase font-mono bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {currentSlide.tagline}
            </span>
          </div>

          {/* Center Main Headline & Description */}
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {language === 'hi' ? currentSlide.titleHi : currentSlide.titleEn}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2.5 max-w-2xl leading-relaxed drop-shadow line-clamp-3">
              {language === 'hi' ? currentSlide.subtitleHi : currentSlide.subtitleEn}
            </p>
          </div>

          {/* Bottom Controls, KPI Metric & CTA Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate(currentSlide.targetView)}
                className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'hi' ? 'विस्तार से देखें' : 'Explore System'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              {onOpenAiCopilot && (
                <button
                  type="button"
                  onClick={onOpenAiCopilot}
                  className="px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#40A9FF]">auto_awesome</span>
                  <span>{language === 'hi' ? 'एआई विश्लेषण' : 'AI Analysis'}</span>
                </button>
              )}
            </div>

            {/* Strategic KPI Stat Box */}
            <div className="hidden sm:flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">
                  {language === 'hi' ? currentSlide.metricLabelHi : currentSlide.metricLabelEn}
                </span>
                <strong className="text-sm font-bold text-[#34C759] font-mono">
                  {currentSlide.metricValue}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={() =>
            setCurrentSlideIndex((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1))
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-30"
          title="Previous Slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-30"
          title="Next Slide"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {bannerSlides.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setCurrentSlideIndex(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === i ? 'w-6 bg-[#0071E3]' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. BEL-Style Strategic Capabilities & Core Technologies Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20 font-mono">
                {language === 'hi' ? 'रणनीतिक नागरिक प्रौद्योगिकी' : 'Strategic Technologies'}
              </span>
              <span className="text-xs text-[#86868b] font-mono">BEL-Class Systems</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
              {language === 'hi' ? 'प्रमुख तकनीकी क्षमताएं एवं क्षेत्र' : 'Core Urban Intelligence Domains'}
            </h2>
          </div>

          <p className="text-xs text-[#86868b] max-w-md">
            {language === 'hi'
              ? 'भारत सरकार के रक्षा एवं स्मार्ट सिटी मानकों पर आधारित स्वदेशी एज-कंप्यूटिंग, जीआईएस रडार एवं एआई कॉपायलट प्रणालियां।'
              : 'Indigenous edge-computing sensor pods, GIS collision radar, and LLM automation engineered for Indian Smart Cities.'}
          </p>
        </div>

        {/* 6-Card Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategicDomains.map((domain) => (
            <div
              key={domain.id}
              onClick={() => onNavigate && onNavigate(domain.targetView)}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-[#0071E3] hover:shadow-xl transition-all cursor-pointer border border-black/10 dark:border-white/10"
            >
              {/* Image Container with Hover Zoom */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={domain.imageUrl}
                  alt={domain.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border border-white/10">
                  <span className="material-symbols-outlined text-[13px] text-[#0071E3]">{domain.icon}</span>
                  <span>{domain.badge}</span>
                </div>

                {/* Bottom Category */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    {language === 'hi' ? domain.categoryHi : domain.categoryEn}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-[#40A9FF] transition-colors truncate">
                    {language === 'hi' ? domain.titleHi : domain.titleEn}
                  </h3>
                </div>
              </div>

              {/* Description & Technical Specs */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs text-[#86868b] leading-relaxed line-clamp-2">
                  {language === 'hi' ? domain.descHi : domain.descEn}
                </p>

                {/* Specs Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {domain.specs.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-[#0071E3]">
                  <span>{language === 'hi' ? 'सिस्टम खोलें' : 'Open Subsystem'}</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BEL-Style Media & National Deployment Highlights */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse"></span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {language === 'hi' ? 'राष्ट्रीय तैनाती एवं क्षेत्र उपलब्धियां' : 'National Fleet Deployment & Field Highlights'}
            </h3>
          </div>
          <span className="text-xs text-[#86868b] font-mono">2026 Sovereign Initiative</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">48 DTC Smart Buses Live</h4>
              <p className="text-[11px] text-[#86868b] mt-1">Autonomous road defect logging across 12 Delhi municipal zones at 10Hz GPS accuracy.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">96.4% Bandwidth Saved</h4>
              <p className="text-[11px] text-[#86868b] mt-1">Edge event metadata filtering dispatches lightweight JSON packets saving cellular costs.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">12 Risk Corridors Mitigated</h4>
              <p className="text-[11px] text-[#86868b] mt-1">DBSCAN clustering prioritized critical remedial road works on Ring Road & Mathura Road.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
