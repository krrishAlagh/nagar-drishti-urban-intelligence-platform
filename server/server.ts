import http from 'http';
import path from 'path';
import fs from 'fs';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import masterRouter from './routes';
import { wsService } from './services/websocket.service';
import { TelemetryService } from './services/telemetry.service';

const app: Express = express();
const server = http.createServer(app);

// Security & Parsing Middlewares
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);
app.use(requestLogger);

// Serve CCTV footage and dataset archives directly to the frontend
app.use('/datasets', express.static(path.join(process.cwd(), 'datasets')));

// Master API Routes
app.use('/api', masterRouter);

// 404 Fallback for unmatched API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      documentationUrl: '/api/docs'
    }
  });
});

// Production Static Serving: Serve built Vite frontend from dist if present
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA Fallback for client-side navigation
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development fallback: redirect root to API documentation
  app.get('/', (req: Request, res: Response) => {
    res.redirect('/api/docs');
  });
}

// Global Error Handler
app.use(errorHandler);

// Initialize WebSocket Engine
wsService.init(server);

// Start Server - Bind explicitly to 0.0.0.0 for Render, Docker, and Cloud compatibility
server.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🏛️   NAGAR DRISHTI - URBAN INTELLIGENCE & COMMAND BACKEND CORE       ║
║                                                                        ║
║   ⚡ REST API Server:      http://0.0.0.0:${ENV.PORT}/api/health               ║
║   📖 API Documentation:    http://0.0.0.0:${ENV.PORT}/api/docs                 ║
║   📡 WebSocket Telemetry:  ws://0.0.0.0:${ENV.PORT}/ws                         ║
║   🖥️ Production Frontend:  http://0.0.0.0:${ENV.PORT}/                          ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  // Start Autonomous Telemetry Simulation Engine
  TelemetryService.start();
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  TelemetryService.stop();
  server.close(() => {
    console.log('[Server] HTTP and WebSocket servers closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default app;
