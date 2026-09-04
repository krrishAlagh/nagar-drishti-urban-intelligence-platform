import React, { useState } from 'react';
import { Language } from '../types';

export interface CctvFootageItem {
  id: string;
  title: string;
  busId: string;
  location: string;
  channel: 'FRONT' | 'REAR' | 'LEFT_SIDE' | 'CABIN_INTERIOR';
  timestamp: string;
  videoUrl: string;
  confidence: number;
  speedKmh: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export const DATASET_CCTV_VIDEOS: CctvFootageItem[] = [
  {
    id: 'cctv-101',
    title: 'Pothole & Structural Asphalt Failure',
    busId: 'DTC-BUS-402',
    location: 'Outer Ring Road, Moolchand Corridor',
    channel: 'FRONT',
    timestamp: '10th July 2023 11:24:12 AM',
    videoUrl: '/datasets/archive/videos_without_audio/10th%20July-20231125T045234Z-001/10th%20July/111_10-07-2023.mp4',
    confidence: 96.4,
    speedKmh: 34,
    severity: 'CRITICAL'
  },
  {
    id: 'cctv-102',
    title: 'Bus Dedicated Lane Encroachment',
    busId: 'DTC-BUS-112',
    location: 'Shivaji Stadium, Connaught Place Outer Circle',
    channel: 'REAR',
    timestamp: '10th July 2023 11:28:45 AM',
    videoUrl: '/datasets/archive/videos_without_audio/10th%20July-20231125T045234Z-001/10th%20July/112_10-07-2023.mp4',
    confidence: 92.8,
    speedKmh: 28,
    severity: 'HIGH'
  },
  {
    id: 'cctv-103',
    title: 'High-Speed Signal Violation & Obstruction',
    busId: 'DTC-BUS-729',
    location: 'ITO Red Light Corridor',
    channel: 'LEFT_SIDE',
    timestamp: '10th July 2023 11:35:10 AM',
    videoUrl: '/datasets/archive/videos_without_audio/10th%20July-20231125T045234Z-001/10th%20July/114_10-07-2023.mp4',
    confidence: 94.1,
    speedKmh: 41,
    severity: 'HIGH'
  },
  {
    id: 'cctv-104',
    title: 'Passenger Safety Alert & Panic Switch Trigger',
    busId: 'DTC-BUS-890',
    location: 'Tilak Nagar Transit Terminal',
    channel: 'CABIN_INTERIOR',
    timestamp: '10th July 2023 11:42:00 AM',
    videoUrl: '/datasets/archive/videos_without_audio/10th%20July-20231125T045234Z-001/10th%20July/116_10-07-2023.mp4',
    confidence: 98.2,
    speedKmh: 22,
    severity: 'CRITICAL'
  }
];

interface CctvFootageModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  item?: CctvFootageItem | null;
}

export const CctvFootageModal: React.FC<CctvFootageModalProps> = ({
  isOpen,
  onClose,
  language,
  item = DATASET_CCTV_VIDEOS[0]
}) => {
  const activeItem = item || DATASET_CCTV_VIDEOS[0];
  const [selectedChannel, setSelectedChannel] = useState<'FRONT' | 'REAR' | 'LEFT_SIDE' | 'CABIN_INTERIOR'>(activeItem.channel);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="glass-panel w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl bg-slate-900 text-white flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <span className="material-symbols-outlined text-[20px] animate-pulse">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">
                  {language === 'hi' ? 'लाइव सीसीटीवी फुटेज एवं एज एआई विश्लेषण' : 'Live CCTV Footage & Edge AI Feed'}
                </h3>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  RECORDED CCTV DATASET
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeItem.busId} • {activeItem.location} • {activeItem.timestamp}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          
          {/* Video Player Container */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video group shadow-2xl">
              
              {/* HTML5 Video Player playing actual MP4 dataset clip */}
              <video
                key={activeItem.videoUrl}
                src={activeItem.videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover"
                onLoadedMetadata={(e) => {
                  (e.target as HTMLVideoElement).playbackRate = playbackRate;
                }}
              />

              {/* CCTV HUD Top Bar Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-[11px] font-mono font-semibold text-white/90 drop-shadow">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>CAM: {selectedChannel}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  SPEED: {activeItem.speedKmh} km/h | 29.8 FPS
                </div>
              </div>

              {/* Bounding Box AI Detection Overlay */}
              {showAiOverlay && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-8">
                  <div className="border-2 border-red-500 bg-red-500/10 rounded-lg w-1/2 h-1/2 relative animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <span className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <span>{activeItem.title}</span>
                      <span className="bg-white/20 px-1 rounded">{activeItem.confidence}% CONF</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls & Camera Channel Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold pr-1">Channels:</span>
                {(['FRONT', 'REAR', 'LEFT_SIDE', 'CABIN_INTERIOR'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedChannel === ch
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    showAiOverlay ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI Bounding Box
                </button>

                <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 text-[10px] font-mono">
                  {[0.5, 1.0, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-2 py-0.5 rounded-full transition-all ${
                        playbackRate === rate ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CCTV Metadata & Incident Details Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Incident Intelligence
                </span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  {activeItem.severity}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">{activeItem.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time visual anomaly captured by onboard transit AI camera node. Transmitted via low-overhead compressed keyframe payload.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between text-slate-300">
                  <span>Transit Bus Node:</span>
                  <span className="text-blue-400 font-bold">{activeItem.busId}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>AI Confidence:</span>
                  <span className="text-emerald-400 font-bold">{activeItem.confidence}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Vehicle Speed:</span>
                  <span className="text-amber-400 font-bold">{activeItem.speedKmh} km/h</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Inference Latency:</span>
                  <span className="text-purple-400 font-bold">18.4 ms</span>
                </div>
              </div>
            </div>

            {/* Other Available Dataset CCTV Footage Selection */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-3 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Dataset CCTV Feeds ({DATASET_CCTV_VIDEOS.length})
              </span>

              <div className="space-y-2 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
                {DATASET_CCTV_VIDEOS.map((vid) => (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => setSelectedChannel(vid.channel)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      vid.id === activeItem.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-white'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{vid.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{vid.busId} • {vid.channel}</div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-blue-400">play_circle</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
