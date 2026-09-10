<div align="center">
  <h1>🏛️ Nagar Drishti — Urban Intelligence & Governance Platform</h1>
  <p><strong>Smart City Transit Edge AI, Defect Detection, Autonomous Work Orders & Citizen Safety Command Center</strong></p>
  <p>
    <a href="https://render.com/deploy"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" /></a>
  </p>
</div>

---

## 🌟 Overview

**Nagar Drishti** is an end-to-end municipal intelligence and civic grievance platform designed for Smart Cities. By mounting edge AI cameras on public transit buses (DTC / State Transport), the system continuously detects, segments, and triages urban infrastructure defects—such as **severe asphalt potholes**, **faulty streetlights**, **subsurface water main leaks**, and **sanitation hazards**—broadcasting live telemetry over WebSockets to city authorities while providing dedicated, role-guarded civic portals for citizens and commuters.

---

## 🚀 Deploy to Render (Cloud Ready)

The repository includes a ready-to-deploy **[render.yaml](render.yaml)** blueprint.

### Option 1: One-Click Render Blueprint (Recommended)
1. Fork or push this repo to your GitHub account: `https://github.com/krrishAlagh/nagar-drishti-urban-intelligence-platform`.
2. Open [Render.com](https://render.com) and click **New +** → **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and provisions the unified Web Service.
4. Add your optional `GEMINI_API_KEY` under Environment Variables.
5. Click **Apply**. Your app will build and go live at `https://<your-service>.onrender.com`!

### Option 2: Manual Web Service on Render
If setting up as a standard Web Service on Render:
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000` (Render sets this automatically)
  - `ENABLE_TELEMETRY_SIMULATION`: `true`
  - `GEMINI_API_KEY`: *(Optional - multi-task deterministic fallback is included)*

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet GIS Maps, Lucide Icons, Motion.
- **Backend Core**: Node.js, Express, WebSocket (`ws`), TypeScript (`tsx`), CORS, Rate Limiting.
- **AI Engine**: Edge Vision YOLOv8 pipeline, Google Gemini 2.0 Flash multimodal copilot, TensorRT edge schemas.
- **Autonomous Simulation**: Real-time city bus GPS telemetry stream, synthetic work order lifecycle transitions, and diurnal incident ingress velocity.
- **Design System**: Apple-grade glassmorphism with dynamic light/dark modes and accessible typography hierarchy.

---

## 👥 Role-Based Access Control (RBAC)

The platform provides strict authentication-guarded view segregation:
- **🟢 Public Commuter**: Real-time Bus Tracker, Route 522 Schedule, Cabin SOS Complaint Filing, 24x7 Helplines.
- **🔵 Municipal Admin**: Citywide Command Center, Defect Heatmaps, Multi-Agency Dispatch, Real-Time Analytics & CSV Exports.
- **🟡 Zonal Officer**: Ward-level Work Order Triage, SLA Breach Alerts, Pavement Hotspots.
- **🟠 Repair Crew Lead**: Kanban Field Work Orders, Before/After Repair Photo Sign-offs, IRC:82 SOPs.
- **🟣 Transport Authority**: 48-Bus Fleet Diagnostics, Live Dashcam Feeds, Driver Safety Compliance.

---

## 💻 Run Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/krrishAlagh/nagar-drishti-urban-intelligence-platform.git
cd nagar-drishti-urban-intelligence-platform

# 2. Install dependencies
npm install

# 3. (Optional) Set environment variables
cp .env.example .env

# 4. Run both Backend & Frontend concurrently
npm run dev:all
# - Frontend: http://localhost:3005
# - Backend REST API: http://localhost:5005/api/health
# - WebSocket Telemetry: ws://localhost:5005/ws
```

### Production Build & Test Locally
```bash
# Build production bundle
npm run build

# Test production server serving both API and static frontend
npm start
# Visit http://localhost:5000
```

---

## 📊 Analytics & Reporting

- **Dynamic Multi-Series Line Graph**: Tracks daily and hourly incident velocities across Potholes, Sanitation, Streetlights, and Water Drainage with cubic bezier smoothing and interactive hover scrubbers.
- **Time Window Filters**: Real-time recalibration for 24 Hours, 7 Days, 30 Days, Current Quarter, and Year to Date.
- **Municipal CSV Export**: Generates compliant RFC-4180 civic defect reports with one click.

---

## 📄 License
MIT License © 2026 Nagar Drishti Team — SIH 2026
