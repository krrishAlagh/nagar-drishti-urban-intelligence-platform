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
  UIDAIStylePortalSection,
  UserAccount
} from '../types/serverTypes';

export const ASSETS = {
  emblem: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDETjAGXjgRghlQZhPFhpiFo38lB0sj_2uzu0_tvK522T0Fy9njGUK7y8MXtgkjuGFXCsi_niNKwEM1scegn-jrHqw_NK45P5I-dJ3eZgli5bHKwy8p6Yp78WESy4c8QThLdouHvbxVFQFFksjjM0ZeUPBC69tct9YgdqedKSwyHBcG16zGJKIBb9UueUP8Src0PLhdQiB7_Bu9XAir9ZdTknwm-rbt6iXHLYak-KVUvG8IspNUEFfU',
  adminAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8QDgUqO8B7Osb3Sk65E0tpcJ49CzH-ISb56yMsko4vUwFwSUeLMNrTsmsdpDZlcmmhu1ciUMwea6EGqWeNBqZ13UC6JUbfxnXK2DZGwpbTV3e-oDPHIgNmILfLiLo9-lmEvokYbTM_PRFlO143iLgEbBkZ9ey8B1rkTKWqgyDCpnvVyppvqF77JUKPQtYXkwpmSNfuG_rmJw0p779T7aDVDFfR2MfofZC9GqGNdpv-ZSg2BgHUijZ',
  sharmaAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvunsBDQBmM-3nvZVqM_znUXV0iBgUX6nijaIQbAlmLG4hllblBUvG29Zn6zFupatdAeX7pw1wgBufdULqk_R9Ae2gEWdxOMbn5BE379G0ZKPbTXIM_ZrNcwE2AP_cNVNQeJBXblZZMVYVjSQpLFwA3gHo7fZbHSJRCRaoL6_K-TvQrueao5FrfTGI27P-OO4GjhT4Y8bNyYqy5lZnqIVIam7-GKlhR1wTQvfc5PVZWIjJf1c-J3ae',
  teamBAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW6PU2pck6jHASoRlh3b38smlCH43VpMTSzw-X3SdHXTG5_7x2mr398Tm8r5KCQoqug9J5aLyGMVUiPtPBMtYkqV9vWeQAmEihyic_vlaoSvDzVuNLz6J5gjWwoUG6kAWFm-xwGYSq5G3vXe28M9awXnVETmQnFbQ7JtIfD5UZ8EpdxQ4IkP4vT4nMPwHFDr71rQwUplCCA-agcCBTO2dmFrnR6Tp7oegEbd9Tp2Q3fN1dEDyRIBUF',
  potholeClose: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdQhYmLopZBtxQzgbUWQ3ijr_9lQC58Gt39POV7aGEKPFRSKKE4p_-pI_0SFxNshK6vXLEYAQH0TK_1Kdjq7AQ0E7e6a5lTMR_Z2WcqUP91LMeax7MzHW6o24XiSF90W-TFm00lxozkmjLTaHMzjUWYQrFN7EVIv0dO6sNMI6M3iRXFJ08mWa7alz9Cnjsnc2886FTEO_0UmLw9yuc35hei0QdWznaLwwcMiRQ2uIm6K4-HfibzPnw',
  streetlightBroken: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuAZ6B5bkvORRmhBGNUH_ELFai8Sc-Z6b_5ZtlQBQQmkunTv4o0_cEWln90zQWu8BfO3qNATMnuyI4LJWIh1asH2dtFi2IeINAjm1Hze7srjKOGUUD3-_afXclanQS1OhqhYG2s5Zx8cXoCEa99Dd78hW1RQrTVOmFLZYh6lbPkl2XDqaKV0oOs2bCtBdDr5-OMss06cyPzncoJ27meyYJaCJ4Q8G981OqCL0pSLNKoQi-U4F1lPaY',
  pipeBurst: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1HoCkuQbf1vj5IttVrTSe_dRT2Cgwby5Y68drDjtsoTLhfQUO_Mq3DZizQXiZHTyZzteRePL6Ldh8gyq6_53kXVRmj-hlC9Dle4Hxjh1wSJ-WeLz3JAXz08eIYdd8ydZdXbictd5LexO5kueALq0FXI0_qNM4LGIfjMbKTaQqxaQzixRR4EC7pq3UQlCZgzeN0r9lX4WBCbp3pd2bRP_JcPZnZcr4_pSJPoNp8NA5J2agoZSlnsTT',
  potholeSevereThumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSkECC60siDEFrSt0Cbk_n8omaxLtppnBWmFvAuxvjgQzHo23KiX6aAISr06pYIcBVa0jqWwwitHgLjXk1cgmXJx51i4vDZiUNE7yU0y7F8FsyJW2xKY1XKx8o4o-F1Mw3W8ebwSNnsd9sbLqKHy0rf5wHajmyaMLuafZpTGNxWl0ef-61HyU9t4tgpU2piWgjrGUpcMvj5dQbOZ12mIH1lfFlDyPB7RKgUcctqEmk9Ou182RIra3F',
  overflowingBinThumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY86PZIRygMTfJEYciq2blkinkXHgWzmH3u0sKctWEmYXH-2G2T0smqbEawqKJx_FuEPoUI4MmafZkTX0HHIUCSupMgSCNvezj-3eY5yDcs0FxzabKw1AlggcqYLp5LvrLsm1eDDKaoevX4UlsfutLpTgHVln-FbIkD14kgmv0Eo_c_mJwWnHNkSBndYfIZRTjSRCp2pRpg9E4_Bx5Y24KtAOFhYr2ShsGq1zGmRDA5krruBOV9IVx',
  brokenStreetlightThumb: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Y3bhh3Iv8SSqyeSuRwVR7RcUqk4hF6aNa6KLauKw2vnn7la2zf1eKuVayQiAsXa386o2G5WDYw11x0owF6NCIAbW-17Akwf3R6F7K-sYDOuKU0qyWKtWFbmcvNtmDLUdA-kAnGyZomah1FR86sYAaaoD8la-orv_4wQdszoN3jvHdnd4Infr5rEw6Q7wydHpU9qzTwpcXQaJI03tmfGPf0ahOF0M7GDsI2knsO53a3eFqPSZoo6I',
  blueprintLogin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm6Sd9Xm1cjJF_Qo-Zs8ueUfM7Gh9Z94tndwbPnlfIomcvs719zr5PEOu2-F44O1SeugcHGwZBGDbvHCzUnZI46iKrGvER-lfhB9b151Z6jjKyQ2iR9ItktLjuHVbbrNnudMi6yxdXuQpUZbgt9Pi2FqYA4xLG9EuEykzz8G1c-r2mI-uP8JGR3XlezW_MthyzuhectXX1DfQym5W2ffXlacXgJDf86h99h8p58y-rYBKQ3n1iojsb'
};

