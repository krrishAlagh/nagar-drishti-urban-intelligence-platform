# SIH 2026 Demonstration Video — Nagar Drishti (नगर दृष्टि)

## Project Information
- **Project Title:** Nagar Drishti – Autonomous Urban Intelligence & Municipal Infrastructure Platform
- **PS ID:** SIH26124
- **Category:** Software
- **Theme:** Smart Cities / Smart Automation / Clean & Green Technology

---

## 🎥 Video Demonstration Links
- **YouTube Demo Video:** [https://youtu.be/Gh6r_L-cUvk?si=z4GAwXQ9Yx6BABHK](https://youtu.be/Gh6r_L-cUvk?si=z4GAwXQ9Yx6BABHK)

---

## ⏱️ Video Demonstration Breakdown & Timestamps

| Timestamp | Module / Screen Focus | Screen Action & Demonstration Highlights | Spoken Script Summary |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:20** | **Command Dashboard & Real-Time Telemetry** | Open `DashboardView.tsx`. Hover over active KPI counters (48 Active Buses, Latency 38ms, Ingested Defect Ticker, 1-Hour SLA Breaches). | *"Welcome to Nagar Drishti—an autonomous urban intelligence platform connecting live with 48 transit buses running edge-AI cameras."* |
| **00:20 – 00:40** | **Live GIS Command Radar & Defect Heatmaps** | Click **Live Map** (`LiveMapView.tsx`). Show moving DTC buses, toggle heatmap layer, click a defect pin to reveal bounding box & 3D crater volume. | *"Our Live GIS Radar tracks bus fleets in real time. With spatial deduplication, it pinpoints potholes and pipe bursts with precise crater volume math."* |
| **00:40 – 01:00** | **Smart Work Orders & IRC:82 Engineering Standards** | Open **Tickets & Work Orders** (`TicketsWorkOrdersView.tsx`). Show Kanban board, click ticket `TK-8921` to display IRC:82 SOPs and Before/After photo audit. | *"Under Work Orders, tickets auto-route to PWD or Jal Board. Each ticket embeds Indian Road Congress IRC:82 repair SOPs and Before/After photo verification."* |
| **01:00 – 01:20** | **Multimodal Gemini AI Copilot (Voice & Bilingual)** | Click floating **'Ask Nagar AI'** pill (`AiCopilotModal.tsx`). Trigger prompt *'1-Hour SLA Breaches'*, play speech output, click deep link. | *"Our floating Gemini AI Copilot supports natural voice queries and audio speech output in both English and Hindi with instant operational dispatch."* |
| **01:20 – 01:40** | **Public Commuter Tracker & Cabin Safety SOS** | Switch role to **Public Commuter** (`PublicBusTrackerView.tsx`). Show Route 522 live ETA/occupancy. Open **Cabin Safety SOS** distress trigger. | *"For citizens, the Public Bus Tracker provides live arrivals and cabin crowd occupancy. Passengers also get an onboard Cabin Safety SOS with CCTV snapshots."* |
| **01:40 – 02:00** | **Accident Blackspot Analytics & Hindi UI** | Click **Accident Blackspots** (`AccidentBlackspotAnalyticsView.tsx`). Click **'हिन्दी / EN'** language button to show sovereign Hindi UI. | *"Finally, Accident Blackspot Analytics couples hazard corridors with remedial engineering action tracking, backed by bilingual localization and CSV export."* |
| **02:00 – 03:30** | **Deep-Tech Edge Pipeline & ANPR Engine** | Open simulated RTSP 4-camera feeds (`ai_engine/edge/edge_pipeline.py`). Show YOLOv8 TensorRT bounding boxes, depth estimation, and license plate OCR. | *"Behind the UI is an industrial NVIDIA Jetson edge pipeline running YOLOv8 TensorRT at >30 FPS with privacy blurring and >95% bandwidth savings."* |

---

## 🎬 How to Run & Replicate the Demonstration Locally
1. Start the concurrent development server:
   ```bash
   npm run dev:all
   ```
2. Open the web interface at `http://localhost:3005`.
3. Switch user roles via the top-right profile selector to inspect **Municipal Admin**, **Zonal Officer**, **Repair Crew Lead**, **Transport Authority**, and **Public Commuter** workflows.
4. Interact with the live GIS radar, Kanban board, and Gemini AI voice copilot.
