import { 
  DefectItem, 
  LiveFeedDetection, 
  BusFleetItem, 
  SystemAlert, 
  AutoRoutingRule, 
  CrossAgencyTicket, 
  AgencyContact, 
  DepartmentMetric, 
  DefectHotspot,
  BusCabinIncident,
  AccidentZoneBlackspot,
  UIDAIStylePortalSection
} from '../types';

export const ASSETS = {
  emblem: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDETjAGXjgRghlQZhPFhpiFo38lB0sj_2uzu0_tvK522T0Fy9njGUK7y8MXtgkjuGFXCsi_niNKwEM1scegn-jrHqw_NK45P5I-dJ3eZgli5bHKwy8p6Yp78WESy4c8QThLdouHvbxVFQFFksjjM0ZeUPBC69tct9YgdqedKSwyHBcG16zGJKIBb9UueUP8Src0PLhdQiB7_Bu9XAir9ZdTknwm-rbt6iXHLYak-KVUvG8IspNUEFfU',
  adminAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8QDgUqO8B7Osb3Sk65E0tpcJ49CzH-ISb56yMsko4vUwFwSUeLMNrTsmsdpDZlcmmhu1ciUMwea6EGqWeNBqZ13UC6JUbfxnXK2DZGwpbTV3e-oDPHIgNmILfLiLo9-lmEvokYbTM_PRFlO143iLgEbBkZ9ey8B1rkTKWqgyDCpnvVyppvqF77JUKPQtYXkwpmSNfuG_rmJw0p779T7aDVDFfR2MfofZC9GqGNdpv-ZSg2BgHUijZ',
  sharmaAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvunsBDQBmM-3nvZVqM_znUXV0iBgUX6nijaIQbAlmLG4hllblBUvG29Zn6zFupatdAeX7pw1wgBufdULqk_R9Ae2gEWdxOMbn5BE379G0ZKPbTXIM_ZrNcwE2AP_cNVNQeJBXblZZMVYVjSQpLFwA3gHo7fZbHSJRCRaoL6_K-TvQrueao5FrfTGI27P-OO4GjhT4Y8bNyYqy5lZnqIVIam7-GKlhR1wTQvfc5PVZWIjJf1c-J3ae',
  teamBAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW6PU2pck6jHASoRlh3b38smlCH43VpMTSzw-X3SdHXTG5_7x2mr398Tm8r5KCQoqug9J5aLyGMVUiPtPBMtYkqV9vWeQAmEihyic_vlaoSvDzVuNLz6J5gjWwoUG6kAWFm-xwGYSq5G3vXe28M9awXnVETmQnFbQ7JtIfD5UZ8EpdxQ4IkP4vT4nMPwHFDr71rQwUplCCA-agcCBTO2dmFrnR6Tp7oegEbd9Tp2Q3fN1dEDyRIBUF',
  mapBase: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUBVKQhiVx2MVFg5FdeTMxU3m9fw_AkagnlD6Z_087F8KwUa_NFN4xG9lrmwxAuNS_iNdFba_R8ZxMqxSVOXEXqR_j8xqUebxBR4H0r6S2W3wMLluRcabXiAZtI5QEcTbaXtDj-tcIdpDFzHA-rOMCA4_s59Oj96OXTzR5JT8lsQ_wI9-DtupNgWWzKn1oO2fgR_qD1sFOjZ-Nvf99MfEjXhcA6CRtUEKHDZsdA1SRN7TRHaLmfy9E',
  mapDelhi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALg7D48n5cPFiVZSJsSXCzJ8cAcoDYAJX5Cos6a-otJjUsTxT4AWVp2ONkokoJfWFxoGIKSFbGR7qZFPjJ5cHGryahZD6u8aRBM-NkTzWwoUR43JnelFPcN0Ednmtuk-M_4LIryH-5zHP4F8ES5XwtGMtR9acevRYNhHzkVJM4nmA4335vFzEJo0HlXfOwO39xFjjXxnCO4c7jl3TSNOu6OVGkWUOjS-z-TZqKjLCQw2_ypMT61q9g',
  mapIntersection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRPS5jHCghG9XzG9-jAia7uM3hmbsHp8YHD1ICv6mdRqA-Hv18aymoVdYXvMxpjSVzJQyhHYZOGjkjAyPJMhihFqfRVr7YCL7JT3S3hka0r0e4Zd1BFeSOZRjOL4UPtLtlksM-68NFPMrsnEazTlYEwZVqbW39RIrr3L40AlwdLOY5Ju1mVrR-6UAX-W1lvfREOtKC30OHfwZWUr7bRFL0LBv7URUwBPP4HMHbpCbE7iJTKFoq0eN',
  potholeDashcam: '/assets/defects/severe_pothole_dashcam.jpg',
  potholeClose: '/assets/defects/severe_pothole_thumb.jpg',
  potholeVideo: '/assets/videos/pothole_dashcam_clip.mp4',
  streetlightVideo: '/assets/videos/streetlight_dashcam_clip.mp4',
  streetlightBroken: '/assets/defects/dangling_streetlight_dashcam.jpg',
  pipeBurst: '/assets/defects/pipe_burst_dashcam.jpg',
  pipeBurstThumb: '/assets/defects/pipe_burst_thumb.jpg',
  pipeBurstVideo: '/assets/videos/pipe_burst_dashcam_clip.mp4',
  sewerOverflow: '/assets/defects/sewer_overflow_dashcam.jpg',
  sewerOverflowThumb: '/assets/defects/sewer_overflow_thumb.jpg',
  sewerOverflowVideo: '/assets/videos/sewer_overflow_clip.mp4',
  potholeSevereThumb: '/assets/defects/severe_pothole_thumb.jpg',
  overflowingBinThumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY86PZIRygMTfJEYciq2blkinkXHgWzmH3u0sKctWEmYXH-2G2T0smqbEawqKJx_FuEPoUI4MmafZkTX0HHIUCSupMgSCNvezj-3eY5yDcs0FxzabKw1AlggcqYLp5LvrLsm1eDDKaoevX4UlsfutLpTgHVln-FbIkD14kgmv0Eo_c_mJwWnHNkSBndYfIZRTjSRCp2pRpg9E4_Bx5Y24KtAOFhYr2ShsGq1zGmRDA5krruBOV9IVx',
  brokenStreetlightThumb: '/assets/defects/dangling_streetlight_thumb.jpg',
  blueprintLogin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm6Sd9Xm1cjJF_Qo-Zs8ueUfM7Gh9Z94tndwbPnlfIomcvs719zr5PEOu2-F44O1SeugcHGwZBGDbvHCzUnZI46iKrGvER-lfhB9b151Z6jjKyQ2iR9ItktLjuHVbbrNnudMi6yxdXuQpUZbgt9Pi2FqYA4xLG9EuEykzz8G1c-r2mI-uP8JGR3XlezW_MthyzuhectXX1DfQym5W2ffXlacXgJDf86h99h8p58y-rYBKQ3n1iojsb'
};

