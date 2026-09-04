import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';
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
  UserAccount
} from '../types/serverTypes';
import {
  INITIAL_DEFECTS,
  INITIAL_LIVE_FEEDS,
  INITIAL_FLEET,
  INITIAL_ALERTS,
  INITIAL_RULES,
  INITIAL_CROSS_AGENCY,
  INITIAL_CONTACTS,
  INITIAL_METRICS,
  INITIAL_HOTSPOTS,
  INITIAL_CABIN_INCIDENTS,
  INITIAL_BLACKSPOTS,
  INITIAL_USERS
} from './seed';

export interface DatabaseSchema {
  users: UserAccount[];
  defects: DefectItem[];
  liveFeeds: LiveFeedDetection[];
  fleet: BusFleetItem[];
  alerts: SystemAlert[];
  rules: AutoRoutingRule[];
  crossAgencyTickets: CrossAgencyTicket[];
  agencyContacts: AgencyContact[];
  departmentMetrics: DepartmentMetric[];
  hotspots: DefectHotspot[];
  cabinIncidents: BusCabinIncident[];
  blackspots: AccidentZoneBlackspot[];
  stats: {
    totalIngestedDetections: number;
    totalResolvedDefects: number;
    lastTelemetrySync: string;
  };
}

class HighPerformanceDatabase {
  private data: DatabaseSchema;
  private dbFilePath: string;
  private isPersisting: boolean = false;
  private pendingPersist: boolean = false;

  constructor() {
    this.dbFilePath = path.join(ENV.DATA_DIR, 'db.json');
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(ENV.DATA_DIR)) {
        fs.mkdirSync(ENV.DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        console.log('[DB] Loaded existing persistent data from disk.');
        return parsed;
      }
    } catch (err) {
      console.warn('[DB] Failed to load disk state, falling back to seed initial data:', err);
    }

