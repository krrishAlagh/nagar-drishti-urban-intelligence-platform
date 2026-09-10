# Nagar Drishti — Screenshots & Hardware Prototype Assets

This directory contains interface screenshots, system architectural diagrams, and evaluated computer vision detection assets for the **Nagar Drishti** platform.

---

## 📁 Recommended Naming Conventions

Please adhere to the following naming conventions when adding new screenshots or prototype photos:

```
assets/screenshots/
├── 01_dashboard_command_center.png       # Executive KPI counters, telemetry velocity & ward tickers
├── 02_live_gis_command_radar.png         # Moving transit buses, defect pins, heatmaps & layers
├── 03_defect_telemetry_modal.png         # Bounding box crop, 3D volume calculations & confidence
├── 04_kanban_work_orders_irc82.png       # 5-stage ticket lifecycle, IRC:82 SOPs & BOM estimation
├── 05_ticket_detail_audit_log.png        # Before/After photo verification & contractor audit trail
├── 06_multimodal_gemini_copilot.png      # Bilingual voice-enabled municipal AI reasoning dialog
├── 07_fleet_diagnostics_edge_health.png  # 48-bus edge hardware metrics, Jetson GPU load & cameras
├── 08_accident_blackspot_analytics.png   # High-fatality corridor mapping & remedial interventions
├── 09_public_commuter_bus_tracker.png    # Route 522 live arrivals, crowd meter & Cabin Safety SOS
├── 10_hindi_localization_ui.png          # Sovereign bilingual English/Hindi interface mode
└── hardware/
    ├── jetson_orin_bus_mount.jpg         # Onboard industrial edge computing enclosure
    └── camera_calibration_rig.jpg        # 4-camera RTSP multi-perspective mounting on transit bus
```

---

## 🔍 Model Detections & Edge Computer Vision Assets

Annotated test frames displaying real-world defect detections on Indian roadways with YOLOv8 bounding boxes, class labels, and confidence metrics are maintained at:
- **Location:** [`ai_engine/evaluation_results/`](../../ai_engine/evaluation_results/)

### Included Test Detections:
- `annotated_01_10072023_mp4-31_jpg`: Severe asphalt pothole crater detection with bounding box and confidence score.
- `annotated_02_10072023_mp4-10_jpg`: Multi-crater road distress on active arterial road corridor.
- `annotated_02_10072023_mp4-33_jpg`: Linear road surface cracking along high-traffic carriageway.
- `annotated_02_10072023_mp4-37_jpg`: Pavement ravelling and curbstone displacement.
- `annotated_03_10072023_mp4-35_jpg`: Edge vision detection under varying illumination and shadow conditions.

---

## 🖥️ Live UI Screen Highlights

1. **Citywide Command Dashboard (`DashboardView.tsx`):**
   - Tracks 48 active transit buses, defect ingestion velocity, 1-hour SLA breaches, and ward-level defect resolution rates.
2. **Interactive Live GIS Radar (`LiveMapView.tsx`):**
   - High-performance Leaflet map tracking buses in motion with real-time GPS breadcrumbs, defect pins, and heatmap overlays.
3. **Smart Work Orders (`TicketsWorkOrdersView.tsx` & `TicketDetailView.tsx`):**
   - Implements Indian Road Congress IRC:82 repair SOPs, material bill calculations, and contractor Before/After photo audit sign-offs.
4. **Multimodal Gemini AI Copilot (`AiCopilotModal.tsx`):**
   - Voice-activated natural language querying with full English & Hindi speech output and one-click operational deep linking.
5. **Public Transit & Safety Portal (`PublicBusTrackerView.tsx`):**
   - Real-time bus ETA tracking for Route 522, onboard crowd occupancy indicators, and emergency Cabin Safety SOS triggers.