export const INITIAL_DEFECTS: DefectItem[] = [
  {
    id: '1',
    ticketNumber: 'TK-8921',
    title: 'Severe Asphalt Pothole',
    category: 'Potholes',
    severity: 'CRITICAL',
    confidence: 98.4,
    locationName: 'MG Road / Outer Ring Road, near Metro Pillar 42',
    coordinates: {
      lat: 28.6139,
      lng: 77.2090,
      formatted: '28.6139° N, 77.2090° E'
    },
    ward: 'Ward C - Central',
    timestamp: '24 Oct 2023, 10:42 AM',
    timeAgo: '10:42:15 AM',
    imageUrl: ASSETS.potholeDashcam,
    secondaryImageUrl: ASSETS.potholeClose,
    videoUrl: ASSETS.potholeVideo,
    hasOverlay: false,
    busId: 'DTC-BUS-402',
    detectedBy: 'Front dashcam YOLO-v8, DTC-BUS-402',
    estimatedDimensions: {
      widthCm: 45,
      depthCm: 15,
      volumeM3: 0.38
    },
    department: 'Roads & Bridges',
    slaRemaining: '04h 00m',
    isOverdue: false,
    description: 'A severely degraded urban road surface shot from a moving DTC bus dashcam perspective. The cracked and crumbling asphalt shows a dangerous crater, depth >15cm and width ~45cm (estimated volume: 0.38m³). The pothole sits on a dual-lane carriageway at an intersection near Metro Pillar 42. Captured by front dashcam YOLO-v8 on DTC-BUS-402 at 34 km/h with 98.4% confidence. Severe hazard for two-wheelers and buses.',
    status: 'NEW',
    comments: [
      {
        id: 'c1',
        author: 'DTC-BUS-402 Edge AI',
        role: 'Computer Vision Core (YOLO-v8)',
        time: '10:42 AM',
        text: 'Automated defect detection triggered via DTC-BUS-402 front dashcam YOLO-v8. Dimensions: W: 45cm | D: 15cm | Vol: 0.38m³. Confidence: 98.4%.',
        attachmentUrl: ASSETS.potholeDashcam,
        attachmentType: 'image',
        attachmentLabel: 'DTC-BUS-402 Front Dashcam YOLO-v8 Capture (34 km/h)'
      },
      {
        id: 'c2',
        author: 'Rajesh K.',
        avatar: ASSETS.adminAvatar,
        role: 'Admin / Triage Officer',
        time: '10:45 AM',
        text: 'Verified severity as CRITICAL. 4-hour SLA initiated for Roads & Bridges emergency hot-mix crew.',
        attachmentUrl: ASSETS.potholeClose,
        attachmentType: 'image',
        attachmentLabel: 'Macro Defect Inspection: 15cm Depth Asphalt Crater Profile'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Front dashcam YOLO-v8 (DTC-BUS-402)', time: '10:42 AM', completed: true },
      { title: 'Verified', subtitle: 'Admin_Rajesh', time: '10:45 AM', completed: true },
      { title: 'Ticket Created', subtitle: 'System', time: '10:46 AM', completed: true, active: true },
      { title: 'Assigned', subtitle: 'Roads & Bridges Crew', time: 'Pending', completed: false },
      { title: 'In Progress', subtitle: 'Crew dispatched', time: 'Pending', completed: false },
      { title: 'Resolved', subtitle: 'Field sign-off', time: 'Pending', completed: false }
    ]
  },
  {
    id: '2',
    ticketNumber: 'TK-8890',
    title: 'Dangling Streetlight Fixture & Live Wire Outage',
    category: 'Streetlights',
    severity: 'HIGH',
    confidence: 92.0,
    locationName: 'Sector 14 Main Avenue, Pole ID LGT-401',
    coordinates: {
      lat: 28.6250,
      lng: 77.2180,
      formatted: '28.6250° N, 77.2180° E'
    },
    ward: 'Ward B - South',
    timestamp: '24 Oct 2023, 08:18 PM',
    timeAgo: '20:18:42 PM',
    imageUrl: ASSETS.streetlightBroken,
    secondaryImageUrl: ASSETS.brokenStreetlightThumb,
    videoUrl: ASSETS.streetlightVideo,
    hasOverlay: false,
    busId: 'DTC-BUS-118',
    detectedBy: 'Front dashcam, DTC-BUS-118',
    estimatedDimensions: {
      widthCm: 80,
      depthCm: 45,
      volumeM3: 0.30
    },
    assignedTo: {
      name: 'R. Sharma',
      avatar: ASSETS.sharmaAvatar,
      team: 'Electrical Section'
    },
    department: 'Electrical & Lighting',
    slaRemaining: '04h 00m',
    isOverdue: false,
    description: 'Nighttime urban street scene. A single metal streetlight pole leans at a 45° angle after storm wind damage. The luminaire head is dangling, held only by exposed electrical wires (~30cm visible). Surrounding area is poorly lit giving a dark, high-contrast scene with only the bus headlights and distant traffic illuminating the scene. Captured by front dashcam on DTC-BUS-118 with 92% confidence. High electrocution hazard.',
    status: 'ASSIGNED',
    comments: [
      {
        id: 'c3-1',
        author: 'DTC-BUS-118 Edge AI',
        role: 'Computer Vision Core (Night Patrol)',
        time: '08:18 PM',
        text: 'Automated defect detection triggered via DTC-BUS-118 front night dashcam. Deflection: 45° | Exposed wiring: ~30cm | Confidence: 92.0%. High electrocution hazard.',
        attachmentUrl: ASSETS.streetlightBroken,
        attachmentType: 'image',
        attachmentLabel: 'DTC-BUS-118 Front Dashcam POV (Sector 14 Main Ave)'
      },
      {
        id: 'c3-2',
        author: 'R. Sharma',
        avatar: ASSETS.sharmaAvatar,
        role: 'Lead Technician (Electrical)',
        time: '08:25 PM',
        text: 'Work order accepted. Line de-energization requested from BSES Substation 4. Aerial bucket truck dispatched to Pole LGT-401 for luminaire head replacement and cable re-splicing.',
        attachmentUrl: ASSETS.brokenStreetlightThumb,
        attachmentType: 'image',
        attachmentLabel: 'Field Macro Inspection: Dangling Luminaire Head & Live 30cm Cable'
      },
      {
        id: 'c3-3',
        author: 'Rajesh K.',
        avatar: ASSETS.adminAvatar,
        role: 'Electrical Zonal Officer',
        time: '08:30 PM',
        text: 'Safety perimeter established around Pole LGT-401. Traffic police notified for partial lane closure. Estimated repair turnaround: 2.5 hours under 4-hour SLA.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Front dashcam (DTC-BUS-118)', time: '08:18 PM', completed: true },
      { title: 'Verified', subtitle: 'Automated Rule R-042', time: '08:20 PM', completed: true },
      { title: 'Ticket Created', subtitle: 'Auto-Routed (Electrical)', time: '08:21 PM', completed: true },
      { title: 'Assigned', subtitle: 'R. Sharma', time: '08:25 PM', completed: true, active: true },
      { title: 'In Progress', subtitle: 'Bucket Truck Dispatched', time: 'Pending', completed: false },
      { title: 'Resolved', subtitle: 'Fixture Re-attached', time: 'Pending', completed: false }
    ]
  },
  {
    id: '3',
    ticketNumber: 'TK-8855',
    title: 'Water Main Burst & Road Flooding',
    category: 'Water Logging',
    severity: 'CRITICAL',
    confidence: 96.5,
    locationName: 'Civil Lines, opposite District Court Gate 1',
    coordinates: {
      lat: 28.6700,
      lng: 77.2250,
      formatted: '28.6700° N, 77.2250° E'
    },
    ward: 'Ward A - North',
    timestamp: '24 Oct 2023, 10:28 AM',
    timeAgo: '10:28:11 AM',
    imageUrl: ASSETS.pipeBurst,
    secondaryImageUrl: ASSETS.pipeBurstThumb,
    videoUrl: ASSETS.pipeBurstVideo,
    hasOverlay: false,
    busId: 'DTC-BUS-204',
    detectedBy: 'Left-side camera, DTC-BUS-204',
    estimatedDimensions: {
      widthCm: 180,
      depthCm: 60,
      volumeM3: 0.80
    },
    assignedTo: {
      name: 'Team B Emergency',
      avatar: ASSETS.teamBAvatar,
      team: 'Rapid Emergency Hydrology'
    },
    department: 'Water Supply & Sanitation',
    slaRemaining: '02h 00m',
    isOverdue: false,
    description: 'Daytime. Left-side side-camera view from DTC-BUS-204 looking out at a flooded road opposite District Court Gate 1. A 600mm high-pressure water main has ruptured at a flange joint, violently gushing muddy water 2m high from cracked asphalt and flooding 1.8m of the dual carriageway (~800L/min). Approaching vehicles and e-rickshaws detouring with extreme slowdown. Critical sinkhole and road washout hazard.',
    status: 'IN_PROGRESS',
    comments: [
      {
        id: 'c4',
        author: 'DTC-BUS-204 Edge AI',
        role: 'Side-Cam Vision Core',
        time: '10:28 AM',
        text: 'Automated hydraulic anomaly detection triggered via DTC-BUS-204 left-side camera. Classification: PIPE BURST / FLOODING (96.5%). Estimated flow: ~800L/min across 1.8m carriageway.',
        attachmentUrl: ASSETS.pipeBurst,
        attachmentType: 'image',
        attachmentLabel: 'DTC-BUS-204 Left-Side Camera Capture (Civil Lines, 18 km/h)'
      },
      {
        id: 'c5',
        author: 'Team B Lead',
        avatar: ASSETS.teamBAvatar,
        role: 'Supervisor (Hydrology)',
        time: '10:32 AM',
        text: 'Emergency crew mobilized. Upstream 600mm line isolation order issued to Civil Lines Pumping Station. Submersible dewatering pump en route.',
        attachmentUrl: ASSETS.pipeBurstThumb,
        attachmentType: 'image',
        attachmentLabel: 'Macro Defect Inspection: Ruptured Flange Crater & High-Pressure Hydraulic Plume'
      },
      {
        id: 'c6',
        author: 'Rajesh K.',
        avatar: ASSETS.adminAvatar,
        role: 'Admin / Triage Officer',
        time: '10:35 AM',
        text: 'Traffic Police North Zone alerted for contraflow diversion outside District Court Gate 1. Priority 1 repair protocol active.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Left-side camera (DTC-BUS-204)', time: '10:28 AM', completed: true },
      { title: 'Verified', subtitle: 'Admin_Rajesh (96.5% Conf)', time: '10:30 AM', completed: true },
      { title: 'Ticket Created', subtitle: 'Auto-Routed (Water Supply)', time: '10:31 AM', completed: true },
      { title: 'Assigned', subtitle: 'Team B Emergency', time: '10:32 AM', completed: true, active: true },
      { title: 'In Progress', subtitle: 'Isolation & Dewatering Active', time: '10:35 AM', completed: false },
      { title: 'Resolved', subtitle: 'Flange Replaced & Pressure Tested', time: 'Pending', completed: false }
    ]
  },
  {
    id: '4',
    ticketNumber: 'TK-8799',
    title: 'Sewer Line Overflow — Manhole Incident',
    category: 'Sanitation',
    severity: 'HIGH',
    confidence: 89.0,
    locationName: 'Nehru Park Outer Ring Road, Gate 3',
    coordinates: { lat: 28.5900, lng: 77.1950, formatted: '28.5900° N, 77.1950° E' },
    ward: 'Ward D - Central',
    timestamp: '24 Oct 2023, 12:35 PM',
    timeAgo: '12:35:48 PM',
    imageUrl: ASSETS.sewerOverflow,
    secondaryImageUrl: ASSETS.sewerOverflowThumb,
    videoUrl: ASSETS.sewerOverflowVideo,
    hasOverlay: false,
    busId: 'DTC-BUS-309',
    detectedBy: 'Rear camera, DTC-BUS-309',
    estimatedDimensions: {
      widthCm: 300,
      depthCm: 45,
      volumeM3: 0.90
    },
    assignedTo: {
      name: 'S. Kumar',
      avatar: ASSETS.sharmaAvatar,
      team: 'Sanitation Squad 4'
    },
    department: 'Sanitation & Waste',
    slaRemaining: '04h 15m',
    isOverdue: false,
    description: 'Rear camera view from departing DTC-BUS-309 at Nehru Park Outer Ring Road, Gate 3. A municipal manhole (ID: NEH-14G) on a footpath/road junction overflows with dark sewage effluent. A thick dark liquid spreads in a ~3m radius around the open manhole, covering the footpath. Pedestrians visibly detour around it. The area has a biohazard look — dark staining, foul texture.',
    status: 'IN_PROGRESS',
    comments: [
      {
        id: 'c7',
        author: 'DTC-BUS-309 Edge AI',
        role: 'Rear-Cam Vision Core',
        time: '12:35 PM',
        text: 'Automated biohazard sewer overflow detected via DTC-BUS-309 rear camera. Classification: SEWER OVERFLOW (89.0%). Overflow radius: ~3m | Manhole ID: NEH-14G.',
        attachmentUrl: ASSETS.sewerOverflow,
        attachmentType: 'image',
        attachmentLabel: 'DTC-BUS-309 Rear Dashcam Capture (Nehru Park Outer Ring Road, 24 km/h)'
      },
      {
        id: 'c8',
        author: 'S. Kumar',
        avatar: ASSETS.sharmaAvatar,
        role: 'Sanitation Supervisor',
        time: '12:40 PM',
        text: 'Sanitation Squad 4 dispatched with 14m³ super suction tanker and biocide wash crew. Footpath perimeter barricaded.',
        attachmentUrl: ASSETS.sewerOverflowThumb,
        attachmentType: 'image',
        attachmentLabel: 'Macro Defect Inspection: Displaced Manhole Lid NEH-14G & Effluent Stain Profile'
      },
      {
        id: 'c9',
        author: 'Rajesh K.',
        avatar: ASSETS.adminAvatar,
        role: 'Admin / Triage Officer',
        time: '12:42 PM',
        text: 'Priority HIGH ticket confirmed. Biohazard protocol activated for Nehru Park pedestrian corridor.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Rear camera (DTC-BUS-309)', time: '12:35 PM', completed: true },
      { title: 'Verified', subtitle: 'Admin_Rajesh (89.0% Conf)', time: '12:38 PM', completed: true },
      { title: 'Ticket Created', subtitle: 'Auto-Routed (Sanitation & Waste)', time: '12:39 PM', completed: true },
      { title: 'Assigned', subtitle: 'Sanitation Squad 4', time: '12:40 PM', completed: true, active: true },
      { title: 'In Progress', subtitle: 'Suction Jetting Active', time: '12:45 PM', completed: false },
      { title: 'Resolved', subtitle: 'Disinfected & Manhole Secured', time: 'Pending', completed: false }
    ]
  },
  {
    id: '5',
    ticketNumber: 'TK-8742',
    title: 'Unauthorized Vendor Encroachment',
    category: 'Encroachment',
    severity: 'MED',
    confidence: 87.4,
    locationName: 'Gandhi Nagar Market Road',
    coordinates: { lat: 28.6550, lng: 77.2750, formatted: '28.6550° N, 77.2750° E' },
    ward: 'Ward E - East',
    timestamp: '22 Oct 2023, 11:15 AM',
    timeAgo: '2 days ago',
    imageUrl: ASSETS.overflowingBinThumb,
    department: 'Encroachment Removal Cell',
    slaRemaining: 'Closed',
    isOverdue: false,
    description: 'Footpath cleared and warning notices issued to non-compliant commercial stalls.',
    status: 'VERIFIED_CLOSED'
  }
];

export const LIVE_FEED_ITEMS: LiveFeedDetection[] = [
  {
    id: 'feed-1',
    title: 'Severe Asphalt Pothole',
    category: 'Roads',
    severity: 'error',
    confidence: 98.4,
    location: 'MG Road / Outer Ring Road, near Metro Pillar 42',
    timestamp: '10:42:15 AM',
    imageUrl: ASSETS.potholeDashcam,
    hasImage: true,
    ticketId: 'TK-8921',
    busNode: 'DTC-BUS-402',
    speedKmh: 34,
    latencyMs: 24,
    fps: 29.8,
    bbox: { x: 38, y: 52, w: 21, h: 16 }
  },
  {
    id: 'feed-2',
    title: 'Sewer Line Overflow — Manhole Incident',
    category: 'Sanitation',
    severity: 'warning',
    confidence: 89.0,
    location: 'Nehru Park Outer Ring Road, Gate 3',
    timestamp: '12:35:48 PM',
    imageUrl: ASSETS.sewerOverflow,
    hasImage: true,
    ticketId: 'TK-8799',
    busNode: 'DTC-BUS-309',
    speedKmh: 24,
    latencyMs: 24,
    fps: 30.0,
    bbox: { x: 22, y: 55, w: 42, h: 36 }
  },
  {
    id: 'feed-3',
    title: 'Dangling Streetlight Fixture & Live Wire Outage',
    category: 'Streetlights',
    severity: 'warning',
    confidence: 92.0,
    location: 'Sector 14 Main Avenue, Pole ID LGT-401',
    timestamp: '08:18:42 PM',
    imageUrl: ASSETS.streetlightBroken,
    hasImage: true,
    ticketId: 'TK-8890',
    busNode: 'DTC-BUS-118',
    speedKmh: 28,
    latencyMs: 19,
    fps: 30.0,
    bbox: { x: 53, y: 21, w: 18, h: 42 }
  },
  {
    id: 'feed-4',
    title: 'Water Main Burst & Road Flooding',
    category: 'Drainage',
    severity: 'error',
    confidence: 96.5,
    location: 'Civil Lines, opposite District Court Gate 1',
    timestamp: '10:28:11 AM',
    imageUrl: ASSETS.pipeBurst,
    hasImage: true,
    ticketId: 'TK-8855',
    busNode: 'DTC-BUS-204',
    speedKmh: 18,
    latencyMs: 28,
    fps: 29.5,
    bbox: { x: 30, y: 22, w: 46, h: 52 }
  },
  {
    id: 'feed-5',
    title: 'Illegal Commercial Hoarding',
    category: 'Encroachment',
    severity: 'warning',
    confidence: 91.8,
    location: 'E-Lajpat Nagar Central',
    timestamp: '10:14:30 AM',
    imageUrl: ASSETS.overflowingBinThumb,
    hasImage: true,
    busNode: 'DTC-BUS-098',
    speedKmh: 29,
    latencyMs: 35,
    fps: 30.0,
    bbox: { x: 15, y: 20, w: 70, h: 50 }
  },
  {
    id: 'feed-6',
    title: 'Faded Pedestrian Zebra Crossing',
    category: 'Roads',
    severity: 'info',
    confidence: 87.3,
    location: 'Connaught Place Outer Ring',
    timestamp: '10:08:14 AM',
    imageUrl: ASSETS.potholeSevereThumb,
    hasImage: true,
    busNode: 'DTC-BUS-512',
    speedKmh: 36,
    latencyMs: 22,
    fps: 29.9,
    bbox: { x: 25, y: 55, w: 50, h: 30 }
  }
];

export const FLEET_BUSES: BusFleetItem[] = [
  {
    busId: 'DL-1PC-2104',
    route: '402-A',
    cameraStatus: 'Online',
    gpsSignal: 'full',
    lastSyncTime: '10:42:15 AM',
    kmScanned: 124.5,
    depot: 'Central Depot 1',
    coordinates: { x: 42, y: 32 }
  },
  {
    busId: 'DL-2PA-1180',
    route: '112-B',
    cameraStatus: 'Warning',
    gpsSignal: 'medium',
    lastSyncTime: '10:41:02 AM',
    kmScanned: 45.2,
    depot: 'Depot A (South)',
    coordinates: { x: 62, y: 52 },
    activeAlert: 'Storage 85% full'
  },
  {
    busId: 'DL-1PD-0422',
    route: '08-B',
    cameraStatus: 'Offline',
    gpsSignal: 'lost',
    lastSyncTime: '09:15:00 AM',
    kmScanned: 12.0,
    depot: 'West Hub',
    coordinates: { x: 22, y: 72 },
    activeAlert: 'Camera malfunction detected'
  },
  {
    busId: 'DL-1PB-3310',
    route: '520-C',
    cameraStatus: 'Online',
    gpsSignal: 'full',
    lastSyncTime: '10:43:00 AM',
    kmScanned: 98.4,
    depot: 'East Depot',
    coordinates: { x: 74, y: 28 }
  }
];

export const SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: 'alt-1',
    title: 'Camera malfunction',
    subtitle: 'Bus 204, Route 12',
    description: 'Primary dashcam feed dropped below 15 fps. Possible lens obstruction or connector issue.',
    time: '10:42 AM',
    type: 'critical',
    icon: 'videocam_off',
    unread: true
  },
  {
    id: 'alt-2',
    title: 'Low Storage (85%)',
    subtitle: 'Bus 118, Depot A',
    description: 'On-board solid state edge storage nearing threshold. Automatic offload queue initiated.',
    time: '10:15 AM',
    type: 'warning',
    icon: 'sd_storage',
    unread: true
  },
  {
    id: 'alt-3',
    title: 'GPS Signal Lost',
    subtitle: 'Bus 422, Route 8B',
    description: 'No telemetry heartbeat received for > 85 minutes. Last ping in Malad sector.',
    time: '09:15 AM',
    type: 'critical',
    icon: 'signal_cellular_connected_no_internet_0_bar',
    unread: false
  },
  {
    id: 'alt-4',
    title: 'New Critical Defect',
    subtitle: 'Major water main burst in Sector 4',
    description: 'Immediate multi-agency coordination required with Traffic Police & Hydrology.',
    time: '10:42 AM',
    type: 'critical',
    icon: 'warning',
    unread: true
  }
];

