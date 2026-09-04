import { Router, Request, Response } from 'express';
import {
  evaluateAutomationPolicies,
  getAutomationStatus,
  AUTO_ASSIGNMENT_POLICIES,
  SCHEDULED_AUTOMATION_JOBS
} from '../services/automationPolicies.service';
import { AutoAssignmentService } from '../services/autoAssignment.service';
import { db } from '../db/database';
import { wsService } from '../services/websocket.service';

const router = Router();

// GET /api/automation/status - Get automation system status
router.get('/status', (req: Request, res: Response) => {
  const status = getAutomationStatus();

  res.json({
    success: true,
    data: status,
    timestamp: new Date().toISOString()
  });
});

// GET /api/automation/policies - List all automation policies
router.get('/policies', (req: Request, res: Response) => {
  const policies = AUTO_ASSIGNMENT_POLICIES.map((p) => ({
    id: p.id,
    name: p.name,
    enabled: p.enabled,
    description: p.description,
    priority: p.priority
  }));

  res.json({
    success: true,
    data: policies,
    summary: {
      total: policies.length,
      enabled: policies.filter((p) => p.enabled).length
    }
  });
});

// GET /api/automation/jobs - List all scheduled automation jobs
router.get('/jobs', (req: Request, res: Response) => {
  const jobs = SCHEDULED_AUTOMATION_JOBS.map((j) => ({
    id: j.id,
    name: j.name,
    enabled: j.enabled,
    schedule: j.schedule,
    lastRun: j.lastRun,
    nextRun: j.nextRun
  }));

  res.json({
    success: true,
    data: jobs,
    summary: {
      total: jobs.length,
      enabled: jobs.filter((j) => j.enabled).length
    }
  });
});

