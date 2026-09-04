"""
Automated Agentic Action Dispatcher (Cloud AI)
Integrates LLM / Generative AI agents (Google Gemini API / Function Calling)
to parse validated defect JSON streams, evaluate SLA urgency,
and automatically synthesize structured municipal work orders.
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from schemas.telemetry_schemas import (
    SpatialClusterDefect,
    MunicipalWorkOrder,
    DefectCategory,
    SeverityLevel
)


class AgenticActionDispatcher:
    """
    Autonomous GenAI Agent that converts raw verified telemetry clusters
    into formal municipal work orders with SLA deadlines, material estimation,
    and cross-department routing.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self._init_llm_client()

    def _init_llm_client(self):
        """Initializes Google GenAI / Gemini client if key is configured."""
        self.use_live_api = False
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                self.use_live_api = True
            except Exception:
                self.use_live_api = False

    def generate_work_order(self, cluster: SpatialClusterDefect) -> MunicipalWorkOrder:
        """
        Synthesizes a structured municipal work order from a spatial defect cluster.
        """
        # Determine target department and SLA
        department, sla_hours = self._map_department_and_sla(cluster)
        sla_deadline = (datetime.utcnow() + timedelta(hours=sla_hours)).isoformat() + "Z"

        # If live Gemini API is available, invoke structured LLM prompt
        if self.use_live_api and hasattr(self, 'client'):
            try:
                prompt = f"""
                You are Nagar Drishti Municipal AI Dispatcher. Convert this verified road defect cluster into a formal engineering work order.
                Input Cluster:
                - Category: {cluster.category.value}
                - GPS: Lat {cluster.centroid_gps.latitude}, Lng {cluster.centroid_gps.longitude}
                - Detection Count: {cluster.detection_count} buses
                - Severity: {cluster.calculated_severity.value}

                Output strict JSON format with fields:
                - title: Actionable title
                - location_landmark: Nearest landmark in Delhi NCR
                - ward: Ward name (e.g. Ward B - South)
                - recommended_repair_procedure: Engineering step by step
                - materials_estimated: list of materials
                """
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                parsed = json.loads(response.text.replace("```json", "").replace("```", "").strip())

                return MunicipalWorkOrder(
                    work_order_id=f"WO-{uuid.uuid4().hex[:6].upper()}",
                    cluster_id=cluster.cluster_id,
                    title=parsed.get("title", f"Repair Order: {cluster.category.value}"),
                    department_assigned=department,
                    severity=cluster.calculated_severity,
                    target_sla_hours=sla_hours,
                    sla_deadline_iso=sla_deadline,
                    location_landmark=parsed.get("location_landmark", f"Near Lat {cluster.centroid_gps.latitude}, Lng {cluster.centroid_gps.longitude}"),
                    ward=parsed.get("ward", "Ward B - South Zone"),
                    recommended_repair_procedure=parsed.get("recommended_repair_procedure", "Execute cold asphalt patch compaction and roller leveling."),
                    materials_estimated=parsed.get("materials_estimated", ["Bitumen cold mix (50kg)", "Tack coat primer", "Compactor roller"]),
                    evidence_image_url=cluster.representative_snapshot_url
                )
            except Exception:
                pass

        # High-performance rule-grounded fallback
        materials_map = {
            DefectCategory.POTHOLE: ["Bitumen cold mix (50kg)", "Tack coat emulsion", "Vibratory compactor"],
            DefectCategory.ROAD_CRACK: ["Hot-pour elastomeric sealant (20kg)", "Pavement router tool"],
            DefectCategory.WATERLOGGING: ["High-flow dewatering suction pump (15HP)", "Gully trap declogging snake"],
            DefectCategory.DAMAGED_DIVIDER: ["Reflective thermoplastic barrier block", "Anchor bolts (M16)", "Yellow retroreflective prism tape"],
            DefectCategory.MISSING_ZEBRA_CROSSING: ["Thermoplastic white road marking paint (100kg)", "Glass beads retroreflective coat"],
            DefectCategory.DAMAGED_TRAFFIC_SIGN: ["Standard retroreflective octagonal signpost", "Galvanized steel mounting pole"],
            DefectCategory.CABIN_MISCONDUCT: ["Vigilance squad dispatch ticket", "CCTV video footage timestamp bundle"],
            DefectCategory.BLIND_SPOT_PEDESTRIAN: ["Audible pedestrian crosswalk buzzer", "Solar-powered flashing beacon"]
        }

        procedure_map = {
            DefectCategory.POTHOLE: "Excavate loose debris from defect crater, apply bitumen emulsion tack coat, fill with Type-II hot asphalt mix, and compact with 2-ton vibratory roller to flush road grade.",
            DefectCategory.ROAD_CRACK: "Blow high-pressure air to clear dust and fissures, pre-heat joint edges, apply hot-pour elastomeric crack sealant at 180°C, and level with squeegee.",
            DefectCategory.WATERLOGGING: "Deploy mobile dewatering suction unit, clear blocked storm drain runoff chambers, inspect catchment pipe gradient, and install silt trap screen.",
            DefectCategory.DAMAGED_DIVIDER: "Clear dislodged concrete fragments, anchor precast median barrier section with expansion bolts, and install high-visibility yellow/black reflective stripes.",
            DefectCategory.CABIN_MISCONDUCT: "Transmit incident GPS and CCTV keyframe bundle to Delhi Transport Corporation (DTC) Central Vigilance Control for conductor/driver inquiry."
        }

        return MunicipalWorkOrder(
            work_order_id=f"WO-{uuid.uuid4().hex[:6].upper()}",
            cluster_id=cluster.cluster_id,
            title=f"Immediate Rectification: {cluster.category.value.replace('_', ' ').title()}",
            department_assigned=department,
            severity=cluster.calculated_severity,
            target_sla_hours=sla_hours,
            sla_deadline_iso=sla_deadline,
            location_landmark=f"Ring Road Corridor (Near {cluster.centroid_gps.latitude:.4f}° N, {cluster.centroid_gps.longitude:.4f}° E)",
            ward="Ward B - South Zone (MCD)",
            recommended_repair_procedure=procedure_map.get(
                cluster.category,
                "Dispatch certified municipal road inspection team for on-site assessment and remedial works."
            ),
            materials_estimated=materials_map.get(cluster.category, ["General civic repair toolkit", "Warning hazard cones"]),
            evidence_image_url=cluster.representative_snapshot_url
        )

    def _map_department_and_sla(self, cluster: SpatialClusterDefect) -> tuple[str, int]:
        """
        Maps defect category and severity to municipal departments and SLA hours.
        """
        if cluster.category in (DefectCategory.POTHOLE, DefectCategory.ROAD_CRACK, DefectCategory.DAMAGED_DIVIDER, DefectCategory.MISSING_ZEBRA_CROSSING):
            dept = "PWD Roads & Highways"
        elif cluster.category == DefectCategory.WATERLOGGING:
            dept = "Delhi Jal Board (DJB) Drainage"
        elif cluster.category == DefectCategory.DAMAGED_TRAFFIC_SIGN or cluster.category == DefectCategory.BLIND_SPOT_PEDESTRIAN:
            dept = "Delhi Traffic Police (Traffic Management)"
        elif cluster.category == DefectCategory.CABIN_MISCONDUCT:
            dept = "DTC Vigilance & Passenger Safety"
        else:
            dept = "Municipal Corporation of Delhi (MCD)"

        if cluster.calculated_severity == SeverityLevel.CRITICAL:
            sla = 1
        elif cluster.calculated_severity == SeverityLevel.HIGH:
            sla = 4
        elif cluster.calculated_severity == SeverityLevel.MEDIUM:
            sla = 24
        else:
            sla = 48

        return dept, sla
