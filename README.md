# SIH 2026 Project Repository Template

This repository follows the official project repository template for Smart India Hackathon (SIH) 2026.

---

## 1. Project Information
- **Project Title**: Nagar Drishti – Autonomous Urban Intelligence & Municipal Governance Platform
- **PS ID**: SIH2026-NAGAR-001
- **PS Title**: AI-Powered Transit Edge Vision, Urban Infrastructure Defect Detection & Autonomous Municipal Governance Platform
- **Category**: Software
- **Theme**: Smart Cities / Smart Automation / Clean & Green Technology

---

## 2. Problem Statement
Municipal infrastructure maintenance in Indian metropolitan areas is predominantly reactive, slow, and uncoordinated:
- **Severe Road Safety Hazards**: Over 3,500 fatal accidents occur annually across India due to unresolved asphalt potholes, open utility trenches, and damaged median barriers.
- **Slow & Reactive Complaint Lifecycles**: Citizen grievance portals take 2 to 3 weeks for municipal engineers to manually inspect, corroborate, and dispatch tickets.
- **High Inspection Capex & Low Coverage**: Conventional manual road surveys cost municipal corporations crores of rupees and are outdated before repairs can commence.
- **Lack of Contractor Accountability**: Without objective pre- and post-repair audit data, contractors frequently submit fraudulent or substandard repair sign-offs.
- **Siloed Utility Departments**: PWD (roads), Delhi Jal Board (water leaks/sewers), power discoms (streetlights), and municipal sanitation bodies operate in silos without a unified geospatial command center.

---

## 3. Proposed Solution
**Nagar Drishti (नगर दृष्टि)** turns public transit bus fleets (e.g., DTC, State Transport Undertakings) that already cover 98% of arterial city routes daily into a decentralized, real-time mobile sensor network:
- **Onboard Edge AI**: Transit buses are fitted with industrial-grade Edge AI cameras running quantized YOLOv8 models (>30 FPS, <25ms latency) to scan roads for potholes, surface cracks, damaged medians, faded pedestrian crossings, waterlogging, and streetlight anomalies.
- **Volumetric 3D Measurement**: Custom multi-frame geometric algorithms calculate real-world physical metrics (pothole crater volume in m³, road crack severity, and water burst discharge rates).
- **Privacy-by-Design & Minimal Bandwidth**: No continuous raw video is transmitted. Frames are processed locally on the edge GPU, with automatic blurring of faces and license plates. Only verified anomaly event packages (<25 KB JSON + WebP keyframes) are sent over 4G/5G, saving >95% bandwidth.
- **Central Decision Core & Deduplication**: The cloud engine uses Haversine DBSCAN clustering to group multiple passes of the same defect into a single ticket.
- **Autonomous Municipal Work Orders**: Automatically synthesizes actionable work orders adhering to Indian Road Congress (IRC:82) engineering guidelines, calculates required materials (e.g., bitumen hot-mix volume), routes tasks directly to responsible civic bodies under strict SLA deadlines, and validates repairs via subsequent bus passes.

---

## 4. Key Features
- **Transit Edge-AI Perception**: 4-stream camera ingestion running YOLOv8 TensorRT at >30 FPS for real-time defect detection.
- **3D Volumetric Defect Measurement**: Real-time calculation of crater volume ($m^3$), depth ($cm$), and water/sewer spread radius.
- **Bandwidth-Optimized Telemetry**: Over 95% cellular data savings by streaming only event-driven telemetry and WebP thumbnails (<25 KB).
- **Spatial Deduplication (Haversine DBSCAN)**: Automatically clusters multi-bus detections within 25 meters into a single canonical defect ticket.
- **Smart Work Orders & IRC:82 Standards**: Instant ticket generation with material estimation, department auto-routing (PWD, Jal Board, BSES, MCD), and Before/After photo audit logs.
- **Interactive Live GIS Command Radar**: High-performance Leaflet GIS map with moving bus fleet tracking, real-time defect heatmaps, and customizable time filters (24H, 7D, 30D, YTD).
- **Multimodal Gemini AI Copilot**: Voice-enabled bilingual (English & Hindi) municipal assistant delivering real-time SLA breach warnings and automated dispatch.
- **Public Commuter & Cabin Safety SOS**: Public transit tracking (Route 522 live ETA & occupancy) and passenger onboard SOS emergency alert system.
- **Accident Blackspot Analytics**: Correlates historical road hazard clusters with ongoing remedial actions, and provides one-click municipal RFC-4180 CSV export.

