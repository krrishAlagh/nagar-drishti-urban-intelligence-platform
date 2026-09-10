import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DefectItem, AccidentZoneBlackspot, Language, LiveFeedDetection } from '../types';
import { ACCIDENT_BLACKSPOTS } from '../data/mockData';

// Fix Leaflet's default icon path issue with Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export interface LiveBusTelemetry {
  id: string;
  name: string;
  route: string;
  speed: number;
  lat: number;
  lng: number;
  heading: number;
  cameraStatus: 'Active' | 'Warning' | 'Standby';
  fps: number;
  detectionsCount: number;
  color: string;
  routePath: [number, number][];
  currentWaypointIdx: number;
}

export interface MapViolation {
  id: string;
  type: 'LANE_VIOLATION' | 'ILLEGAL_DUMPING' | 'ENCROACHMENT' | 'RED_LIGHT_CROSS';
  title: string;
  location: string;
  lat: number;
  lng: number;
  timeAgo: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  vehiclePlate?: string;
}

interface OpenStreetMapViewerProps {
  language: Language;
  tickets: DefectItem[];
  liveFeed?: LiveFeedDetection[];
  blackspots?: AccidentZoneBlackspot[];
  onSelectTicket?: (ticketId: string) => void;
  height?: string;
  showControls?: boolean;
  activeTicketId?: string | null;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Pre-defined real bus routes in Delhi NCR with GPS coordinates
const INITIAL_BUS_FLEET: LiveBusTelemetry[] = [
  {
    id: 'BUS-402',
    name: 'DTC-BUS-402',
    route: 'Route 522 (Inderlok ⇄ Ambedkar Nagar)',
    speed: 34,
    lat: 28.6139,
    lng: 77.2090,
    heading: 45,
    cameraStatus: 'Active',
    fps: 29.8,
    detectionsCount: 14,
    color: '#002D62',
    currentWaypointIdx: 0,
    routePath: [
      [28.6139, 77.2090],
      [28.6185, 77.2155],
      [28.6250, 77.2210],
      [28.6315, 77.2180],
      [28.6380, 77.2120],
      [28.6320, 77.2040],
      [28.6220, 77.2000],
      [28.6139, 77.2090]
    ]
  },
  {
    id: 'BUS-112',
    name: 'DTC-BUS-112',
    route: 'Route 620 (Shivaji Stadium ⇄ Vasant Kunj)',
    speed: 28,
    lat: 28.5700,
    lng: 77.1600,
    heading: 120,
    cameraStatus: 'Active',
    fps: 30.0,
    detectionsCount: 9,
    color: '#E65100',
    currentWaypointIdx: 0,
    routePath: [
      [28.5700, 77.1600],
      [28.5620, 77.1700],
      [28.5550, 77.1850],
      [28.5480, 77.1950],
      [28.5550, 77.2100],
      [28.5700, 77.2200],
      [28.5800, 77.1900],
      [28.5700, 77.1600]
    ]
  },
  {
    id: 'BUS-729',
    name: 'DTC-BUS-729',
    route: 'Route 729 (Kashmere Gate ⇄ Nehru Place)',
    speed: 41,
    lat: 28.6500,
    lng: 77.2300,
    heading: 190,
    cameraStatus: 'Active',
    fps: 28.5,
    detectionsCount: 18,
    color: '#0D9488',
    currentWaypointIdx: 0,
    routePath: [
      [28.6500, 77.2300],
      [28.6350, 77.2400],
      [28.6150, 77.2450],
      [28.5950, 77.2480],
      [28.5750, 77.2450],
      [28.5500, 77.2500],
      [28.5750, 77.2400],
      [28.6500, 77.2300]
    ]
  },
  {
    id: 'BUS-890',
    name: 'DTC-BUS-890',
    route: 'Route 890 (Najafgarh ⇄ Tilak Nagar)',
    speed: 22,
    lat: 28.6200,
    lng: 77.0800,
    heading: 90,
    cameraStatus: 'Active',
    fps: 30.0,
    detectionsCount: 6,
    color: '#7C3AED',
    currentWaypointIdx: 0,
    routePath: [
      [28.6200, 77.0800],
      [28.6250, 77.0950],
      [28.6300, 77.1100],
      [28.6350, 77.1250],
      [28.6300, 77.1100],
      [28.6250, 77.0950],
      [28.6200, 77.0800]
    ]
  }
];

// Real-time urban violations data
const SAMPLE_VIOLATIONS: MapViolation[] = [
  {
    id: 'VIO-891',
    type: 'LANE_VIOLATION',
    title: 'Bus Dedicated Lane Encroachment',
    location: 'Outer Ring Road, Opp Nehru Place Flyover',
    lat: 28.5505,
    lng: 77.2520,
    timeAgo: '4 mins ago',
    severity: 'HIGH',
    vehiclePlate: 'DL-01-AB-4921'
  },
  {
    id: 'VIO-892',
    type: 'ILLEGAL_DUMPING',
    title: 'Construction Debris & Malba Dumping',
    location: 'Near Mayur Vihar Phase 1 Underpass',
    lat: 28.6040,
    lng: 77.2950,
    timeAgo: '12 mins ago',
    severity: 'CRITICAL'
  },
  {
    id: 'VIO-893',
    type: 'ENCROACHMENT',
    title: 'Commercial Footpath Encroachment',
    location: 'Lajpat Nagar Central Market Crossing',
    lat: 28.5680,
    lng: 77.2400,
    timeAgo: '28 mins ago',
    severity: 'MEDIUM'
  },
  {
    id: 'VIO-894',
    type: 'RED_LIGHT_CROSS',
    title: 'High-Speed Signal Violation',
    location: 'Moolchand Metro Intersection',
    lat: 28.5650,
    lng: 77.2340,
    timeAgo: '45 mins ago',
    severity: 'HIGH',
    vehiclePlate: 'HR-26-CM-8812'
  }
];

export const OpenStreetMapViewer: React.FC<OpenStreetMapViewerProps> = ({
  language,
  tickets = [],
  liveFeed = [],
  blackspots = ACCIDENT_BLACKSPOTS,
  onSelectTicket,
  height = '100%',
  showControls = true,
  activeTicketId,
  className = '',
  initialCenter = [28.6139, 77.2090], // Delhi Center
  initialZoom = 12
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layers refs for dynamic updating
  const defectsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const busesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const violationsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const blackspotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility State
  const [showPotholes, setShowPotholes] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showViolations, setShowViolations] = useState(true);
  const [showBlackspots, setShowBlackspots] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Live bus movement telemetry state
  const [buses, setBuses] = useState<LiveBusTelemetry[]>(INITIAL_BUS_FLEET);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: initialCenter as L.LatLngTuple,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | Nagar Drishti Urban GIS'
      }).addTo(map);

      // Attribution in bottom right with glassmorphism style
      L.control.attribution({ position: 'bottomright', prefix: 'OpenStreetMap | Nagar Drishti Edge AI' }).addTo(map);

      // Initialize Layer Groups
      defectsLayerGroupRef.current = L.layerGroup().addTo(map);
      routesLayerGroupRef.current = L.layerGroup().addTo(map);
      blackspotsLayerGroupRef.current = L.layerGroup().addTo(map);
      violationsLayerGroupRef.current = L.layerGroup().addTo(map);
      busesLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force size invalidation after render / DOM layout
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (_) {}
      }, 100);

      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (_) {}
      }, 400);

      const ro = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch (_) {}
      });
      if (mapContainerRef.current) {
        ro.observe(mapContainerRef.current);
      }

      return () => {
        try {
          ro.disconnect();
          map.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn('[OpenStreetMapViewer] Map initialization caught error:', err);
    }
  }, []);

  // 2. Animate Real Bus Movements along GPS Trajectories
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const nextIdx = (bus.currentWaypointIdx + 1) % bus.routePath.length;
          const currentPoint = bus.routePath[bus.currentWaypointIdx];
          const nextPoint = bus.routePath[nextIdx];

          // Smooth interpolation step
          const newLat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * 0.25;
          const newLng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * 0.25;

          // Compute rough heading angle
          const dLat = nextPoint[0] - currentPoint[0];
          const dLng = nextPoint[1] - currentPoint[1];
          const heading = Math.round(((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360);

          // Variable realistic speed
          const speedVariation = Math.round(25 + Math.random() * 20);

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            heading,
            speed: speedVariation,
            currentWaypointIdx: nextIdx
          };
        })
      );
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // 3. Render Bus Routes Polylines
  useEffect(() => {
    if (!routesLayerGroupRef.current || !mapInstanceRef.current) return;
    routesLayerGroupRef.current.clearLayers();

    if (!showRoutes) return;

    buses.forEach((bus) => {
      const polyline = L.polyline(bus.routePath, {
        color: bus.color,
        weight: 3,
        opacity: 0.55,
        dashArray: '6, 8',
        lineCap: 'round'
      });
      routesLayerGroupRef.current?.addLayer(polyline);
    });
  }, [buses, showRoutes]);

  // 4. Render Live DTC Buses with Custom Animated Markers
  useEffect(() => {
    if (!busesLayerGroupRef.current || !mapInstanceRef.current) return;
    busesLayerGroupRef.current.clearLayers();

    if (!showBuses) return;

    buses.forEach((bus) => {
      const busIconHtml = `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="w-8 h-8 rounded-full bg-[#002D62] text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-500/50 hover:scale-125 transition-transform duration-200">
            <span class="material-symbols-outlined text-[16px] text-[#FF9933]">directions_bus</span>
          </div>
          <div class="absolute -top-7 bg-[#002D62] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-white/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>${bus.name}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: busIconHtml,
        className: 'custom-bus-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-3 text-slate-900 font-sans text-xs min-w-[220px]">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span class="font-extrabold text-sm text-[#002D62]">${bus.name}</span>
            <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">AI Camera Live</span>
          </div>
          <p class="font-semibold text-slate-700 mb-1">${bus.route}</p>
          <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 font-mono">
            <div>Speed: <strong>${bus.speed} km/h</strong></div>
            <div>FPS: <strong>${bus.fps}</strong></div>
            <div>Scanned: <strong>${bus.detectionsCount} defects</strong></div>
            <div>GPS: <strong>Fixed 3D</strong></div>
          </div>
          <div class="text-[10px] text-slate-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px] text-emerald-600">videocam</span>
            <span>Edge AI Model: YOLO-v9-Transit-IN</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'glass-popup', closeButton: false });
      busesLayerGroupRef.current?.addLayer(marker);
    });
  }, [buses, showBuses]);

  // 5. Render Defect & Pothole Pins
  useEffect(() => {
    if (!defectsLayerGroupRef.current || !mapInstanceRef.current) return;
    defectsLayerGroupRef.current.clearLayers();

    if (!showPotholes) return;

    const filteredTickets = tickets.filter((tk) => {
      if (selectedCategory !== 'ALL' && tk.category !== selectedCategory) return false;
      return true;
    });

    filteredTickets.forEach((tk) => {
      const lat = tk.coordinates?.lat || 28.6139;
      const lng = tk.coordinates?.lng || 77.2090;
      const isCritical = tk.severity === 'CRITICAL';
      const isHigh = tk.severity === 'HIGH';

      const colorBg = isCritical ? 'bg-rose-600' : isHigh ? 'bg-amber-500' : 'bg-blue-600';
      const iconName =
        tk.category === 'Potholes'
          ? 'report_problem'
          : tk.category === 'Sanitation'
          ? 'delete'
          : tk.category === 'Streetlights'
          ? 'lightbulb'
          : 'water_drop';

      const defectIconHtml = `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="w-6 h-6 rounded-full ${colorBg} text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-125 transition-transform">
            <span class="material-symbols-outlined text-[13px]">${iconName}</span>
          </div>
          ${isCritical ? `<div class="absolute inset-0 w-6 h-6 rounded-full bg-rose-500 animate-ping opacity-75 pointer-events-none"></div>` : ''}
        </div>
      `;

      const markerIcon = L.divIcon({
        html: defectIconHtml,
        className: 'custom-defect-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon });

      const popupContent = `
        <div class="p-3 text-slate-900 font-sans text-xs min-w-[240px]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
            <span class="font-mono font-bold text-xs text-[#002D62]">${tk.ticketNumber}</span>
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
              isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }">${tk.severity}</span>
          </div>
          ${tk.imageUrl ? `
            <div class="relative w-full h-24 mb-2 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
              <img src="${tk.imageUrl}" class="w-full h-full object-cover" alt="${tk.title}" />
              <div class="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                AI Match: ${tk.confidence}%
              </div>
            </div>
          ` : ''}
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-tight">${tk.title}</h4>
          <p class="text-[11px] text-slate-600 mb-2">${tk.locationName}</p>
          <div class="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
            <span>Ward: <strong>${tk.ward}</strong></span>
            <span class="text-rose-600 font-bold font-mono">SLA: ${tk.slaRemaining}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'glass-popup' });
      marker.on('click', () => {
        if (onSelectTicket) onSelectTicket(tk.ticketNumber);
      });

      defectsLayerGroupRef.current?.addLayer(marker);
    });
  }, [tickets, showPotholes, selectedCategory, onSelectTicket]);

  // 6. Render Violations Layer
  useEffect(() => {
    if (!violationsLayerGroupRef.current || !mapInstanceRef.current) return;
    violationsLayerGroupRef.current.clearLayers();

    if (!showViolations) return;

    const liveViolationMarkers = liveFeed.slice(0, 8).map((item) => {
      const lat = item.ticketId ? (tickets.find((t) => t.ticketNumber === item.ticketId)?.coordinates?.lat ?? 28.6139) : 28.6139;
      const lng = item.ticketId ? (tickets.find((t) => t.ticketNumber === item.ticketId)?.coordinates?.lng ?? 77.2090) : 77.2090;
      return {
        ...item,
        lat,
        lng,
        type: item.category,
        severity: item.severity === 'error' ? 'CRITICAL' : item.severity === 'warning' ? 'HIGH' : 'MEDIUM',
        title: item.title,
        location: item.location,
        timeAgo: item.timestamp
      } as MapViolation & { lat: number; lng: number };
    });

    [...SAMPLE_VIOLATIONS, ...liveViolationMarkers].forEach((vio) => {
      const vioIconHtml = `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-125 transition-transform">
            <span class="material-symbols-outlined text-[15px]">fmd_bad</span>
          </div>
          <div class="absolute -top-6 bg-purple-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
            ${vio.type.replace('_', ' ')}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: vioIconHtml,
        className: 'custom-vio-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([vio.lat, vio.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-900 font-sans text-xs min-w-[220px]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-purple-200">
            <span class="font-bold text-purple-900 font-mono">${vio.id}</span>
            <span class="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Violation</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1">${vio.title}</h4>
          <p class="text-[11px] text-slate-600 mb-2">${vio.location}</p>
          ${vio.vehiclePlate ? `<p class="text-[11px] font-mono bg-purple-50 text-purple-900 px-2 py-1 rounded border border-purple-200 mb-2 font-bold">Plate: ${vio.vehiclePlate}</p>` : ''}
          <div class="text-[10px] text-slate-400">Captured: ${vio.timeAgo}</div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'glass-popup' });
      violationsLayerGroupRef.current?.addLayer(marker);
    });
  }, [liveFeed, showViolations, tickets]);

  // 7. Render Accident Blackspots Danger Circles
  useEffect(() => {
    if (!blackspotsLayerGroupRef.current || !mapInstanceRef.current) return;
    blackspotsLayerGroupRef.current.clearLayers();

    if (!showBlackspots) return;

    blackspots.forEach((spot) => {
      const lat = spot.coordinates?.lat || 28.6139;
      const lng = spot.coordinates?.lng || 77.2090;

      // Circle representing danger radius
      const circle = L.circle([lat, lng], {
        radius: 450,
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.2,
        weight: 1.5,
        dashArray: '4, 4'
      });

      const spotIconHtml = `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-125 transition-transform">
            <span class="material-symbols-outlined text-[13px]">crisis_alert</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: spotIconHtml,
        className: 'custom-blackspot-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 text-slate-900 font-sans text-xs min-w-[240px]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-rose-200">
            <span class="font-bold text-rose-900 font-mono">${spot.spotCode}</span>
            <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">EXTREME RISK</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1">${spot.corridorName}</h4>
          <div class="grid grid-cols-3 gap-1 text-center bg-rose-50 p-2 rounded-lg border border-rose-100 my-2">
            <div><span class="text-[9px] text-slate-500 block">30 Days</span><strong class="text-rose-700">${spot.accidentsPast30Days}</strong></div>
            <div><span class="text-[9px] text-slate-500 block">6 Months</span><strong class="text-rose-700">${spot.accidentsPast6Months}</strong></div>
            <div><span class="text-[9px] text-slate-500 block">Fatalities</span><strong class="text-rose-700">${spot.fatalitiesCount}</strong></div>
          </div>
          <p class="text-[10.5px] text-slate-600">Authority: <strong>${spot.actionAuthority}</strong></p>
        </div>
      `;

      circle.bindPopup(popupHtml, { className: 'glass-popup' });
      marker.bindPopup(popupHtml, { className: 'glass-popup' });

      blackspotsLayerGroupRef.current?.addLayer(circle);
      blackspotsLayerGroupRef.current?.addLayer(marker);
    });
  }, [blackspots, showBlackspots]);

  // Center on Delhi or Bus
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.6139, 77.2090], 13, { duration: 1.2 });
    }
  };

  const handleFocusBus = (bus: LiveBusTelemetry) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([bus.lat, bus.lng], 16, { duration: 1.0 });
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[450px] overflow-hidden rounded-2xl ${className}`} style={{ height: height || '100%' }}>
      {/* 1. Leaflet OpenStreetMap Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-10" />

      {/* 2. Glassmorphism Floating Top Control Bar */}
      {/* 2. Apple Maps Floating Glass Control Dock */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
          {/* Layer Visibility Toggles in Apple Glass Container */}
          <div className="pointer-events-auto glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-full shadow-lg">
            {/* Potholes & Defects Toggle */}
            <button
              type="button"
              onClick={() => setShowPotholes((p) => !p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showPotholes
                  ? 'bg-[#FF3B30] text-white shadow-2xs'
                  : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">report_problem</span>
              <span>{language === 'hi' ? 'गड्ढे एवं दोष' : 'Potholes'}</span>
            </button>

            {/* Live DTC Buses Movement Toggle */}
            <button
              type="button"
              onClick={() => setShowBuses((b) => !b)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showBuses
                  ? 'bg-[#0071E3] text-white shadow-2xs'
                  : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">directions_bus</span>
              <span>{language === 'hi' ? 'लाइव बसें (48)' : 'Live Buses (48)'}</span>
            </button>

            {/* Violations Toggle */}
            <button
              type="button"
              onClick={() => setShowViolations((v) => !v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showViolations
                  ? 'bg-[#AF52DE] text-white shadow-2xs'
                  : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">fmd_bad</span>
              <span>{language === 'hi' ? 'उल्लंघन' : 'Violations'}</span>
            </button>

            {/* Accident Blackspots Toggle */}
            <button
              type="button"
              onClick={() => setShowBlackspots((s) => !s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showBlackspots
                  ? 'bg-[#FF9F0A] text-white shadow-2xs'
                  : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">crisis_alert</span>
              <span>{language === 'hi' ? 'ब्लैकस्पॉट' : 'Blackspots'}</span>
            </button>

            {/* Route Lines Toggle */}
            <button
              type="button"
              onClick={() => setShowRoutes((r) => !r)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                showRoutes
                  ? 'bg-[#30B0C7] text-white shadow-2xs'
                  : 'text-[#86868b] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">alt_route</span>
              <span>{language === 'hi' ? 'रूट लाइन्स' : 'Routes'}</span>
            </button>
          </div>

          {/* Recenter / Quick Navigation Tools */}
          <div className="pointer-events-auto flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRecenter}
              className="glass-panel px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0071E3] hover:bg-white dark:hover:bg-[#1d1d1f] flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Reset center to Delhi NCR"
            >
              <span className="material-symbols-outlined text-[15px]">my_location</span>
              <span>{language === 'hi' ? 'पुनः केंद्रित' : 'Center Delhi'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Apple Maps Floating Bottom Live Telemetry Pill & Bus Dock */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
          {/* Active Bus Fleet Selector Pills */}
          <div className="pointer-events-auto glass-panel p-1.5 rounded-full flex items-center gap-1.5 overflow-x-auto max-w-full custom-scrollbar shadow-lg">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase px-2 font-mono">
              Live Fleet:
            </span>
            {buses.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => handleFocusBus(b)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-[#0071E3]/10 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all shrink-0 font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
                <span>{b.id}</span>
                <span className="text-[10px] text-[#86868b]">({b.speed}km/h)</span>
              </button>
            ))}
          </div>

          {/* OSM Live Status Badge */}
          <div className="pointer-events-auto glass-panel px-3.5 py-1.5 rounded-full text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
              OpenStreetMap Engine • 10Hz Telemetry
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