export const AUTO_ROUTING_RULES: AutoRoutingRule[] = [
  {
    id: 'R-001',
    name: 'Severe Pothole Heavy Crew Rule',
    condition: "IF {Type} == 'Pothole' AND {Est_Depth} > 5cm",
    action: "ASSIGN_TO: 'Roads Dept - Heavy Crew'\nSEVERITY: 'HIGH'\nSLA: 4h",
    isActive: true,
    department: 'Roads & Highways',
    severity: 'HIGH',
    sla: '4h'
  },
  {
    id: 'R-042',
    name: 'Electrical Hazard Rapid SLA',
    condition: "IF {Keyword} MATCHES 'Live Wire' OR {Type} == 'Transformer Sparking'",
    action: "ASSIGN_TO: 'Electricity Board - Rapid'\nSEVERITY: 'CRITICAL'\nSLA: 1h",
    isActive: true,
    department: 'Electricity Board',
    severity: 'CRITICAL',
    sla: '1h'
  },
  {
    id: 'R-089',
    name: 'Sanitation Bulk Garbage Clearance',
    condition: "IF {Type} == 'Overflowing Bin' AND {Volume_Est} > 2m3",
    action: "ASSIGN_TO: 'Sanitation Compactor Unit 3'\nSEVERITY: 'MED'\nSLA: 6h",
    isActive: true,
    department: 'Sanitation & Solid Waste',
    severity: 'MED',
    sla: '6h'
  }
];