---

## 5. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet GIS Maps, Lucide Icons, Motion
- **Backend**: Node.js, Express, WebSocket (`ws`), TypeScript (`tsx`), CORS, Dotenv, Zod
- **Machine Learning & Edge Vision**: Python 3.11, Ultralytics YOLOv8, PyTorch, NVIDIA TensorRT (FP16), OpenCV, ByteTrack, EasyOCR
- **GenAI / Multimodal Copilot**: Google Gemini 2.0 Flash (`@google/genai`)
- **Spatial Analytics & Database**: Scikit-Learn (DBSCAN), NumPy, SciPy, In-Memory Telemetry Store (with PostgreSQL/GIS schema compatibility)
- **Deployment & Cloud**: Render (via `render.yaml`), Docker-ready, Vite 6 production bundler

---

## 6. Architecture
See [docs/architecture.md](docs/architecture.md).

```
User / Fleet Cameras
       │
       ▼
Frontend UI / Edge Pipeline (React 19 / YOLOv8 TensorRT)
       │
       ▼
Backend API & WebSockets (Node.js Express / Python Telemetry)
       │
       ├───► Spatial Clustering & Deduplication (Haversine DBSCAN)
       │
       ▼
Multimodal AI Decision Core (Google Gemini 2.0 Flash)
       │
       ▼
Actionable Work Orders, GIS Heatmaps & Citizen SOS Dispatch
```

---

## 7. Repository Structure

```
nagar-drishti-urban-intelligence-platform/
├── README.md                           # Main Project Overview & SIH Documentation
├── .env.example                        # Environment configuration template
├── package.json                        # Node.js project manifest & scripts
├── render.yaml                         # Cloud deployment blueprint for Render
├── vite.config.ts                      # Vite build configuration
├── index.html                          # Single Page Application HTML entry
├── docs/
│   └── architecture.md                 # Detailed architectural and technical specifications
├── submission/
│   ├── PRESENTATION.md                 # Presentation deck links and pitch script outline
│   └── DEMO.md                         # Video demonstration links and walkthrough breakdown
├── assets/
│   └── screenshots/
│       └── README.md                   # UI screenshots and evaluation asset guides
├── src/                                # Frontend React Application
│   ├── components/                     # Modular UI components (Sidebar, Modals, Navbar, etc.)
│   ├── views/                          # Major dashboard views (Dashboard, Live Map, Tickets, etc.)
│   ├── types.ts                        # TypeScript interface definitions & schemas
│   ├── App.tsx                         # Core application router and state management
│   ├── main.tsx                        # React application entry point
│   └── index.css                       # Design system and glassmorphism styling
├── server/                             # Backend Node.js & Express Service
│   ├── server.ts                       # REST API & WebSocket server entry point
│   ├── routes/                         # Express API controllers (defects, fleet, tickets, ai)
│   └── services/                       # Business logic & Google Gemini AI integration
├── ai_engine/                          # Python Edge & Cloud AI Pipelines
│   ├── README.md                       # Comprehensive AI pipeline documentation
│   ├── requirements.txt                # Python dependencies for AI components
│   ├── edge/                           # RTSP stream ingestion, YOLOv8 inference, ANPR OCR
│   ├── cloud/                          # DBSCAN clustering, traffic analytics, agentic dispatcher
│   ├── schemas/                        # Pydantic v2 telemetry schemas
│   └── models/                         # Trained weights (YOLOv8)
├── public/                             # Static assets, scripts & presentation resources
│   ├── pitch_script.html               # 4-Speaker SIH pitch presentation script
│   ├── script_2min_features.html       # 2-Minute feature walkthrough script
│   └── demo_video_script.html          # Detailed demo video transcript & screen flow
└── scripts/                            # Video rendering & simulation helpers
```

