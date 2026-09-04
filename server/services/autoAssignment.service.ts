import { DefectItem } from '../types/serverTypes';
import { CREW_TEAMS } from '../db/seed';
import { db } from '../db/database';
import { wsService } from './websocket.service';

export interface CrewMetrics {
  id: string;
  name: string;
  team: string;
  activeTickets: number;
  avgResolutionTime: number;
  department: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  responseTime: number; // minutes to respond to new assignment
}

export interface AssignmentStrategy {
  method: 'intelligent' | 'round-robin' | 'availability' | 'department-match';
  priority: 'speed' | 'expertise' | 'balanced';
}

export class AutoAssignmentService {
  /**
   * Automatically assign work order to most suitable crew
   * based on defect category, severity, and crew availability
   */
  public static autoAssignWorkOrder(
    defect: DefectItem,
    strategy: AssignmentStrategy = { method: 'intelligent', priority: 'balanced' }
  ): { success: boolean; crew?: typeof CREW_TEAMS[0]; reasoning: string } {
    const category = defect.category || 'Potholes';
    const severity = defect.severity || 'MED';

    // Get all active defects to calculate crew workload
    const allDefects = db.getDefects();
    const crewWorkload: Record<string, number> = {};

    CREW_TEAMS.forEach((crew) => {
      crewWorkload[crew.id] = allDefects.filter(
        (d) => d.assignedTo?.name === crew.name && (d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS')
      ).length;
    });

    // Match crews by department/category
    const matchedCrews = this.matchCrewsByCategory(category, severity);

    if (matchedCrews.length === 0) {
      return {
        success: false,
        reasoning: `No crews available for category: ${category}`
      };
    }

    let selectedCrew: typeof CREW_TEAMS[0];

    switch (strategy.method) {
      case 'round-robin':
        selectedCrew = this.selectByRoundRobin(matchedCrews, crewWorkload);
        break;

      case 'availability':
        selectedCrew = this.selectByAvailability(matchedCrews, crewWorkload);
        break;

      case 'department-match':
        selectedCrew = matchedCrews[0]; // First match is the best fit
        break;

      case 'intelligent':
      default:
        selectedCrew = this.selectIntelligently(
          defect,
          matchedCrews,
          crewWorkload,
          strategy.priority
        );
        break;
    }

    return {
      success: true,
      crew: selectedCrew,
      reasoning: this.generateAssignmentReasoning(defect, selectedCrew, crewWorkload[selectedCrew.id])
    };
  }

  /**
   * Match crews based on defect category and severity
   */
  private static matchCrewsByCategory(
    category: string,
    severity: string
  ): typeof CREW_TEAMS[0][] {
    const categoryMap: Record<string, string[]> = {
      'Potholes': ['Roads & Bridges - Central Zone', 'Roads & Bridges - Heavy Equipment'],
      'Streetlights': ['Electrical & Lighting', 'Electrical & Lighting Department'],
      'Water Logging': ['Rapid Emergency Hydrology', 'Sanitation & Drainage', 'Water Supply & Sanitation'],
      'Sanitation': ['Water Supply & Sanitation', 'Sanitation & Drainage'],
      'Electrical': ['Electrical & Lighting', 'Electrical & Lighting Department'],
      'Traffic': ['Traffic Engineering Division'],
      'Drainage': ['Sanitation & Drainage', 'Rapid Emergency Hydrology'],
      'Defective Signage': ['Traffic Engineering Division'],
      'Broken Furniture': ['Roads & Bridges - Central Zone']
    };

    const targetTeams = categoryMap[category] || Object.keys(categoryMap)[0].split(',');

    // Filter crews matching the category
    let matched = CREW_TEAMS.filter((crew) =>
      targetTeams.some((team) => crew.team.includes(team) || team.includes(crew.team))
    );

    // If no exact match, return all crews (fallback)
    if (matched.length === 0) {
      matched = CREW_TEAMS;
    }

    // Prioritize based on severity
    if (severity === 'CRITICAL') {
      // Prefer emergency/rapid response crews
      const emergencyCrews = matched.filter((c) => 
        c.name.toLowerCase().includes('emergency') || 
        c.name.toLowerCase().includes('rapid') ||
        c.name.toLowerCase().includes('quick')
      );
      return emergencyCrews.length > 0 ? emergencyCrews : matched;
    }

    if (severity === 'HIGH') {
      // Prefer heavy-duty crews for high severity
      const heavyCrews = matched.filter((c) => 
        c.name.toLowerCase().includes('heavy') || 
        c.name.toLowerCase().includes('maintenance')
      );
      return heavyCrews.length > 0 ? heavyCrews : matched;
    }

    return matched;
  }

  /**
   * Intelligent assignment considering multiple factors
   */
  private static selectIntelligently(
    defect: DefectItem,
    crews: typeof CREW_TEAMS[0][],
    workload: Record<string, number>,
    priority: 'speed' | 'expertise' | 'balanced'
  ): typeof CREW_TEAMS[0] {
    let scores: Record<string, number> = {};

    crews.forEach((crew) => {
      let score = 100; // Base score

      // Factor 1: Workload (lower workload = higher score)
      const crew_workload = workload[crew.id] || 0;
      const avgWorkload = Object.values(workload).reduce((a, b) => a + b, 0) / CREW_TEAMS.length;
      
      if (crew_workload > avgWorkload) {
        score -= (crew_workload - avgWorkload) * 10; // Penalty for overload
      } else {
        score += (avgWorkload - crew_workload) * 5; // Bonus for under-utilized
      }

      // Factor 2: Department match (expertise)
      if (crew.department.toLowerCase().includes(defect.department?.toLowerCase() || '')) {
        score += 20; // Bonus for matching department
      }

      // Factor 3: Speed vs Expertise trade-off
      if (priority === 'speed') {
        // Prefer less busy crews
        score += (10 - Math.min(crew_workload, 10)) * 2;
      } else if (priority === 'expertise') {
        // Prefer specialized crews
        if (defect.severity === 'CRITICAL') {
          score += crew.name.toLowerCase().includes('emergency') ? 30 : 0;
        }
        score += crew.name.toLowerCase().includes('maintenance') ? 15 : 0;
      } else {
        // Balanced: mix both
        score += (10 - Math.min(crew_workload, 10));
        score += crew.department.toLowerCase().includes(defect.department?.toLowerCase() || '') ? 10 : 0;
      }

      // Factor 4: Severity-specific routing
      if (defect.severity === 'CRITICAL') {
        if (crew.name.toLowerCase().includes('rapid') || crew.name.toLowerCase().includes('emergency')) {
          score += 25;
        }
      }

      scores[crew.id] = score;
    });

    // Select crew with highest score
    const bestCrewId = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    return crews.find((c) => c.id === bestCrewId) || crews[0];
  }

  /**
   * Round-robin assignment for fair distribution
   */
  private static selectByRoundRobin(
    crews: typeof CREW_TEAMS[0][],
    workload: Record<string, number>
  ): typeof CREW_TEAMS[0] {
    // Select crew with least workload
    let minWorkload = Infinity;
    let selectedCrew = crews[0];

    crews.forEach((crew) => {
      const crewLoad = workload[crew.id] || 0;
      if (crewLoad < minWorkload) {
        minWorkload = crewLoad;
        selectedCrew = crew;
      }
    });

    return selectedCrew;
  }

  /**
   * Select crew based on current availability
   */
  private static selectByAvailability(
    crews: typeof CREW_TEAMS[0][],
    workload: Record<string, number>
  ): typeof CREW_TEAMS[0] {
    // Prioritize crew with lowest response time (availability)
    const threshold = 3; // crews with <= 3 tickets are considered available

    const availableCrews = crews.filter((c) => (workload[c.id] || 0) <= threshold);

    if (availableCrews.length > 0) {
      return availableCrews[0];
    }

    // Fallback to least busy
    return this.selectByRoundRobin(crews, workload);
  }

  /**
   * Get crew performance metrics for dashboard
   */
  public static getCrewMetrics(): CrewMetrics[] {
    const allDefects = db.getDefects();

    return CREW_TEAMS.map((crew) => {
      const crewDefects = allDefects.filter(
        (d) => d.assignedTo?.name === crew.name
      );

      const activeDefects = crewDefects.filter(
        (d) => d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS'
      );

      // Calculate average resolution time (mock for now)
      const resolvedDefects = crewDefects.filter(
        (d) => d.status === 'RESOLVED' || d.status === 'VERIFIED_CLOSED'
      );
      const avgResolutionTime = resolvedDefects.length > 0 ? 120 : 0; // minutes

      // Determine availability based on workload
      let availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE' = 'AVAILABLE';
      if (activeDefects.length > 5) {
        availability = 'BUSY';
      } else if (activeDefects.length === 0) {
        availability = 'AVAILABLE';
      }

      return {
        id: crew.id,
        name: crew.name,
        team: crew.team,
        activeTickets: activeDefects.length,
        avgResolutionTime,
        department: crew.department,
        availability,
        responseTime: activeDefects.length > 0 ? 15 + activeDefects.length * 5 : 5 // minutes
      };
    });
  }

  /**
   * Assign all NEW tickets automatically
   */
  public static assignAllPendingTickets(): {
    assigned: number;
    failed: number;
    results: Array<{ ticketId: string; success: boolean; crew?: string; error?: string }>;
  } {
    const allDefects = db.getDefects();
    const newTickets = allDefects.filter((d) => d.status === 'NEW');

    const results: Array<{ ticketId: string; success: boolean; crew?: string; error?: string }> = [];
    let assignedCount = 0;
    let failedCount = 0;

    newTickets.forEach((ticket) => {
      const assignment = this.autoAssignWorkOrder(ticket);

      if (assignment.success && assignment.crew) {
        // Update ticket with auto-assignment
        const assignmentTimestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        const updatedTimeline = (ticket.timeline || []).map((step) => {
          if (step.title === 'Assigned') {
            return {
              ...step,
              completed: true,
              active: true,
              time: assignmentTimestamp
            };
          }
          return step;
        });

        const updated = db.updateDefect(ticket.id, {
          assignedTo: {
            name: assignment.crew.name,
            team: assignment.crew.team,
            avatar: assignment.crew.avatar
          },
          status: 'ASSIGNED',
          timeline: updatedTimeline,
          comments: [
            ...(ticket.comments || []),
            {
              id: `c-auto-assign-${Date.now()}`,
              author: 'Auto Assignment Engine',
              role: 'Autonomous Dispatcher',
              time: assignmentTimestamp,
              text: `Automatically assigned to ${assignment.crew.name} from ${assignment.crew.team}. ${assignment.reasoning}`
            }
          ]
        });

        if (updated) {
          wsService.broadcast('TICKET_UPDATE', updated);
          wsService.broadcast('WORK_ORDER_ASSIGNED', {
            ticketId: ticket.id,
            crew: assignment.crew.name,
            team: assignment.crew.team,
            auto: true
          });

          results.push({
            ticketId: ticket.id,
            success: true,
            crew: assignment.crew.name
          });
          assignedCount++;
        } else {
          results.push({
            ticketId: ticket.id,
            success: false,
            error: 'Failed to update ticket in database'
          });
          failedCount++;
        }
      } else {
        results.push({
          ticketId: ticket.id,
          success: false,
          error: assignment.reasoning
        });
        failedCount++;
      }
    });

    return {
      assigned: assignedCount,
      failed: failedCount,
      results
    };
  }

  /**
   * Generate human-readable assignment reasoning
   */
  private static generateAssignmentReasoning(
    defect: DefectItem,
    crew: typeof CREW_TEAMS[0],
    crewWorkload: number
  ): string {
    const reasons: string[] = [];

    reasons.push(`Specialized in ${crew.department}`);

    if (defect.severity === 'CRITICAL') {
      reasons.push('Rapid response team for critical severity');
    }

    if (crewWorkload === 0) {
      reasons.push('Currently available with no pending tickets');
    } else {
      reasons.push(`Currently handling ${crewWorkload} active ticket(s)`);
    }

    if (defect.category === 'Potholes' && crew.name.includes('Heavy')) {
      reasons.push('Heavy equipment expertise for road repairs');
    }

    return reasons.join(' | ');
  }
}