export const CROSS_AGENCY_TICKETS: CrossAgencyTicket[] = [
  {
    id: 'ca-1',
    ticketCode: 'TCK-8902',
    issue: 'Pothole + Water Leak',
    originatingDept: 'Roads & Highways',
    receivingDept: 'Water Board',
    status: 'Pending Hand-off',
    hasUnreadMessage: true,
    lastUpdated: '10:30 AM',
    messagesCount: 4
  },
  {
    id: 'ca-2',
    ticketCode: 'TCK-8875',
    issue: 'Fallen Tree on Powerline',
    originatingDept: 'Parks & Rec',
    receivingDept: 'Electricity Dept',
    status: 'Urgent Action',
    hasUnreadMessage: false,
    lastUpdated: '09:45 AM',
    messagesCount: 2
  },
  {
    id: 'ca-3',
    ticketCode: 'TCK-8850',
    issue: 'Road Digging Debris',
    originatingDept: 'Telecom Board',
    receivingDept: 'Sanitation',
    status: 'In Progress',
    hasUnreadMessage: false,
    lastUpdated: '08:20 AM',
    messagesCount: 6
  },
  {
    id: 'ca-4',
    ticketCode: 'TCK-8812',
    issue: 'Traffic Signal Sync',
    originatingDept: 'Traffic Police',
    receivingDept: 'IT Infrastructure',
    status: 'Pending Hand-off',
    hasUnreadMessage: true,
    lastUpdated: 'Yesterday',
    messagesCount: 3
  },
  {
    id: 'ca-5',
    ticketCode: 'TCK-8799',
    issue: 'Sewer Line Collapse',
    originatingDept: 'Sanitation',
    receivingDept: 'Roads & Highways',
    status: 'Resolved',
    hasUnreadMessage: false,
    lastUpdated: '23 Oct',
    messagesCount: 8
  }
];

export const AGENCY_CONTACTS: AgencyContact[] = [
  {
    id: 'ag-1',
    name: 'Roads & Highways',
    officer: 'R. Sharma',
    designation: 'Nodal Officer',
    phone: '+91 11 2345 6780',
    available: true
  },
  {
    id: 'ag-2',
    name: 'Electricity Dept',
    officer: 'A. Patel',
    designation: 'Chief Engineer',
    phone: '+91 11 2345 6781',
    available: true
  },
  {
    id: 'ag-3',
    name: 'Sanitation & Solid Waste',
    officer: 'S. Kumar',
    designation: 'Director',
    phone: '+91 11 2345 6782',
    available: true
  },
  {
    id: 'ag-4',
    name: 'Traffic Police',
    officer: 'Control Room (24x7)',
    designation: 'Superintendent on Duty',
    phone: '+91 11 2345 6783',
    available: true
  }
];

export const DEPARTMENT_METRICS: DepartmentMetric[] = [
  {
    department: 'PWD (Roads & Bridges)',
    assigned: 1245,
    resolved: 1058,
    avgResTimeHrs: 48.5,
    slaCompliance: 85.0
  },
  {
    department: 'Water & Sanitation',
    assigned: 890,
    resolved: 641,
    avgResTimeHrs: 36.2,
    slaCompliance: 72.0
  },
  {
    department: 'Electrical & Lighting',
    assigned: 450,
    resolved: 261,
    avgResTimeHrs: 72.0,
    slaCompliance: 58.0
  },
  {
    department: 'Parks & Recreation',
    assigned: 210,
    resolved: 198,
    avgResTimeHrs: 24.5,
    slaCompliance: 94.3
  },
  {
    department: 'Waste Management',
    assigned: 1560,
    resolved: 920,
    avgResTimeHrs: 120.4,
    slaCompliance: 58.9
  }
];

