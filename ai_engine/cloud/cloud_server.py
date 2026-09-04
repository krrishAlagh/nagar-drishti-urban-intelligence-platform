"""
Centralized Cloud AI & Decision Support Server
Ingests edge telemetry from bus fleet, executes DBSCAN spatial deduplication,
analyzes traffic congestion, and triggers GenAI agentic work order generation.
"""

import time
import json
import logging
from typing import List

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from schemas.telemetry_schemas import (
    EdgeTelemetryPayload,
    GPSCoordinate,
    DetectedDefect,
    BoundingBox,
    DefectCategory,
    CameraChannel
)
from cloud.spatial_clustering import SpatialClusteringEngine
from cloud.traffic_analytics import TrafficAnalyticsEngine
from cloud.agentic_dispatcher import AgenticActionDispatcher

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [CloudAI] %(message)s'
)
logger = logging.getLogger("CloudAIServer")


class CloudAIServer:
    """
    Central Decision Support Engine for Nagar Drishti Urban Intelligence Platform.
    """

    def __init__(self):
        self.spatial_engine = SpatialClusteringEngine(eps_meters=30.0, min_samples=1)
        self.traffic_engine = TrafficAnalyticsEngine()
        self.dispatcher = AgenticActionDispatcher()
        self.raw_telemetry_buffer: List[EdgeTelemetryPayload] = []

    def ingest_edge_payload(self, payload: EdgeTelemetryPayload):
        """
        Receives lightweight event payload from a bus node.
        """
        self.raw_telemetry_buffer.append(payload)
        logger.info(
            f"📥 Ingested Telemetry from [{payload.bus_node_id}] | "
            f"GPS: ({payload.gps.latitude:.4f}, {payload.gps.longitude:.4f}) | "
            f"Defects: {len(payload.defects)} | ANPR: {len(payload.anpr_events)}"
        )

    def process_analytics_batch(self):
        """
        Executes spatial deduplication, clustering, traffic delay modeling,
        and agentic work order synthesis on the ingested batch.
        """
        if not self.raw_telemetry_buffer:
            logger.info("No new telemetry in buffer to process.")
            return

        logger.info(f"\n⚙️ Starting Cloud AI Batch Processing for {len(self.raw_telemetry_buffer)} telemetry packets...")

        # 1. Spatial Clustering & Deduplication
        clusters = self.spatial_engine.deduplicate_and_cluster(self.raw_telemetry_buffer)
        logger.info(f"✨ DBSCAN Clustered {len(self.raw_telemetry_buffer)} raw detections into {len(clusters)} unique civic defects:")

        # 2. Automated Agentic Work Order Synthesis
        for cluster in clusters:
            work_order = self.dispatcher.generate_work_order(cluster)
            logger.info(
                f"📋 [AGENTIC DISPATCH] {work_order.work_order_id} | "
                f"Dept: {work_order.department_assigned} | "
                f"SLA: {work_order.target_sla_hours}h | "
                f"Severity: {work_order.severity.value} | "
                f"Title: '{work_order.title}'"
            )

        # 3. Traffic Congestion & Delay Analysis
        telemetry_dicts = [p.gps.model_dump() | {"route_id": p.route_id} for p in self.raw_telemetry_buffer]
        congestion = self.traffic_engine.compute_sector_congestion(telemetry_dicts)
        for cong in congestion:
            logger.info(
                f"🚦 [TRAFFIC AI] Sector: {cong['corridor_id']} | "
                f"Speed: {cong['current_avg_speed_kmh']} km/h (Deficit: {cong['speed_deficit_percent']}%) | "
                f"Level: {cong['congestion_level']}"
            )

        # Clear processed buffer
        self.raw_telemetry_buffer.clear()


def generate_sample_fleet_telemetry() -> List[EdgeTelemetryPayload]:
    """Generates synthetic multi-bus passes around Moolchand & AIIMS Delhi for demonstration."""
    sample_reports = []

    # Bus 101 detects a pothole at Moolchand
    sample_reports.append(
        EdgeTelemetryPayload(
            message_id="msg-101-01",
            bus_node_id="DTC-BUS-101",
            route_id="Ring Road Central",
            camera_channel=CameraChannel.FRONT,
            gps=GPSCoordinate(latitude=28.56841, longitude=77.23412, speed_kmh=32.0),
            defects=[
                DetectedDefect(
                    detection_id="det-1",
                    category=DefectCategory.POTHOLE,
                    confidence=0.94,
                    bbox=BoundingBox(x_min=0.3, y_min=0.6, x_max=0.7, y_max=0.9),
                    estimated_depth_cm=12.5,
                    estimated_area_sqm=0.85
                )
            ]
        )
    )

    # Bus 402 detects the same pothole 8 minutes later (slight GPS variance 6m)
    sample_reports.append(
        EdgeTelemetryPayload(
            message_id="msg-402-01",
            bus_node_id="DTC-BUS-402",
            route_id="Ring Road Central",
            camera_channel=CameraChannel.FRONT,
            gps=GPSCoordinate(latitude=28.56845, longitude=77.23418, speed_kmh=28.5),
            defects=[
                DetectedDefect(
                    detection_id="det-2",
                    category=DefectCategory.POTHOLE,
                    confidence=0.96,
                    bbox=BoundingBox(x_min=0.28, y_min=0.58, x_max=0.72, y_max=0.88),
                    estimated_depth_cm=13.0,
                    estimated_area_sqm=0.90
                )
            ]
        )
    )

    # Bus 729 detects waterlogging at Lajpat Nagar
    sample_reports.append(
        EdgeTelemetryPayload(
            message_id="msg-729-01",
            bus_node_id="DTC-BUS-729",
            route_id="Mathura Road Corridor",
            camera_channel=CameraChannel.FRONT,
            gps=GPSCoordinate(latitude=28.57010, longitude=77.24050, speed_kmh=18.0),
            defects=[
                DetectedDefect(
                    detection_id="det-3",
                    category=DefectCategory.WATERLOGGING,
                    confidence=0.89,
                    bbox=BoundingBox(x_min=0.1, y_min=0.4, x_max=0.9, y_max=0.95),
                    estimated_depth_cm=8.0,
                    estimated_area_sqm=4.5
                )
            ]
        )
    )

    return sample_reports


if __name__ == "__main__":
    server = CloudAIServer()
    sample_batch = generate_sample_fleet_telemetry()
    for report in sample_batch:
        server.ingest_edge_payload(report)
    server.process_analytics_batch()
    print("\n✅ Central Cloud AI Decision Engine executed successfully.")