export const CREW_TEAMS = [
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
  },
  {
    id: 'crew-5',
    name: 'Heavy Pothole Repair Crew',
    team: 'Roads & Bridges - Heavy Equipment',
    lead: 'Vikram Singh',
    phone: '+91 97654 32109',
    avatar: ASSETS.adminAvatar,
    department: 'PWD (Roads & Bridges) - Heavy Crew'
  },
  {
    id: 'crew-6',
    name: 'Traffic Signal Rapid Response',
    team: 'Traffic Engineering Division',
    lead: 'Priya Sharma',
    phone: '+91 96543 21098',
    avatar: ASSETS.sharmaAvatar,
    department: 'Traffic Engineering'
  },
  {
    id: 'crew-7',
    name: 'Street Lighting Crew Alpha',
    team: 'Electrical & Lighting',
    lead: 'Deepak Electrical',
    phone: '+91 95432 10987',
    avatar: ASSETS.adminAvatar,
    department: 'BSES / Electrical Dept'
  },
  {
    id: 'crew-8',
    name: 'Drainage & Waterlogging Team',
    team: 'Sanitation & Drainage',
    lead: 'Ajay Kumar',
    phone: '+91 94321 09876',
    avatar: ASSETS.sharmaAvatar,
    department: 'Delhi Water Board'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Rajesh Kumar, IAS',
    email: 'admin@nagardrishti.gov.in',
    role: 'Municipal Admin',
    department: 'Municipal Corporation Command HQ',
    avatar: ASSETS.adminAvatar,
    phone: '+91 11 2345 6780',
    wardAssigned: 'All Wards (Central Command)'
  },
  {
    id: 'usr-2',
    name: 'R. Sharma',
    email: 'r.sharma@pwd.gov.in',
    role: 'Zonal Officer',
    department: 'PWD (Roads & Bridges) - Central Zone',
    avatar: ASSETS.sharmaAvatar,
    phone: '+91 98112 00192',
    wardAssigned: 'Ward C - Central'
  },
  {
    id: 'usr-3',
    name: 'Team B Lead (Hydrology)',
    email: 'crew.lead@delhijalboard.gov.in',
    role: 'Repair Crew Lead',
    department: 'Rapid Emergency Hydrology',
    avatar: ASSETS.teamBAvatar,
    phone: '+91 98731 99201',
    wardAssigned: 'Ward D - Central / East'
  },
  {
    id: 'usr-4',
    name: 'Superintendent DTC Control Room',
    email: 'transit.safety@dtc.delhi.gov.in',
    role: 'Transport Authority',
    department: 'Delhi Transport Corporation Safety Cell',
    avatar: ASSETS.adminAvatar,
    phone: '+91 11 2345 6783',
    wardAssigned: 'All Transit Corridors'
  }
];