export const RECURRING_HOTSPOTS: DefectHotspot[] = [
  {
    id: 'hot-1',
    locationCode: 'LOC-7829-A',
    name: 'MG Road Intersection',
    primaryIssue: 'POTHOLE CLUSTER',
    repeatCount: 14,
    lastDetected: '24-Oct-2023',
    badgeType: 'error'
  },
  {
    id: 'hot-2',
    locationCode: 'LOC-1102-B',
    name: 'Sector 14 Drain',
    primaryIssue: 'OVERFLOW',
    repeatCount: 8,
    lastDetected: '21-Oct-2023',
    badgeType: 'warning'
  },
  {
    id: 'hot-3',
    locationCode: 'LOC-9931-C',
    name: 'City Hospital Approach',
    primaryIssue: 'STREETLIGHT OFF',
    repeatCount: 5,
    lastDetected: '18-Oct-2023',
    badgeType: 'secondary'
  }
];

export const BUS_CABIN_INCIDENTS: BusCabinIncident[] = [
  {
    id: 'inc-1',
    ticketCode: 'CABIN-4091',
    busNumber: 'DTC-BUS-402',
    routeNumber: 'Route 522 (Inderlok ⇄ Ambedkar Nagar)',
    category: 'Driver Misconduct / Phone Use',
    severity: 'HIGH',
    detectedBy: 'AI Cabin Camera',
    status: 'INVESTIGATING',
    timestamp: '24 Oct 2023, 10:38 AM',
    timeAgo: '10:38 AM',
    location: 'Ring Road near Moolchand Underpass',
    ward: 'Ward B - South',
    driverName: 'Rameshwar Singh (ID: DRV-882)',
    conductorName: 'Vikas Kumar (ID: CND-419)',
    description: 'Driver continuous smartphone usage while maneuvering through high-speed traffic for > 45 seconds. Detected by in-bus interior cabin camera AI model.',
    hasCctvClip: true,
    cctvSnapshotUrl: ASSETS.blueprintLogin
  },
  {
    id: 'inc-2',
    ticketCode: 'CABIN-4088',
    busNumber: 'DTC-BUS-112',
    routeNumber: 'Route 620 (Shivaji Stadium ⇄ Vasant Kunj)',
    category: 'Conductor Overcharging / Dispute',
    severity: 'MED',
    detectedBy: 'Citizen Passenger',
    status: 'NEW',
    timestamp: '24 Oct 2023, 09:50 AM',
    timeAgo: '09:50 AM',
    location: 'AIIMS Metro Station Bus Stop',
    ward: 'Ward C - Central',
    driverName: 'Satish Verma (ID: DRV-304)',
    conductorName: 'Praveen Tyagi (ID: CND-108)',
    passengerName: 'Anjali Sharma',
    passengerPhone: '+91 98112-44390',
    description: 'Conductor refused to issue digital receipt ticket after taking ₹25 cash, aggressive argument and rude behavior towards senior citizen commuter.',
    hasCctvClip: true
  },
  {
    id: 'inc-3',
    ticketCode: 'CABIN-4085',
    busNumber: 'DTC-BUS-331',
    routeNumber: 'Route 419 (Old Delhi Rly ⇄ Saket)',
    category: 'Passenger Harassment / Women Safety',
    severity: 'CRITICAL',
    detectedBy: 'Conductor Panic Switch',
    status: 'DISPATCHED_ENFORCEMENT',
    timestamp: '24 Oct 2023, 09:12 AM',
    timeAgo: '09:12 AM',
    location: 'Lajpat Nagar Flyover Approach',
    ward: 'Ward B - South',
    driverName: 'Kishan Chand (ID: DRV-192)',
    conductorName: 'Manoj Pandey (ID: CND-512)',
    passengerName: 'Meenakshi Iyer',
    passengerPhone: '+91 98731-00219',
    description: 'Emergency panic button triggered in women reserved section. Co-passenger misbehavior and verbal harassment. Police Flying Squad alerted at next signal checkpoint.',
    hasCctvClip: true
  },
  {
    id: 'inc-4',
    ticketCode: 'CABIN-4079',
    busNumber: 'DTC-BUS-204',
    routeNumber: 'Route 764 (Nehru Place ⇄ Dwarka Sector 10)',
    category: 'Overcrowding & Gate Blocking',
    severity: 'MED',
    detectedBy: 'AI Cabin Camera',
    status: 'NEW',
    timestamp: '24 Oct 2023, 08:40 AM',
    timeAgo: '08:40 AM',
    location: 'IIT Flyover Bus Stop',
    ward: 'Ward B - South',
    driverName: 'Suraj Bhan (ID: DRV-521)',
    conductorName: 'Amit Rawat (ID: CND-224)',
    description: 'Rear pneumatic door choked by hanging passengers during transit. In-bus passenger density sensor triggered safety threshold warning.',
    hasCctvClip: true
  },
  {
    id: 'inc-5',
    ticketCode: 'CABIN-4070',
    busNumber: 'DTC-BUS-098',
    routeNumber: 'Route 212 (Anand Vihar ⇄ ISBT Kashmiri Gate)',
    category: 'Fare POS & Sensor Malfunction',
    severity: 'LOW',
    detectedBy: 'Depot Inspection',
    status: 'RESOLVED',
    timestamp: '23 Oct 2023, 06:15 PM',
    timeAgo: 'Yesterday',
    location: 'ISBT Kashmiri Gate Terminal',
    ward: 'Ward A - North',
    driverName: 'Deepak Sharma (ID: DRV-701)',
    conductorName: 'Ravi Joshi (ID: CND-340)',
    description: 'Contactless Smart Card validator machine in bus gate 1 stopped syncing with central transit ticketing server.',
    resolutionNotes: 'POS unit replaced and recalibrated at Kashmiri Gate depot maintenance workshop.'
  }
];

export const ACCIDENT_BLACKSPOTS: AccidentZoneBlackspot[] = [
  {
    id: 'spot-1',
    spotCode: 'BLK-01',
    corridorName: 'Outer Ring Road (Mukarba Chowk to Burari)',
    ward: 'Ward A - North',
    riskLevel: 'EXTREME_RISK',
    accidentsPast30Days: 9,
    accidentsPast6Months: 46,
    accidentsPast1Year: 92,
    fatalitiesCount: 14,
    injuriesCount: 58,
    dailyTrafficVolume: '145,000 PCU/day',
    coordinates: {
      lat: 28.7230,
      lng: 77.1645,
      formatted: '28.7230° N, 77.1645° E',
      mapX: 38,
      mapY: 22
    },
    primaryHazardFactors: [
      'Blind curvature on high-speed flyover descent',
      'Non-functional high-mast streetlights during night hours',
      'Recurring asphalt rutting and severe potholes near merge slip',
      'Uncontrolled pedestrian crossing near rural settlement'
    ],
    lastAccidentDate: '21 Oct 2023 (Heavy truck roll-over)',
    safetyIndexScore: 32,
    remedialActionStatus: 'Speed Tables Approved',
    actionAuthority: 'NHAI & Traffic Police Squad 4'
  },
  {
    id: 'spot-2',
    spotCode: 'BLK-02',
    corridorName: 'Mathura Road (Badarpur Border to Apollo Cross)',
    ward: 'Ward B - South',
    riskLevel: 'HIGH_RISK',
    accidentsPast30Days: 6,
    accidentsPast6Months: 31,
    accidentsPast1Year: 64,
    fatalitiesCount: 8,
    injuriesCount: 42,
    dailyTrafficVolume: '118,000 PCU/day',
    coordinates: {
      lat: 28.5280,
      lng: 77.2890,
      formatted: '28.5280° N, 77.2890° E',
      mapX: 72,
      mapY: 65
    },
    primaryHazardFactors: [
      'Open drainage culvert without crash barrier',
      'Heavy commercial vehicle mix with two-wheelers',
      'Inadequate speed limit retro-reflective signage'
    ],
    lastAccidentDate: '19 Oct 2023 (Two-wheeler skid over wet asphalt)',
    safetyIndexScore: 44,
    remedialActionStatus: 'Lighting Retrofit Underway',
    actionAuthority: 'PWD South Zone & Traffic Police'
  },
  {
    id: 'spot-3',
    spotCode: 'BLK-03',
    corridorName: 'Rohtak Road (Peera Garhi Chowk Intersection)',
    ward: 'Ward C - Central / West',
    riskLevel: 'HIGH_RISK',
    accidentsPast30Days: 5,
    accidentsPast6Months: 28,
    accidentsPast1Year: 53,
    fatalitiesCount: 6,
    injuriesCount: 37,
    dailyTrafficVolume: '96,000 PCU/day',
    coordinates: {
      lat: 28.6790,
      lng: 77.0940,
      formatted: '28.6790° N, 77.0940° E',
      mapX: 25,
      mapY: 48
    },
    primaryHazardFactors: [
      'Water stagnation during rainfall obscuring deep manhole edges',
      'Illegal median cuts used by motorbikes',
      'Signal cycle timing mismatch during peak rush'
    ],
    lastAccidentDate: '16 Oct 2023 (Rear-end collision at intersection)',
    safetyIndexScore: 48,
    remedialActionStatus: 'Survey In Progress',
    actionAuthority: 'MCD West & Traffic Cell'
  },
  {
    id: 'spot-4',
    spotCode: 'BLK-04',
    corridorName: 'Vikas Marg (Laxmi Nagar Metro Pillar 40 to 65)',
    ward: 'Ward D - East',
    riskLevel: 'MODERATE_RISK',
    accidentsPast30Days: 3,
    accidentsPast6Months: 18,
    accidentsPast1Year: 39,
    fatalitiesCount: 3,
    injuriesCount: 26,
    dailyTrafficVolume: '88,000 PCU/day',
    coordinates: {
      lat: 28.6340,
      lng: 77.2780,
      formatted: '28.6340° N, 77.2780° E',
      mapX: 68,
      mapY: 42
    },
    primaryHazardFactors: [
      'Commercial auto-rickshaw encroachment eating road shoulder',
      'Faded zebra crossings and missing pedestrian refuge island',
      'Night-time glare from unshaded advertisement boards'
    ],
    lastAccidentDate: '11 Oct 2023 (Pedestrian hit while crossing)',
    safetyIndexScore: 58,
    remedialActionStatus: 'Signage Installed',
    actionAuthority: 'East Delhi Municipal Corp'
  }
];

