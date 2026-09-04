import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { AutoRoutingRule } from '../types/serverTypes';
import { RulesEngineService } from '../services/rulesEngine.service';

const router = Router();

// GET /api/rules - List all rules
router.get('/', (req: Request, res: Response) => {
  const rules = db.getRules();
  res.json({ success: true, data: rules });
});

// POST /api/rules - Create new rule
router.post('/', (req: Request, res: Response) => {
  const { name, condition, action, department, severity, sla } = req.body;

  if (!name || !condition || !action || !department) {
    return res.status(400).json({
      success: false,
      error: { message: 'name, condition, action, and department are required.' }
    });
  }

  const count = db.getRules().length + 1;
  const newRule: AutoRoutingRule = {
    id: `R-0${Math.floor(10 + Math.random() * 90)}`,
    name,
    condition,
    action,
    isActive: true,
    department,
    severity: severity || 'MED',
    sla: sla || '4h'
  };

  const created = db.createRule(newRule);
  res.status(201).json({ success: true, data: created });
});

// PATCH /api/rules/:id/toggle - Toggle rule active/inactive state
router.patch('/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.toggleRuleActive(id);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: `Rule not found: ${id}` }
    });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/rules/:id - Delete rule
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteRule(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { message: `Rule not found: ${id}` }
    });
  }

  res.json({ success: true, message: `Rule ${id} successfully deleted.` });
});

// POST /api/rules/evaluate - Dry-run test rule evaluation against defect payload
router.post('/evaluate', (req: Request, res: Response) => {
  const result = RulesEngineService.evaluateDefect(req.body);
  res.json({ success: true, data: result });
});

export default router;