export const INITIAL_DEFECTS: DefectItem[] = [
  {
    id: '1',
    ticketNumber: 'TK-8921',
    title: 'Pothole (Severity 3)',
    category: 'Potholes',
    severity: 'HIGH',
    confidence: 94.2,
    locationName: 'MG Road Intersection, near Metro Pillar 42. Depth > 10cm.',
    coordinates: {
      lat: 28.6139,
      lng: 77.2090,
      formatted: '28.6139° N, 77.2090° E'
    },
    ward: 'Ward C - Central',
    timestamp: '24 Oct 2023, 10:42 AM',
    timeAgo: '10:42:15 AM',
    imageUrl: ASSETS.potholeClose,
    hasOverlay: true,
    busId: 'BUS-402',
    department: 'Roads & Bridges',
    slaRemaining: '01h 45m',
    isOverdue: false,
    description: 'Major road surface degradation observed with dangerous depth exceeding 10cm. Requires immediate asphalt hot-mix filling crew.',
    status: 'NEW',
    comments: [
      {
        id: 'c1',
        author: 'System AI',
        role: 'Computer Vision Core',
        time: '10:42 AM',
        text: 'Automated defect detection triggered via Bus 402 forward sensor. Confidence rating: 94.2%.'
      },
      {
        id: 'c2',
        author: 'Rajesh K.',
        avatar: ASSETS.adminAvatar,
        role: 'Admin',
        time: '10:45 AM',
        text: 'Verified severity as Category 3. Flagged for urgent dispatch to Central Roads crew.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'System AI (BUS-402)', time: '10:42 AM', completed: true },
      { title: 'Verified', subtitle: 'Admin_Rajesh', time: '10:45 AM', completed: true },
      { title: 'Ticket Created', subtitle: 'System', time: '10:46 AM', completed: true, active: true },
      { title: 'Assigned', subtitle: 'Pending Dispatch', time: 'Pending', completed: false },
      { title: 'In Progress', subtitle: 'Crew on route', time: 'Pending', completed: false },
      { title: 'Resolved', subtitle: 'Field sign-off', time: 'Pending', completed: false }
    ]
  },
  {
    id: '2',
    ticketNumber: 'TK-8890',
    title: 'Streetlight Outage',
    category: 'Streetlights',
    severity: 'MED',
    confidence: 92.0,
    locationName: 'Sector 14, Main Avenue. Pole ID: LGT-401.',
    coordinates: {
      lat: 28.6250,
      lng: 77.2180,
      formatted: '28.6250° N, 77.2180° E'
    },
    ward: 'Ward B - South',
    timestamp: '24 Oct 2023, 08:30 AM',
    timeAgo: '08:30:00 AM',
    imageUrl: ASSETS.streetlightBroken,
    busId: 'BUS-112',
    assignedTo: {
      name: 'R. Sharma',
      avatar: ASSETS.sharmaAvatar,
      team: 'Electrical Maintenance Div 2'
    },
    department: 'Electrical & Lighting',
    slaRemaining: '04h 10m',
    isOverdue: false,
    description: 'High-mast luminaire non-functional. Causes low visibility on pedestrian crossing.',
    status: 'ASSIGNED',
    comments: [
      {
        id: 'c3',
        author: 'R. Sharma',
        avatar: ASSETS.sharmaAvatar,
        role: 'Field Officer',
        time: '08:45 AM',
        text: 'Replacement LED driver dispatched with maintenance van 12.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Night Scan Routine', time: '08:30 AM', completed: true },
      { title: 'Verified', subtitle: 'Auto-Rule R-042', time: '08:32 AM', completed: true },
      { title: 'Ticket Created', subtitle: 'System', time: '08:35 AM', completed: true },
      { title: 'Assigned', subtitle: 'R. Sharma (Div 2)', time: '08:40 AM', completed: true, active: true },
      { title: 'In Progress', subtitle: 'Crew on site', time: 'Pending', completed: false },
      { title: 'Resolved', subtitle: 'Luminaire tested', time: 'Pending', completed: false }
    ]
  },
  {
    id: '3',
    ticketNumber: 'TK-8855',
    title: 'Water Pipe Burst & Flooding',
    category: 'Water Logging',
    severity: 'CRITICAL',
    confidence: 96.8,
    locationName: 'Civil Lines, North Ward near Raj Niwas Marg',
    coordinates: {
      lat: 28.6700,
      lng: 77.2250,
      formatted: '28.6700° N, 77.2250° E'
    },
    ward: 'Ward A - North',
    timestamp: '24 Oct 2023, 06:15 AM',
    timeAgo: '06:15:00 AM',
    imageUrl: ASSETS.pipeBurst,
    busId: 'BUS-204',
    assignedTo: {
      name: 'Team B',
      avatar: ASSETS.teamBAvatar,
      team: 'Rapid Emergency Hydrology'
    },
    department: 'Water Supply & Sanitation',
    slaRemaining: '-0h 15m',
    isOverdue: true,
    description: 'High-pressure 600mm feeder line ruptured. Flooding adjacent dual-lane carriageway.',
    status: 'IN_PROGRESS',
    comments: [
      {
        id: 'c4',
        author: 'Team B Lead',
        avatar: ASSETS.teamBAvatar,
        role: 'Supervisor',
        time: '07:20 AM',
        text: 'Main isolation valves 4 & 5 closed. Excavator on site to expose fractured pipe collar.'
      }
    ],
    timeline: [
      { title: 'Detected by AI', subtitle: 'Citizen Hotline + CCTV', time: '06:15 AM', completed: true },
      { title: 'Verified', subtitle: 'Duty Officer', time: '06:20 AM', completed: true },
      { title: 'Ticket Created', subtitle: 'Severity: CRITICAL', time: '06:22 AM', completed: true },
      { title: 'Assigned', subtitle: 'Team B Emergency', time: '06:30 AM', completed: true },
      { title: 'In Progress', subtitle: 'Repair under way', time: '07:00 AM', completed: true, active: true },
      { title: 'Resolved', subtitle: 'Pressure test passed', time: 'Pending', completed: false }
    ]
  },
  {
    id: '4',
    ticketNumber: 'TK-8799',
    title: 'Sewer Line Overflow',
    category: 'Sanitation',
    severity: 'HIGH',
    confidence: 89.0,
    locationName: 'Nehru Park Outer Ring, Gate 3',
    coordinates: { lat: 28.5900, lng: 77.1950, formatted: '28.5900° N, 77.1950° E' },
    ward: 'Ward D - Central',
    timestamp: '23 Oct 2023, 04:00 PM',
    timeAgo: 'Yesterday',
    imageUrl: ASSETS.overflowingBinThumb,
    assignedTo: { name: 'S. Kumar', team: 'Sanitation Squad 4' },
    department: 'Sanitation & Waste',
    slaRemaining: 'Resolved',
    isOverdue: false,
    description: 'Manhole blockage resolved with suction jetting machine.',
    status: 'RESOLVED'
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

export const INITIAL_LIVE_FEEDS: LiveFeedDetection[] = [
  {
    id: 'feed-1',
    title: 'Severe Asphalt Pothole',
    category: 'Roads',
    severity: 'error',
    confidence: 98.4,
    location: 'W-Andheri East, Link Rd',
    timestamp: '10:42:15 AM',
    imageUrl: ASSETS.potholeSevereThumb,
    hasImage: true,
    ticketId: 'TK-8921',
    busNode: 'DTC-BUS-402',
    speedKmh: 34,
    latencyMs: 24,
    fps: 29.8,
    bbox: { x: 32, y: 40, w: 36, h: 28 }
  },
  {
    id: 'feed-2',
    title: 'Overflowing Municipal Bin',
    category: 'Sanitation',
    severity: 'warning',
    confidence: 89.2,
    location: 'S-Colaba Causeway',
    timestamp: '10:40:02 AM',
    imageUrl: ASSETS.overflowingBinThumb,
    hasImage: true,
    ticketId: 'TK-8923',
    busNode: 'DTC-BUS-112',
    speedKmh: 22,
    latencyMs: 31,
    fps: 30.0,
    bbox: { x: 28, y: 35, w: 44, h: 32 }
  },
  {
    id: 'feed-3',
    title: 'Dangling Streetlight Fixture',
    category: 'Streetlights',
    severity: 'info',
    confidence: 94.6,
    location: 'C-Dadar TT Circle',
    timestamp: '10:35:45 AM',
    imageUrl: ASSETS.brokenStreetlightThumb,
    hasImage: true,
    ticketId: 'TK-8890',
    busNode: 'DTC-BUS-331',
    speedKmh: 41,
    latencyMs: 19,
    fps: 30.0,
    bbox: { x: 45, y: 15, w: 20, h: 35 }
  },
  {
    id: 'feed-4',
    title: 'Main Pipeline Burst & Flooding',
    category: 'Drainage',
    severity: 'error',
    confidence: 96.5,
    location: 'Civil Lines, North Ward',
    timestamp: '10:28:11 AM',
    imageUrl: ASSETS.pipeBurst,
    hasImage: true,
    ticketId: 'TK-8855',
    busNode: 'DTC-BUS-204',
    speedKmh: 18,
    latencyMs: 28,
    fps: 29.5,
    bbox: { x: 20, y: 45, w: 60, h: 40 }
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

export const INITIAL_FLEET: BusFleetItem[] = [
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

export const INITIAL_ALERTS: SystemAlert[] = [
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

export const INITIAL_RULES: AutoRoutingRule[] = [
  {
    id: 'R-001',
    name: 'Severe Pothole Heavy Crew Rule',
    condition: "IF {Type} == 'Pothole' AND {Est_Depth} > 5cm",
    action: "ASSIGN_TO: 'Roads Dept - Heavy Crew'\nSEVERITY: 'HIGH'\nSLA: 4h",
    isActive: true,
    department: 'Roads & Bridges',
    severity: 'HIGH',
    sla: '4h'
  },
  {
    id: 'R-042',
    name: 'Electrical Hazard Rapid SLA',
    condition: "IF {Keyword} MATCHES 'Live Wire' OR {Type} == 'Transformer Sparking'",
    action: "ASSIGN_TO: 'Electricity Board - Rapid'\nSEVERITY: 'CRITICAL'\nSLA: 1h",
    isActive: true,
    department: 'Electrical & Lighting',
    severity: 'CRITICAL',
    sla: '1h'
  },
  {
    id: 'R-089',
    name: 'Sanitation Bulk Garbage Clearance',
    condition: "IF {Type} == 'Overflowing Bin' AND {Volume_Est} > 2m3",
    action: "ASSIGN_TO: 'Sanitation Compactor Unit 3'\nSEVERITY: 'MED'\nSLA: 6h",
    isActive: true,
    department: 'Sanitation & Waste',
    severity: 'MED',
    sla: '6h'
  }
];

export const INITIAL_CROSS_AGENCY: CrossAgencyTicket[] = [
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

export const INITIAL_CONTACTS: AgencyContact[] = [
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

export const INITIAL_METRICS: DepartmentMetric[] = [
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

export const INITIAL_HOTSPOTS: DefectHotspot[] = [
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

export const INITIAL_CABIN_INCIDENTS: BusCabinIncident[] = [
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

export const INITIAL_BLACKSPOTS: AccidentZoneBlackspot[] = [
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