### What goes where?
| Item | Location |
| :--- | :--- |
| **Source code** | `src/` (Frontend), `server/` (Backend), and `ai_engine/` (AI Engine) |
| **Architecture / technical documentation** | `docs/architecture.md` and `ai_engine/README.md` |
| **Project screenshots / visual assets** | `assets/screenshots/` and `ai_engine/evaluation_results/` |
| **Final PPT / presentation** | `submission/PRESENTATION.md` and `public/pitch_script.html` |
| **Demo video link & walkthrough** | `submission/DEMO.md` and `public/script_2min_features.html` |
| **Project overview** | `README.md` |

---

## 8. Final Presentation
- **Interactive Presentation Pitch**: Accessible directly at [public/pitch_script.html](public/pitch_script.html). Features a timed 4-speaker, 6-minute presentation script complete with role matrices, technical depth, municipal ROI, and stage directions.
- **Slide Deck & Presentation Scripts**:
  - [submission/PRESENTATION.md](submission/PRESENTATION.md)
  - [Nagar_Drishti_Demo_Video_Script.pdf](Nagar_Drishti_Demo_Video_Script.pdf)
  - [Nagar_Drishti_2Min_Feature_Script.pdf](Nagar_Drishti_2Min_Feature_Script.pdf)
- Complete presentation decks and pitch guides are tracked in the repository for direct evaluation.

---

## 9. Demo Video
- **Submission Demo Details**: See [submission/DEMO.md](submission/DEMO.md) for demonstration video links and breakdown.
- **2-Minute Feature Walkthrough Script**: [public/script_2min_features.html](public/script_2min_features.html) (Detailed screen-by-screen breakdown of all 6 core modules).
- **Full Video Demo Script**: [public/demo_video_script.html](public/demo_video_script.html) (Complete continuous demonstration walkthrough).

---

## 10. Screenshots / Prototype Photos
Visual evidence and model evaluation assets:
- **Model Detections & Annotated Frames**: Check [`ai_engine/evaluation_results/`](ai_engine/evaluation_results/) for annotated edge vision test frames showing bounding boxes, segmentation masks, and confidence scores on Indian road surfaces.
- **Application Views & Screenshots**: See [assets/screenshots/README.md](assets/screenshots/README.md) for descriptions of interface modules, command radar views, and field repair Kanban screens.

---

## 11. Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.10 or higher (for AI Engine)

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/krrishAlagh/nagar-drishti-urban-intelligence-platform.git
cd nagar-drishti-urban-intelligence-platform

# 2. Install Node.js dependencies
npm install

# 3. (Optional) Install Python AI Engine dependencies
pip install -r ai_engine/requirements.txt

# 4. Set up environment variables
cp .env.example .env
```

---

## 12. Run

### Development Mode (Frontend & Backend Concurrently)
```bash
npm run dev:all
```
- **Frontend Application**: `http://localhost:3005`
- **Backend REST API**: `http://localhost:5005/api/health`
- **WebSocket Telemetry Stream**: `ws://localhost:5005/ws`

### Run Python AI Microservices (Optional)
```bash
# Central Decision Support & Spatial Clustering Server
python ai_engine/cloud/cloud_server.py

# Multi-Stream Edge AI Inference Pipeline (Simulated RTSP Feeds)
python ai_engine/edge/edge_pipeline.py
```

### Production Build & Local Preview
```bash
# Build production bundle
npm run build

# Start production server
npm start
# Visit http://localhost:5000
```

---

## 13. Future Scope
- **Integration with National Smart City Platforms**: Native integration with Integrated Command and Control Centers (ICCC) and India Urban Data Exchange (IUDX) using Open Urban Platform (OUP) standards.
- **LiDAR & Pavement Roughness Profiling**: Adding low-cost solid-state LiDAR sensors to calibrate International Roughness Index (IRI) values dynamically across city arteries.
- **Citizen Corroboration & Micro-Credits**: A citizen participatory portal with UPI-based micro-incentives for verifying or reporting localized civic repairs.
- **Autonomous Drone Sorties for Inaccessible Zones**: Automated dispatch of surveillance drones to inspect high-voltage electrical towers, storm drains, and flood corridors during severe weather events.
- **Predictive Infrastructure Degradation**: Predictive AI models analyzing traffic load, rainfall history, and pavement wear to forecast sinkholes and potholes 3 to 6 months prior to surface failure.
