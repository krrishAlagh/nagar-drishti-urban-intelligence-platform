import http from 'http';
import path from 'path';
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

// Root greeting & redirect to docs
app.get('/', (req: Request, res: Response) => {
  res.redirect('/api/docs');
});

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

// Global Error Handler
app.use(errorHandler);

// Initialize WebSocket Engine
wsService.init(server);

// Start Server
server.listen(ENV.PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🏛️   NAGAR DRISHTI - URBAN INTELLIGENCE & COMMAND BACKEND CORE       ║
║                                                                        ║
║   ⚡ REST API Server:      http://localhost:${ENV.PORT}/api/health              ║
║   📖 API Documentation:    http://localhost:${ENV.PORT}/api/docs                ║
║   📡 WebSocket Telemetry:  ws://localhost:${ENV.PORT}/ws                        ║
║   🖥️ Frontend Dev URL:     ${ENV.APP_URL}                             ║
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
