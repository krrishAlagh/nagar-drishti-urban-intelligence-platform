import React, { useState, useEffect, useRef } from 'react';
import { Language, ActiveView } from '../types';

interface ProjectImageSliderProps {
  language: Language;
  onNavigate?: (view: ActiveView, filterParam?: string) => void;
  onOpenAiCopilot?: () => void;
}

interface SlideItem {
  id: string;
  imageSrc: string;
  tagEn: string;
  tagHi: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  kpiLabelEn: string;
  kpiLabelHi: string;
  kpiValue: string;
  targetView: ActiveView;
  accentColor: string;
}

export const ProjectImageSlider: React.FC<ProjectImageSliderProps> = ({
  language,
  onNavigate,
  onOpenAiCopilot
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 5 Custom-Generated Project Thematic Slides (Sized precisely for 1270.4 x 423.74 container)
  const slides: SlideItem[] = [
    {
      id: 'transit-ai-scan',
      imageSrc: '/assets/showcase/transit_ai_road_scan.jpg',
      tagEn: 'Transit AI Vision Core',
      tagHi: 'ट्रांजिट एआई विज़न कोर',
      titleEn: '48 DTC Transit AI Dashcams Scanning Potholes & Road Cracks',
      titleHi: '48 डीटीसी बसें AI कैमरों द्वारा सड़क गड्ढों का लाइव स्कैन',
      descEn: 'Onboard NVIDIA Jetson Orin Nano running TensorRT YOLOv8 segmentation at 30+ FPS, streaming sub-meter GPS defect bounding boxes.',
      descHi: 'एनवीडिया जेटसन ओरिन नैनो टेंसरआरटी द्वारा संचालित 30+ FPS सड़क सतह स्कैन और लाइव जीपीएस मैपिंग।',
      kpiLabelEn: 'Active Transit Nodes',
      kpiLabelHi: 'सक्रिय बस नोड्स',
      kpiValue: '48 Buses Online',
      targetView: 'fleet',
      accentColor: '#0071E3'
    },
    {
      id: 'war-room-command',
      imageSrc: '/assets/showcase/smart_city_war_room.jpg',
      tagEn: 'Unified Municipal Command',
      tagHi: 'एकीकृत नगर निगम कमान',
      titleEn: 'Central Smart City Operations & Integrated Decision Support Hub',
      titleHi: 'केंद्रीय स्मार्ट सिटी ऑपरेशंस एवं एकीकृत निर्णय समर्थन केंद्र',
      descEn: 'Curved 3D GIS video wall aggregating city-wide civic defect telemetry, fleet heatmaps, and automated Gemini AI work order routing.',
      descHi: '3D जीआईएस वीडियो वॉल द्वारा पूरे शहर के सड़क दोष, बस रडार और स्वचालित वर्क ऑर्डर का रीयल-टाइम नियंत्रण।',
      kpiLabelEn: 'Average SLA Turnaround',
      kpiLabelHi: 'औसत एसएलए निवारण',
      kpiValue: '01h 42m Critical',
      targetView: 'dashboard',
      accentColor: '#34C759'
    },
    {
      id: 'rapid-repair-squad',
      imageSrc: '/assets/showcase/rapid_road_repair_crew.jpg',
      tagEn: 'Autonomous Field Dispatch',
      tagHi: 'स्वचालित फील्ड तैनाती',
      titleEn: 'Municipal Rapid Road Maintenance & Automated Pothole Patching',
      titleHi: 'सड़क रखरखाव दस्ता एवं स्वचालित गड्ढा भराई अभियान',
      descEn: 'Instant work order dispatch to zonal PWD road engineering squads with automated bill of materials and retroreflective safety barricading.',
      descHi: 'पीडब्ल्यूडी रोड इंजीनियरिंग दस्तों को तत्काल कार्य आदेश, सामग्री अनुमान और सुरक्षा बैरिकेडिंग का स्वतः प्रेषण।',
      kpiLabelEn: 'Defects Resolved',
      kpiLabelHi: 'निवारित दोष',
      kpiValue: '1,280+ Closed',
      targetView: 'tickets',
      accentColor: '#FF9F0A'
    },
    {
      id: 'blackspot-radar',
      imageSrc: '/assets/showcase/accident_blackspot_radar.jpg',
      tagEn: 'Geospatial Safety Radar',
      tagHi: 'भू-स्थानिक सुरक्षा रडार',
      titleEn: 'Accident Blackspot Collision Modeling & Velocity Flow Analysis',
      titleHi: 'दुर्घटना संभावित ब्लैकस्पॉट मॉडलिंग एवं गति प्रवाह विश्लेषण',
      descEn: 'Haversine DBSCAN clustering identifying high-risk collision corridors, pedestrian blind spots, and median structural hazards.',
      descHi: 'हेवरसाइन डीबीस्कैन क्लस्टरिंग द्वारा उच्च-जोखिम दुर्घटना गलियारों और मोड़ सुरक्षा की सटीक पहचान।',
      kpiLabelEn: 'Monitored Corridors',
      kpiLabelHi: 'निगरानी में गलियारे',
      kpiValue: '12 Blackspot Zones',
      targetView: 'accident-analytics',
      accentColor: '#FF3B30'
    },
    {
      id: 'electric-fleet-depot',
      imageSrc: '/assets/showcase/electric_bus_depot_ai.jpg',
      tagEn: 'Clean Mobility Grid',
      tagHi: 'स्वच्छ परिवहन ग्रिड',
      titleEn: 'Zero-Emission Electric Bus Fleet Terminal & Smart Charging Depot',
      titleHi: 'शून्य-उत्सर्जन इलेक्ट्रिक बस फ्लीट टर्मिनल एवं स्मार्ट चार्जिंग डिपो',
      descEn: '24/7 telematics monitoring DTC electric fleet health, high-voltage battery states, route schedules, and sensor diagnostics.',
      descHi: 'डीटीसी इलेक्ट्रिक बसों के स्वास्थ्य, बैटरी स्थिति, मार्ग समय सारिणी और सेंसर डायग्नोस्टिक्स की 24/7 निगरानी।',
      kpiLabelEn: 'Fleet Connectivity',
      kpiLabelHi: 'फ्लीट कनेक्टिविटी',
      kpiValue: '99.8% Uptime',
      targetView: 'fleet',
      accentColor: '#30B0C7'
    }
  ];

  // Auto slide interval
  useEffect(() => {
    if (!isPlaying || isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, slides.length]);

  const current = slides[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      {/* Top Header Bar for Slider */}
      <div className="w-full max-w-[1270.4px] flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] animate-pulse"></span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'hi' ? 'परियोजना गैलरी एवं लाइव विज़न' : 'Urban Intelligence Image Showcase'}
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
            1270.4 × 423.74
          </span>
        </div>

        {/* Play/Pause & Counter Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <span className="text-xs font-mono font-semibold text-[#86868b]">
            {activeIndex + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Main Image Slider Container - Sized exactly to 1270.4px x 423.74px ratio */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-[1270.4px] h-[260px] sm:h-[340px] md:h-[423.74px] rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/15 group bg-slate-950"
      >
        {/* Render Slides with Fade & Zoom Transitions */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.imageSrc}
              alt={slide.titleEn}
              className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                activeIndex === idx ? 'scale-100' : 'scale-105'
              }`}
            />

            {/* Gradient Overlays for High Contrast & Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent"></div>

            {/* Slide Content Overlay */}
            <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-between text-white z-20">
              {/* Top Tag & Metric Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  style={{ backgroundColor: `${slide.accentColor}25`, borderColor: `${slide.accentColor}50`, color: '#ffffff' }}
                  className="px-3.5 py-1 rounded-full text-xs font-bold font-mono border backdrop-blur-md shadow-sm flex items-center gap-1.5"
                >
                  <span
                    style={{ backgroundColor: slide.accentColor }}
                    className="w-2 h-2 rounded-full animate-pulse"
                  ></span>
                  {language === 'hi' ? slide.tagHi : slide.tagEn}
                </span>

                <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3.5 py-1 rounded-full border border-white/15 text-xs font-mono">
                  <span className="text-slate-300">
                    {language === 'hi' ? slide.kpiLabelHi : slide.kpiLabelEn}:
                  </span>
                  <strong className="text-white font-bold">{slide.kpiValue}</strong>
                </div>
              </div>

              {/* Center Main Text */}
              <div className="max-w-3xl">
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
                  {language === 'hi' ? slide.titleHi : slide.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 line-clamp-2 max-w-2xl leading-relaxed drop-shadow">
                  {language === 'hi' ? slide.descHi : slide.descEn}
                </p>
              </div>

              {/* Bottom Action CTA & Secondary AI Button */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(slide.targetView)}
                  style={{ backgroundColor: slide.accentColor }}
                  className="px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'hi' ? 'लाइव सिस्टम देखें' : 'View Subsystem'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                {onOpenAiCopilot && (
                  <button
                    type="button"
                    onClick={onOpenAiCopilot}
                    className="px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    <span>{language === 'hi' ? 'AI कॉपायलट' : 'Ask AI'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Left & Right Chevron Navigation Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-30 shadow-lg"
          title="Previous Slide"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-30 shadow-lg"
          title="Next Slide"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>

        {/* Bottom Pagination Bar */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 5-Slide Thumbnail Quick Preview Strip */}
      <div className="w-full max-w-[1270.4px] grid grid-cols-5 gap-2 sm:gap-3 px-1">
        {slides.map((s, idx) => (
          <button
            type="button"
            key={s.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-2xl overflow-hidden h-14 sm:h-18 border-2 transition-all cursor-pointer group text-left ${
              activeIndex === idx
                ? 'border-[#0071E3] shadow-md ring-2 ring-[#0071E3]/30 scale-[1.02]'
                : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={s.imageSrc}
              alt={s.tagEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute bottom-1 left-2 right-2 text-white text-[9px] sm:text-[10px] font-bold truncate">
              {idx + 1}. {language === 'hi' ? s.tagHi : s.tagEn}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
