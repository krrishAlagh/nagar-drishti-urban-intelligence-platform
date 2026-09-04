import { Router, Request, Response } from 'express';
import { wsService } from '../services/websocket.service';
import { db } from '../db/database';

const router = Router();
const startTime = Date.now();

// GET /api/health - Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  res.json({
    status: 'healthy',
    service: 'Nagar Drishti Urban Intelligence Backend',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    activeWsClients: wsService.getConnectedClientsCount(),
    memoryUsageMB: {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
    },
    database: {
      defectsCount: db.getDefects().length,
      fleetCount: db.getFleet().length,
      alertsCount: db.getAlerts().length,
      blackspotsCount: db.getBlackspots().length,
      cabinIncidentsCount: db.getCabinIncidents().length
    }
  });
});

// GET /api/system/stats - Detailed runtime statistics
router.get('/system/stats', (req: Request, res: Response) => {
  const stats = db.getStats();
  res.json({
    success: true,
    data: {
      ...stats,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      connectedWsClients: wsService.getConnectedClientsCount(),
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

// GET /api/docs - Interactive HTML & OpenAPI specification
router.get('/docs', (req: Request, res: Response) => {
  const isHtml = req.accepts('html');

  if (!isHtml) {
    return res.json({
      title: 'Nagar Drishti REST & Realtime API',
      version: '2.4.0',
      baseUrl: '/api',
      websocketUrl: 'ws://localhost:5000/ws',
      endpoints: [
        { method: 'GET', path: '/api/health', desc: 'Server health and runtime metrics' },
        { method: 'GET', path: '/api/auth/roles', desc: 'Get all user roles' },
        { method: 'POST', path: '/api/auth/login', desc: 'Login with role or email' },
        { method: 'GET', path: '/api/defects', desc: 'Filter, search and paginate defects' },
        { method: 'POST', path: '/api/defects', desc: 'Create defect with automated rule-based triage' },
        { method: 'PATCH', path: '/api/defects/:id/status', desc: 'Update ticket status and timeline' },
        { method: 'POST', path: '/api/defects/:id/comments', desc: 'Add officer comment' },
        { method: 'GET', path: '/api/live-feed', desc: 'Get live AI dashcam detections' },
        { method: 'POST', path: '/api/live-feed/ingest', desc: 'Ingest edge dashcam AI detection' },
        { method: 'GET', path: '/api/fleet', desc: 'Get 48 connected bus telemetry' },
        { method: 'POST', path: '/api/fleet/telemetry', desc: 'Update bus GPS and camera status' },
        { method: 'GET', path: '/api/cabin-incidents', desc: 'List bus cabin safety grievances' },
        { method: 'POST', path: '/api/cabin-incidents', desc: 'Trigger cabin SOS panic alert' },
        { method: 'GET', path: '/api/blackspots', desc: 'Accident corridors and risk data' },
        { method: 'PATCH', path: '/api/blackspots/:id/remedial', desc: 'Update remedial status' },
        { method: 'GET', path: '/api/cross-agency/tickets', desc: 'Inter-departmental handoffs' },
        { method: 'GET', path: '/api/rules', desc: 'List auto-routing rules' },
        { method: 'POST', path: '/api/rules/evaluate', desc: 'Dry-run evaluate defect routing' },
        { method: 'GET', path: '/api/analytics/overview', desc: 'System-wide KPIs' },
        { method: 'GET', path: '/api/analytics/ward-breakdown', desc: 'Ward metrics breakdown' },
        { method: 'GET', path: '/api/alerts', desc: 'List system notifications' },
        { method: 'POST', path: '/api/ai/analyze-defect', desc: 'Gemini AI Vision & triage analysis' },
        { method: 'POST', path: '/api/ai/ward-summary', desc: 'Gemini AI municipal executive briefing' },
        { method: 'GET', path: '/api/portal/sections', desc: 'UIDAI service directory catalog' }
      ]
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nagar Drishti - Backend API Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #071E27;
      --card-bg: #0F2D3C;
      --border: #1E465A;
      --accent: #FF7722;
      --accent-blue: #0088FF;
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --green: #10B981;
      --purple: #A855F7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      padding: 32px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .title-area h1 { font-size: 28px; font-weight: 800; color: #FFF; display: flex; align-items: center; gap: 10px; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 119, 34, 0.2);
      color: var(--accent);
      border: 1px solid var(--accent);
    }
    .badge.green {
      background: rgba(16, 185, 129, 0.2);
      color: var(--green);
      border-color: var(--green);
    }
    .badge.blue {
      background: rgba(0, 136, 255, 0.2);
      color: var(--accent-blue);
      border-color: var(--accent-blue);
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .card h3 { font-size: 16px; margin-bottom: 12px; color: #FFF; }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      transition: all 0.2s;
    }
    .endpoint-card:hover { border-color: var(--accent); }
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 6px;
      min-width: 65px;
      text-align: center;
    }
    .GET { background: rgba(16, 185, 129, 0.2); color: var(--green); border: 1px solid var(--green); }
    .POST { background: rgba(0, 136, 255, 0.2); color: var(--accent-blue); border: 1px solid var(--accent-blue); }
    .PATCH { background: rgba(255, 119, 34, 0.2); color: var(--accent); border: 1px solid var(--accent); }
    .DELETE { background: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid #EF4444; }
    .path { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #FFF; }
    .desc { font-size: 13px; color: var(--text-muted); }
    .link-btn {
      color: var(--accent-blue);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: 0.2s;
    }
    .link-btn:hover { background: rgba(0, 136, 255, 0.15); border-color: var(--accent-blue); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-area">
        <h1>Nagar Drishti Core <span class="badge">v2.4.0</span></h1>
        <p style="color: var(--text-muted); margin-top: 4px;">High-Performance Node.js REST API & Realtime Telemetry WebSocket Engine</p>
      </div>
      <div>
        <span class="badge green">● Live & Healthy</span>
        <span class="badge blue" style="margin-left: 8px;">ws://localhost:5000/ws</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h3>⚡ Realtime Telemetry Engine</h3>
        <p style="color: var(--text-muted); font-size: 13px;">Autonomous 24x7 edge camera detection stream & 48-bus GPS telemetry updates broadcasted over native WebSockets and SSE.</p>
      </div>
      <div class="card">
        <h3>🤖 Auto-Routing & AI Vision</h3>
        <p style="color: var(--text-muted); font-size: 13px;">Rule-based SLA escalation and Gemini AI model analysis for civic damage severity and emergency crew dispatch.</p>
      </div>
      <div class="card">
        <h3>💾 Persistent Datastore</h3>
        <p style="color: var(--text-muted); font-size: 13px;">In-memory ultra-low latency query core with asynchronous atomic snapshots stored in <code>server/data/db.json</code>.</p>
      </div>
    </div>

    <h2 style="font-size: 20px; margin-bottom: 16px; color: #FFF;">API Endpoints Specification</h2>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/health</div>
          <div class="desc">Server health, memory consumption, uptime and database statistics</div>
        </div>
      </div>
      <a href="/api/health" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/defects</div>
          <div class="desc">Query civic defects with filtering (category, severity, status, ward, search)</div>
        </div>
      </div>
      <a href="/api/defects" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method POST">POST</span>
        <div>
          <div class="path">/api/defects</div>
          <div class="desc">Create defect ticket with automated rule evaluation & SLA assignment</div>
        </div>
      </div>
      <span class="desc" style="font-family: monospace;">Payload: { title, locationName, category, severity }</span>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/fleet</div>
          <div class="desc">48 connected bus fleet telemetry, GPS coordinates, and camera health</div>
        </div>
      </div>
      <a href="/api/fleet" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/live-feed</div>
          <div class="desc">Edge AI dashcam detections with bounding boxes & confidence scores</div>
        </div>
      </div>
      <a href="/api/live-feed" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/cabin-incidents</div>
          <div class="desc">Bus cabin passenger safety incidents, SOS panic triggers, and audits</div>
        </div>
      </div>
      <a href="/api/cabin-incidents" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/blackspots</div>
          <div class="desc">Accident blackspots, fatality/injury records, and engineering remedies</div>
        </div>
      </div>
      <a href="/api/blackspots" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/analytics/overview</div>
          <div class="desc">Executive municipal intelligence KPIs, resolution rates, and SLA compliance</div>
        </div>
      </div>
      <a href="/api/analytics/overview" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/rules</div>
          <div class="desc">Configurable auto-routing rules and automated triage conditions</div>
        </div>
      </div>
      <a href="/api/rules" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method POST">POST</span>
        <div>
          <div class="path">/api/ai/analyze-defect</div>
          <div class="desc">AI defect classification, damage assessment, and crew recommendations</div>
        </div>
      </div>
      <span class="desc" style="font-family: monospace;">Powered by Gemini AI</span>
    </div>

    <div class="endpoint-card">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="method GET">GET</span>
        <div>
          <div class="path">/api/portal/sections</div>
          <div class="desc">UIDAI styled bilingual civic service directory catalog</div>
        </div>
      </div>
      <a href="/api/portal/sections" target="_blank" class="link-btn">Try Endpoint →</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
