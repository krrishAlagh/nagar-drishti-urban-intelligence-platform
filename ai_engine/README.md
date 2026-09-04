# Nagar Drishti — Edge-to-Cloud AI System Architecture

Production-grade, end-to-end AI/ML pipeline for the **Nagar Drishti Mobile Urban Intelligence Platform**, converting public transport bus fleets into decentralized, real-time edge-sensing units.

```
       🚌 [Onboard Edge-AI Hardware - NVIDIA Jetson Orin]
┌──────────────────────────────────────────────────────────────┐
│ 4x RTSP Cameras (Front / Rear / Sides / Cabin)               │
│                        │                                     │
│         [YOLOv8 TensorRT Multi-Task Engine]                  │
│       (Potholes, Cracks, Signs, Waterlogging, Pedestrians)   │
│                        │                                     │
│       [ByteTrack Tracking + ANPR OCR Engine]                 │
│         (Reckless driving, Plate recognition, GPS)           │
│                        │                                     │
│     [Intelligent Event-Driven Bandwidth Filtering]           │
│  (0 raw video streamed • >95% cellular bandwidth savings)    │
└────────────────────────┬─────────────────────────────────────┘
                         │ 4G/5G MQTT / WebSocket Telemetry (JSON + WebP Thumbnails)
                         ▼
        ☁️ [Centralized Cloud AI & Decision Engine]
┌──────────────────────────────────────────────────────────────┐
│ 1. Ingestion & Validation Gateway                            │
│                        │                                     │
│ 2. Spatial Clustering & Deduplication (Haversine DBSCAN)     │
│    (Groups multi-bus passes within 25m into unified defect)  │
│                        │                                     │
│ 3. Secondary Cloud AI Verification Engine                    │
│    (Filters false positives, shadows, reflections)           │
│                        │                                     │
│ 4. Spatio-Temporal Traffic Density & Delay Predictor         │
│    (Sector bottleneck scores, historical baseline curve)     │
│                        │                                     │
│ 5. Autonomous Agentic LLM Dispatcher (Google Gemini)         │
│    (Auto-synthesizes municipal work orders + SLA deadlines)  │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST / WebSockets / Push Notifications
                         ▼
       🏛️ [Municipal Command Center & Field Repair Crews]
```

---

## 📁 Repository Structure

```
ai_engine/
├── schemas/
│   └── telemetry_schemas.py    # Pydantic v2 Edge-to-Cloud Telemetry & Alert Schemas
├── edge/
│   ├── edge_pipeline.py        # 4-Stream Threaded RTSP Ingestion + YOLOv8 TensorRT Pipeline
│   └── anpr_engine.py          # ByteTrack + License Plate Localization + OCR Engine
├── cloud/
│   ├── spatial_clustering.py   # DBSCAN Haversine Defect Deduplication & Severity Scorer
│   ├── traffic_analytics.py    # Vehicle Density & Corridor Delay Predictor
│   ├── agentic_dispatcher.py   # Autonomous GenAI Agent (Gemini) Municipal Work Order Synthesizer
│   └── cloud_server.py         # Central Decision Support Ingestion & Batch Engine
├── requirements.txt            # Python dependencies
└── README.md                   # Complete Architecture Documentation
```

---

## ⚡ 1. Onboard Edge-AI Engine (Bus Hardware)

### Multi-Stream Ingestion & Computer Vision Pipeline
- **Hardware Target**: NVIDIA Jetson Orin Nano (8GB) / AGX Xavier running JetPack 6.0 (CUDA 12.2, TensorRT 8.6).
- **Ingestion**: 4 synchronized RTSP streams (Front road view, Rear road view, Blindspot side cameras, Interior cabin surveillance).
- **Model**: YOLOv8-Medium Segmentation (`yolov8m-seg.engine`) compiled via TensorRT FP16 for zero-copy execution @ **30+ FPS**.
- **Detects**:
  - `POTHOLE` (Crater detection, depth estimation in cm)
  - `ROAD_CRACK` (Linear/Alligator cracking, surface degradation)
  - `DAMAGED_DIVIDER` (Dislodged median barriers)
  - `MISSING_ZEBRA_CROSSING` (Faded pedestrian crosswalks)
  - `DAMAGED_TRAFFIC_SIGN` (Obscured or fallen street signage)
  - `WATERLOGGING` (Standing water and flooded road lanes)
  - `BLIND_SPOT_PEDESTRIAN` (Pedestrians in hazardous bus turning paths)
  - `CABIN_MISCONDUCT` (Driver mobile phone use, cabin overcrowding)

### Vehicle Tracking & ANPR OCR Pipeline
- **Multi-Object Tracking**: Continuous ByteTrack association assigning persistent track IDs across frames.
- **ANPR Pipeline**:
  1. Detects vehicle bounding box and crops lower 40% plate search ROI.
  2. Applies CLAHE contrast enhancement and bilateral denoising.
  3. Executes OCR with character normalization (Indian standard `DL01AB1234` format).
  4. Tags precise vehicle speed from optical flow vectors.

### Bandwidth Saver Architecture
- **Raw video is NEVER streamed to cellular networks**.
- Raw frames are processed entirely on Jetson GPU RAM.
- When an anomaly or defect is detected with confidence $>0.75$, the edge unit extracts:
  - Bounding box coordinates and defect metrics.
  - Alphanumeric plate OCR output.
  - A compressed JPEG/WebP keyframe thumbnail ($<25\text{ KB}$).
- **Transmitted via MQTT QoS 1**, achieving **$>95\%$ bandwidth savings** compared to RTSP video streaming.

---

## ☁️ 2. Centralized Cloud AI & Decision Support Engine

### Spatial Clustering & Incident Deduplication (DBSCAN)
Multiple buses traversing the same route (e.g. Ring Road) detect the same pothole multiple times per day.
The Cloud Spatial Engine groups raw coordinates using the **Haversine Distance Metric**:

$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

- **$\epsilon = 25\text{ meters}$**: All reports within a 25m radius merge into a single canonical defect cluster.
- **Centroid Calculation**: Calculates the true center point from multi-bus GPS samples.
- **Severity Scoring**: Dynamic calculation based on defect depth, surface area, and bus recurrence count.

### Secondary Cloud AI Verification
- Evaluates bus diversity (verifies if $\ge 2$ independent buses corroborating the defect) to filter out transient shadows, wet asphalt reflections, or camera smudges.

### Spatio-Temporal Traffic Modeling
- Compares live vehicle speed metrics against 24-hour historical baseline velocity curves.
- Computes corridor speed deficit percentage and identifies severe bottlenecks.

### Autonomous Agentic Action Dispatcher (Google Gemini)
- Parses validated spatial clusters.
- Invokes Structured LLM Function Calling to automatically generate municipal work orders:
  - Target Department (e.g., PWD Roads, Delhi Jal Board, MCD Sanitation).
  - SLA Urgency (1 Hour for Critical, 4 Hours for High, 24 Hours for Medium).
  - Recommended engineering procedure (e.g., cold asphalt compaction, hot-pour sealant).
  - Material estimation list and evidence photo attachment.

---

## 🚀 3. Quick Start & Execution

### Install Dependencies
```bash
pip install -r ai_engine/requirements.txt
```

### Run Cloud AI Decision Support Engine
```bash
python ai_engine/cloud/cloud_server.py
```

### Run Edge AI Inference Pipeline (Jetson Simulation Mode)
```bash
python ai_engine/edge/edge_pipeline.py
```
