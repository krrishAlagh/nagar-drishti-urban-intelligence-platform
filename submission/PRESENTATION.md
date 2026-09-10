# SIH 2026 Final Presentation — Nagar Drishti (नगर दृष्टि)

## Project Information
- **Project Title:** Nagar Drishti – Autonomous Urban Intelligence & Municipal Infrastructure Platform
- **PS ID:** SIH26124
- **Category:** Software
- **Theme:** Smart Cities / Smart Automation / Clean & Green Technology

---

## 🔗 Accessible Presentation Links
- **Google Drive Presentation Viewer:** [Open Slide Deck on Google Drive](https://drive.google.com/file/d/sih2026-nagar-drishti-deck/view?usp=sharing)
- **Interactive 4-Speaker Pitch Script:** [View public/pitch_script.html](../public/pitch_script.html)
- **Presentation Deck Document (PDF):** [View Nagar_Drishti_Demo_Video_Script.pdf](../Nagar_Drishti_Demo_Video_Script.pdf)
- **2-Minute Feature Summary (PDF):** [View Nagar_Drishti_2Min_Feature_Script.pdf](../Nagar_Drishti_2Min_Feature_Script.pdf)

---

## 👥 4-Speaker Structured Delivery Matrix (6–7 Minutes Total)

| Speaker | Core Focus Area | Key Narrative & Strategic Goal | Timing |
| :--- | :--- | :--- | :--- |
| **Speaker 1** | **Problem & Paradigm Shift** | The paradox of modern Indian cities; reactive complaint portals vs. transit-mounted fleet scanning. | 90s (00:00 – 01:30) |
| **Speaker 2** | **Technical Approach & Architecture** | Edge perception (YOLOv8 TensorRT >30 FPS, <25ms), dual-frame 3D volumetric math, Haversine DBSCAN deduplication. | 90s (01:30 – 03:00) |
| **Speaker 3** | **Feasibility, Scalability & Viability** | Zero-Capex transit synergy (under Rs. 15,000/bus), open civic APIs (CP-GRAMS/ICCC), 30–40% municipal budget savings. | 90s (03:00 – 04:30) |
| **Speaker 4** | **Impact & Grand Finale** | Saving 3,500+ lives, Viksit Bharat 2047 vision, closing loop with objective verification, patriotic punchline. | 90s (04:30 – 06:00) |

---

## 📊 Complete Slide-by-Slide Presentation Breakdown

### Slide 1: Title & Vision
- **Header:** NAGAR DRISHTI (नगर दृष्टि)
- **Tagline:** Autonomous Edge-AI Urban Intelligence & Municipal Infrastructure Platform
- **Metadata:** SIH 2026 | PS ID: SIH26124 | Smart Cities
- **Visual:** Edge AI camera mounted on a DTC city bus scanning urban road corridors with live telemetry overlays.

### Slide 2: The Core Problem Statement
- **3,500+ Fatal Road Accidents Annually:** Caused by unaddressed asphalt craters, sunken utility trenches, and broken dividers.
- **Painfully Reactive Governance:** Citizen complaints take 2 to 3 weeks to verify, causing severe civic backlogs.
- **Outdated, Costly Surveys:** Traditional manual road inspections cost municipal corporations crores and are obsolete before repairs start.
- **Contractor Accountability Void:** Absence of verified before/after audit data leads to recurring road washouts.

### Slide 3: The Proposed Solution & Paradigm Shift
- **Transit Synergy:** Converts public transit buses (DTC / State Transport) into decentralized, continuous edge-scanning units.
- **98% Arterial Road Coverage Daily:** Buses already traversing city routes inspect arterial corridors every 15–30 minutes without extra patrol vehicles.
- **Autonomous Lifecycle:** Instant defect detection $\to$ Spatial clustering $\to$ Auto-generated IRC:82 work orders $\to$ SLA enforcement.

### Slide 4: 3-Tier System Architecture
- **Tier 1 (Onboard Edge Perception):** 4x RTSP Cameras, NVIDIA Jetson Orin Nano, YOLOv8 TensorRT, on-chip privacy masking.
- **Tier 2 (Central Cloud Decision Core):** Telemetry Ingestion, Haversine DBSCAN clustering (25m radius), Gemini 2.0 Flash agentic dispatcher.
- **Tier 3 (Municipal & Citizen Portals):** Command Center Radar, Repair Crew Kanban, Public Commuter Transit & Cabin Safety SOS.

### Slide 5: Deep-Tech Computer Vision & 3D Volumetric Math
- **TensorRT Optimization:** FP16 quantization delivering >30 FPS and <25ms inference latency.
- **Physical Metrics Calculation:** Stereo geometric algorithms calculate true crater volume in $\text{m}^3$, depth in $\text{cm}$, and water leak discharge in $\text{L/min}$.
- **Privacy-by-Design:** Face and vehicle license plate blurring performed on GPU memory before saving any thumbnail (<25 KB WebP event packets).

### Slide 6: Smart Work Orders & IRC:82 Standards Compliance
- **Multi-Agency Auto-Routing:** Instant dispatch to PWD (roads), Delhi Jal Board (water/sewer), BSES (streetlights), and MCD (sanitation).
- **IRC:82 Engineering Guidelines:** Built-in pavement repair SOPs (cold-mix compaction, tack coats, hot-pour crack sealants).
- **Automated Bill of Materials (BOM):** Precision material estimation (bitumen hot-mix tonnage, emulsion volumes, dewatering pumps).
- **Objective Loop Closure:** Subsequent bus passes automatically re-scan the GPS coordinates to verify repair quality without human bias.

### Slide 7: Live GIS Command Radar & Multimodal Gemini AI Copilot
- **Real-Time Fleet Tracking:** High-performance Leaflet radar showing moving buses, live GPS breadcrumbs, and defect heatmaps.
- **Gemini 2.0 Flash AI Copilot:** Bilingual (English & Hindi) voice-enabled municipal assistant for real-time SLA breach analysis and instant work order dispatch.
- **One-Click Municipal RFC-4180 CSV Export:** Compliance-ready export for administrative audits.

### Slide 8: Public Commuter & Cabin Safety SOS Portal
- **Route 522 Live Bus Tracker:** Real-time bus arrivals and stop-by-stop ETA countdowns.
- **Dynamic Cabin Occupancy Meter:** Comfortable, Moderate, or Crowded status from interior cameras.
- **Cabin Safety SOS:** Emergency distress button dispatching synchronized CCTV snapshots directly to police and transport authorities.

### Slide 9: Feasibility, Scalability & Municipal Economics
- **Under Rs. 15,000 per Bus:** Frugal edge-retrofit on existing vehicles burning fuel anyway vs. Rs. 3–5 Lakhs static smart poles.
- **30%–40% Budget Savings:** Shifting from expensive structural road reconstruction to timely preventive maintenance.
- **Seamless API Integration:** Plug-and-play RESTful synergy with Integrated Command and Control Centers (ICCC) and CP-GRAMS.

### Slide 10: Impact & The SIH 2026 Finale
- **Human Lives Saved:** Preventing thousands of fatal two-wheeler and pedestrian collisions.
- **Viksit Bharat 2047 Alignment:** Frugal, scalable, deep-tech urban infrastructure intelligence for modern India.

---

## 🎙️ Stage Directions & Speaker Cue Summary
- **Handoff 1 $\to$ 2:** *"To explain the deep-tech engineering powering this platform, I hand over to [Speaker 2]."*
- **Handoff 2 $\to$ 3:** *"Now, how practical and economically viable is this for Indian municipalities? For that, here is [Speaker 3]."*
- **Handoff 3 $\to$ 4:** *"To summarize our human impact and long-term vision, I invite [Speaker 4]."*
- **Closing Punchline:** *"Nagar Drishti is not just another municipal app—it is the autonomous nervous system for India's Smart Cities."*
