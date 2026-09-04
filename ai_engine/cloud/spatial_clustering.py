"""
Cloud Spatial Analytics & Incident Deduplication Engine
Implements Haversine-based DBSCAN spatial clustering to group multi-bus GPS defect detections,
eliminate duplicates, compute cluster centroids, and calculate severity scores.
"""

import math
import numpy as np
from typing import List, Dict, Tuple
from datetime import datetime
from sklearn.cluster import DBSCAN

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from schemas.telemetry_schemas import (
    EdgeTelemetryPayload,
    SpatialClusterDefect,
    GPSCoordinate,
    DefectCategory,
    SeverityLevel
)


class SpatialClusteringEngine:
    """
    Groups recurring defect reports from multiple transit buses into consolidated spatial clusters.
    Uses Haversine distance metric (in meters) to account for Earth curvature.
    """

    EARTH_RADIUS_METERS = 6371000.0

    def __init__(self, eps_meters: float = 25.0, min_samples: int = 1):
        """
        :param eps_meters: Maximum spatial distance (in meters) to consider reports part of the same defect
        :param min_samples: Minimum detections to form a confirmed cluster
        """
        self.eps_meters = eps_meters
        self.min_samples = min_samples
        # Convert eps in meters to radians for Haversine metric
        self.eps_radians = eps_meters / self.EARTH_RADIUS_METERS

    def deduplicate_and_cluster(
        self, raw_telemetry_reports: List[EdgeTelemetryPayload]
    ) -> List[SpatialClusterDefect]:
        """
        Executes DBSCAN spatial clustering on unaggregated defect reports.
        """
        # Flatten individual defect detections with their parent GPS and bus node
        flat_records = []
        for report in raw_telemetry_reports:
            for defect in report.defects:
                flat_records.append({
                    "bus_node_id": report.bus_node_id,
                    "timestamp": report.timestamp_iso,
                    "lat": report.gps.latitude,
                    "lng": report.gps.longitude,
                    "category": defect.category,
                    "confidence": defect.confidence,
                    "thumbnail_b64": report.event_snapshot_thumbnail_b64,
                    "depth_cm": defect.estimated_depth_cm,
                    "area_sqm": defect.estimated_area_sqm
                })

        if not flat_records:
            return []

        # Convert Lat/Lng to radians for Haversine distance matrix
        coords_rad = np.radians([[r["lat"], r["lng"]] for r in flat_records])

        # Execute DBSCAN clustering
        db = DBSCAN(
            eps=self.eps_radians,
            min_samples=self.min_samples,
            metric='haversine'
        )
        labels = db.fit_predict(coords_rad)

        clusters: List[SpatialClusterDefect] = []
        unique_labels = set(labels)

        for label in unique_labels:
            # Skip noise if label is -1 and min_samples > 1
            if label == -1 and self.min_samples > 1:
                continue

            cluster_indices = [i for i, lbl in enumerate(labels) if lbl == label]
            cluster_items = [flat_records[i] for i in cluster_indices]

            # Compute centroid GPS
            mean_lat = float(np.mean([item["lat"] for item in cluster_items]))
            mean_lng = float(np.mean([item["lng"] for item in cluster_items]))

            # Category majority vote
            categories = [item["category"] for item in cluster_items]
            primary_category = max(set(categories), key=categories.count)

            # Bus diversity
            unique_buses = list(set([item["bus_node_id"] for item in cluster_items]))
            timestamps = [item["timestamp"] for item in cluster_items]

            # Aggregate confidence
            mean_conf = float(np.mean([item["confidence"] for item in cluster_items]))

            # Secondary Cloud Verification
            is_verified = self.verify_cluster_authenticity(cluster_items)

            # Compute Severity
            severity = self.calculate_cluster_severity(cluster_items, primary_category)

            cluster_id = f"CLUSTER-{primary_category.value[:3]}-{abs(hash((mean_lat, mean_lng))) % 100000:05d}"

            clusters.append(
                SpatialClusterDefect(
                    cluster_id=cluster_id,
                    category=primary_category,
                    centroid_gps=GPSCoordinate(
                        latitude=round(mean_lat, 6),
                        longitude=round(mean_lng, 6),
                        speed_kmh=0.0
                    ),
                    detection_count=len(cluster_items),
                    first_detected_iso=min(timestamps),
                    last_detected_iso=max(timestamps),
                    contributing_bus_ids=unique_buses,
                    aggregate_confidence=round(mean_conf, 3),
                    calculated_severity=severity,
                    verified_by_secondary_cloud_ai=is_verified,
                    representative_snapshot_url=f"/api/evidence/{cluster_id}.jpg"
                )
            )

        return clusters

    def verify_cluster_authenticity(self, cluster_items: List[Dict]) -> bool:
        """
        Secondary verification engine: validates that multiple buses or high confidence
        corroborate the visual defect, filtering out transient shadows or road reflections.
        """
        buses = set([item["bus_node_id"] for item in cluster_items])
        max_conf = max([item["confidence"] for item in cluster_items])

        # Verified if at least 2 independent buses detected it, or a single bus with >92% confidence
        return len(buses) >= 2 or max_conf >= 0.92

    def calculate_cluster_severity(self, cluster_items: List[Dict], category: DefectCategory) -> SeverityLevel:
        """
        Computes dynamic severity score based on frequency of detection,
        estimated depth/area, and category safety impact.
        """
        depths = [item["depth_cm"] for item in cluster_items if item["depth_cm"] is not None]
        avg_depth = float(np.mean(depths)) if depths else 5.0

        if category == DefectCategory.BLIND_SPOT_PEDESTRIAN or category == DefectCategory.CABIN_MISCONDUCT:
            return SeverityLevel.CRITICAL

        if category == DefectCategory.POTHOLE:
            if avg_depth >= 10.0 or len(cluster_items) >= 4:
                return SeverityLevel.CRITICAL
            elif avg_depth >= 5.0:
                return SeverityLevel.HIGH
            return SeverityLevel.MEDIUM

        if category == DefectCategory.WATERLOGGING:
            return SeverityLevel.HIGH

        return SeverityLevel.MEDIUM
