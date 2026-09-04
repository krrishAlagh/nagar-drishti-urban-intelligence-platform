export type ActiveView = 
  | 'dashboard'
  | 'live-map'
  | 'tickets'
  | 'ticket-detail'
  | 'safety-complaints'
  | 'accident-analytics'
  | 'analytics'
  | 'fleet'
  | 'multi-agency'
  | 'notifications'
  | 'settings'
  | 'services-directory'
  | 'login';

export type Language = 'en' | 'hi';
export type Theme = 'light' | 'dark';
export type FontSizeScale = 'sm' | 'md' | 'lg';

export type UserRole = 
  | 'Municipal Admin'
  | 'Zonal Officer'
  | 'Repair Crew Lead'
  | 'Transport Authority';

export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MED' | 'LOW';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED_CLOSED';

export type DefectCategory = 
  | 'Potholes'
  | 'Sanitation'
  | 'Streetlights'
  | 'Water Logging'
  | 'Encroachment'
  | 'Electrical'
  | 'Manhole Hazard'
  | 'Traffic Signal';

export interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  role: string;
  time: string;
  text: string;
}

export interface TimelineItem {
  title: string;
  subtitle: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

export interface DefectItem {
  id: string;
  ticketNumber: string;
  title: string;
  category: DefectCategory;
  severity: TicketPriority;
  confidence: number;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
  };
  ward: string;
  timestamp: string;
  timeAgo: string;
  imageUrl: string;
  hasOverlay?: boolean;
  busId?: string;
  assignedTo?: {
    name: string;
    avatar?: string;
    team?: string;
  };
  department: string;
  slaRemaining: string;
  isOverdue?: boolean;
  description: string;
  status: TicketStatus;
  comments?: CommentItem[];
  timeline?: TimelineItem[];
}

export interface LiveFeedDetection {
  id: string;
  title: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  confidence: number;
  location: string;
  timestamp: string;
  imageUrl: string;
  hasImage: boolean;
  ticketId?: string;
  busNode?: string;
  speedKmh?: number;
  latencyMs?: number;
  fps?: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

export interface BusFleetItem {
  busId: string;
  route: string;
  cameraStatus: 'Online' | 'Warning' | 'Offline';
  gpsSignal: 'full' | 'medium' | 'lost';
  lastSyncTime: string;
  kmScanned: number;
  depot: string;
  coordinates: { x: number; y: number };
  activeAlert?: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
  icon: string;
  unread?: boolean;
}

export interface AutoRoutingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  isActive: boolean;
  department: string;
  severity: TicketPriority;
  sla: string;
}

export interface CrossAgencyTicket {
  id: string;
  ticketCode: string;
  issue: string;
  originatingDept: string;
  receivingDept: string;
  status: 'Pending Hand-off' | 'Urgent Action' | 'In Progress' | 'Resolved';
  hasUnreadMessage: boolean;
  lastUpdated: string;
  messagesCount: number;
}

export interface AgencyContact {
  id: string;
  name: string;
  officer: string;
  designation: string;
  phone: string;
  available: boolean;
}

export interface DepartmentMetric {
  department: string;
  assigned: number;
  resolved: number;
  avgResTimeHrs: number;
  slaCompliance: number;
}

export interface DefectHotspot {
  id: string;
  locationCode: string;
  name: string;
  primaryIssue: string;
  repeatCount: number;
  lastDetected: string;
  badgeType: 'error' | 'warning' | 'secondary';
}

export type CabinIncidentCategory = 
  | 'Driver Misconduct / Phone Use'
  | 'Conductor Overcharging / Dispute'
  | 'Passenger Harassment / Women Safety'
  | 'Overcrowding & Gate Blocking'
  | 'Fare POS & Sensor Malfunction'
  | 'Medical Emergency / Fall';

export interface BusCabinIncident {
  id: string;
  ticketCode: string;
  busNumber: string;
  routeNumber: string;
  category: CabinIncidentCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MED' | 'LOW';
  detectedBy: 'AI Cabin Camera' | 'Citizen Passenger' | 'Conductor Panic Switch' | 'Depot Inspection';
  status: 'NEW' | 'INVESTIGATING' | 'DISPATCHED_ENFORCEMENT' | 'RESOLVED';
  timestamp: string;
  timeAgo: string;
  location: string;
  ward: string;
  driverName: string;
  conductorName: string;
  description: string;
  passengerName?: string;
  passengerPhone?: string;
  hasCctvClip?: boolean;
  cctvSnapshotUrl?: string;
  resolutionNotes?: string;
}

export interface AccidentZoneBlackspot {
  id: string;
  spotCode: string;
  corridorName: string;
  ward: string;
  riskLevel: 'EXTREME_RISK' | 'HIGH_RISK' | 'MODERATE_RISK';
  accidentsPast30Days: number;
  accidentsPast6Months: number;
  accidentsPast1Year: number;
  fatalitiesCount: number;
  injuriesCount: number;
  dailyTrafficVolume: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
    mapX: number;
    mapY: number;
  };
  primaryHazardFactors: string[];
  lastAccidentDate: string;
  safetyIndexScore: number;
  remedialActionStatus: 'Survey In Progress' | 'Speed Tables Approved' | 'Lighting Retrofit Underway' | 'Signage Installed' | 'Pending Action';
  actionAuthority: string;
}

export interface UIDAIStyleServiceItem {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  icon: string;
  badge?: string;
  targetView: ActiveView;
  subCategory: string;
  actionType?: 'navigate' | 'modal' | 'filter';
  filterKey?: string;
}

export interface UIDAIStylePortalSection {
  id: string;
  headingHi: string;
  headingEn: string;
  subheadingHi: string;
  subheadingEn: string;
  icon: string;
  color: string;
  items: UIDAIStyleServiceItem[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  phone: string;
  wardAssigned?: string;
}