// POST /api/automation/evaluate/:id - Evaluate which policies apply to a ticket
router.post('/evaluate/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const defect = db.getDefectById(id);
  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found: ${id}` }
    });
  }

  const applicablePolicy = evaluateAutomationPolicies(defect);

  res.json({
    success: true,
    data: {
      ticketId: id,
      ticketNumber: defect.ticketNumber,
      status: defect.status,
      category: defect.category,
      severity: defect.severity,
      applicablePolicy: applicablePolicy
        ? {
            id: applicablePolicy.id,
            name: applicablePolicy.name,
            description: applicablePolicy.description,
            priority: applicablePolicy.priority
          }
        : null,
      willAutoAssign: applicablePolicy !== null && defect.status === 'NEW',
      matchedConditions: [
        defect.status === 'NEW' ? 'Ticket is NEW' : null,
        defect.severity === 'CRITICAL' ? 'CRITICAL severity' : null,
        applicablePolicy ? 'Matches active policy' : null
      ].filter(Boolean)
    }
  });
});

// POST /api/automation/trigger - Manually trigger automation for unassigned tickets
router.post('/trigger', (req: Request, res: Response) => {
  const { scope = 'all', category, severity } = req.body;

  const allDefects = db.getDefects();
  let targetDefects = allDefects.filter((d) => d.status === 'NEW');

  if (scope === 'category' && category) {
    targetDefects = targetDefects.filter((d) => d.category === category);
  }

  if (scope === 'severity' && severity) {
    targetDefects = targetDefects.filter((d) => d.severity === severity);
  }

  const results = {
    processed: 0,
    assigned: 0,
    failed: 0,
    assignments: [] as Array<{
      ticketId: string;
      ticketNumber: string;
      crew: string;
      policy: string;
    }>
  };

  targetDefects.forEach((defect) => {
    const policy = evaluateAutomationPolicies(defect);

    if (policy) {
      const assignment = AutoAssignmentService.autoAssignWorkOrder(defect, {
        method: 'intelligent',
        priority: 'balanced'
      });

      if (assignment.success && assignment.crew) {
        const assignmentTimestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        const updatedTimeline = (defect.timeline || []).map((step) => {
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

        const updated = db.updateDefect(defect.id, {
          assignedTo: {
            name: assignment.crew.name,
            team: assignment.crew.team,
            avatar: assignment.crew.avatar
          },
          status: 'ASSIGNED',
          timeline: updatedTimeline,
          comments: [
            ...(defect.comments || []),
            {
              id: `c-policy-${Date.now()}`,
              author: 'Automation Policy Engine',
              role: 'Autonomous Dispatcher',
              time: assignmentTimestamp,
              text: `Policy-triggered assignment: ${policy.name}. ${assignment.reasoning}`
            }
          ]
        });

        if (updated) {
          wsService.broadcast('TICKET_UPDATE', updated);
          wsService.broadcast('WORK_ORDER_ASSIGNED', {
            ticketId: defect.id,
            crew: assignment.crew.name,
            team: assignment.crew.team,
            auto: true,
            policy: policy.id
          });

          results.assignments.push({
            ticketId: defect.id,
            ticketNumber: defect.ticketNumber,
            crew: assignment.crew.name,
            policy: policy.name
          });

          results.assigned++;
        } else {
          results.failed++;
        }
      } else {
        results.failed++;
      }

      results.processed++;
    }
  });

  res.json({
    success: true,
    data: results,
    summary: {
      policyTriggered: results.assigned > 0,
      totalEvaluated: targetDefects.length,
      successRate: ((results.assigned / results.processed) * 100).toFixed(1) + '%'
    }
  });
});

// POST /api/automation/enable-policy/:policyId - Enable/disable a policy
router.post('/enable-policy/:policyId', (req: Request, res: Response) => {
  const { policyId } = req.params;
  const { enabled } = req.body;

  const policy = AUTO_ASSIGNMENT_POLICIES.find((p) => p.id === policyId);

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: { message: `Policy not found: ${policyId}` }
    });
  }

  policy.enabled = enabled;

  res.json({
    success: true,
    data: {
      policyId: policy.id,
      name: policy.name,
      enabled: policy.enabled
    }
  });
});

// GET /api/automation/assignment-history - Get recent auto-assignments
router.get('/assignment-history', (req: Request, res: Response) => {
  const allDefects = db.getDefects();

  // Get recently assigned tickets with auto-assignment
  const autoAssignments = allDefects
    .filter((d) => d.status === 'ASSIGNED' && d.assignedTo)
    .filter((d) =>
      d.comments?.some(
        (c) =>
          c.author === 'Auto Assignment Engine' ||
          c.author === 'Automation Policy Engine' ||
          c.author === 'Work Order System'
      )
    )
    .slice(0, 20) // Last 20 assignments
    .map((d) => ({
      ticketId: d.id,
      ticketNumber: d.ticketNumber,
      category: d.category,
      severity: d.severity,
      assignedTo: d.assignedTo?.name,
      assignedTeam: d.assignedTo?.team,
      assignmentTime: d.timeline?.find((t) => t.title === 'Assigned')?.time,
      autoAssigned: d.comments?.some(
        (c) => c.author === 'Auto Assignment Engine' || c.author === 'Automation Policy Engine'
      )
    }));

  res.json({
    success: true,
    data: autoAssignments,
    summary: {
      total: autoAssignments.length,
      policyTriggered: autoAssignments.filter((a) => a.autoAssigned).length
    }
  });
});

// POST /api/automation/simulate/:id - Simulate auto-assignment without applying
router.post('/simulate/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { strategy } = req.body;

  const defect = db.getDefectById(id);
  if (!defect) {
    return res.status(404).json({
      success: false,
      error: { message: `Defect not found: ${id}` }
    });
  }

  const policy = evaluateAutomationPolicies(defect);
  const assignment = AutoAssignmentService.autoAssignWorkOrder(defect, strategy);

  res.json({
    success: true,
    data: {
      ticketId: id,
      ticketNumber: defect.ticketNumber,
      simulationResults: {
        wouldAutoAssign: policy !== null,
        applicablePolicy: policy ? { id: policy.id, name: policy.name } : null,
        recommendedCrew: assignment.crew
          ? {
              id: assignment.crew.id,
              name: assignment.crew.name,
              team: assignment.crew.team,
              lead: assignment.crew.lead,
              phone: assignment.crew.phone
            }
          : null,
        assignmentReasoning: assignment.reasoning,
        slaIfAssigned: defect.slaRemaining
      }
    }
  });
});

export default router;
