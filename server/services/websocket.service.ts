import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export type WsMessageType = 
  | 'LIVE_DETECTION'
  | 'FLEET_UPDATE'
  | 'TICKET_UPDATE'
  | 'NEW_DEFECT'
  | 'NEW_ALERT'
  | 'CABIN_INCIDENT'
  | 'STATS_UPDATE'
  | 'ANALYTICS_UPDATE'
  | 'SYSTEM_HEARTBEAT'
  | 'WORK_ORDER_ASSIGNED';


export interface WsMessagePayload<T = any> {
  type: WsMessageType;
  timestamp: string;
  data: T;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientIp = req.socket.remoteAddress || 'unknown';
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected from ${clientIp}. Total connected clients: ${this.clients.size}`);

      // Send initial welcome message
      ws.send(JSON.stringify({
        type: 'SYSTEM_HEARTBEAT',
        timestamp: new Date().toISOString(),
        data: {
          status: 'connected',
          server: 'Nagar Drishti Realtime Telemetry Core',
          version: '2.4.0',
          activeClients: this.clients.size
        }
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch (e) {
          // Non-JSON ping or client message
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.warn('[WebSocket] Client error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log('[WebSocket] Realtime WebSocket Server initialized on /ws');
  }

  public broadcast<T>(type: WsMessageType, data: T) {
    if (!this.wss || this.clients.size === 0) return;

    const payload: WsMessagePayload<T> = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    const serialized = JSON.stringify(payload);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsService = WebSocketService.getInstance();
