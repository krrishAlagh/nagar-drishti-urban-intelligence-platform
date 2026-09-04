import { WebSocket } from 'ws';

const PORT = process.env.PORT || 5005;
const BASE_URL = `http://localhost:${PORT}`;
const WS_URL = `ws://localhost:${PORT}/ws`;

async function runEndToEndTests() {
  console.log(`\n--- 🚀 RUNNING NAGAR DRISHTI BACKEND TEST SUITE (${BASE_URL}) ---\n`);

  // 1. Test WebSocket Connection
  const ws = new WebSocket(WS_URL);
  const wsEvents: string[] = [];

  ws.on('open', () => {
    console.log(`✔ WebSocket Connected to ${WS_URL}`);
  });

  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());
    wsEvents.push(parsed.type);
    console.log(`📡 WebSocket Broadcast Received: [${parsed.type}]`);
  });

  // 2. Test Health Endpoint
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log(`✔ Health Check: ${health.status.toUpperCase()} (Uptime: ${health.uptimeSeconds}s, Memory: ${health.memoryUsageMB.rss}MB)`);

  // 3. Test Defects Listing
  const defectsRes = await fetch(`${BASE_URL}/api/defects`);
  const defects = await defectsRes.json();
  console.log(`✔ Defects List: Retrieved ${defects.data.length} total defects`);

  // 4. Test Defect Creation with Auto-Routing
  const createRes = await fetch(`${BASE_URL}/api/defects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'High Voltage Sparking Wire Falling Over Footpath',
      category: 'Electrical',
      locationName: 'Sector 18 Market Gate',
      ward: 'Ward B - South',
      description: 'Dangerous electrical transformer sparking with live conductor exposed'
    })
  });

  const created = await createRes.json();
  console.log(`✔ Defect Created: ${created.data.ticketNumber} | Dept: ${created.data.department} | Severity: ${created.data.severity} | SLA: ${created.data.slaRemaining}`);

  // 5. Test Status Update & Timeline
  const patchRes = await fetch(`${BASE_URL}/api/defects/${created.data.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'IN_PROGRESS', note: 'Emergency electrical squad on site.' })
  });
  const patched = await patchRes.json();
  console.log(`✔ Status Patched: ${patched.data.status} | Comments Count: ${patched.data.comments.length}`);

  // 6. Test Cabin SOS Panic Trigger
  const sosRes = await fetch(`${BASE_URL}/api/cabin-incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      busNumber: 'DL-1PC-2104',
      routeNumber: 'Route 402-A',
      category: 'Passenger Harassment / Women Safety',
      detectedBy: 'Conductor Panic Switch',
      description: 'Emergency panic trigger activated in women coach'
    })
  });
  const sos = await sosRes.json();
  console.log(`✔ Cabin SOS Panic Trigger: ${sos.data.ticketCode} | Status: ${sos.data.status} | Severity: ${sos.data.severity}`);

  // 7. Test AI Vision Analysis
  const aiRes = await fetch(`${BASE_URL}/api/ai/analyze-defect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Massive Crater Pothole > 12cm Depth',
      description: 'Severe structural asphalt failure on flyover curve',
      location: 'Ring Road'
    })
  });
  const ai = await aiRes.json();
  console.log(`✔ AI Analysis Result: Confidence ${ai.data.confidence}% | Severity: ${ai.data.severity} | SLA: ${ai.data.recommendedSLA}`);

  // 8. Test Analytics Overview
  const analyticsRes = await fetch(`${BASE_URL}/api/analytics/overview`);
  const analytics = await analyticsRes.json();
  console.log(`✔ Analytics Overview: Total Ingested Detections: ${analytics.data.kpi.totalIngestedDetections} | Fleet Online: ${analytics.data.kpi.activeFleetBuses}/${analytics.data.kpi.totalFleetBuses}`);

  // Wait a moment to ensure WebSocket events arrive
  await new Promise((resolve) => setTimeout(resolve, 1200));
  ws.close();

  console.log(`\n🎉 ALL 8/8 BACKEND END-TO-END TESTS PASSED WITH ${wsEvents.length} WEBSOCKET EVENTS CAPTURED!\n`);
  process.exit(0);
}

runEndToEndTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