    console.log('[DB] Initializing new database with seed datasets.');
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      defects: INITIAL_DEFECTS,
      liveFeeds: INITIAL_LIVE_FEEDS,
      fleet: INITIAL_FLEET,
      alerts: INITIAL_ALERTS,
      rules: INITIAL_RULES,
      crossAgencyTickets: INITIAL_CROSS_AGENCY,
      agencyContacts: INITIAL_CONTACTS,
      departmentMetrics: INITIAL_METRICS,
      hotspots: INITIAL_HOTSPOTS,
      cabinIncidents: INITIAL_CABIN_INCIDENTS,
      blackspots: INITIAL_BLACKSPOTS,
      stats: {
        totalIngestedDetections: 4820,
        totalResolvedDefects: 2680,
        lastTelemetrySync: new Date().toISOString()
      }
    };

    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(ENV.DATA_DIR)) {
        fs.mkdirSync(ENV.DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing sync to db.json:', err);
    }
  }

  public save(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isPersisting) {
        this.pendingPersist = true;
        resolve();
        return;
      }

      this.isPersisting = true;
      const snapshot = JSON.stringify(this.data, null, 2);

      fs.writeFile(this.dbFilePath, snapshot, 'utf-8', (err) => {
        this.isPersisting = false;
        if (err) {
          console.error('[DB] Async persistence error:', err);
        }
        if (this.pendingPersist) {
          this.pendingPersist = false;
          this.save().then(resolve);
        } else {
          resolve();
        }
      });
    });
  }

  // --- Defects Operations ---
  public getDefects(filters?: {
    category?: string;
    severity?: string;
    status?: string;
    ward?: string;
    search?: string;
  }): DefectItem[] {
    let result = [...this.data.defects];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        result = result.filter((d) => d.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.severity && filters.severity !== 'all') {
        result = result.filter((d) => d.severity.toUpperCase() === filters.severity!.toUpperCase());
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter((d) => d.status.toUpperCase() === filters.status!.toUpperCase());
      }
      if (filters.ward && filters.ward !== 'all') {
        result = result.filter((d) => d.ward.toLowerCase().includes(filters.ward!.toLowerCase()));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (d) =>
            d.ticketNumber.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q) ||
            d.locationName.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.department.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }

  public getDefectById(id: string): DefectItem | undefined {
    return this.data.defects.find((d) => d.id === id || d.ticketNumber === id);
  }

  public createDefect(defect: DefectItem): DefectItem {
    this.data.defects.unshift(defect);
    this.data.stats.totalIngestedDetections += 1;
    this.save();
    return defect;
  }

  public updateDefect(id: string, updates: Partial<DefectItem>): DefectItem | null {
    const idx = this.data.defects.findIndex((d) => d.id === id || d.ticketNumber === id);
    if (idx === -1) return null;

    const existing = this.data.defects[idx];
    const updated = { ...existing, ...updates };

    if (updates.status === 'RESOLVED' || updates.status === 'VERIFIED_CLOSED') {
      if (existing.status !== 'RESOLVED' && existing.status !== 'VERIFIED_CLOSED') {
        this.data.stats.totalResolvedDefects += 1;
      }
    }

    this.data.defects[idx] = updated;
    this.save();
    return updated;
  }

  // --- Live Feed Operations ---
  public getLiveFeeds(): LiveFeedDetection[] {
    return this.data.liveFeeds;
  }

  public addLiveFeed(item: LiveFeedDetection): LiveFeedDetection {
    this.data.liveFeeds.unshift(item);
    if (this.data.liveFeeds.length > 50) {
      this.data.liveFeeds = this.data.liveFeeds.slice(0, 50);
    }
    this.data.stats.totalIngestedDetections += 1;
    this.data.stats.lastTelemetrySync = new Date().toISOString();
    this.save();
    return item;
  }

  // --- Fleet Operations ---
  public getFleet(): BusFleetItem[] {
    return this.data.fleet;
  }

  public updateBusTelemetry(busId: string, updates: Partial<BusFleetItem>): BusFleetItem | null {
    const idx = this.data.fleet.findIndex((b) => b.busId === busId);
    if (idx === -1) return null;

    const updated = { ...this.data.fleet[idx], ...updates, lastSyncTime: new Date().toLocaleTimeString() };
    this.data.fleet[idx] = updated;
    this.save();
    return updated;
  }

  // --- Cabin Incidents Operations ---
  public getCabinIncidents(): BusCabinIncident[] {
    return this.data.cabinIncidents;
  }

  public getCabinIncidentById(id: string): BusCabinIncident | undefined {
    return this.data.cabinIncidents.find((i) => i.id === id || i.ticketCode === id);
  }

  public createCabinIncident(incident: BusCabinIncident): BusCabinIncident {
    this.data.cabinIncidents.unshift(incident);
    this.save();
    return incident;
  }

  public updateCabinIncidentStatus(id: string, status: BusCabinIncident['status']): BusCabinIncident | null {
    const idx = this.data.cabinIncidents.findIndex((i) => i.id === id || i.ticketCode === id);
    if (idx === -1) return null;

    this.data.cabinIncidents[idx].status = status;
    this.save();
    return this.data.cabinIncidents[idx];
  }

  // --- Accident Blackspots Operations ---
  public getBlackspots(): AccidentZoneBlackspot[] {
    return this.data.blackspots;
  }

  public getBlackspotById(id: string): AccidentZoneBlackspot | undefined {
    return this.data.blackspots.find((b) => b.id === id || b.spotCode === id);
  }

  public updateBlackspotRemedial(
    id: string,
    status: AccidentZoneBlackspot['remedialActionStatus'],
    authority?: string
  ): AccidentZoneBlackspot | null {
    const idx = this.data.blackspots.findIndex((b) => b.id === id || b.spotCode === id);
    if (idx === -1) return null;

    this.data.blackspots[idx].remedialActionStatus = status;
    if (authority) this.data.blackspots[idx].actionAuthority = authority;
    this.save();
    return this.data.blackspots[idx];
  }

  // --- Auto-Routing Rules Operations ---
  public getRules(): AutoRoutingRule[] {
    return this.data.rules;
  }

  public createRule(rule: AutoRoutingRule): AutoRoutingRule {
    this.data.rules.push(rule);
    this.save();
    return rule;
  }

  public toggleRuleActive(ruleId: string): AutoRoutingRule | null {
    const rule = this.data.rules.find((r) => r.id === ruleId);
    if (!rule) return null;
    rule.isActive = !rule.isActive;
    this.save();
    return rule;
  }

  public deleteRule(ruleId: string): boolean {
    const idx = this.data.rules.findIndex((r) => r.id === ruleId);
    if (idx === -1) return false;
    this.data.rules.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Alerts Operations ---
  public getAlerts(): SystemAlert[] {
    return this.data.alerts;
  }

  public markAlertRead(alertId: string): boolean {
    const alert = this.data.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    alert.unread = false;
    this.save();
    return true;
  }

  public markAllAlertsRead(): void {
    this.data.alerts.forEach((a) => (a.unread = false));
    this.save();
  }

  public createAlert(alert: SystemAlert): SystemAlert {
    this.data.alerts.unshift(alert);
    this.save();
    return alert;
  }

  // --- Cross Agency Operations ---
  public getCrossAgencyTickets(): CrossAgencyTicket[] {
    return this.data.crossAgencyTickets;
  }

  public createCrossAgencyTicket(item: CrossAgencyTicket): CrossAgencyTicket {
    this.data.crossAgencyTickets.unshift(item);
    this.save();
    return item;
  }

  public updateCrossAgencyStatus(
    id: string,
    status: CrossAgencyTicket['status']
  ): CrossAgencyTicket | null {
    const idx = this.data.crossAgencyTickets.findIndex((t) => t.id === id || t.ticketCode === id);
    if (idx === -1) return null;
    this.data.crossAgencyTickets[idx].status = status;
    this.data.crossAgencyTickets[idx].lastUpdated = 'Just now';
    this.save();
    return this.data.crossAgencyTickets[idx];
  }

  public getAgencyContacts(): AgencyContact[] {
    return this.data.agencyContacts;
  }

  // --- Analytics & Metrics ---
  public getDepartmentMetrics(): DepartmentMetric[] {
    return this.data.departmentMetrics;
  }

  public getHotspots(): DefectHotspot[] {
    return this.data.hotspots;
  }

  public getStats() {
    const totalDefects = this.data.defects.length;
    const criticalCount = this.data.defects.filter((d) => d.severity === 'CRITICAL').length;
    const resolvedCount = this.data.defects.filter(
      (d) => d.status === 'RESOLVED' || d.status === 'VERIFIED_CLOSED'
    ).length;
    const activeBuses = this.data.fleet.filter((b) => b.cameraStatus === 'Online').length;
    const unreadAlerts = this.data.alerts.filter((a) => a.unread).length;

    return {
      totalDefects,
      criticalCount,
      resolvedCount,
      resolutionRate: totalDefects > 0 ? Math.round((resolvedCount / totalDefects) * 100) : 0,
      activeFleetBuses: activeBuses,
      totalFleetBuses: this.data.fleet.length,
      unreadAlerts,
      totalIngestedDetections: this.data.stats.totalIngestedDetections,
      lastSyncTime: this.data.stats.lastTelemetrySync
    };
  }

  // --- User Accounts ---
  public getUsers(): UserAccount[] {
    return this.data.users;
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.data.users.find((u) => u.id === id || u.email === id);
  }
}

export const db = new HighPerformanceDatabase();
