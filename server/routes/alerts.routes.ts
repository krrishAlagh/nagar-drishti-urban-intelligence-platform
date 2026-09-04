import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { SystemAlert } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';

const router = Router();

// GET /api/alerts - List system alerts
router.get('/', (req: Request, res: Response) => {
  const alerts = db.getAlerts();
  res.json({
    success: true,
    data: alerts,
    meta: {
      total: alerts.length,
      unread: alerts.filter((a) => a.unread).length
    }
  });
});

// POST /api/alerts - Broadcast new system alert
router.post('/', (req: Request, res: Response) => {
  const { title, subtitle, description, type, icon } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: { message: 'title and description are required.' }
    });
  }

  const alert: SystemAlert = {
    id: `alt-${Date.now()}`,
    title,
    subtitle: subtitle || 'Command Center Alert',
    description,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type || 'info',
    icon: icon || 'notifications',
    unread: true
  };

  const created = db.createAlert(alert);
  wsService.broadcast('NEW_ALERT', created);

  res.status(201).json({ success: true, data: created });
});

// PATCH /api/alerts/:id/read - Mark alert as read
router.patch('/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const marked = db.markAlertRead(id);

  if (!marked) {
    return res.status(404).json({
      success: false,
      error: { message: `Alert not found: ${id}` }
    });
  }

  res.json({ success: true, message: `Alert ${id} marked as read.` });
});

// POST /api/alerts/mark-all-read - Mark all as read
router.post('/mark-all-read', (req: Request, res: Response) => {
  db.markAllAlertsRead();
  res.json({ success: true, message: 'All alerts marked as read.' });
});

export default router;
