import React, { useState } from 'react';
import { NearbyBus, PublicBusRoute, CommuterIncidentFeedback, DefectItem, Language } from '../types';
import { NEARBY_BUSES, PUBLIC_BUS_ROUTES, COMMUTER_FEEDBACK_ITEMS } from '../data/mockData';
import { 
  Bus, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Users, 
  Wind, 
  Gauge, 
  MessageSquarePlus, 
  ThumbsUp, 
  Sparkles,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { OpenStreetMapViewer } from './OpenStreetMapViewer';

interface PublicBusTrackerViewProps {
  language: Language;
  tickets?: DefectItem[];
  onAddTicket?: (ticket: Partial<DefectItem>) => void;
  onNavigateToTicket?: (ticketId: string) => void;
}

export const PublicBusTrackerView: React.FC<PublicBusTrackerViewProps> = ({
  language,
  tickets = [],
  onAddTicket,
  onNavigateToTicket
}) => {
  const isHi = language === 'hi';

  const [selectedStop, setSelectedStop] = useState<string>('Connaught Place Central Hub');
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
  const [buses, setBuses] = useState<NearbyBus[]>(NEARBY_BUSES);
  const [routes] = useState<PublicBusRoute[]>(PUBLIC_BUS_ROUTES);
  const [feedbacks, setFeedbacks] = useState<CommuterIncidentFeedback[]>(COMMUTER_FEEDBACK_ITEMS);

  // Form State for Commuter Incident Feedback
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetBusId, setTargetBusId] = useState(NEARBY_BUSES[0].busId);
  const [category, setCategory] = useState<CommuterIncidentFeedback['category']>('AC Breakdown');
  const [description, setDescription] = useState('');
  const [commuterName, setCommuterName] = useState('');
  const [commuterPhone, setCommuterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [selectedBusForMap, setSelectedBusForMap] = useState<NearbyBus | null>(NEARBY_BUSES[0]);

  const busStops = [
    'Connaught Place Central Hub',
    'AIIMS Metro Station',
    'Mandi House Circle',
    'ITO Bus Stand',
    'Dhaula Kuan Junction',
    'ISBT Kashmere Gate'
  ];

  const filteredBuses = buses.filter((b) => {
    if (selectedRoute !== 'ALL' && b.routeNumber !== selectedRoute) return false;
    return true;
  });

  const handleUpvote = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotesCount: item.upvotesCount + 1 } : item))
    );
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    const bus = buses.find((b) => b.busId === targetBusId) || buses[0];
    const ticketId = `TK-PUB-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      const newFeedback: CommuterIncidentFeedback = {
        id: `FB-${Math.floor(900 + Math.random() * 100)}`,
        ticketId,
        busId: bus.busId,
        routeNumber: bus.routeNumber,
        commuterName: commuterName || (isHi ? 'नागरिक यात्री' : 'Commuter Passenger'),
        commuterPhone,
        category,
        description,
        timestamp: isHi ? 'अभी-अभी' : 'Just now',
        status: 'AI_VERIFIED',
        upvotesCount: 1,
        hasPhoto: true
      };

      setFeedbacks([newFeedback, ...feedbacks]);

      // Automatically register a work order ticket in the central platform
      if (onAddTicket) {
        onAddTicket({
          id: ticketId,
          ticketNumber: ticketId,
          title: `[Public Report] ${category} on Bus ${bus.busId} (${bus.routeNumber})`,
          category: category === 'AC Breakdown' ? 'Electrical' : 'Sanitation',
          severity: category === 'Reckless Driving' || category === 'Safety Hazard' ? 'HIGH' : 'MED',
          confidence: 0.94,
          locationName: `${bus.currentStop} (Route ${bus.routeNumber})`,
          coordinates: {
            lat: bus.lat,
            lng: bus.lng,
            formatted: `${bus.lat.toFixed(4)}° N, ${bus.lng.toFixed(4)}° E`
          },
          ward: 'Ward 42 - Central Public Transit Zone',
          timestamp: new Date().toISOString(),
          timeAgo: 'Just now',
          imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800',
          hasOverlay: true,
          busId: bus.busId,
          department: 'Transport Authority',
          slaRemaining: '4h 00m',
          description: `Commuter Incident Feedback: ${description}`,
          status: 'NEW',
          timeline: [
            {
              step: 'Commuter Submitted',
              time: 'Just now',
              completed: true
            },
            {
              step: 'AI Automated Triage',
              time: 'Just now',
              completed: true,
              active: true
            },
            {
              step: 'Depot Dispatch',
              time: 'Pending',
              completed: false
            },
            {
              step: 'Resolution Verified',
              time: 'Pending',
              completed: false
            }
          ]
        });
      }

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsFormOpen(false);
        setDescription('');
      }, 1500);
    }, 600);
  };

  const getOccupancyBadge = (occ: NearbyBus['occupancy']) => {
    switch (occ) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300';
      case 'Overcrowded':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 animate-pulse';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 opacity-15 transform translate-x-12 -translate-y-6 pointer-events-none">
          <Bus className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            {isHi ? 'सार्वजनिक बस ट्रैकर एवं नागरिक प्रतिक्रिया' : 'Public Commuter Transit & Feedback Portal'}
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            {isHi ? 'अपनी बस लाइव देखें एवं समस्या रिपोर्ट करें' : 'Track Nearby Buses Live & Report Commuter Issues'}
          </h1>
          
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            {isHi
              ? 'वास्तविक समय में अपनी निकटतम बस का आगमन, क्षमता और गति देखें। यात्रा के दौरान उत्पन्न किसी भी असुविधा या सुरक्षा खतरे को तुरंत रिपोर्ट करें।'
              : 'Real-time arrival ETAs, cabin occupancy, AC availability, and direct citizen incident reporting to continuously improve municipal bus transport.'}
          </p>

          {/* Quick Action Bar */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {isHi ? 'बस शिकायत / प्रतिक्रिया दर्ज करें' : 'Report Bus Incident / Feedback'}
            </button>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isHi ? 'नगर दृष्टि AI द्वारा 100% सत्यापित' : '100% AI Auto-Routed to Depot'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stop & Route Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative w-full sm:w-72">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
              {isHi ? 'बस स्टॉप चुनें' : 'Select Nearby Bus Stop'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
              >
                {busStops.map((stop) => (
                  <option key={stop} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
              {isHi ? 'रूट नंबर फ़िल्टर' : 'Filter Route Number'}
            </label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">{isHi ? 'सभी सक्रिय मार्ग (All Routes)' : 'All Active Routes'}</option>
                {routes.map((r) => (
                  <option key={r.routeNumber} value={r.routeNumber}>
                    Route {r.routeNumber} - {r.origin}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
          <span>{isHi ? 'लाइव जीपीएस रिफ्रेश (सक्रिय)' : 'Live GPS Sync Active'}</span>
        </div>
      </div>

      {/* Main Grid: Nearby Buses Cards & Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Nearby Bus Arrivals Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {isHi ? `निकटतम बस आगमन (${filteredBuses.length})` : `Nearby Bus Arrivals (${filteredBuses.length})`}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? `स्टॉप: ${selectedStop}` : `At Stop: ${selectedStop}`}
            </span>
          </div>

          <div className="space-y-4">
            {filteredBuses.map((bus) => (
              <div
                key={bus.busId}
                onClick={() => setSelectedBusForMap(bus)}
                className={`bg-white dark:bg-slate-900 rounded-xl p-5 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  selectedBusForMap?.busId === bus.busId
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-blue-500/20">
                      <span className="text-xs uppercase leading-none font-medium opacity-80">Route</span>
                      <span className="text-sm font-black">{bus.routeNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{bus.busId}</span>
                        {bus.isAc ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">
                            <Wind className="w-3 h-3" /> AC
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Non-AC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{bus.routeName}</p>
                    </div>
                  </div>

                  {/* ETA Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 justify-end">
                        <Clock className="w-4 h-4" />
                        {bus.etaMinutes} {isHi ? 'मिनट' : 'mins'}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {bus.distanceKm} km {isHi ? 'दूर' : 'away'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bus Specs & Details */}
                <div className="mt-3 grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isHi ? 'भीड़ स्तर' : 'Occupancy'}</span>
                      <span className={`inline-block font-semibold px-1.5 py-0.5 rounded text-[11px] ${getOccupancyBadge(bus.occupancy)}`}>
                        {bus.occupancy}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isHi ? 'वर्तमान गति' : 'Speed'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{bus.speedKmh} km/h</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isHi ? 'अगला स्टॉप' : 'Next Stop'}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">{bus.nextStop}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-400">
                    Depot: <strong className="text-slate-600 dark:text-slate-300 font-medium">{bus.depot}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetBusId(bus.busId);
                      setIsFormOpen(true);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
                  >
                    <span>{isHi ? 'इस बस पर शिकायत करें' : 'Report Issue on this Bus'}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Map & Bus Location (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              {isHi ? 'सक्रिय बस GPS स्थिति मानचित्र' : 'Live Bus GPS Location'}
            </h3>

            {selectedBusForMap && (
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800/60 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-200">{selectedBusForMap.busId}</span>
                  <span className="text-blue-700 dark:text-blue-300 ml-2">Route {selectedBusForMap.routeNumber}</span>
                </div>
                <span className="font-medium text-blue-600 dark:text-blue-400">{selectedBusForMap.currentStop}</span>
              </div>
            )}

            {/* Interactive Leaflet Map Integration */}
            <div className="h-[360px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
              <OpenStreetMapViewer
                language={language}
                tickets={tickets}
                height="360px"
                initialCenter={[selectedBusForMap ? selectedBusForMap.lat : 28.6315, selectedBusForMap ? selectedBusForMap.lng : 77.2167]}
                initialZoom={14}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Community Incident Feedback & Citizen Reports Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {isHi ? 'नागरिक प्रतिक्रिया एवं लाइव सुधार स्थिति' : 'Public Commuter Feedback & Incident Activity'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isHi
                ? 'यात्रियों द्वारा दर्ज की गई शिकायतों का वास्तविक समय स्थिति अपडेट। AI द्वारा स्वचालित सत्यापन एवं डिपो आवंटन।'
                : 'Live resolution status of citizen-submitted bus complaints auto-routed into depot work orders.'}
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            {isHi ? 'नई रिपोर्ट दर्ज करें' : 'Submit New Report'}
          </button>
        </div>

        {/* Feedback Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    Bus {fb.busId}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Route {fb.routeNumber}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> {fb.status}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                  {fb.category}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{fb.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>By {fb.commuterName}</span>
                  <span>•</span>
                  <span>{fb.timestamp}</span>
                </div>

                <button
                  onClick={() => handleUpvote(fb.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 shadow-xs"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>{fb.upvotesCount} {isHi ? 'समर्थन' : 'Upvotes'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Submitting Incident Feedback */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {isHi ? 'बस शिकायत एवं अनुभव रिपोर्ट' : 'Report Bus Incident / Commuter Feedback'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isHi ? 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है!' : 'Feedback Submitted Successfully!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isHi
                    ? 'नगर दृष्टि AI ने आपकी रिपोर्ट को सत्यापित कर संबंधित बस डिपो और रखरखाव दल को स्वचालित कार्य आदेश जारी कर दिया है।'
                    : 'Auto-routed into municipal ticket triage system. Work order has been dispatched to depot team.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    {isHi ? 'बस चुनें' : 'Select Bus'}
                  </label>
                  <select
                    value={targetBusId}
                    onChange={(e) => setTargetBusId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    {buses.map((b) => (
                      <option key={b.busId} value={b.busId}>
                        Bus {b.busId} - Route {b.routeNumber} ({b.currentStop})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    {isHi ? 'समस्या श्रेणी' : 'Incident Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommuterIncidentFeedback['category'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="AC Breakdown">AC Breakdown / Heat Issue</option>
                    <option value="Overcrowding">Severe Overcrowding</option>
                    <option value="Reckless Driving">Reckless Driving / Overspeeding</option>
                    <option value="Cabin Cleanliness">Cabin Litter / Cleanliness</option>
                    <option value="Broken Seat/Railing">Broken Seat or Railing Hazard</option>
                    <option value="Safety Hazard">Security / Safety Alert</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    {isHi ? 'समस्या का विवरण' : 'Description of Incident'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      isHi
                        ? 'कृपया घटना या असुविधा का विस्तार से वर्णन करें...'
                        : 'Describe the issue clearly (e.g. AC fan not cooling, loose safety handle near middle door)...'
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      {isHi ? 'आपका नाम (ऐच्छिक)' : 'Your Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={commuterName}
                      onChange={(e) => setCommuterName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                      {isHi ? 'मोबाइल नंबर (ऐच्छिक)' : 'Phone Number (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={commuterPhone}
                      onChange={(e) => setCommuterPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isHi ? 'सबमिट हो रहा है...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isHi ? 'सबमिट करें' : 'Submit Feedback'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
