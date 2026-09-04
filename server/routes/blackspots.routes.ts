import { Router, Request, Response } from 'express';
import { db } from '../db/database';

const router = Router();

// GET /api/blackspots - List accident blackspots
router.get('/', (req: Request, res: Response) => {
  const { riskLevel, ward, status } = req.query;
  let list = db.getBlackspots();

  if (riskLevel) {
    list = list.filter((b) => b.riskLevel.toUpperCase() === (riskLevel as string).toUpperCase());
  }
  if (ward) {
    list = list.filter((b) => b.ward.toLowerCase().includes((ward as string).toLowerCase()));
  }
  if (status) {
    list = list.filter((b) => b.remedialActionStatus.toLowerCase().includes((status as string).toLowerCase()));
  }

  res.json({ success: true, data: list });
});

// GET /api/blackspots/analytics/summary - High level risk statistics
router.get('/analytics/summary', (req: Request, res: Response) => {
  const spots = db.getBlackspots();
  const totalFatalities = spots.reduce((acc, s) => acc + s.fatalitiesCount, 0);
  const totalInjuries = spots.reduce((acc, s) => acc + s.injuriesCount, 0);
  const extremeRiskCount = spots.filter((s) => s.riskLevel === 'EXTREME_RISK').length;
  const highRiskCount = spots.filter((s) => s.riskLevel === 'HIGH_RISK').length;

  res.json({
    success: true,
    data: {
      totalCorridorsMapped: spots.length,
      totalFatalitiesPastYear: totalFatalities,
      totalInjuriesPastYear: totalInjuries,
      extremeRiskCount,
      highRiskCount,
      averageSafetyScore: Math.round(spots.reduce((acc, s) => acc + s.safetyIndexScore, 0) / spots.length)
    }
  });
});

// GET /api/blackspots/:id - Get blackspot by spotCode or id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const spot = db.getBlackspotById(id);

  if (!spot) {
    return res.status(404).json({
      success: false,
      error: { message: `Blackspot not found: ${id}` }
    });
  }

  res.json({ success: true, data: spot });
});

// PATCH /api/blackspots/:id/remedial - Update remedial action status
router.patch('/:id/remedial', (req: Request, res: Response) => {
  const { id } = req.params;
  const { remedialActionStatus, actionAuthority } = req.body;

  if (!remedialActionStatus) {
    return res.status(400).json({
      success: false,
      error: { message: 'remedialActionStatus is required.' }
    });
  }

  const updated = db.updateBlackspotRemedial(id, remedialActionStatus, actionAuthority);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { message: `Blackspot not found: ${id}` }
    });
  }

  res.json({ success: true, data: updated });
});

export default router;