export const GOV_TICKER_BULLETINS = [
  {
    id: 'b1',
    hi: 'राष्ट्रीय सड़क सुरक्षा माह 2026: 48 नगर निगम बसों पर AI एज सेंसर द्वारा 12 वार्डों में चौबीसों घंटे गड्ढों की स्वचालित मैपिंग जारी।',
    en: 'National Road Safety Month 2026: 24x7 automated AI dashcam defect scanning active across 12 municipal wards.'
  },
  {
    id: 'b2',
    hi: 'मानसून जलभराव रैपिड रिस्पॉन्स: दिल्ली जल बोर्ड और पीडब्ल्यूडी की संयुक्त आपातकालीन टीमें 15 मिनट SLA पर तैनात।',
    en: 'Monsoon Waterlogging Rapid Response: Joint Jal Board & PWD emergency dewatering teams deployed on 15-min SLA.'
  },
  {
    id: 'b3',
    hi: 'बस केबिन सुरक्षा व महिला हेल्पलाइन 1800-300-1947: पैनिक स्विच व चालक फोन उपयोग पर स्वचालित नियंत्रण कक्ष अलर्ट।',
    en: 'Bus Cabin Women Safety & Transit Helpline 1800-300-1947: Instant command center dispatch on cabin panic triggers.'
  }
];

