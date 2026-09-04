import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { LiveFeedDetection } from '../types/serverTypes';
import { wsService } from '../services/websocket.service';
import { TelemetryService } from '../services/telemetry.service';

const router = Router();

// GET /api/live-feed - List detections
router.get('/', (req: Request, res: Response) => {
  const items = db.getLiveFeeds();
  res.json({ success: true, data: items });
});

// POST /api/live-feed/ingest - Ingest edge dashcam detection
router.post('/ingest', (req: Request, res: Response) => {
  const body = req.body;

  if (!body.title || !body.location) {
    return res.status(400).json({
      success: false,
      error: { message: 'title and location are required.' }
    });
  }

  const detection: LiveFeedDetection = {
    id: `feed-${Date.now()}`,
    title: body.title,
    category: body.category || 'Roads',
    severity: body.severity || 'warning',
    confidence: body.confidence || 95.0,
    location: body.location,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    hasImage: Boolean(body.imageUrl || true),
    busNode: body.busNode || 'DTC-BUS-402',
    speedKmh: body.speedKmh || 32,
    latencyMs: body.latencyMs || 22,
    fps: body.fps || 30.0,
    bbox: body.bbox || { x: 30, y: 30, w: 40, h: 30 }
  };

  const saved = db.addLiveFeed(detection);
  wsService.broadcast('LIVE_DETECTION', saved);

  res.status(201).json({ success: true, data: saved });
});

// POST /api/live-feed/simulate-trigger - Trigger manual simulation tick
router.post('/simulate-trigger', (req: Request, res: Response) => {
  TelemetryService.tick();
  res.json({ success: true, message: 'Telemetry simulation tick triggered.' });
});

// GET /api/live-feed/stream - Server-Sent Events (SSE) endpoint
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`data: ${JSON.stringify({ type: 'INIT', timestamp: new Date().toISOString(), data: db.getLiveFeeds().slice(0, 10) })}\n\n`);

  const interval = setInterval(() => {
    const latest = db.getLiveFeeds()[0];
    if (latest) {
      res.write(`data: ${JSON.stringify({ type: 'LIVE_DETECTION', data: latest })}\n\n`);
    }
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
