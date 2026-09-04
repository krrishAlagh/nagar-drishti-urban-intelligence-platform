import { DefectItem, AutoRoutingRule } from '../types/serverTypes';
import { db } from '../db/database';

export interface RoutingEvaluationResult {
  matchedRule?: AutoRoutingRule;
  department: string;
  severity: DefectItem['severity'];
  slaRemaining: string;
  assignedTeam?: string;
  reasoning: string;
}

export class RulesEngineService {
  public static evaluateDefect(defect: Partial<DefectItem>): RoutingEvaluationResult {
    const rules = db.getRules().filter((r) => r.isActive);
    const category = defect.category || 'Potholes';
    const desc = (defect.description || '').toLowerCase();
    const title = (defect.title || '').toLowerCase();

    // Check specific active rules
    for (const rule of rules) {
      if (rule.id === 'R-042' || rule.name.toLowerCase().includes('electrical')) {
        if (
          category === 'Electrical' ||
          category === 'Streetlights' ||
          desc.includes('live wire') ||
          desc.includes('sparking') ||
          desc.includes('shock') ||
          title.includes('wire') ||
          title.includes('spark')
        ) {
          return {
            matchedRule: rule,
            department: 'Electrical & Lighting',
            severity: 'CRITICAL',
            slaRemaining: '01h 00m',
            assignedTeam: 'Electricity Board - Rapid Squad',
            reasoning: `Triggered Rule ${rule.id} (${rule.name}): Live electrical or hazardous lighting defect detected.`
          };
        }
      }

      if (rule.id === 'R-001' || rule.name.toLowerCase().includes('pothole')) {
        if (
          category === 'Potholes' &&
          (desc.includes('depth') || desc.includes('cm') || desc.includes('severe') || title.includes('severity 3') || title.includes('severe'))
        ) {
          return {
            matchedRule: rule,
            department: 'Roads & Bridges',
            severity: 'HIGH',
            slaRemaining: '04h 00m',
            assignedTeam: 'Roads Dept - Heavy Crew 1',
            reasoning: `Triggered Rule ${rule.id} (${rule.name}): Deep crater/pothole requiring asphalt hot-mix filling crew.`
          };
        }
      }

      if (rule.id === 'R-089' || rule.name.toLowerCase().includes('sanitation')) {
        if (
          category === 'Sanitation' &&
          (desc.includes('overflow') || desc.includes('dump') || desc.includes('garbage') || desc.includes('bulk'))
        ) {
          return {
            matchedRule: rule,
            department: 'Sanitation & Waste',
            severity: 'MED',
            slaRemaining: '06h 00m',
            assignedTeam: 'Sanitation Compactor Unit 3',
            reasoning: `Triggered Rule ${rule.id} (${rule.name}): High volume waste accumulation routed to mechanized compactor.`
          };
        }
      }
    }

    // Default category-based intelligent routing fallback
    switch (category) {
      case 'Potholes':
        return {
          department: 'Roads & Bridges',
          severity: defect.severity || 'HIGH',
          slaRemaining: '04h 00m',
          assignedTeam: 'Central Roads Division',
          reasoning: 'Standard municipal road defect routing.'
        };
      case 'Water Logging':
        return {
          department: 'Water Supply & Sanitation',
          severity: defect.severity || 'CRITICAL',
          slaRemaining: '02h 00m',
          assignedTeam: 'Rapid Emergency Hydrology',
          reasoning: 'Hydrology emergency water-logging response routing.'
        };
      case 'Streetlights':
        return {
          department: 'Electrical & Lighting',
          severity: defect.severity || 'MED',
          slaRemaining: '08h 00m',
          assignedTeam: 'Zonal Lighting Squad',
          reasoning: 'Smart Streetlight grid maintenance routing.'
        };
      case 'Sanitation':
        return {
          department: 'Sanitation & Waste',
          severity: defect.severity || 'MED',
          slaRemaining: '06h 00m',
          assignedTeam: 'Ward Sanitation Squad',
          reasoning: 'Ward waste clearance unit routing.'
        };
      case 'Encroachment':
        return {
          department: 'Encroachment Removal Cell',
          severity: defect.severity || 'MED',
          slaRemaining: '24h 00m',
          assignedTeam: 'Zonal Enforcement Taskforce',
          reasoning: 'Pedestrian walkway clearing taskforce routing.'
        };
      case 'Manhole Hazard':
        return {
          department: 'Water Supply & Sanitation',
          severity: 'CRITICAL',
          slaRemaining: '01h 30m',
          assignedTeam: 'Emergency Drainage Safety Crew',
          reasoning: 'Immediate pedestrian & vehicle fall risk mitigation.'
        };
      case 'Traffic Signal':
        return {
          department: 'Traffic Police & IT Infra',
          severity: 'HIGH',
          slaRemaining: '02h 00m',
          assignedTeam: 'Traffic Control System Electronics Unit',
          reasoning: 'Traffic flow & junction signal sync routing.'
        };
      default:
        return {
          department: 'Municipal Central Command',
          severity: defect.severity || 'MED',
          slaRemaining: '12h 00m',
          assignedTeam: 'General Maintenance Squad',
          reasoning: 'General civic grievance routing.'
        };
    }
  }
}