export const UIDAI_PORTAL_SECTIONS: UIDAIStylePortalSection[] = [
  {
    id: 'sec-my-nagar',
    headingHi: 'मेरी नागरिक सेवाएं एवं AI पहचान',
    headingEn: 'My Civic Services & Edge AI Detection',
    subheadingHi: 'शहरी बुनियादी ढांचे के स्वचालित निरीक्षण और नागरिक सुरक्षा सेवाएं',
    subheadingEn: 'Automated civic infrastructure scanning and defect logging services',
    icon: 'location_city',
    color: '#002D62',
    items: [
      {
        id: 'srv-potholes',
        titleHi: 'सड़क गड्ढे एवं दरारें',
        titleEn: 'Pothole & Surface Defects',
        descHi: 'बसों के AI कैमरों द्वारा गहराई व स्थान की स्वचालित पहचान',
        descEn: 'Edge AI camera depth analysis and geo-tagged coordinates',
        icon: 'warning',
        badge: 'AI Edge',
        targetView: 'dashboard',
        subCategory: 'Potholes',
        actionType: 'filter',
        filterKey: 'Potholes'
      },
      {
        id: 'srv-lights',
        titleHi: 'स्मार्ट स्ट्रीट लाइट ग्रिड',
        titleEn: 'Smart Streetlights & Poles',
        descHi: 'अंधेरे क्षेत्र, टूटे खंभे एवं एलईडी खराबी का त्वरित पता लगाना',
        descEn: 'Dark-spot detection and dangling luminaire rapid triage',
        icon: 'lightbulb',
        badge: 'Sensors Active',
        targetView: 'dashboard',
        subCategory: 'Streetlights',
        actionType: 'filter',
        filterKey: 'Streetlights'
      },
      {
        id: 'srv-water',
        titleHi: 'जलभराव एवं पाइपलाइन रिसाव',
        titleEn: 'Waterlogging & Main Leaks',
        descHi: 'मानसून जल निकासी अवरोध एवं मुख्य पाइपलाइन फटने की चेतावनी',
        descEn: 'Severe carriageway flooding and feeder burst escalation',
        icon: 'water_damage',
        badge: 'High Priority',
        targetView: 'dashboard',
        subCategory: 'Water Logging',
        actionType: 'filter',
        filterKey: 'Water Logging'
      },
      {
        id: 'srv-sanitation',
        titleHi: 'स्वच्छता एवं कचरा प्रबंधन',
        titleEn: 'Waste & Sanitation Overflow',
        descHi: 'ओवरफ्लो डस्टबिन, खुले कचरे के ढेर एवं सफाई वाहन ट्रैकिंग',
        descEn: 'Overflowing dumpsters and ward sanitation schedule sync',
        icon: 'delete_sweep',
        targetView: 'dashboard',
        subCategory: 'Sanitation',
        actionType: 'filter',
        filterKey: 'Sanitation'
      },
      {
        id: 'srv-encroach',
        titleHi: 'फुटपाथ अतिक्रमण एवं अवरोध',
        titleEn: 'Footpath & Lane Encroachment',
        descHi: 'पैदल यात्री मार्गों और लेन अवरोधों की स्वचालित पहचान',
        descEn: 'Pedestrian walkway blockages and unauthorized hoarding',
        icon: 'block',
        targetView: 'dashboard',
        subCategory: 'Encroachment',
        actionType: 'filter',
        filterKey: 'Encroachment'
      },
      {
        id: 'srv-livemap',
        titleHi: 'लाइव जीआईएस शहर मानचित्र',
        titleEn: 'City-Wide GIS Geospatial Map',
        descHi: 'रीयल-टाइम दोष हॉटस्पॉट, बस लोकेशन एवं वार्ड बाउंड्री',
        descEn: 'Real-time multi-layered geospatial defect map with filters',
        icon: 'map',
        badge: 'Interactive',
        targetView: 'live-map',
        subCategory: 'GIS',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-grievance-orders',
    headingHi: 'शिकायत निवारण एवं कार्य आदेश',
    headingEn: 'Grievance Redressal & Work Orders',
    subheadingHi: 'कानबन कार्यप्रवाह, फील्ड मरम्मत दल आवंटन और एसएलए ट्रैकिंग',
    subheadingEn: 'Kanban triage, automated crew dispatch and SLA compliance',
    icon: 'assignment',
    color: '#E65100',
    items: [
      {
        id: 'srv-tickets-all',
        titleHi: 'सभी कार्य आदेश (कानबन)',
        titleEn: 'All Work Orders & Triage',
        descHi: 'नया, आवंटित, प्रगति में और सत्यापित बंद मामलों की कतार',
        descEn: 'Triage board with priority queues and status transitions',
        icon: 'view_kanban',
        badge: 'Live Queue',
        targetView: 'tickets',
        subCategory: 'Work Orders',
        actionType: 'navigate'
      },
      {
        id: 'srv-rules',
        titleHi: 'स्मार्ट ऑटो-रूटिंग इंजन',
        titleEn: 'Auto-Routing & SLA Rules',
        descHi: 'गंभीरता और विभाग के आधार पर स्वतः मरम्मत दल आवंटन नियम',
        descEn: 'Configurable automated dispatch and escalation triggers',
        icon: 'alt_route',
        targetView: 'tickets',
        subCategory: 'Automation',
        actionType: 'navigate'
      },
      {
        id: 'srv-new-ticket',
        titleHi: 'नया दोष टिकट / कार्य आदेश',
        titleEn: 'Register New Defect Ticket',
        descHi: 'जीपीएस निर्देशांक और फोटो साक्ष्य के साथ मैन्युअल प्रविष्टि',
        descEn: 'Manual grievance logging with image upload and GPS pins',
        icon: 'add_task',
        badge: 'Fast Action',
        targetView: 'tickets',
        subCategory: 'Manual Log',
        actionType: 'modal'
      }
    ]
  },
  {
    id: 'sec-transit-safety',
    headingHi: 'सार्वजनिक परिवहन एवं यात्री सुरक्षा',
    headingEn: 'Transit & Bus Passenger Safety',
    subheadingHi: 'केबिन AI सर्विलांस, चालक व्यवहार और महिला सुरक्षा निगरानी',
    subheadingEn: 'Cabin AI video analytics, conductor audits and panic alarms',
    icon: 'directions_bus',
    color: '#002D62',
    items: [
      {
        id: 'srv-cabin-safety',
        titleHi: 'बस केबिन सुरक्षा शिकायतें',
        titleEn: 'Cabin Safety & Misconduct',
        descHi: 'ड्राइवर फोन उपयोग, महिला सुरक्षा अलार्म एवं किराया विवाद',
        descEn: 'Driver distraction alarms, passenger SOS, and fare disputes',
        icon: 'videocam',
        badge: 'Cabin AI',
        targetView: 'safety-complaints',
        subCategory: 'Safety',
        actionType: 'navigate'
      },
      {
        id: 'srv-fleet-monitor',
        titleHi: '48 कनेक्टेड ई-बस बेड़ा',
        titleEn: '48 AI Connected Fleet Hub',
        descHi: 'लाइव डैशकैम स्ट्रीम, जीपीएस सिग्नल और स्कैन किए गए किलोमीटर',
        descEn: 'Real-time telemetry, camera feed status, and depot sync',
        icon: 'local_shipping',
        badge: '48 Nodes',
        targetView: 'fleet',
        subCategory: 'Fleet',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-blackspots',
    headingHi: 'सड़क सुरक्षा एवं ब्लैकस्पॉट पोर्टल',
    headingEn: 'Road Safety & Accident Blackspots',
    subheadingHi: 'उच्च जोखिम दुर्घटना गलियारे, उपचारात्मक सिविल कार्य और सांख्यिकी',
    subheadingEn: 'Crash frequency hotspots, remedial engineering and risk index',
    icon: 'crisis_alert',
    color: '#B71C1C',
    items: [
      {
        id: 'srv-blackspot-analytics',
        titleHi: 'ब्लैकस्पॉट गलियारा विश्लेषण',
        titleEn: 'Blackspot Corridor Risk Matrix',
        descHi: '30-दिवसीय दुर्घटनाएं, हताहतों की संख्या और सुरक्षा सूचकांक',
        descEn: 'Corridor risk rating, fatality statistics, and hazard factors',
        icon: 'warning_amber',
        badge: 'MoRTH Standard',
        targetView: 'accident-analytics',
        subCategory: 'Safety GIS',
        actionType: 'navigate'
      },
      {
        id: 'srv-remedial',
        titleHi: 'उपचारात्मक सिविल कार्य योजना',
        titleEn: 'Remedial Civil Action Hub',
        descHi: 'स्पीड टेबल, रेट्रो-रिफ्लेक्टिव साइनेज एवं प्रकाश सुधार कार्य',
        descEn: 'Tracking speed calming retrofits, signages and road design fixes',
        icon: 'engineering',
        targetView: 'accident-analytics',
        subCategory: 'Civil Works',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-multiagency',
    headingHi: 'अंतर-विभागीय समन्वय केंद्र',
    headingEn: 'Multi-Agency Governance Hub',
    subheadingHi: 'पीडब्ल्यूडी, ट्रैफिक पुलिस, जल बोर्ड और डिस्कॉम का संयुक्त समन्वय',
    subheadingEn: 'Cross-agency ticket hand-offs, direct officer chat and directory',
    icon: 'hub',
    color: '#0A3871',
    items: [
      {
        id: 'srv-agency-sync',
        titleHi: 'संयुक्त अंतर-विभागीय टिकट',
        titleEn: 'Cross-Agency Hand-offs',
        descHi: 'पीडब्ल्यूडी और ट्रैफिक पुलिस के बीच संयुक्त कार्य आदेश ट्रांसफर',
        descEn: 'Unified inter-departmental ticket routing and live collaboration',
        icon: 'groups',
        badge: '4 Agencies',
        targetView: 'multi-agency',
        subCategory: 'Governance',
        actionType: 'navigate'
      },
      {
        id: 'srv-agency-dir',
        titleHi: 'अधिकारी एवं एजेंसी निर्देशिका',
        titleEn: 'Official Agency Directory',
        descHi: 'क्षेत्रीय अधिकारियों के संपर्क, नोडल पद एवं उपलब्धता स्थिति',
        descEn: 'Zonal nodal officers, direct emergency lines and desk info',
        icon: 'contact_phone',
        targetView: 'multi-agency',
        subCategory: 'Directory',
        actionType: 'navigate'
      }
    ]
  },
  {
    id: 'sec-analytics',
    headingHi: 'डेटा, रिपोर्ट एवं ओपन इंटेलिजेंस',
    headingEn: 'Data, Analytics & Open Intelligence',
    subheadingHi: 'वार्डवार प्रदर्शन सूचकांक, एसएलए अनुपालन और 30-दिवसीय रुझान',
    subheadingEn: 'Ward-wise SLA scorecards, resolution velocity and trends',
    icon: 'analytics',
    color: '#002D62',
    items: [
      {
        id: 'srv-analytics-report',
        titleHi: 'सड़क स्वास्थ्य एवं एसएलए रिपोर्ट',
        titleEn: 'City Road Health & SLA Velocity',
        descHi: 'समाधान गति, विभागीय रैंकिंग और आवर्ती दोष हॉटस्पॉट विश्लेषण',
        descEn: 'Ward performance charts, resolution times and 30-day velocity',
        icon: 'trending_up',
        badge: 'Live Data',
        targetView: 'analytics',
        subCategory: 'Reports',
        actionType: 'navigate'
      }
    ]
  }
];

export const TRANSLATIONS = {
  en: {
    platformName: 'Nagar Drishti',
    platformSubtitle: 'Urban Intelligence & Municipal Command Platform',
    govHeaderTitle: 'Government of India | भारत सरकार',
    ministryTitle: 'Ministry of Housing & Urban Affairs | MeitY Digital India',
    servicesDirectory: 'Service Categories',
    dashboard: 'Dashboard',
    liveMap: 'Live Map',
    ticketsWorkOrders: 'Tickets & Work Orders',
    analyticsReports: 'Analytics & Reports',
    fleetMonitoring: 'Fleet Monitoring',
    multiAgency: 'Multi-Agency',
    notifications: 'Notifications',
    settings: 'Settings',
    safetyComplaints: 'Bus Cabin & Safety',
    accidentBlackspots: 'Accident Zones & Blackspots',
    searchPlaceholder: 'Search by ID, Ward, Department, Hazard, or Service...',
    defectsToday: 'Defects Today',
    openTickets: 'Open Tickets',
    resolvedWk: 'Resolved Wk',
    avgResTime: 'Avg Res Time',
    safetyIndex: 'Safety Index',
    sensorsOn: 'Sensors On',
    liveFeed: 'Live Detection Feed',
    defectTrend30d: '30-Day Defect Trend',
    defectsByWard: 'Defects By Ward',
    categories: 'Categories',
    autoRoutingRules: 'Auto-Routing Rules',
    createWorkOrder: 'Generate Work Order',
    markDuplicate: 'Mark Duplicate',
    escalate: 'Escalate',
    detectionEvidence: 'Detection Evidence',
    preciseLocation: 'Precise Location',
    resolutionContext: 'Resolution Context',
    statusTimeline: 'Status Timeline',
    assignment: 'Assignment',
    addComment: 'Add Comment / Internal Note',
    postComment: 'Post Comment',
    systemAlerts: 'System Alerts',
    agencyDirectory: 'Agency Directory',
    crossAgencyCollab: 'Cross-Agency Collaboration',
    newRequest: 'New Request',
    tollFreeHelpline: 'Toll-Free Helpline: 1800-300-1947 | Municipal 1913 | Emergency 112',
    skipToMain: 'Skip to main content',
    screenReader: 'Screen Reader Access',
    fontSize: 'Text Size',
    highContrast: 'Contrast',
    allServices: 'All Service Categories',
    quickLinks: 'Quick Portals'
  },
  hi: {
    platformName: 'नगर दृष्टि',
    platformSubtitle: 'शहरी बुद्धिमत्ता एवं नगर कमान मंच',
    govHeaderTitle: 'भारत सरकार | Government of India',
    ministryTitle: 'आवासन और शहरी कार्य मंत्रालय | इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय',
    servicesDirectory: 'सेवा श्रेणियां',
    dashboard: 'मुख्य डैशबोर्ड',
    liveMap: 'लाइव जीआईएस मानचित्र',
    ticketsWorkOrders: 'शिकायतें एवं कार्य आदेश',
    analyticsReports: 'विश्लेषण एवं रिपोर्ट',
    fleetMonitoring: 'वाहन बेड़ा निगरानी',
    multiAgency: 'बहु-एजेंसी समन्वय',
    notifications: 'सूचनाएं एवं अलर्ट',
    settings: 'सेटिंग्स एवं प्रोफाइल',
    safetyComplaints: 'बस केबिन व यात्री सुरक्षा',
    accidentBlackspots: 'दुर्घटना संभावित क्षेत्र (ब्लैकस्पॉट)',
    searchPlaceholder: 'आईडी, वार्ड, विभाग, खतरा या सेवा खोजें...',
    defectsToday: 'आज की कमियां',
    openTickets: 'खुले मामले',
    resolvedWk: 'सप्ताह में हल',
    avgResTime: 'औसत समाधान समय',
    safetyIndex: 'सुरक्षा सूचकांक',
    sensorsOn: 'सक्रिय सेंसर',
    liveFeed: 'लाइव डिटेक्शन फीड',
    defectTrend30d: '30-दिवसीय प्रवृत्ति',
    defectsByWard: 'वार्ड अनुसार दोष',
    categories: 'श्रेणियां',
    autoRoutingRules: 'ऑटो-रूटिंग नियम',
    createWorkOrder: 'कार्य आदेश जारी करें',
    markDuplicate: 'डुप्लीकेट चिह्नित करें',
    escalate: 'उच्चाधिकारी को भेजें',
    detectionEvidence: 'पहचान साक्ष्य',
    preciseLocation: 'सटीक स्थान',
    resolutionContext: 'समाधान स्थिति',
    statusTimeline: 'स्थिति समयरेखा',
    assignment: 'आवंटन',
    addComment: 'टिप्पणी / आंतरिक नोट जोड़ें',
    postComment: 'टिप्पणी दर्ज करें',
    systemAlerts: 'सिस्टम अलर्ट',
    agencyDirectory: 'एजेंसी निर्देशिका',
    crossAgencyCollab: 'अंतर-एजेंसी सहयोग',
    newRequest: 'नया अनुरोध',
    tollFreeHelpline: 'टोल-फ्री हेल्पलाइन: 1800-300-1947 | नागरिक 1913 | आपातकाल 112',
    skipToMain: 'मुख्य सामग्री पर जाएं',
    screenReader: 'स्क्रीन रीडर एक्सेस',
    fontSize: 'फ़ॉन्ट आकार',
    highContrast: 'कंट्रास्ट',
    allServices: 'समस्त नागरिक सेवा श्रेणियां',
    quickLinks: 'त्वरित पोर्टल'
  }
};

export const NEARBY_BUSES: import('../types').NearbyBus[] = [
  {
    busId: 'DL-01-BUS-104',
    routeNumber: '423',
    routeName: 'ISBT Kashmere Gate ➔ AIIMS Metro',
    currentStop: 'Connaught Place Central Hub',
    nextStop: 'Janpath Metro Station',
    etaMinutes: 3,
    distanceKm: 0.4,
    occupancy: 'Moderate',
    isAc: true,
    speedKmh: 34,
    driverName: 'Suresh Kumar',
    depot: 'Central Delhi Bus Depot #2',
    lat: 28.6315,
    lng: 77.2167
  },
  {
    busId: 'DL-01-BUS-208',
    routeNumber: '534',
    routeName: 'Anand Vihar ISBT ➔ Mehrauli Depot',
    currentStop: 'Mandi House Circle',
    nextStop: 'Supreme Court Transit Gate',
    etaMinutes: 7,
    distanceKm: 1.2,
    occupancy: 'High',
    isAc: true,
    speedKmh: 28,
    driverName: 'Ramesh Chander',
    depot: 'East Delhi DTC Depot',
    lat: 28.6254,
    lng: 77.2341
  },
  {
    busId: 'DL-01-BUS-312',
    routeNumber: '620',
    routeName: 'Shivaji Stadium ➔ Vasant Kunj Sector C',
    currentStop: 'Dhaula Kuan Junction',
    nextStop: 'Moti Bagh Bus Stop',
    etaMinutes: 12,
    distanceKm: 2.8,
    occupancy: 'Low',
    isAc: true,
    speedKmh: 42,
    driverName: 'Vikram Singh',
    depot: 'South Delhi DTC Terminal',
    lat: 28.5921,
    lng: 77.1685
  },
  {
    busId: 'DL-01-BUS-405',
    routeNumber: '502',
    routeName: 'Old Delhi Railway Station ➔ Saket City Center',
    currentStop: 'ITO Bus Stand',
    nextStop: 'Pragati Maidan Metro',
    etaMinutes: 5,
    distanceKm: 0.8,
    occupancy: 'Overcrowded',
    isAc: false,
    speedKmh: 19,
    driverName: 'Anil Tyagi',
    depot: 'Yamuna Vihar Depot',
    lat: 28.6289,
    lng: 77.2412
  }
];

export const PUBLIC_BUS_ROUTES: import('../types').PublicBusRoute[] = [
  {
    routeNumber: '423',
    routeName: 'ISBT Kashmere Gate ➔ AIIMS Metro',
    origin: 'ISBT Kashmere Gate',
    destination: 'AIIMS Metro Station',
    totalStops: 24,
    frequencyMins: 8,
    activeBusesCount: 14
  },
  {
    routeNumber: '534',
    routeName: 'Anand Vihar ISBT ➔ Mehrauli Depot',
    origin: 'Anand Vihar Terminal',
    destination: 'Mehrauli Terminal',
    totalStops: 32,
    frequencyMins: 10,
    activeBusesCount: 18
  },
  {
    routeNumber: '620',
    routeName: 'Shivaji Stadium ➔ Vasant Kunj Sector C',
    origin: 'Shivaji Stadium Terminal',
    destination: 'Vasant Kunj Hub',
    totalStops: 19,
    frequencyMins: 12,
    activeBusesCount: 9
  },
  {
    routeNumber: '502',
    routeName: 'Old Delhi Station ➔ Saket City Center',
    origin: 'Old Delhi Junction',
    destination: 'Saket Metro',
    totalStops: 28,
    frequencyMins: 6,
    activeBusesCount: 22
  }
];

export const COMMUTER_FEEDBACK_ITEMS: import('../types').CommuterIncidentFeedback[] = [
  {
    id: 'FB-901',
    ticketId: 'TK-8925',
    busId: 'DL-01-BUS-405',
    routeNumber: '502',
    commuterName: 'Aman Verma',
    commuterPhone: '+91 98765 43210',
    category: 'AC Breakdown',
    description: 'Air conditioning unit completely non-functional during peak afternoon hours. Extreme heat in passenger cabin.',
    timestamp: '15 mins ago',
    status: 'AI_VERIFIED',
    upvotesCount: 14,
    hasPhoto: true
  },
  {
    id: 'FB-902',
    ticketId: 'TK-8926',
    busId: 'DL-01-BUS-208',
    routeNumber: '534',
    commuterName: 'Priya Sharma',
    category: 'Broken Seat/Railing',
    description: 'Railing loose near rear emergency door posing a fall hazard for standing commuters.',
    timestamp: '1 hour ago',
    status: 'DISPATCHED',
    upvotesCount: 8,
    hasPhoto: false
  }
];



