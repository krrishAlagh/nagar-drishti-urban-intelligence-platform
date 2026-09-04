import { useEffect, useState, useRef, useCallback } from 'react';
import { DefectItem, BusFleetItem, LiveFeedDetection, SystemAlert } from '../types';
import { INITIAL_DEFECTS, FLEET_BUSES, LIVE_FEED_ITEMS, SYSTEM_ALERTS } from '../data/mockData';

export interface RealtimeState {
  isConnected: boolean;
  tickets: DefectItem[];
  fleet: BusFleetItem[];
  liveFeed: LiveFeedDetection[];
  alerts: SystemAlert[];
  analyticsKpi: {
    totalIngestedDetections: number;
    activeFleetBuses: number;
    totalFleetBuses: number;
    resolvedTodayCount: number;
    criticalPotholesCount: number;
    avgAiConfidence: number;
    avgEdgeLatencyMs: number;
  };
  latestEvent: {
    type: string;
    message: string;
    timestamp: string;
  } | null;
}

export function useRealtimeData() {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    tickets: INITIAL_DEFECTS,
    fleet: FLEET_BUSES,
    liveFeed: LIVE_FEED_ITEMS,
    alerts: SYSTEM_ALERTS,
    analyticsKpi: {
      totalIngestedDetections: 5843,
      activeFleetBuses: 48,
      totalFleetBuses: 48,
      resolvedTodayCount: 142,
      criticalPotholesCount: 19,
      avgAiConfidence: 94.6,
      avgEdgeLatencyMs: 18.4
    },
    latestEvent: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial REST API Hydration
  const fetchInitialData = useCallback(async () => {
    try {
      // Defects
      const defectsRes = await fetch('/api/defects').catch(() => null);
      if (defectsRes && defectsRes.ok) {
        const json = await defectsRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setState((prev) => ({ ...prev, tickets: json.data }));
        }
      }

      // Fleet
      const fleetRes = await fetch('/api/fleet').catch(() => null);
      if (fleetRes && fleetRes.ok) {
        const json = await fleetRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setState((prev) => ({ ...prev, fleet: json.data }));
        }
      }

      // Live Feed
      const feedRes = await fetch('/api/live-feed').catch(() => null);
      if (feedRes && feedRes.ok) {
        const json = await feedRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setState((prev) => ({ ...prev, liveFeed: json.data }));
        }
      }

      // Analytics Overview
      const analyticsRes = await fetch('/api/analytics/overview').catch(() => null);
      if (analyticsRes && analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.success && json.data && json.data.kpi) {
          setState((prev) => ({
            ...prev,
            analyticsKpi: {
              ...prev.analyticsKpi,
              ...json.data.kpi
            }
          }));
        }
      }
    } catch (err) {
      console.warn('[Realtime] Initial REST hydration fallback:', err);
    }
  }, []);

  // 2. WebSocket Realtime Sync
  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('⚡ [Realtime WS] Connected to backend telemetry stream:', wsUrl);
        setState((prev) => ({ ...prev, isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'LIVE_DETECTION') {
            setState((prev) => {
              const updatedFeed = [data, ...prev.liveFeed.slice(0, 49)];
              return {
                ...prev,
                liveFeed: updatedFeed,
                analyticsKpi: {
                  ...prev.analyticsKpi,
                  totalIngestedDetections: prev.analyticsKpi.totalIngestedDetections + 1
                },
                latestEvent: {
                  type: 'LIVE_DETECTION',
                  message: `New AI Detection: ${data.title} (${data.confidence}% conf) on ${data.busNode || 'BUS'}`,
                  timestamp: new Date().toLocaleTimeString()
                }
              };
            });
          } else if (type === 'FLEET_UPDATE') {
            setState((prev) => {
              const updatedFleet = prev.fleet.map((bus) =>
                bus.busId === data.busId ? { ...bus, ...data } : bus
              );
              return {
                ...prev,
                fleet: updatedFleet
              };
            });
          } else if (type === 'NEW_DEFECT' || type === 'TICKET_UPDATE') {
            setState((prev) => {
              const existingIndex = prev.tickets.findIndex((t) => t.id === data.id || t.ticketNumber === data.ticketNumber);
              let updatedTickets: DefectItem[];
              if (existingIndex >= 0) {
                updatedTickets = [...prev.tickets];
                updatedTickets[existingIndex] = { ...updatedTickets[existingIndex], ...data };
              } else {
                updatedTickets = [data, ...prev.tickets];
              }
              return {
                ...prev,
                tickets: updatedTickets,
                latestEvent: {
                  type: 'TICKET_UPDATE',
                  message: `Work Order ${data.ticketNumber} [${data.status}]: ${data.title}`,
                  timestamp: new Date().toLocaleTimeString()
                }
              };
            });
          } else if (type === 'ANALYTICS_UPDATE') {
            if (data && data.kpi) {
              setState((prev) => ({
                ...prev,
                analyticsKpi: { ...prev.analyticsKpi, ...data.kpi }
              }));
            }
          } else if (type === 'NEW_ALERT' || type === 'CABIN_INCIDENT') {
            setState((prev) => ({
              ...prev,
              latestEvent: {
                type: 'ALERT',
                message: `Safety Alert: ${data.title || data.category || 'Incident reported'}`,
                timestamp: new Date().toLocaleTimeString()
              }
            }));
          }
        } catch (err) {
          console.warn('[Realtime WS] Message parse error:', err);
        }
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, isConnected: false }));
        // Auto-reconnect after 2.5s
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2500);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.warn('[Realtime WS] Connection setup failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchInitialData, connectWebSocket]);

  // Methods to interact with backend
  const updateTicketStatus = async (ticketId: string, status: DefectItem['status']) => {
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t))
    }));

    try {
      await fetch(`/api/defects/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('[Realtime] Status patch error:', err);
    }
  };

  const addTicket = async (newTicket: DefectItem) => {
    setState((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets]
    }));

    try {
      await fetch('/api/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
    } catch (err) {
      console.warn('[Realtime] Defect creation error:', err);
    }
  };

  const addComment = async (ticketId: string, commentText: string, userRole: string) => {
    const newComment = {
      id: `cmt-${Date.now()}`,
      author: `Officer (${userRole})`,
      role: userRole as any,
      time: 'Just now',
      text: commentText
    };

    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, comments: [...(t.comments || []), newComment] } : t
      )
    }));

    try {
      await fetch(`/api/defects/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
    } catch (err) {
      console.warn('[Realtime] Comment post error:', err);
    }
  };

  return {
    state,
    updateTicketStatus,
    addTicket,
    addComment,
    refetch: fetchInitialData
  };
}
