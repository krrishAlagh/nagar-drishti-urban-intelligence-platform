import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render 'Page X of Y' on all pages.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(14 * mm, 283 * mm, 196 * mm, 283 * mm)
            self.drawString(14 * mm, 285 * mm, "NAGAR DRISHTI (Urban Intelligence Platform) — Complete Features Specification")
            self.drawRightString(196 * mm, 285 * mm, "SIH 2026 | PS ID: SIH26124")

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(14 * mm, 14 * mm, 196 * mm, 14 * mm)
        self.drawString(14 * mm, 10 * mm, "CONFIDENTIAL & PROPRIETARY — Nagar Drishti Urban Intelligence Platform")
        self.drawRightString(196 * mm, 10 * mm, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="Nagar_Drishti_Features_Specification.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY = colors.HexColor("#0A192F")       # Deep Navy
    SECONDARY = colors.HexColor("#0071E3")     # Apple / Tech Blue
    ACCENT = colors.HexColor("#0284C7")        # Cyan Blue
    SUCCESS = colors.HexColor("#10B981")       # Emerald
    WARNING = colors.HexColor("#F59E0B")       # Amber
    DANGER = colors.HexColor("#EF4444")        # Red
    TEXT_DARK = colors.HexColor("#0F172A")     # Dark Slate
    TEXT_MUTED = colors.HexColor("#475569")    # Muted Slate
    BG_LIGHT = colors.HexColor("#F8FAFC")      # Off-white / Card background
    BORDER_LIGHT = colors.HexColor("#E2E8F0")  # Light Border

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.white,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#93C5FD"),
        spaceAfter=0
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK,
        spaceAfter=4
    )
    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    bullet_style = ParagraphStyle(
        'FeatureBullet',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=TEXT_DARK
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )
    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=SECONDARY
    )

    story = []

    # =========================================================================
    # COVER HEADER BANNER
    # =========================================================================
    header_table_data = [
        [
            Paragraph("<b>NAGAR DRISHTI</b><br/><font size=10 color='#93C5FD'>Autonomous Edge-AI Urban Intelligence & Municipal Infrastructure Platform</font>", title_style),
            Paragraph("<b>SIH 2026 SPECIFICATION</b><br/><font size=8.5 color='#E0F2FE'><b>PS ID:</b> SIH26124<br/><b>Theme:</b> Smart Cities<br/><b>Category:</b> Software</font>", ParagraphStyle('BadgeR', parent=title_style, alignment=2, fontSize=11, leading=14))
        ]
    ]
    header_table = Table(header_table_data, colWidths=[122 * mm, 60 * mm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINELEFT', (0, 0), (0, -1), 4, SECONDARY),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4 * mm))

    # Executive Summary Card
    summary_text = (
        "<b>DOCUMENT PURPOSE:</b> This comprehensive document provides an exhaustive, feature-by-feature "
        "architectural and operational breakdown of <b>Nagar Drishti</b>. The platform shifts urban governance "
        "from a slow, reactive complaints cycle to an <b>autonomous, proactive intelligence network</b> by mounting "
        "edge-AI vision sensors on public transit buses. This document catalogs all 10 core system modules, "
        "sensor dataflows, algorithmic pipelines, role-based access portals, and municipal compliance standards."
    )
    summary_table = Table([[Paragraph(summary_text, body_style)]], colWidths=[182 * mm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_LIGHT),
        ('LINELEFT', (0, 0), (-1, -1), 3.5, SECONDARY),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 1. CORE PROBLEM & ARCHITECTURAL PARADIGM SHIFT
    # =========================================================================
    story.append(Paragraph("1. System Paradigm Shift & Core Problem Solved", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    paradigm_data = [
        [
            Paragraph("<b>Dimension</b>", table_header),
            Paragraph("<b>Traditional Municipal Governance</b>", table_header),
            Paragraph("<b>Nagar Drishti Autonomous Platform</b>", table_header)
        ],
        [
            Paragraph("<b>Defect Detection</b>", table_cell),
            Paragraph("Reactive; dependent on citizen mobile complaints or sporadic manual road surveys costing crores.", table_cell),
            Paragraph("<b>Autonomous Continuous Fleet Scanning</b>; buses traversing daily arterial routes inspect streets every 15–30 mins.", table_cell)
        ],
        [
            Paragraph("<b>Verification & Triage</b>", table_cell),
            Paragraph("Manual junior engineer site visits taking <b>2 to 3 weeks</b> to verify authenticity.", table_cell),
            Paragraph("<b>Sub-25ms Edge Vision Verification</b> with instant 3D physical volumetric depth/area calculations.", table_cell)
        ],
        [
            Paragraph("<b>SLA Accountability</b>", table_cell),
            Paragraph("Unmonitored backlogs; contractors claim repair completion without proof; repeated road washouts.", table_cell),
            Paragraph("<b>Strict 1h/4h/24h Countdown Timers</b>, Before/After photo audits & auto-verification via next passing bus.", table_cell)
        ],
        [
            Paragraph("<b>Infrastructure Capex</b>", table_cell),
            Paragraph("Exorbitant smart-pole installations (Rs. 3–5 Lakhs/pole) with narrow 50-meter stationary visibility.", table_cell),
            Paragraph("<b>Zero-Capex Vehicle Synergy</b> (retrofitting existing DTC/State transit fleet for &lt;Rs. 15,000/bus).", table_cell)
        ]
    ]
    ptable = Table(paradigm_data, colWidths=[38 * mm, 72 * mm, 72 * mm])
    ptable.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(ptable)
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 2. ONBOARD EDGE-AI & MULTI-STREAM COMPUTER VISION
    # =========================================================================
    story.append(Paragraph("2. Onboard Edge-AI & Computer Vision Perception Engine", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    story.append(Paragraph(
        "Each transit bus is converted into an active, intelligent edge-sensing node using an onboard <b>NVIDIA Jetson Orin Nano / Xavier</b> "
        "processor interfaced with 4 synchronized industrial RTSP camera feeds. The edge software runs zero-copy, quantized TensorRT models "
        "processing video locally without cellular streaming.", body_style
    ))

    edge_features = [
        "<b>4-Stream Multi-Perspective Ingestion:</b> Captures synchronized high-definition video from Front (road pavement & dividers), Rear (trailing road defects & tailgating), Blindspot Sides (pedestrian turning safety), and Interior Cabin (commuter density & safety).",
        "<b>YOLOv8-Medium TensorRT Segmentation (>30 FPS, <25ms Inference):</b> Custom-trained weights compiled down to FP16 TensorRT for ultra-low latency inference, detecting road distress and municipal hazards in real time under direct sunlight, monsoon rain, and low-light dusk conditions.",
        "<b>8 Multi-Class Municipal Defect Detectors:</b>",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Severe Asphalt Potholes:</i> Localizes crater rim, computes bounding box, and tags surface severity.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Road Surface Cracking:</i> Classifies longitudinal, transverse, and severe alligator distress patterns.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Damaged Concrete Dividers:</i> Flags displaced median barriers, broken curb stones, and road obstructions.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Faded Zebra Crossings & Lane Markings:</i> Identifies worn pedestrian crosswalks posing pedestrian hazard.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Damaged or Obscured Street Signage:</i> Tags bent poles, vandalized boards, or foliage-obscured speed limit signs.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Waterlogging & Pipe Bursts:</i> Detects standing water surface reflections and pressurized water main bursts.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Sewer Overflows & Sanitation Hazards:</i> Pinpoints manhole sewage backflow and overflowing garbage vats.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <i>Cabin Overcrowding & Distracted Driving:</i> Onboard interior surveillance monitoring driver phone use and passenger crush capacity.",
        "<b>Dual-Frame 3D Volumetric Depth Math:</b> Uses epipolar stereo geometry and camera elevation calibration to calculate true physical metrics in meters (crater volume in m³, road crack depth in cm, and fluid discharge rate in Litres/minute).",
        "<b>On-Chip Privacy-by-Design Anonymization:</b> Face and vehicle license plate regions are blurred on GPU memory before saving any telemetry keyframe thumbnail, ensuring total compliance with India's Digital Personal Data Protection (DPDP) Act.",
        "<b>Bandwidth-Optimized Event Telemetry (>95% Cellular Savings):</b> Continuous raw video is NEVER streamed over 4G/5G. When a defect confidence exceeds 75%, an event payload (&lt;25 KB JSON + WebP keyframe) is dispatched via MQTT QoS 1."
    ]
    for ef in edge_features:
        story.append(Paragraph(f"• {ef}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 3. CLOUD SPATIAL DEDUPLICATION & DECISION CORE
    # =========================================================================
    story.append(Paragraph("3. Central Cloud Decision & Spatial Analytics Core", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    cloud_features = [
        "<b>Spatial Deduplication via Haversine DBSCAN (25m Radius):</b> Multiple transit buses traversing corridors like Ring Road or Outer Ring Road detect the same defect dozens of times daily. The cloud spatial engine clusters coordinates using the Haversine metric (radius = 25m), merging duplicate passes into a single canonical ticket while averaging precision centroids.",
        "<b>Multi-Bus Corroboration Engine:</b> Eliminates false positives caused by transient tree shadows, wet asphalt reflections, or camera lens smudges by verifying corroboration across >= 2 distinct bus fleet identifiers before elevating severity.",
        "<b>Spatio-Temporal Traffic Velocity & Corridor Delay Modeling:</b> Compares live bus telemetry speeds against 24-hour historical baseline velocity curves, detecting traffic bottlenecks directly caused by roadway cratering or waterlogging.",
        "<b>Dynamic Ingestion Velocity Tracking:</b> Real-time ingestion counter monitors defect ingress velocity across all 12 municipal zones with rolling 1-hour, 24-hour, and 7-day velocity charts."
    ]
    for cf in cloud_features:
        story.append(Paragraph(f"• {cf}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 4. SMART WORK ORDERS & IRC:82 ENGINEERING COMPLIANCE
    # =========================================================================
    story.append(Paragraph("4. Smart Municipal Work Orders & Engineering Compliance", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    work_order_features = [
        "<b>Kanban Operational Board:</b> Comprehensive 5-stage ticket lifecycle management (NEW -> TRIAGED -> IN PROGRESS -> RESOLVED -> VERIFIED CLOSED).",
        "<b>Automated Departmental Routing Engine:</b> Auto-triage rule engine dispatches tickets directly to designated agencies without bureaucratic delays:",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <b>PWD (Public Works Department):</b> Road ravelling, potholes, broken dividers, fallen trees.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <b>Delhi Jal Board (DJB):</b> Subsurface water pipeline bursts, storm drain chokes, sewer line overflows.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <b>BSES / Discoms:</b> Extinguished streetlights, knocked-over electric poles, dangling live cables.",
        "&nbsp;&nbsp;&nbsp;&nbsp;• <b>MCD (Municipal Corporation):</b> Solid waste accumulations, road sweepings, hazardous dead animals.",
        "<b>Indian Road Congress (IRC:82) Engineering SOP Integration:</b> Each repair ticket embeds official IRC:82 pavement maintenance guidelines, outlining required procedures (cold-mix asphalt compaction, tack coat application, hot-pour crack sealant).",
        "<b>Automated Bill of Materials (BOM) Synthesis:</b> Calculates physical material requirements based on 3D volumetric metrics (e.g. 1.8 Tonnes Bitumen Hot-Mix, 150L Bituminous Emulsion, Submersible Dewatering Pump).",
        "<b>SLA Countdown Timers & Breach Alarms:</b> Strict, countdown timers based on severity (1 Hour for CRITICAL, 4 Hours for HIGH, 24 Hours for MEDIUM) with automatic red alerts when SLA deadlines approach.",
        "<b>Before/After Photo Verification Loop:</b> Contractors must upload photographic proof of completion. More importantly, the very next bus passing that GPS point automatically re-scans the pavement, enabling objective verification without human bias."
    ]
    for wof in work_order_features:
        story.append(Paragraph(f"• {wof}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 5. LIVE GIS COMMAND RADAR & ANALYTICS
    # =========================================================================
    story.append(Paragraph("5. Interactive Live GIS Command Radar & Citywide Analytics", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    gis_features = [
        "<b>Real-Time Interactive Leaflet GIS Radar:</b> Ultra-fast geospatial map rendering moving DTC transit bus fleets with live GPS breadcrumb trails and directional heading indicators.",
        "<b>Multi-Layer Geospatial Toggles:</b> Allows operators to toggle Defect Pins, Fleet Bus Routes, High-Density Heatmaps, Cluster Bubbles, and High-Resolution Satellite Basemaps.",
        "<b>Interactive Defect Telemetry Modals:</b> Clicking any map pin reveals AI confidence score (e.g. 96.4%), bounding box thumbnail, depth/volume metrics, assigned department, and SLA timer.",
        "<b>Dynamic Multi-Series Ingress Graph:</b> Cubic bezier-smoothed trendlines monitoring daily and hourly defect velocities across Potholes, Sanitation, Streetlights, and Water Drainage.",
        "<b>Time-Window Recalibration:</b> Instant client-side and server-side filtering for 24 Hours, 7 Days, 30 Days, Current Quarter, and Year to Date.",
        "<b>Municipal RFC-4180 CSV Export:</b> One-click generation of audit-compliant CSV reports containing ticket IDs, GPS coordinates, department tags, timestamps, and SLA resolution statuses."
    ]
    for gf in gis_features:
        story.append(Paragraph(f"• {gf}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 6. BILINGUAL MULTIMODAL GEMINI AI COPILOT
    # =========================================================================
    story.append(Paragraph("6. Multimodal Gemini 2.0 Flash AI Copilot (Voice & Bilingual)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    copilot_features = [
        "<b>Voice-Activated Natural Language Interface:</b> Floating AI assistant supporting natural voice input with real-time speech recognition and text-to-speech audio synthesis.",
        "<b>Sovereign Bilingual Localization:</b> Complete bidirectional conversational fluency in both <b>English and Hindi</b>, democratizing municipal intelligence for ground officers and senior administrators alike.",
        "<b>Grounded Municipal Reasoning:</b> Powered by Google Gemini 2.0 Flash with structured function calling, analyzing real-time database state to answer complex operational queries (e.g. <i>'Which wards have active SLA breaches right now?'</i> or <i>'Show critical potholes on Ring Road'</i>).",
        "<b>Actionable Operational Deep-Linking:</b> Copilot responses include clickable deep links that immediately filter the Kanban board, focus GIS map coordinates, or generate emergency repair dispatches."
    ]
    for cpf in copilot_features:
        story.append(Paragraph(f"• {cpf}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 7. PUBLIC COMMUTER & ONBOARD CABIN SAFETY PORTAL
    # =========================================================================
    story.append(Paragraph("7. Public Commuter Transit & Cabin Safety SOS Portal", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    commuter_features = [
        "<b>Live Transit Bus Tracking (Route 522):</b> Provides commuters with real-time bus locations, next-stop countdowns, and accurate ETA predictions updated every 3 seconds.",
        "<b>Live Onboard Occupancy Meter:</b> Displays real-time passenger crowd indices (Comfortable / Moderate / Crowded) calculated from cabin interior vision sensors, helping passengers plan safer travel.",
        "<b>Cabin Safety SOS Emergency Trigger:</b> Onboard emergency distress trigger allowing passengers or conductors to immediately alert central police and transport command with synchronized CCTV snapshots.",
        "<b>Public Grievance Lodging:</b> Commuters can file complaints regarding driver misconduct, route deviations, fare meter discrepancies, or cleanliness directly through the mobile-optimized interface.",
        "<b>24x7 Civic Helplines Directory:</b> Direct tap-to-call emergency contacts for Delhi Police (112), Women Safety Helpline (1091), PWD Road Assistance, and Delhi Jal Board Flood Control."
    ]
    for cf in commuter_features:
        story.append(Paragraph(f"• {cf}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 8. ACCIDENT BLACKSPOT ANALYTICS & MULTI-AGENCY WAR ROOM
    # =========================================================================
    story.append(Paragraph("8. Accident Blackspot Analytics & Multi-Agency War Room", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    blackspot_features = [
        "<b>Historical Fatality & Injury Correlation:</b> Maps high-collision blackspot corridors (e.g. Mukarba Chowk, Anand Vihar ISBT, Moolchand Flyover) and correlates fatal crashes with recurring infrastructure hazards.",
        "<b>Hazard Priority Indexing:</b> Ranks road segments based on composite risk scores (Traffic Volume × Defect Density × Crash Frequency) to direct priority capital expenditure.",
        "<b>Remedial Engineering Recommendations:</b> Suggests permanent engineering interventions (rumble strips, high-friction anti-skid surfacing, high-mast illumination, median height elevation).",
        "<b>Inter-Agency Governance War Room:</b> Connects PWD, Delhi Jal Board, BSES, and MCD on a single synchronized dashboard, resolving inter-departmental finger-pointing, expediting road-cutting permissions, and coordinating joint utility works."
    ]
    for bf in blackspot_features:
        story.append(Paragraph(f"• {bf}", bullet_style))
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 9. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
    # =========================================================================
    story.append(Paragraph("9. Role-Based Access Control (RBAC) Security Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    rbac_data = [
        [
            Paragraph("<b>User Role</b>", table_header),
            Paragraph("<b>Allowed Views & Portals</b>", table_header),
            Paragraph("<b>Key Operational Responsibilities</b>", table_header)
        ],
        [
            Paragraph("<b>Municipal Admin</b>", table_cell),
            Paragraph("Full access to all 14 views (Dashboard, Map, Tickets, Analytics, Blackspots, Multi-Agency, Fleet, Settings).", table_cell),
            Paragraph("Citywide executive command, budget allocation, cross-agency arbitration, SLA enforcement, and CSV data audits.", table_cell)
        ],
        [
            Paragraph("<b>Zonal Officer</b>", table_cell),
            Paragraph("Dashboard, Tickets, Ticket Detail, Live Map, Services Directory, Accident Blackspots, Notifications.", table_cell),
            Paragraph("Ward-level work order triage, contractor assignment, local SLA escalation handling, and repair approval.", table_cell)
        ],
        [
            Paragraph("<b>Repair Crew Lead</b>", table_cell),
            Paragraph("Tickets Kanban Board, Ticket Detail View, Live Map (field navigation), Notifications.", table_cell),
            Paragraph("Field execution of IRC:82 SOPs, material logistics requisition, Before/After photo submission, and job sign-off.", table_cell)
        ],
        [
            Paragraph("<b>Transport Authority</b>", table_cell),
            Paragraph("Fleet Diagnostics, Safety Complaints, Accident Analytics, Public Transit Tracker, Notifications.", table_cell),
            Paragraph("48-bus edge sensor health monitoring, Jetson GPU load diagnostics, driver safety compliance, and route coverage.", table_cell)
        ],
        [
            Paragraph("<b>Public Commuter</b>", table_cell),
            Paragraph("Public Transit Bus Tracker, Safety Complaints, Services Directory, Emergency Helplines.", table_cell),
            Paragraph("Live Route 522 bus arrival tracking, cabin crowd monitoring, onboard emergency SOS triggering, and civic grievance submission.", table_cell)
        ]
    ]
    rtable = Table(rbac_data, colWidths=[35 * mm, 65 * mm, 82 * mm])
    rtable.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(rtable)
    story.append(Spacer(1, 4 * mm))

    # =========================================================================
    # 10. TECHNICAL ARCHITECTURE & DEPLOYMENT SPECIFICATIONS
    # =========================================================================
    story.append(Paragraph("10. Technology Stack & Deployment Specifications", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceBefore=1, spaceAfter=4))
    
    tech_data = [
        [
            Paragraph("<b>Layer</b>", table_header),
            Paragraph("<b>Technologies & Libraries</b>", table_header),
            Paragraph("<b>Operational Role</b>", table_header)
        ],
        [
            Paragraph("<b>Frontend Core</b>", table_cell),
            Paragraph("React 19, TypeScript, Tailwind CSS, Motion (Framer), Lucide Icons", table_cell),
            Paragraph("High-performance responsive Single Page Application with dynamic light/dark glassmorphic design system.", table_cell)
        ],
        [
            Paragraph("<b>Geospatial GIS</b>", table_cell),
            Paragraph("Leaflet 1.9, OpenStreetMap Vector Tiles, Leaflet Heatmap Layer", table_cell),
            Paragraph("Interactive live radar rendering moving transit bus fleets, defect markers, and heat density corridors.", table_cell)
        ],
        [
            Paragraph("<b>Backend API & WS</b>", table_cell),
            Paragraph("Node.js 22, Express 4, WebSocket (ws 8), TSX Runtime, CORS, Zod", table_cell),
            Paragraph("Low-latency REST API, WebSocket telemetry broadcast, autonomous simulation tick engine, and rate limiting.", table_cell)
        ],
        [
            Paragraph("<b>Edge Computer Vision</b>", table_cell),
            Paragraph("Python 3.11, Ultralytics YOLOv8, PyTorch, NVIDIA TensorRT, OpenCV, ByteTrack", table_cell),
            Paragraph("Sub-25ms multi-task defect segmentation, 3D volume estimation, license plate ANPR OCR, and on-chip privacy blurring.", table_cell)
        ],
        [
            Paragraph("<b>Generative AI</b>", table_cell),
            Paragraph("Google Gemini 2.0 Flash (@google/genai SDK), Structured Function Calling", table_cell),
            Paragraph("Multimodal bilingual AI copilot, automated IRC:82 work order generation, and SLA deadline estimation.", table_cell)
        ],
        [
            Paragraph("<b>Spatial Clustering</b>", table_cell),
            Paragraph("Scikit-Learn (DBSCAN Haversine), NumPy, SciPy, Pydantic v2", table_cell),
            Paragraph("Multi-bus defect deduplication within 25m radius, traffic density deficit scoring, and schema validation.", table_cell)
        ],
        [
            Paragraph("<b>Cloud Deployment</b>", table_cell),
            Paragraph("Render Unified Web Service (render.yaml), Docker-ready, Vite 6 Bundle", table_cell),
            Paragraph("Production-ready cloud hosting with zero-configuration blueprint and environment isolation.", table_cell)
        ]
    ]
    ttable = Table(tech_data, colWidths=[35 * mm, 65 * mm, 82 * mm])
    ttable.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(ttable)
    story.append(Spacer(1, 6 * mm))

    # Concluding Verification Box
    conclusion_text = (
        "<b>CONCLUSION & SIH 2026 EVALUATION SUMMARY:</b> Nagar Drishti delivers a complete, deployable, "
        "and economically frugal urban intelligence platform. By synergizing with existing transit bus fleets, "
        "it achieves over <b>98% citywide arterial road coverage every 24 hours</b>, saves up to <b>40% in municipal "
        "repair budgets</b> through early intervention, and guarantees verifiable contractor accountability."
    )
    conc_table = Table([[Paragraph(conclusion_text, body_style)]], colWidths=[182 * mm])
    conc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ('LINELEFT', (0, 0), (-1, -1), 4, SECONDARY),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(conc_table)

    # Build PDF with dynamic page numbering
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "Nagar_Drishti_Features_Specification.pdf"
    build_pdf(out_path)
