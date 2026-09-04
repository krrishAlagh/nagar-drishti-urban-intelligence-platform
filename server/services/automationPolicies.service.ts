import { DefectItem } from '../types/serverTypes';

export interface AutomationPolicy {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  triggerCondition: (defect: DefectItem) => boolean;
  action: (defect: DefectItem) => any;
  priority: number; // Higher number = higher priority
}

export interface ScheduledAutomationJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: 'immediate' | 'hourly' | 'every-4-hours' | 'daily';
  action: () => void;
  lastRun?: Date;
  nextRun?: Date;
}

export const AUTO_ASSIGNMENT_POLICIES: AutomationPolicy[] = [
  {
    id: 'policy-1',
    name: 'Immediate Electrical Hazard Assignment',
    enabled: true,
    description: 'Automatically assign CRITICAL electrical defects immediately',
    triggerCondition: (defect: DefectItem) => {
      return (
        defect.status === 'NEW' &&
        defect.severity === 'CRITICAL' &&
        (defect.category?.toLowerCase().includes('electrical') ||
          defect.category?.toLowerCase().includes('streetlight') ||
          defect.description?.toLowerCase().includes('live wire') ||
          defect.description?.toLowerCase().includes('spark'))
      );
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'intelligent', priority: 'speed' },
      sla: '01h 00m',
      notification: 'URGENT_DISPATCH'
    }),
    priority: 10
  },

  {
    id: 'policy-2',
    name: 'Emergency Water Logging Response',
    enabled: true,
    description: 'Immediately assign CRITICAL water logging incidents to hydrology teams',
    triggerCondition: (defect: DefectItem) => {
      return (
        defect.status === 'NEW' &&
        defect.severity === 'CRITICAL' &&
        (defect.category?.toLowerCase().includes('water logging') ||
          defect.category?.toLowerCase().includes('flooding') ||
          defect.description?.toLowerCase().includes('waterlog') ||
          defect.description?.toLowerCase().includes('flood'))
      );
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'department-match', priority: 'speed' },
      sla: '02h 00m',
      notification: 'EMERGENCY_DISPATCH'
    }),
    priority: 9
  },

  {
    id: 'policy-3',
    name: 'High Severity Pothole Assignment',
    enabled: true,
    description: 'Auto-assign HIGH severity potholes to appropriate road crew',
    triggerCondition: (defect: DefectItem) => {
      return (
        defect.status === 'NEW' &&
        defect.severity === 'HIGH' &&
        (defect.category?.toLowerCase().includes('pothole') ||
          defect.category?.toLowerCase().includes('crater') ||
          defect.category?.toLowerCase().includes('road defect'))
      );
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'intelligent', priority: 'expertise' },
      sla: '04h 00m',
      notification: 'PRIORITY_DISPATCH'
    }),
    priority: 7
  },

  {
    id: 'policy-4',
    name: 'Standard Maintenance Assignment',
    enabled: true,
    description: 'Auto-assign MEDIUM priority defects using round-robin',
    triggerCondition: (defect: DefectItem) => {
      return defect.status === 'NEW' && defect.severity === 'MED';
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'round-robin', priority: 'balanced' },
      sla: '08h 00m',
      notification: 'STANDARD_DISPATCH'
    }),
    priority: 5
  },

  {
    id: 'policy-5',
    name: 'Low Priority Batch Assignment',
    enabled: true,
    description: 'Batch assign LOW priority defects at end of day',
    triggerCondition: (defect: DefectItem) => {
      return defect.status === 'NEW' && defect.severity === 'LOW';
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'availability', priority: 'balanced' },
      sla: '24h 00m',
      notification: 'BATCH_DISPATCH',
      batchProcess: true
    }),
    priority: 3
  },

  {
    id: 'policy-6',
    name: 'Sanitation Emergency Assignment',
    enabled: true,
    description: 'Rapid assignment for critical sanitation issues',
    triggerCondition: (defect: DefectItem) => {
      return (
        defect.status === 'NEW' &&
        defect.severity === 'CRITICAL' &&
        (defect.category?.toLowerCase().includes('sanitation') ||
          defect.description?.toLowerCase().includes('overflow') ||
          defect.description?.toLowerCase().includes('dump'))
      );
    },
    action: (defect: DefectItem) => ({
      autoAssign: true,
      strategy: { method: 'department-match', priority: 'speed' },
      sla: '03h 00m',
      notification: 'URGENT_DISPATCH'
    }),
    priority: 8
  }
];

export const SCHEDULED_AUTOMATION_JOBS: ScheduledAutomationJob[] = [
  {
    id: 'job-1',
    name: 'Auto-assign Pending Tickets - Immediate',
    enabled: true,
    schedule: 'immediate',
    action: () => {
      // Executes immediately when ticket is created
    }
  },

  {
    id: 'job-2',
    name: 'Auto-assign Pending Tickets - Hourly Batch',
    enabled: true,
    schedule: 'hourly',
    action: () => {
      // Executes every hour to catch any unassigned tickets
    }
  },

  {
    id: 'job-3',
    name: 'Crew Load Balancing - Every 4 hours',
    enabled: true,
    schedule: 'every-4-hours',
    action: () => {
      // Rebalances crew assignments if workload becomes uneven
    }
  },

  {
    id: 'job-4',
    name: 'Daily Shift Assignment Report',
    enabled: true,
    schedule: 'daily',
    action: () => {
      // Generates daily report of all assignments
    }
  }
];

/**
 * Apply automation policies to a defect
 */
export function evaluateAutomationPolicies(defect: DefectItem): AutomationPolicy | null {
  const applicablePolicies = AUTO_ASSIGNMENT_POLICIES.filter(
    (policy) => policy.enabled && policy.triggerCondition(defect)
  );

  if (applicablePolicies.length === 0) {
    return null;
  }

  // Return highest priority policy
  return applicablePolicies.sort((a, b) => b.priority - a.priority)[0];
}

/**
 * Get automation status summary
 */
export function getAutomationStatus() {
  const enabledPolicies = AUTO_ASSIGNMENT_POLICIES.filter((p) => p.enabled);
  const enabledJobs = SCHEDULED_AUTOMATION_JOBS.filter((j) => j.enabled);

  return {
    policiesEnabled: enabledPolicies.length,
    policiesTotal: AUTO_ASSIGNMENT_POLICIES.length,
    jobsEnabled: enabledJobs.length,
    jobsTotal: SCHEDULED_AUTOMATION_JOBS.length,
    automationActive: enabledPolicies.length > 0 && enabledJobs.length > 0,
    policies: enabledPolicies.map((p) => ({
      id: p.id,
      name: p.name,
      priority: p.priority
    })),
    jobs: enabledJobs.map((j) => ({
      id: j.id,
      name: j.name,
      schedule: j.schedule
    }))
  };
}
