import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { CrossAgencyTicket } from '../types/serverTypes';

const router = Router();

// GET /api/cross-agency/tickets - Get inter-departmental tickets
router.get('/tickets', (req: Request, res: Response) => {
  const list = db.getCrossAgencyTickets();
  res.json({ success: true, data: list });
});

// POST /api/cross-agency/tickets - Create new cross-agency hand-off
router.post('/tickets', (req: Request, res: Response) => {
  const { issue, originatingDept, receivingDept, status } = req.body;

  if (!issue || !originatingDept || !receivingDept) {
    return res.status(400).json({
      success: false,
      error: { message: 'issue, originatingDept, and receivingDept are required.' }
    });
  }

  const count = db.getCrossAgencyTickets().length + 1;
  const newTicket: CrossAgencyTicket = {
    id: `ca-${Date.now()}`,
    ticketCode: `TCK-${8800 + count}`,
    issue,
    originatingDept,
    receivingDept,
    status: status || 'Pending Hand-off',
    hasUnreadMessage: true,
    lastUpdated: 'Just now',
    messagesCount: 1
  };

  const created = db.createCrossAgencyTicket(newTicket);
  res.status(201).json({ success: true, data: created });
});

// PATCH /api/cross-agency/tickets/:id/status - Update hand-off status
router.patch('/tickets/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'status is required.' }
    });
  }

  const updated = db.updateCrossAgencyStatus(id, status);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: `Cross-agency ticket not found: ${id}` }
    });
  }

  res.json({ success: true, data: updated });
});

// GET /api/cross-agency/contacts - Directory of agency nodal officers
router.get('/contacts', (req: Request, res: Response) => {
  const contacts = db.getAgencyContacts();
  res.json({ success: true, data: contacts });
});

export default router;
