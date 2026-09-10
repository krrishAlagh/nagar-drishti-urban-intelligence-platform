# Nagar Drishti — System Architecture & Technical Specification

## 1. Executive Summary
**Nagar Drishti (नगर दृष्टि)** is an end-to-end municipal intelligence and urban infrastructure monitoring platform that converts public transit bus fleets into mobile edge-AI sensing units. The platform autonomously detects, measures, clusters, and converts urban infrastructure defects—such as severe asphalt potholes, damaged streetlights, waterlogging, and sewer leaks—into actionable engineering work orders under strict Service Level Agreements (SLAs).

---

## 2. High-Level Architecture

```
                      🚌 Public Transit Fleet (DTC / State Buses)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [4x RTSP Edge Cameras]                  [GPS / Telemetry Module]
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                   [Onboard Edge-AI Engine: NVIDIA Jetson]
                   • YOLOv8 TensorRT Multi-Task Engine (>30 FPS, <25ms)
                   • Multi-camera Sync (Front, Rear, Blindspot Sides, Cabin)
                   • Dual-frame Geometric 3D Depth & Volumetric Math
                   • Privacy-by-Design On-Chip Face & Plate Blurring
                   • Bandwidth Saver: <25 KB Event Payload (>95% Bandwidth Saved)
                                        │
                                        ▼  WebSocket / MQTT (4G/5G)
                   [Centralized Cloud Decision & Dispatch Core]
                   • Telemetry Ingestion & Validation Gateway
                   • Spatial Clustering & Deduplication (Haversine DBSCAN 25m)
                   • Multi-Bus Corroboration (Filters False Positives)
                   • Autonomous Gemini 2.0 Flash Dispatcher (IRC:82 Work Orders)
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 ▼                      ▼                      ▼
      [Municipal Command Radar]   [Repair Crew Field App]   [Public Commuter Portal]
      • Live Fleet & Defect Map   • Kanban Work Orders      • Live Bus ETA & Occupancy
      • SLA Breach Timers         • Before/After Photo Audit• Cabin SOS Distress
      • Blackspot Heatmaps & CSV  • IRC:82 SOPs & Materials • 24x7 Civic Helplines
```

---

## 3. Core Subsystems

### 3.1 Onboard Edge Perception Tier
- **Hardware**: NVIDIA Jetson Orin Nano / Xavier edge computing platform mounted on transit buses.
- **Vision Pipeline**: 4 synchronized RTSP camera streams feeding into an FP16 TensorRT-accelerated YOLOv8 segmentation model.
- **Physical Metrics Estimation**: Dual-frame epipolar geometry estimates depth ($cm$) and surface area ($m^2$) to calculate true crater volume ($m^3$) and fluid outflow rates.
- **Edge Anonymization**: Real-time license plate and facial masking implemented on GPU RAM before any thumbnail extraction.
- **Bandwidth Optimization**: Zero continuous video streaming; only event-triggered telemetry packages ($<25\text{ KB}$ JSON + WebP keyframe) are dispatched via MQTT QoS 1.

### 3.2 Cloud Spatial Analytics & Deduplication Tier
- **Deduplication Engine**: Uses **Haversine DBSCAN clustering** with an $\epsilon = 25\text{ meters}$ threshold. Multiple bus passes over the same defect within a 24-hour cycle are consolidated into a single master incident.
- **Corroboration Filter**: Requires multi-pass verification to eliminate transient visual anomalies (e.g. tree shadows, standing water reflections, lens smudges).
- **Traffic Velocity Analytics**: Evaluates real-time transit bus speed against 24-hour baseline velocity curves to detect congestion bottlenecks caused by roadway distress.

### 3.3 Autonomous Municipal Dispatch & Governance Tier
- **Autonomous Agentic Dispatcher**: Powered by Google Gemini 2.0 Flash with structured function calling.
- **Department Routing**: Auto-routes incidents to appropriate municipal authorities:
  - **PWD (Public Works Department)**: Potholes, road cracks, divider damage.
  - **Delhi Jal Board / Water Authority**: Water main leaks, drainage bursts, sewer overflows.
  - **BSES / Power Discoms**: Non-functional streetlights, dangling live wires.
  - **MCD / Urban Local Body**: Sanitation hazards, garbage dumps, fallen trees.
- **Engineering SOP Compliance**: Attaches Indian Road Congress (IRC:82) repair standards and automated bill-of-materials (hot-mix bitumen tonnage, sealants, dewatering pumps).
- **Closed-Loop Verification**: When a repair ticket is marked completed by a crew, subsequent bus passes automatically re-inspect the GPS coordinates to verify restoration quality and close the ticket without human bias.

### 3.4 Command Center & User Portals
- **Role-Based Views**: Dedicated portals for Municipal Administrators, Zonal Engineers, Repair Crews, Transport Authorities, and Public Commuters.
- **Live GIS Command Radar**: High-performance Leaflet map tracking live vehicle positions, defect heatmaps, and route corridors.
- **Voice-Enabled AI Copilot**: Bilingual (English & Hindi) natural language assistant for conversational analytics, SLA monitoring, and instant work order dispatch.
