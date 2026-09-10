import React, { useState, useEffect } from 'react';
import { DefectItem, Language } from '../types';
import { ASSETS, TRANSLATIONS } from '../data/mockData';
import { CctvFootageModal, DATASET_CCTV_VIDEOS } from './CctvFootageModal';

interface TicketDetailViewProps {
  language: Language;
  ticket: DefectItem;
  onBack: () => void;
  onUpdateStatus: (ticketId: string, status: DefectItem['status']) => void;
  onAddComment: (ticketId: string, commentText: string) => void;
}

interface CrewTeam {
  id: string;
  name: string;
  team: string;
  lead: string;
  phone: string;
  avatar: string;
  department: string;
}

interface VideoDataset {
  id: string;
  name: string;
  folder: string;
  videos: number;
  totalSize: string;
  date: string;
  description: string;
  videoUrls?: string[];
  mediaItems?: Array<{
    title: string;
    type: 'video' | 'image';
    url: string;
    tag?: string;
    subtitle?: string;
  }>;
}

const getCategoryRepairDefaults = (category: string, defect: DefectItem) => {
  if (category === 'Streetlights' || category === 'Electrical' || defect.ticketNumber === 'TK-8890') {
    return {
      actionPlan: 'De-energize Sector 14 lighting feeder circuit (OSHA Lockout/Tagout protocol). Deploy 14m aerial hydraulic bucket truck to stabilize tilted 8m pole (Deflection: 45°). Strip and splice severed ~30cm electrical wiring using dual-wall adhesive heat-shrink sleeves. Mount and secure replacement 250W IP66 LED luminaire fixture (torque to 65 N·m). Inspect foundation bolts, re-align pole perpendicularity with spirit level, and conduct insulation resistance test (>50 MΩ) prior to re-energizing.',
      materials: [
        '250W LED IP66 Luminaire Head & Driver Kit',
        '14m Aerial Hydraulic Bucket Truck',
        '10kV Insulated Lineman Toolset & High-Voltage Detector',
        'Dual-wall Adhesive Heat-shrink Splice Sleeves (3-core)',
        'Heavy-duty Galvanized Base Anchor Bolts (M24)',
        'Retroreflective Hazard Cones & Safety Barricades'
      ],
      hazards: [
        '230V live exposed wire electrocution hazard to pedestrians & road users',
        'Severe road corridor blackout causing nighttime vehicular collision risk',
        'Risk of structural collapse from 45° pole tilt under gusty wind conditions'
      ]
    };
  }
  if (category === 'Sanitation') {
    return {
      actionPlan: 'Deploy 14m³ high-power super suction jetting machine to clear sewer line blockage at manhole NEH-14G. Cordon off 3m overflow radius on footpath with biohazard tape. Extract effluent sludge from catch basin, high-pressure wash walkway tiles with 10% quaternary ammonium biocide disinfectant, and re-seat and lock cast-iron manhole cover.',
      materials: [
        '14m³ High-Velocity Super Suction Jetting Tanker',
        'Heavy-Duty Cast Iron Manhole Cover & Locking Ring (NEH-14G)',
        'Quaternary Ammonium Antimicrobial Sanitizer (60L)',
        'Biohazard Perimeter Barricade & Warning Cones',
        'Hazardous Effluent PPE, Respirators & Chemical Gloves'
      ],
      hazards: [
        'Pathogenic biohazard effluent exposure & waterborne infection risk',
        'Pedestrian slipping hazard on slippery walkway tiles',
        'Pedestrian spillover into active traffic lane on Outer Ring Road'
      ]
    };
  }
  if (category === 'Water Logging' || category === 'Drainage') {
    return {
      actionPlan: 'Emergency isolate 600mm municipal feeder main via upstream gate valves at Civil Lines pumping station (mitigating ~800L/min high-pressure flow). Deploy two 15HP submersible dewatering pumps to evacuate 1.8m flooded carriageway. Install trench shoring safety shield around fracture crater. Replace ruptured 600mm ductile iron mechanical flange coupling (Class K9, torqued to 180 N·m). Backfill with compacted crushed stone aggregate (4 tons) and execute 8-bar hydrostatic pressure test prior to bituminous road resurfacing.',
      materials: [
        '600mm Ductile Iron Mechanical Flange Coupling (Class K9)',
        '15HP High-Flow Diesel Dewatering Pumps & Discharge Hoses (2 Units)',
        'Trench Shoring Box & Steel Safety Shielding Plates',
        'Fast-Setting Hydrophobic Hydraulic Mortar & Gaskets',
        'Crushed Stone Sub-base Aggregate (4 Tons)',
        'High-Intensity Flood Hazard Cones & LED Flashers'
      ],
      hazards: [
        'Carriageway sub-base washaway causing sudden sinkhole collapse under vehicular load',
        'Vehicular engine hydrostatic lock and corridor obstruction outside District Court Gate 1',
        'Sub-surface 11kV electrical cable short-circuit & contamination hazard'
      ]
    };
  }
  // Default: Roads & Bridges / Potholes
  return {
    actionPlan: 'Establish traffic taper using retroreflective cones (MUTCD standard). Saw-cut damaged asphalt perimeter to a rectangular profile and excavate loose debris to solid subgrade (depth ~15cm). Thoroughly apply hot cationic bitumen emulsion (SS-1h) tack coat. Place Type-II Hot Mix Asphalt in 50mm compacted lifts at 150°C and compact with 1.5-ton vibratory roller to 95% target density.',
    materials: [
      'Type-II Hot Mix Asphalt (250kg)',
      'Bitumen Emulsion Tack Coat Primer',
      '1.5-ton Vibratory Roller Compactor',
      'Asphalt Rake, Level Lute & Hand Tamper',
      'Retroreflective Hazard Cones & LED Warning Flashers'
    ],
    hazards: [
      'High-speed vehicular tire blowouts and rim damage',
      'Severe two-wheeler loss of control and skidding accident hazard',
      'Subgrade water infiltration causing progressive structural road collapse'
    ]
  };
};

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  language,
  ticket,
  onBack,
  onUpdateStatus,
  onAddComment
}) => {
  const t = TRANSLATIONS[language];
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(ticket.comments || []);
  const [selectedCrew, setSelectedCrew] = useState<CrewTeam | null>(null);
  const [crewList, setCrewList] = useState<CrewTeam[]>([]);
  const [videoDatasets, setVideoDatasets] = useState<VideoDataset[]>([]);
  const [isAssigningWork, setIsAssigningWork] = useState(false);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    actionPlan?: string;
    detectedHazards?: string[];
    materialsEstimated?: string[];
    confidence?: number;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCctvOpen, setIsCctvOpen] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'video' | 'dashcam' | 'closeup'>(ticket.videoUrl ? 'video' : 'dashcam');

  useEffect(() => {
    setActivePhotoTab(ticket.videoUrl ? 'video' : 'dashcam');
  }, [ticket.id, ticket.videoUrl]);

  useEffect(() => {
    setLocalComments(ticket.comments || []);
  }, [ticket.id, ticket.comments]);

  const repairDefaults = getCategoryRepairDefaults(ticket.category, ticket);
  const effectiveActionPlan = aiAnalysis?.actionPlan || repairDefaults.actionPlan;
  const effectiveMaterials = (aiAnalysis?.materialsEstimated && aiAnalysis.materialsEstimated.length > 0)
    ? aiAnalysis.materialsEstimated
    : repairDefaults.materials;
  const effectiveHazards = (aiAnalysis?.detectedHazards && aiAnalysis.detectedHazards.length > 0)
    ? aiAnalysis.detectedHazards
    : repairDefaults.hazards;

  const activeCctvItem = (ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799')
    ? DATASET_CCTV_VIDEOS.find((c) => c.id === 'cctv-104') || DATASET_CCTV_VIDEOS[3]
    : (ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855')
    ? DATASET_CCTV_VIDEOS.find((c) => c.id === 'cctv-103') || DATASET_CCTV_VIDEOS[2]
    : (ticket.category === 'Streetlights' || ticket.ticketNumber === 'TK-8890')
    ? DATASET_CCTV_VIDEOS.find((c) => c.id === 'cctv-102') || DATASET_CCTV_VIDEOS[1]
    : (ticket.category === 'Potholes' || ticket.ticketNumber === 'TK-8921')
    ? DATASET_CCTV_VIDEOS.find((c) => c.id === 'cctv-101') || DATASET_CCTV_VIDEOS[0]
    : DATASET_CCTV_VIDEOS.find((c) => c.busId === ticket.busId) || DATASET_CCTV_VIDEOS[0];

  // Load crew list on mount
  useEffect(() => {
    const loadCrewList = async () => {
      try {
        // Load default crew teams - in production, this would come from an API
        const crews: CrewTeam[] = [
          {
            id: 'crew-1',
            name: 'Central Roads Maintenance Team',
            team: 'Roads & Bridges - Central Zone',
            lead: 'R. Sharma',
            phone: '+91 98112 00192',
            avatar: ASSETS.sharmaAvatar,
            department: 'PWD (Roads & Bridges) - Central Zone'
          },
          {
            id: 'crew-2',
            name: 'Team B Emergency',
            team: 'Rapid Emergency Hydrology',
            lead: 'Team B Lead',
            phone: '+91 98731 99201',
            avatar: ASSETS.teamBAvatar,
            department: 'Rapid Emergency Hydrology'
          },
          {
            id: 'crew-3',
            name: 'Electrical Maintenance Div 2',
            team: 'Electrical & Lighting Department',
            lead: 'Rajesh Electrical',
            phone: '+91 98002 33456',
            avatar: ASSETS.adminAvatar,
            department: 'BSES / Electrical Dept'
          },
          {
            id: 'crew-4',
            name: 'Sanitation Squad 4',
            team: 'Water Supply & Sanitation',
            lead: 'Kumar Sani',
            phone: '+91 98765 43210',
            avatar: ASSETS.sharmaAvatar,
            department: 'Delhi Water Board'
          }
        ];
        setCrewList(crews);
        
        // Pre-select crew if already assigned
        if (ticket.assignedTo?.name) {
          const assigned = crews.find(c => c.name === ticket.assignedTo?.name);
          if (assigned) {
            setSelectedCrew(assigned);
          } else {
            setSelectedCrew(crews[0]);
          }
        } else {
          setSelectedCrew(crews[0]);
        }
      } catch (err) {
        console.warn('Error loading crew list:', err);
      }
    };
    loadCrewList();
  }, [ticket]);

  // Load video datasets
  useEffect(() => {
    const loadDatasets = async () => {
      setIsLoadingDatasets(true);
      try {
        const res = await fetch(`/api/defects/${ticket.id}/datasets`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setVideoDatasets(json.data);
            setIsLoadingDatasets(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error loading datasets:', err);
      } finally {
        setIsLoadingDatasets(false);
      }

      // Context-aware datasets tailored to defect category and telemetry
      if (ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799') {
        setVideoDatasets([
          {
            id: 'dataset-sani-309',
            name: 'DTC-BUS-309 Rear Camera & Sanitation AI Stream',
            folder: 'DTC-BUS-309/nehrupark-gate3',
            videos: 3,
            totalSize: '210MB',
            date: '2023-10-24',
            description: '12-second continuous rear dashcam clip capturing overflowing manhole NEH-14G, ~3m effluent spread on walkway, pedestrian detour, and Edge AI yellow bounding box.',
            videoUrls: ['/assets/videos/sewer_overflow_clip.mp4'],
            mediaItems: [
              {
                title: 'Continuous Rear Dashcam MP4 Recording (12s)',
                type: 'video',
                url: '/assets/videos/sewer_overflow_clip.mp4',
                tag: 'VIDEO CLIP',
                subtitle: 'Rear bus POV at 24 km/h, receding perspective, effluent spill & ticket banner'
              },
              {
                title: 'DTC-BUS-309 Rear Dashcam Detection Frame',
                type: 'image',
                url: ASSETS.sewerOverflow,
                tag: 'DASHCAM STILL',
                subtitle: 'Rear view: Nehru Park Gate 3, 3m overflow radius, Yellow AI box (89.0% Conf)'
              },
              {
                title: 'Macro Defect Inspection Photo (Displaced Manhole NEH-14G)',
                type: 'image',
                url: ASSETS.sewerOverflowThumb,
                tag: 'MACRO CARD',
                subtitle: 'Close-up evidence card: Dislodged circular cover, sludge stain & walkway pooling'
              }
            ]
          }
        ]);
      } else if (ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855') {
        setVideoDatasets([
          {
            id: 'dataset-hyd-204',
            name: 'DTC-BUS-204 Left-Side Camera & Hydraulic Telemetry Stream',
            folder: 'DTC-BUS-204/civil-lines-distcourt',
            videos: 3,
            totalSize: '235MB',
            date: '2023-10-24',
            description: '12-second side dashcam recording capturing 600mm ruptured feeder flange, 2m muddy water geyser cascade (~800L/min), 1.8m road flood, detouring vehicles, and Edge AI bounding box.',
            videoUrls: ['/assets/videos/pipe_burst_dashcam_clip.mp4'],
            mediaItems: [
              {
                title: 'Continuous Side Dashcam MP4 Recording (12s)',
                type: 'video',
                url: '/assets/videos/pipe_burst_dashcam_clip.mp4',
                tag: 'VIDEO CLIP',
                subtitle: 'Left-side bus POV at 18 km/h, 2m geyser spray, flood detour & auto-ticket alert'
              },
              {
                title: 'DTC-BUS-204 Left-Side Camera Detection Frame',
                type: 'image',
                url: ASSETS.pipeBurst,
                tag: 'DASHCAM STILL',
                subtitle: 'Side view: District Court Gate 1, 1.8m flood extent, Edge AI box (96.5% Conf)'
              },
              {
                title: 'Macro Defect Inspection Photo (Ruptured Flange Crater)',
                type: 'image',
                url: ASSETS.pipeBurstThumb,
                tag: 'MACRO CARD',
                subtitle: 'Close-up evidence card: 600mm fractured collar, hydraulic plume & danger barricade'
              }
            ]
          }
        ]);
      } else if (ticket.category === 'Streetlights' || ticket.ticketNumber === 'TK-8890') {
        setVideoDatasets([
          {
            id: 'dataset-lgt-401',
            name: 'DTC-BUS-118 Night Dashcam & Telemetry Stream',
            folder: 'DTC-BUS-118/sec14-lgt401',
            videos: 3,
            totalSize: '215MB',
            date: '2023-10-24',
            description: '12-second continuous night dashcam clip capturing tilted pole, dangling swaying luminaire, electrical micro-arcing, and automated safety slowdown.',
            videoUrls: ['/assets/videos/streetlight_dashcam_clip.mp4'],
            mediaItems: [
              {
                title: 'Continuous Dashcam MP4 Recording (12s)',
                type: 'video',
                url: '/assets/videos/streetlight_dashcam_clip.mp4',
                tag: 'VIDEO CLIP',
                subtitle: 'Night approach, swaying luminaire head, AI hazard alert & safety crawl'
              },
              {
                title: 'DTC-BUS-118 Front Dashcam POV (Sector 14 Main Ave)',
                type: 'image',
                url: ASSETS.streetlightBroken,
                tag: 'DASHCAM STILL',
                subtitle: 'High-resolution night dashcam capture showing 45° pole tilt'
              },
              {
                title: 'Macro Defect Inspection Photo (Pole LGT-401)',
                type: 'image',
                url: ASSETS.brokenStreetlightThumb,
                tag: 'MACRO CARD',
                subtitle: 'Close-up evidence card: 30cm live wire & luminaire drop'
              }
            ]
          }
        ]);
      } else if (ticket.category === 'Potholes' || ticket.ticketNumber === 'TK-8921') {
        setVideoDatasets([
          {
            id: 'dataset-pth-402',
            name: 'DTC-BUS-402 YOLO-v8 Forward Dashcam Clip',
            folder: 'DTC-BUS-402/mgroad-pillar42',
            videos: 3,
            totalSize: '240MB',
            date: '2023-10-24',
            description: '15-second continuous forward dashcam clip at 34 km/h capturing crater defect with YOLO-v8 bounding box and HUD telemetry.',
            videoUrls: [ASSETS.potholeVideo],
            mediaItems: [
              {
                title: 'Continuous Dashcam MP4 Recording (15s)',
                type: 'video',
                url: ASSETS.potholeVideo,
                tag: 'VIDEO CLIP',
                subtitle: 'Bus approach at 34 km/h with active YOLO-v8 detection'
              },
              {
                title: 'High-Resolution Dashcam Detection Frame',
                type: 'image',
                url: ASSETS.potholeDashcam,
                tag: 'DASHCAM STILL',
                subtitle: 'Defect crater at Metro Pillar 42 with HUD telemetry'
              },
              {
                title: 'Macro Road Surface Inspection Capture',
                type: 'image',
                url: ASSETS.potholeClose,
                tag: 'MACRO CARD',
                subtitle: 'Crater profile: 45cm width, 15cm depth, subgrade exposed'
              }
            ]
          }
        ]);
      } else {
        setVideoDatasets([
          {
            id: 'dataset-gen-1',
            name: `Edge Telemetry Dataset (${ticket.busId || 'DTC-BUS'})`,
            folder: `recordings/${ticket.ward.replace(/\s+/g, '-').toLowerCase()}`,
            videos: 1,
            totalSize: '120MB',
            date: '2023-10-24',
            description: `Edge surveillance and telemetry dataset captured near ${ticket.locationName}.`,
            videoUrls: [],
            mediaItems: [
              {
                title: 'Primary Incident Detection Frame',
                type: 'image',
                url: ticket.imageUrl,
                tag: 'PRIMARY CAPTURE',
                subtitle: ticket.locationName
              }
            ]
          }
        ]);
      }
    };
    loadDatasets();
  }, [ticket.id, ticket.category, ticket.ticketNumber, ticket.busId, ticket.ward, ticket.locationName, ticket.imageUrl]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentText = newComment.trim();
    onAddComment(ticket.id, commentText);

    // Optimistic addition to local state
    const optimisticComment = {
      id: `c-local-${Date.now()}`,
      author: 'Rajesh K. (Field Officer)',
      avatar: ASSETS.adminAvatar,
      role: 'Zonal Inspector',
      time: 'Just now',
      text: commentText
    };
    setLocalComments((prev) => [...prev, optimisticComment]);
    setNewComment('');
  };

  const handleAssignWork = async () => {
    if (!selectedCrew) {
      alert('Please select a crew team');
      return;
    }

    setIsAssigningWork(true);
    try {
      const res = await fetch(`/api/defects/${ticket.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewName: selectedCrew.name,
          crewTeam: selectedCrew.team,
          crewLead: {
            name: selectedCrew.lead,
            avatar: selectedCrew.avatar
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          onUpdateStatus(ticket.id, 'ASSIGNED');
          alert(`✓ Work order assigned to ${selectedCrew.name}`);
        }
      } else {
        alert('Failed to assign work order. Please try again.');
      }
    } catch (err) {
      console.error('Work assignment error:', err);
      alert('Error assigning work order');
    } finally {
      setIsAssigningWork(false);
    }
  };

  const handleFetchAiWorkOrder = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          location: ticket.locationName,
          category: ticket.category
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F7] dark:bg-black overflow-y-auto custom-scrollbar">
      {/* Top Apple Header / Breadcrumb & Actions */}
      <div className="glass-card px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 m-4 sm:m-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
            title="Back to Tickets"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white">
                {ticket.ticketNumber}
              </h2>
              <span
                className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                  ticket.severity === 'CRITICAL' || ticket.severity === 'HIGH'
                    ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                    : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                }`}
              >
                {ticket.severity}
              </span>
              <span className="bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
                {ticket.category}
              </span>
            </div>
            <p className="text-xs text-[#86868b]">{ticket.title}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCctvOpen(true)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[15px] animate-pulse">videocam</span>
            <span>View CCTV Clip</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Ticket ${ticket.ticketNumber} flagged as duplicate.`)}
            className="btn-apple-secondary px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#86868b]">content_copy</span>
            <span>{t.markDuplicate}</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Ticket ${ticket.ticketNumber} escalated to Zonal Commissioner.`)}
            className="px-3.5 py-1.5 bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">priority_high</span>
            <span>{t.escalate}</span>
          </button>

          {ticket.status === 'NEW' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'ASSIGNED')}
              className="btn-apple-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
              <span>Dispatch Work Order</span>
            </button>
          )}

          {ticket.status === 'ASSIGNED' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
              className="px-4 py-1.5 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">handyman</span>
              <span>Start On-Site Work</span>
            </button>
          )}

          {ticket.status === 'IN_PROGRESS' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'RESOLVED')}
              className="px-4 py-1.5 bg-[#34C759] hover:bg-[#34C759]/90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Mark as Resolved</span>
            </button>
          )}

          {ticket.status === 'RESOLVED' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(ticket.id, 'IN_PROGRESS')}
              className="btn-apple-secondary px-4 py-1.5 text-xs font-semibold cursor-pointer"
            >
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      {/* Visual 4-Step Progress Banner */}
      <div className="mx-4 sm:mx-6 mb-6">
        <div className="glass-card p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#34C759]/10 flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-[#34C759] text-white flex items-center justify-center text-[10px] font-bold mb-1">
              ✓
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">1. AI Detection</span>
            <span className="text-[10px] text-[#86868b] font-mono">Bus Dashcam</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status !== 'NEW'
                ? 'bg-[#34C759]/10'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status !== 'NEW' ? 'bg-[#34C759] text-white' : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status !== 'NEW' ? '✓' : '2'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">2. Work Order</span>
            <span className="text-[10px] text-[#86868b] font-mono">Crew Assigned</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED'
                ? 'bg-[#0071E3]/15'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status === 'RESOLVED'
                  ? 'bg-[#34C759] text-white'
                  : ticket.status === 'IN_PROGRESS'
                  ? 'bg-[#0071E3] text-white animate-pulse'
                  : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status === 'RESOLVED' ? '✓' : '3'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">3. On-Site Repair</span>
            <span className="text-[10px] text-[#86868b] font-mono">Crew Active</span>
          </div>

          <div
            className={`p-3 rounded-xl flex flex-col items-center transition-all ${
              ticket.status === 'RESOLVED'
                ? 'bg-[#34C759]/20'
                : 'bg-black/5 dark:bg-white/5 opacity-60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                ticket.status === 'RESOLVED' ? 'bg-[#34C759] text-white' : 'bg-black/20 text-[#86868b]'
              }`}
            >
              {ticket.status === 'RESOLVED' ? '✓' : '4'}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white text-[11px]">4. Verified & Closed</span>
            <span className="text-[10px] text-[#86868b] font-mono">Quality Sign-off</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full pb-24">
        {/* Left Col (7 cols): Evidence & Location */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* AI Evidence Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">photo_camera</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.detectionEvidence}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-black/5 dark:bg-white/10 p-0.5 rounded-lg text-[11px] font-medium">
                  {ticket.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setActivePhotoTab('video')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        activePhotoTab === 'video'
                          ? 'bg-[#FF3B30] text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px] animate-pulse">play_circle</span>
                      <span>15s Video Clip</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab('dashcam')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      activePhotoTab === 'dashcam'
                        ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">videocam</span>
                    <span>Dashcam Still</span>
                  </button>
                  {ticket.secondaryImageUrl && (
                    <button
                      type="button"
                      onClick={() => setActivePhotoTab('closeup')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        activePhotoTab === 'closeup'
                          ? 'bg-[#0071E3] text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">zoom_in</span>
                      <span>Close-up</span>
                    </button>
                  )}
                </div>
                <span className="bg-[#34C759]/10 text-[#34C759] text-xs font-mono font-semibold px-2.5 py-1 rounded-full border border-[#34C759]/20">
                  AI Match: {ticket.confidence}%
                </span>
              </div>
            </div>

            {/* Media Viewport */}
            <div className="relative bg-black min-h-[320px] flex items-center justify-center overflow-hidden group">
              {activePhotoTab === 'video' && ticket.videoUrl ? (
                <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video
                    key={ticket.videoUrl}
                    src={ticket.videoUrl}
                    poster={ticket.imageUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md pointer-events-none border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>{ticket.busId || 'DTC-BUS'} • {ticket.category === 'Sanitation' ? '12s REAR DASHCAM STREAM' : ticket.category === 'Water Logging' ? '12s SIDE-CAM HYDRAULIC FEED' : ticket.category === 'Streetlights' ? '12s NIGHT DASHCAM STREAM' : '15s YOLO-v8 DASHCAM CLIP'}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/15 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
                    <span>30 FPS • H.264 HD</span>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={
                      activePhotoTab === 'closeup' && ticket.secondaryImageUrl
                        ? ticket.secondaryImageUrl
                        : ticket.imageUrl || ASSETS.potholeClose
                    }
                    alt={ticket.title}
                    className="w-full h-auto max-h-[460px] object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = ASSETS.potholeClose;
                    }}
                  />

                  {/* Annotation Overlay for Close-Up inspection mode */}
                  {activePhotoTab === 'closeup' && (
                    <div className={`absolute rounded-md pointer-events-none flex flex-col justify-between p-2 animate-pulse ${
                      ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799'
                        ? 'top-[15%] left-[20%] w-[58%] h-[55%] border-2 border-[#FF9F0A] bg-[#FF9F0A]/15'
                        : ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855'
                        ? 'top-[22%] left-[24%] w-[52%] h-[50%] border-2 border-[#0071E3] bg-[#0071E3]/15'
                        : ticket.category === 'Streetlights'
                        ? 'top-[18%] left-[30%] w-[45%] h-[55%] border-2 border-[#FFCC00] bg-[#FFCC00]/15'
                        : 'top-[28%] left-[26%] w-[48%] h-[45%] border-2 border-[#FF3B30] bg-[#FF3B30]/15'
                    }`}>
                      <div className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full self-start shadow ${
                        ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799'
                          ? 'bg-[#FF9F0A] text-slate-950'
                          : ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855'
                          ? 'bg-[#0071E3] text-white'
                          : ticket.category === 'Streetlights'
                          ? 'bg-[#FFCC00] text-slate-950'
                          : 'bg-[#FF3B30] text-white'
                      }`}>
                        {ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799'
                          ? `SEWER OVERFLOW: ${ticket.confidence}%`
                          : ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855'
                          ? `PIPE BURST / FLOODING: ${ticket.confidence}%`
                          : ticket.category === 'Streetlights'
                          ? `STREETLIGHT OUTAGE: ${ticket.confidence}%`
                          : `POTHOLE: ${ticket.confidence}%`}
                      </div>
                      <div className="bg-black/85 text-white font-mono text-[9.5px] px-2 py-0.5 rounded-md self-end flex items-center gap-1 border border-white/10">
                        {ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799' ? (
                          <span>Overflow: ~3m radius • Manhole: NEH-14G</span>
                        ) : ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855' ? (
                          <span>Pipe: 600mm • Flood: 1.8m • Flow: ~800L/min</span>
                        ) : ticket.category === 'Streetlights' ? (
                          <span>Pole: 8m • Defl: 45° • Cable: ~30cm</span>
                        ) : (
                          <>
                            <span>Depth: ~15cm</span>
                            <span>•</span>
                            <span>Width: 45cm</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Edge Telemetry Badge */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/15 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
                    <span>{ticket.detectedBy || 'YOLO-v8 Edge Vision'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Comprehensive Telemetry & Event Overview Grid */}
            <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] block">Severity</span>
                  <span className={`font-bold font-mono flex items-center gap-1 mt-0.5 ${
                    ticket.severity === 'CRITICAL' ? 'text-[#FF3B30]' : 'text-[#FF9500]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                      ticket.severity === 'CRITICAL' ? 'bg-[#FF3B30]' : 'bg-[#FF9500]'
                    }`}></span>
                    {ticket.severity}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] block">Detected By</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate block mt-0.5">
                    {ticket.detectedBy || 'Transit AI Dashcam'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] block">Dimensions</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white block mt-0.5">
                    {ticket.category === 'Sanitation' || ticket.ticketNumber === 'TK-8799'
                      ? 'Overflow: ~3m radius | Manhole: NEH-14G'
                      : ticket.category === 'Water Logging' || ticket.ticketNumber === 'TK-8855'
                      ? 'Pipe: 600mm | Flood: 1.8m | ~800L/min'
                      : ticket.category === 'Streetlights'
                      ? 'Pole: 8m | Defl: 45° | Cable: ~30cm'
                      : ticket.estimatedDimensions 
                      ? `W:${ticket.estimatedDimensions.widthCm}cm | D:${ticket.estimatedDimensions.depthCm}cm | ${ticket.estimatedDimensions.volumeM3}m³`
                      : 'W: 45cm | D: 15cm | 0.38m³'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] block">Department & SLA</span>
                  <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                    {ticket.department} ({ticket.slaRemaining || '4 hours'})
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed pt-2 border-t border-black/5 dark:border-white/10">
                <span className="font-bold text-slate-900 dark:text-white">Incident Analysis: </span>
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">pin_drop</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.preciseLocation}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                {ticket.ward}
              </span>
            </div>

            <div className="relative h-48 bg-slate-900">
              <img
                src={ASSETS.mapBase}
                alt="Map Snapshot"
                className="w-full h-full object-cover opacity-60"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = ASSETS.mapDelhi;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                </div>
              </div>
            </div>

            <div className="p-4 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{ticket.locationName}</p>
                <p className="text-[11px] text-[#86868b] font-mono">{ticket.coordinates?.formatted || '28.6139° N, 77.2090° E'}</p>
              </div>
              <button
                type="button"
                onClick={() => alert(`Coordinates copied: ${ticket.coordinates?.formatted}`)}
                className="btn-apple-secondary px-3 py-1 text-xs font-semibold cursor-pointer"
              >
                Copy GPS
              </button>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): SLA, AI Action Plan & Timeline */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SLA Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">SLA Resolution Countdown</h3>
              <span className="text-xs font-mono font-bold text-[#FF3B30]">{ticket.slaRemaining}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Department:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{ticket.department}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Assigned Crew:</span>
              <strong className="text-slate-900 dark:text-white font-medium">{ticket.assignedTo?.name || 'Not Assigned'}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868b]">Logged Timestamp:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{ticket.timestamp}</strong>
            </div>

            {/* Work Assignment UI - Only for NEW tickets */}
            {ticket.status === 'NEW' && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2.5">
                  <span className="material-symbols-outlined text-[14px] inline mr-1">assignment</span>
                  Assign Work Order to Crew
                </label>
                <div className="flex flex-col gap-2">
                  <select
                    value={selectedCrew?.id || ''}
                    onChange={(e) => {
                      const crew = crewList.find(c => c.id === e.target.value);
                      setSelectedCrew(crew || null);
                    }}
                    className="w-full bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-3 py-2.5 border border-black/10 dark:border-white/10 focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] outline-none transition-all"
                  >
                    <option value="">Select a crew team...</option>
                    {crewList.map((crew) => (
                      <option key={crew.id} value={crew.id}>
                        {crew.name} ({crew.team})
                      </option>
                    ))}
                  </select>

                  {selectedCrew && (
                    <div className="bg-[#0071E3]/10 border border-[#0071E3]/30 rounded-lg p-2.5 text-[11px]">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={selectedCrew.avatar} alt={selectedCrew.lead} className="w-5 h-5 rounded-full object-cover" />
                        <strong className="text-slate-900 dark:text-white">{selectedCrew.lead}</strong>
                      </div>
                      <p className="text-[#86868b] text-[10px]">{selectedCrew.team}</p>
                      <p className="text-[#86868b] text-[10px] font-mono">{selectedCrew.phone}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAssignWork}
                    disabled={isAssigningWork || !selectedCrew}
                    className="w-full bg-[#0071E3] hover:bg-[#0071E3]/90 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">{isAssigningWork ? 'hourglass_empty' : 'assignment_turned_in'}</span>
                    <span>{isAssigningWork ? 'Assigning...' : 'Create & Assign Work Order'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Engineering Action Plan & Materials Estimator */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">psychology</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Engineering Repair Plan</h3>
              </div>
              <button
                type="button"
                onClick={handleFetchAiWorkOrder}
                disabled={isLoadingAi}
                className="text-[11px] font-bold text-[#0071E3] hover:text-[#0071E3]/80 flex items-center gap-1 bg-[#0071E3]/10 px-3 py-1 rounded-full cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                <span>{isLoadingAi ? 'Synthesizing...' : '✨ Refresh AI Plan'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl border border-black/5 dark:border-white/10">
              <strong className="text-slate-900 dark:text-white block mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0071E3]">build_circle</span>
                Recommended Procedure:
              </strong>
              <p className="whitespace-pre-line">{effectiveActionPlan}</p>
            </div>

            <div>
              <strong className="text-xs text-slate-900 dark:text-white block mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#0071E3]">inventory_2</span>
                Estimated Materials Bill:
              </strong>
              <div className="flex flex-wrap gap-1.5">
                {effectiveMaterials.map((mat, i) => (
                  <span key={i} className="text-[11px] font-medium bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/10">
                    • {mat}
                  </span>
                ))}
              </div>
            </div>

            {effectiveHazards && effectiveHazards.length > 0 && (
              <div className="bg-[#FF3B30]/5 dark:bg-[#FF3B30]/10 p-3.5 rounded-2xl border border-[#FF3B30]/20">
                <strong className="text-xs text-[#FF3B30] block mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#FF3B30]">warning</span>
                  Identified Engineering & Public Safety Hazards:
                </strong>
                <ul className="list-disc pl-4 text-[11px] text-slate-700 dark:text-slate-300 flex flex-col gap-1">
                  {effectiveHazards.map((hz, i) => (
                    <li key={i}>{hz}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Video Datasets & Media Evidence Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0071E3]">movie</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Related Video Datasets & Media Evidence</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#0071E3]/10 text-[#0071E3] px-2.5 py-0.5 rounded-full">
                {videoDatasets.length} datasets
              </span>
            </div>

            {isLoadingDatasets ? (
              <div className="text-xs text-[#86868b] py-4 text-center">
                <span className="inline-block animate-spin mr-2">⏳</span>
                Loading datasets...
              </div>
            ) : videoDatasets.length > 0 ? (
              <div className="flex flex-col gap-3">
                {videoDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="p-3.5 bg-black/5 dark:bg-white/[0.05] rounded-2xl border border-black/10 dark:border-white/10 flex flex-col gap-2.5 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#0071E3] transition-colors">
                          {dataset.name}
                        </h4>
                        <p className="text-[10px] text-[#86868b] font-mono mt-0.5">{dataset.date}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                        {dataset.videos} files
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                      {dataset.description}
                    </p>

                    {/* Media Items (Videos and High-Res Images) */}
                    {dataset.mediaItems && dataset.mediaItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
                        {dataset.mediaItems.map((media, mIdx) => (
                          <div
                            key={mIdx}
                            className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black flex flex-col group/media"
                          >
                            <div className="relative aspect-video w-full bg-black">
                              {media.type === 'video' ? (
                                <video
                                  controls
                                  preload="metadata"
                                  playsInline
                                  className="w-full h-full object-cover"
                                  src={media.url}
                                />
                              ) : (
                                <div
                                  className="w-full h-full cursor-pointer relative"
                                  onClick={() => {
                                    if (media.url === ticket.secondaryImageUrl) {
                                      setActivePhotoTab('closeup');
                                    } else {
                                      setActivePhotoTab('dashcam');
                                    }
                                  }}
                                >
                                  <img
                                    src={media.url}
                                    alt={media.title}
                                    className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = ASSETS.potholeClose;
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-[10px] text-white font-medium bg-[#0071E3] px-2 py-0.5 rounded-md">
                                      Inspect Photo ↗
                                    </span>
                                  </div>
                                </div>
                              )}
                              {media.tag && (
                                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                                  {media.tag}
                                </span>
                              )}
                            </div>
                            <div className="p-2 bg-slate-900 text-white flex flex-col gap-0.5">
                              <span className="text-[11px] font-semibold truncate text-white">{media.title}</span>
                              {media.subtitle && (
                                <span className="text-[9.5px] text-slate-400 line-clamp-1">{media.subtitle}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : dataset.videoUrls && dataset.videoUrls.length > 0 ? (
                      <div className="overflow-hidden rounded-md border border-black/10 dark:border-white/10 bg-black">
                        <video
                          controls
                          preload="metadata"
                          playsInline
                          className="w-full h-28 object-cover bg-black"
                          src={dataset.videoUrls[0]}
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-[10px] text-[#86868b] pt-1 border-t border-black/5 dark:border-white/5">
                      <span>📁 {dataset.folder}</span>
                      <span className="font-mono">{dataset.totalSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#86868b] py-4 text-center">
                No video datasets available for this location
              </div>
            )}
          </div>

          {/* Comment Stream / Officer Notes & Field Updates */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#0071E3]">note_alt</span>
                Officer Notes & Field Updates
              </h3>
              <span className="text-xs font-mono font-bold bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full">
                {localComments.length} notes
              </span>
            </div>

            {/* Notes List with Image Evidence */}
            <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
              {localComments.length > 0 ? (
                localComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 bg-black/5 dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/10 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-7 h-7 rounded-full object-cover border border-black/10 dark:border-white/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#0071E3]/15 text-[#0071E3] flex items-center justify-center font-bold text-xs">
                            {comment.author.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                              {comment.author}
                            </strong>
                            <span className="text-[9.5px] font-medium bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full font-mono">
                              {comment.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#86868b] font-mono">{comment.time}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-9">
                      {comment.text}
                    </p>

                    {/* Attached Field Evidence Image */}
                    {comment.attachmentUrl && (
                      <div className="ml-9 mt-1 p-2 rounded-xl bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 flex flex-col gap-1.5 max-w-md group">
                        <div
                          className="relative overflow-hidden rounded-lg aspect-video bg-black cursor-pointer"
                          onClick={() => {
                            if (comment.attachmentUrl === ticket.secondaryImageUrl) {
                              setActivePhotoTab('closeup');
                            } else {
                              setActivePhotoTab('dashcam');
                            }
                          }}
                          title="Click to view full image in inspection panel"
                        >
                          <img
                            src={comment.attachmentUrl}
                            alt={comment.attachmentLabel || 'Attached field evidence'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-[#34C759]">verified</span>
                            <span>FIELD EVIDENCE</span>
                          </div>
                        </div>
                        {comment.attachmentLabel && (
                          <div className="flex items-center justify-between text-[10.5px] text-slate-600 dark:text-slate-400 px-1 font-mono">
                            <span className="truncate">{comment.attachmentLabel}</span>
                            <span
                              onClick={() => {
                                if (comment.attachmentUrl === ticket.secondaryImageUrl) {
                                  setActivePhotoTab('closeup');
                                } else {
                                  setActivePhotoTab('dashcam');
                                }
                              }}
                              className="text-[#0071E3] text-[10px] font-sans font-semibold shrink-0 cursor-pointer hover:underline"
                            >
                              Inspect Photo ↗
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#86868b] py-2 text-center">
                  No officer notes logged yet. Add first note below.
                </div>
              )}
            </div>

            {/* Note submission form */}
            <form onSubmit={handlePostComment} className="flex flex-col gap-2.5 pt-2 border-t border-black/5 dark:border-white/10">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add inspection notes or dispatch instructions..."
                className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl text-xs resize-none outline-none focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-1 focus:ring-[#0071E3] transition-all text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="btn-apple-primary self-end px-4 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      </div>

      <CctvFootageModal
        isOpen={isCctvOpen}
        onClose={() => setIsCctvOpen(false)}
        language={language}
        item={activeCctvItem}
      />
    </div>
  );
};
