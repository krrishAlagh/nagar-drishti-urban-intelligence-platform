import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { wsService } from '../services/websocket.service';

const router = Router();

// GET /api/fleet - Get all fleet buses
router.get('/', (req: Request, res: Response) => {
  const fleet = db.getFleet();
  res.json({
    success: true,
    data: fleet,
    meta: {
      total: fleet.length,
      online: fleet.filter((b) => b.cameraStatus === 'Online').length,
      warning: fleet.filter((b) => b.cameraStatus === 'Warning').length,
      offline: fleet.filter((b) => b.cameraStatus === 'Offline').length
    }
  });
});

// GET /api/fleet/:busId - Get bus details
router.get('/:busId', (req: Request, res: Response) => {
  const { busId } = req.params;
  const bus = db.getFleet().find((b) => b.busId.toLowerCase() === busId.toLowerCase());

  if (!bus) {
    return res.status(404).json({
      success: false,
      error: { message: `Bus not found with ID: ${busId}` }
    });
  }

  res.json({ success: true, data: bus });
});

// POST /api/fleet/telemetry - Update bus telemetry
router.post('/telemetry', (req: Request, res: Response) => {
  const { busId, coordinates, cameraStatus, gpsSignal, kmScanned, activeAlert } = req.body;

  if (!busId) {
    return res.status(400).json({
      success: false,
      error: { message: 'busId is required.' }
    });
  }

  const updated = db.updateBusTelemetry(busId, {
    coordinates,
    cameraStatus,
    gpsSignal,
    kmScanned,
    activeAlert
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: `Bus not found: ${busId}` }
    });
  }

  wsService.broadcast('FLEET_UPDATE', updated);

  res.json({ success: true, data: updated });
});

export default router;
