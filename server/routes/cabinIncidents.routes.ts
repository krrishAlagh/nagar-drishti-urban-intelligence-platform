import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { BusCabinIncident } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';

const router = Router();

// GET /api/cabin-incidents - List cabin incidents
router.get('/', (req: Request, res: Response) => {
  const { category, severity, status, search } = req.query;
  let list = db.getCabinIncidents();

  if (category) {
    list = list.filter((i) => i.category.toLowerCase().includes((category as string).toLowerCase()));
  }
  if (severity) {
    list = list.filter((i) => i.severity.toUpperCase() === (severity as string).toUpperCase());
  }
  if (status) {
    list = list.filter((i) => i.status.toUpperCase() === (status as string).toUpperCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (i) =>
        i.ticketCode.toLowerCase().includes(q) ||
        i.busNumber.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: list });
});

// GET /api/cabin-incidents/:id - Get incident by id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = db.getCabinIncidentById(id);

  if (!incident) {
    return res.status(404).json({
      success: false,
      error: { message: `Cabin incident not found: ${id}` }
    });
  }

  res.json({ success: true, data: incident });
});

// POST /api/cabin-incidents - Create new incident / panic trigger
router.post('/', (req: Request, res: Response) => {
  const body = req.body;

  if (!body.category || !body.busNumber || !body.description) {
    return res.status(400).json({
      success: false,
      error: { message: 'category, busNumber, and description are required.' }
    });
  }

  const count = db.getCabinIncidents().length + 1;
  const now = new Date();

  const newIncident: BusCabinIncident = {
    id: `inc-${Date.now()}`,
    ticketCode: body.ticketCode || `CABIN-${4090 + count}`,
    busNumber: body.busNumber,
    routeNumber: body.routeNumber || 'Route 522 (Transit Corridor)',
    category: body.category,
    severity: body.severity || (body.category.includes('Harassment') || body.category.includes('Medical') ? 'CRITICAL' : 'HIGH'),
    detectedBy: body.detectedBy || 'Citizen Passenger',
    status: body.status || (body.detectedBy === 'Conductor Panic Switch' ? 'DISPATCHED_ENFORCEMENT' : 'NEW'),
    timestamp: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + `, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    timeAgo: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: body.location || 'Central Transit Corridor Stop',
    ward: body.ward || 'Ward B - South',
    driverName: body.driverName || 'Duty Driver',
    conductorName: body.conductorName || 'Duty Conductor',
    description: body.description,
    passengerName: body.passengerName,
    passengerPhone: body.passengerPhone,
    hasCctvClip: body.hasCctvClip ?? true,
    cctvSnapshotUrl: body.cctvSnapshotUrl,
    resolutionNotes: body.resolutionNotes
  };

  const created = db.createCabinIncident(newIncident);
  wsService.broadcast('CABIN_INCIDENT', created);

  // Also create system alert if critical
  if (created.severity === 'CRITICAL') {
    const alert = db.createAlert({
      id: `alt-sos-${Date.now()}`,
      title: 'EMERGENCY: Cabin Safety Alert',
      subtitle: `${created.busNumber} (${created.category})`,
      description: created.description,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'critical',
      icon: 'notifications_active',
      unread: true
    });
    wsService.broadcast('NEW_ALERT', alert);
  }

  res.status(201).json({ success: true, data: created });
});

// PATCH /api/cabin-incidents/:id/status - Update incident status
router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { message: 'status is required.' }
    });
  }

  const updated = db.updateCabinIncidentStatus(id, status);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: `Incident not found: ${id}` }
    });
  }

  if (notes) {
    updated.resolutionNotes = notes;
    db.save();
  }

  wsService.broadcast('CABIN_INCIDENT', updated);

  res.json({ success: true, data: updated });
});

export default router;
