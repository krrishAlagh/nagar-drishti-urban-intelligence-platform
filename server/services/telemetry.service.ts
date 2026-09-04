import { db } from '../db/database';
import { wsService } from './websocket.service';
import { LiveFeedDetection, BusFleetItem, DefectItem } from '../types/serverTypes';
import { ASSETS } from '../db/seed';
import { ENV } from '../config/env';

export class TelemetryService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning: boolean = false;
  private static tickCounter: number = 0;

  private static mockLocations = [
    { name: 'Connaught Place Outer Circle', ward: 'Ward C - Central', lat: 28.6315, lng: 77.2167 },
    { name: 'Ring Road Moolchand Flyover', ward: 'Ward B - South', lat: 28.5684, lng: 77.2345 },
    { name: 'Mukarba Chowk Flyover Slip', ward: 'Ward A - North', lat: 28.7235, lng: 77.1650 },
    { name: 'Laxmi Nagar Metro Pillar 52', ward: 'Ward D - East', lat: 28.6300, lng: 77.2790 },
    { name: 'Dhaula Kuan Enclave Junction', ward: 'Ward C - Central / West', lat: 28.5920, lng: 77.1580 },
    { name: 'Sector 14 Rohini Main Rd', ward: 'Ward A - North', lat: 28.7120, lng: 77.1210 },
    { name: 'AIIMS Flyover Pillar 14', ward: 'Ward B - South', lat: 28.5690, lng: 77.2100 },
    { name: 'ITO Red Light Corridor', ward: 'Ward C - Central', lat: 28.6280, lng: 77.2410 }
  ];

  private static mockDefects = [
    { title: 'Severe Asphalt Ravelling & Pothole', category: 'Potholes' as const, severity: 'CRITICAL' as const, image: ASSETS.potholeClose, dept: 'PWD Roads & Bridges', sla: '01h 00m' },
    { title: 'Overflowing Municipal Waste Container', category: 'Sanitation' as const, severity: 'MED' as const, image: ASSETS.overflowingBinThumb, dept: 'MCD Solid Waste Management', sla: '06h 00m' },
    { title: 'Damaged Sodium Lamp Luminaire', category: 'Streetlights' as const, severity: 'MED' as const, image: ASSETS.brokenStreetlightThumb, dept: 'BSES / Electrical Dept', sla: '08h 00m' },
    { title: 'Sub-surface Water Main Leakage', category: 'Water Logging' as const, severity: 'HIGH' as const, image: ASSETS.pipeBurst, dept: 'Delhi Jal Board (DJB)', sla: '04h 00m' },
    { title: 'Cracked Curbstone & Pedestrian Hazard', category: 'Potholes' as const, severity: 'HIGH' as const, image: ASSETS.potholeSevereThumb, dept: 'PWD Roads & Bridges', sla: '04h 00m' }
  ];

  public static start() {
    if (this.isRunning || !ENV.ENABLE_TELEMETRY_SIMULATION) return;

    this.isRunning = true;
    const intervalMs = Math.min(ENV.SIMULATION_INTERVAL_MS, 3000);
    console.log(`[Telemetry] Starting autonomous telemetry simulation & work order engine (interval: ${intervalMs}ms)`);

    this.timer = setInterval(() => {
      try {
        this.tick();
      } catch (err) {
        console.warn('[Telemetry] Simulation tick error:', err);
      }
    }, intervalMs);
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Telemetry] Simulation engine paused.');
  }

  public static tick() {
    this.tickCounter++;

    // 1. Move fleet buses smoothly across map coordinates & increment scanned mileage
    const fleet = db.getFleet();
    if (fleet.length > 0) {
      fleet.forEach((bus) => {
        const deltaX = (Math.random() - 0.48) * 3;
        const deltaY = (Math.random() - 0.48) * 3;
        const newX = Math.max(12, Math.min(88, bus.coordinates.x + deltaX));
        const newY = Math.max(15, Math.min(85, bus.coordinates.y + deltaY));
        const updatedKm = parseFloat((bus.kmScanned + (0.1 + Math.random() * 0.2)).toFixed(1));

        const updated = db.updateBusTelemetry(bus.busId, {
          coordinates: { x: Math.round(newX), y: Math.round(newY) },
          kmScanned: updatedKm
        });

        if (updated) {
          wsService.broadcast('FLEET_UPDATE', updated);
        }
      });
    }

    // 2. Generate live AI edge camera detection
    const loc = this.mockLocations[Math.floor(Math.random() * this.mockLocations.length)];
    const defectDef = this.mockDefects[Math.floor(Math.random() * this.mockDefects.length)];
    const randomBus = fleet[Math.floor(Math.random() * fleet.length)];
    const confidence = parseFloat((88 + Math.random() * 11.5).toFixed(1));

    const detection: LiveFeedDetection = {
      id: `feed-${Date.now()}`,
      title: defectDef.title,
      category: defectDef.category === 'Potholes' ? 'Roads' : defectDef.category === 'Water Logging' ? 'Drainage' : defectDef.category,
      severity: defectDef.severity === 'CRITICAL' ? 'error' : defectDef.severity === 'HIGH' ? 'warning' : 'info',
      confidence,
      location: loc.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      imageUrl: defectDef.image,
      hasImage: true,
      busNode: randomBus ? `DTC-${randomBus.busId}` : 'DTC-BUS-402',
      speedKmh: Math.floor(22 + Math.random() * 26),
      latencyMs: Math.floor(16 + Math.random() * 14),
      fps: parseFloat((29.6 + Math.random() * 0.7).toFixed(1)),
      bbox: {
        x: Math.floor(20 + Math.random() * 30),
        y: Math.floor(25 + Math.random() * 30),
        w: Math.floor(30 + Math.random() * 25),
        h: Math.floor(20 + Math.random() * 20)
      }
    };

    db.addLiveFeed(detection);
    wsService.broadcast('LIVE_DETECTION', detection);

    // 3. Every 5 ticks (~15 seconds), synthesize a new AI Triaged Defect Work Order
    if (this.tickCounter % 5 === 0) {
      const newTicketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newDefect: DefectItem = {
        id: `tk-${Date.now()}`,
        ticketNumber: newTicketNumber,
        title: defectDef.title,
        category: defectDef.category,
        severity: defectDef.severity,
        confidence,
        locationName: loc.name,
        coordinates: {
          lat: loc.lat + (Math.random() - 0.5) * 0.005,
          lng: loc.lng + (Math.random() - 0.5) * 0.005,
          formatted: `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`
        },
        ward: loc.ward,
        timestamp: 'Just now',
        timeAgo: 'Just now',
        imageUrl: defectDef.image,
        department: defectDef.dept,
        slaRemaining: defectDef.sla,
        isOverdue: false,
        description: `Edge AI Dashcam on ${randomBus?.busId || 'BUS-402'} detected anomaly with ${confidence}% confidence score. Automatic work order dispatched.`,
        status: 'NEW',
        timeline: [
          { title: 'Reported & Triaged', subtitle: 'Nagar AI Core', time: 'Just now', completed: true, active: true },
          { title: 'Assigned', subtitle: 'Pending Dispatch', time: 'Pending', completed: false },
          { title: 'In Progress', subtitle: 'Crew on route', time: 'Pending', completed: false },
          { title: 'Resolved', subtitle: 'Field sign-off', time: 'Pending', completed: false }
        ]
      };

      const added = db.createDefect(newDefect);
      wsService.broadcast('NEW_DEFECT', added);
      wsService.broadcast('TICKET_UPDATE', added);
      console.log(`[Telemetry] Auto-synthesized & broadcasted new Defect Order: ${added.ticketNumber}`);
    }

    // 4. Automated Work Order Lifecycle Engine: Auto-assign, auto-dispatch, auto-resolve
    if (this.tickCounter % 4 === 0) {
      const allTickets = db.getDefects();
      
      // Auto-assign NEW tickets
      const newTicket = allTickets.find((t) => t.status === 'NEW');
      if (newTicket) {
        const assigned = db.updateDefect(newTicket.id, {
          status: 'ASSIGNED',
          assignedTo: {
            name: `${newTicket.department} Zonal Squad`,
            team: `${newTicket.ward} Rapid Maintenance Unit`,
            avatar: ASSETS.sharmaAvatar
          },
          timeline: newTicket.timeline?.map((step, idx) =>
            idx === 1
              ? { ...step, completed: true, active: false, time: 'Just now' }
              : idx === 2
              ? { ...step, active: true }
              : step
          )
        });
        if (assigned) {
          wsService.broadcast('TICKET_UPDATE', assigned);
          console.log(`[AutoWorkOrder] Auto-assigned ticket ${assigned.ticketNumber} to ${assigned.department}`);
        }
      } else {
        // Auto-dispatch ASSIGNED to IN_PROGRESS
        const assignedTicket = allTickets.find((t) => t.status === 'ASSIGNED');
        if (assignedTicket) {
          const inProgress = db.updateDefect(assignedTicket.id, {
            status: 'IN_PROGRESS',
            timeline: assignedTicket.timeline?.map((step, idx) =>
              idx === 2
                ? { ...step, completed: true, active: true, time: 'Just now' }
                : step
            )
          });
          if (inProgress) {
            wsService.broadcast('TICKET_UPDATE', inProgress);
            console.log(`[AutoWorkOrder] Auto-dispatched work order ${inProgress.ticketNumber} to IN_PROGRESS`);
          }
        } else {
          // Auto-resolve IN_PROGRESS ticket
          const inProgressTicket = allTickets.find((t) => t.status === 'IN_PROGRESS');
          if (inProgressTicket) {
            const resolved = db.updateDefect(inProgressTicket.id, {
              status: 'RESOLVED',
              timeline: inProgressTicket.timeline?.map((step) => ({ ...step, completed: true, active: false }))
            });
            if (resolved) {
              wsService.broadcast('TICKET_UPDATE', resolved);
              console.log(`[AutoWorkOrder] Auto-resolved work order ${resolved.ticketNumber} with AI verification`);
            }
          }
        }
      }
    }

    // 5. Periodically broadcast real-time updated system analytics KPI
    if (this.tickCounter % 3 === 0) {
      const allDefects = db.getDefects();
      const stats = db.getStats();
      const resolvedTodayCount = allDefects.filter(
        (d) => d.status === 'RESOLVED' || d.status === 'VERIFIED_CLOSED'
      ).length;
      const criticalPotholesCount = allDefects.filter(
        (d) => d.severity === 'CRITICAL'
      ).length;

      wsService.broadcast('ANALYTICS_UPDATE', {
        kpi: {
          totalIngestedDetections: stats.totalIngestedDetections,
          activeFleetBuses: stats.activeFleetBuses,
          totalFleetBuses: stats.totalFleetBuses,
          resolvedTodayCount,
          criticalPotholesCount,
          avgAiConfidence: parseFloat((94.2 + Math.random() * 1.5).toFixed(1)),
          avgEdgeLatencyMs: parseFloat((17.8 + Math.random() * 1.2).toFixed(1))
        },
        totalDefects: allDefects.length,
        stats
      });
    }
  }
}
