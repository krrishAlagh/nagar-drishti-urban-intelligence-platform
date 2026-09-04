"""
Nagar Drishti - Dataset Preprocessing & Ingestion Engine
Processes Indian Road Scenarios dataset (RAD, RDD2022, CMIRD, IDD format)
Validates bounding box coordinates, generates class distribution metrics,
and configures absolute YAML configuration for YOLOv8 model training.
"""

import os
import glob
import json
import yaml
from pathlib import Path
from collections import defaultdict

# Root directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "archive" / "images"
VIDEOS_DIR = BASE_DIR / "datasets" / "archive" / "videos_without_audio"
OUTPUT_DIR = BASE_DIR / "ai_engine"

CLASS_NAMES = [
    'HMV',             # 0: Heavy Motor Vehicles (Buses, Trucks, Tankers)
    'LMV',             # 1: Light Motor Vehicles (Cars, Autos, Two-Wheelers)
    'Pedestrian',      # 2: Pedestrians & Hazard Vulnerable Road Users
    'RoadDamages',     # 3: Road Damages (Potholes, Cracks, Craters)
    'SpeedBump',       # 4: Speed Bumps & Breakers
    'UnsurfacedRoad'   # 5: Unsurfaced Road / Gravel / Mud / Waterlogging
]

def preprocess_and_validate():
    print("=" * 70)
    print("🏛️  NAGAR DRISHTI: DATASET PREPROCESSING & VALIDATION PIPELINE")
    print("=" * 70)
    
    splits = ['train', 'valid', 'test']
    split_stats = {}
    overall_class_counts = defaultdict(int)
    total_boxes = 0
    total_images = 0
    corrupt_labels = 0

    for split in splits:
        img_dir = DATASET_DIR / split / "images"
        lbl_dir = DATASET_DIR / split / "labels"
        
        if not img_dir.exists() or not lbl_dir.exists():
            print(f"⚠️ Warning: Split directory not found: {img_dir}")
            continue
            
        img_files = sorted(glob.glob(str(img_dir / "*.*")))
        lbl_files = sorted(glob.glob(str(lbl_dir / "*.txt")))
        
        class_counts = defaultdict(int)
        split_boxes = 0
        valid_lbl_count = 0
        
        for lbl_path in lbl_files:
            try:
                with open(lbl_path, 'r') as f:
                    lines = f.readlines()
                
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        cls_id = int(parts[0])
                        x_center = float(parts[1])
                        y_center = float(parts[2])
                        width = float(parts[3])
                        height = float(parts[4])
                        
                        # Validate coordinates normalization
                        if 0.0 <= x_center <= 1.0 and 0.0 <= y_center <= 1.0 and 0.0 <= width <= 1.0 and 0.0 <= height <= 1.0:
                            if 0 <= cls_id < len(CLASS_NAMES):
                                class_name = CLASS_NAMES[cls_id]
                                class_counts[class_name] += 1
                                overall_class_counts[class_name] += 1
                                split_boxes += 1
                        else:
                            corrupt_labels += 1
                valid_lbl_count += 1
            except Exception as e:
                corrupt_labels += 1

        total_images += len(img_files)
        total_boxes += split_boxes
        split_stats[split] = {
            "image_count": len(img_files),
            "label_count": len(lbl_files),
            "total_annotated_boxes": split_boxes,
            "class_distribution": dict(class_counts)
        }
        
        print(f"\n📂 [{split.upper()} SET]")
        print(f"   • Images: {len(img_files):,}")
        print(f"   • Annotations: {split_boxes:,} boxes across {valid_lbl_count:,} label files")
        for cls_name in CLASS_NAMES:
            count = class_counts.get(cls_name, 0)
            pct = (count / split_boxes * 100) if split_boxes > 0 else 0
            print(f"     - {cls_name:16s}: {count:6,d} ({pct:5.1f}%)")

    # Discover videos
    video_files = glob.glob(str(VIDEOS_DIR / "**" / "*.mp4"), recursive=True)
    
    print("\n" + "=" * 70)
    print("📊 OVERALL DATASET SUMMARY")
    print("=" * 70)
    print(f"Total Processed Images   : {total_images:,}")
    print(f"Total Bounding Boxes     : {total_boxes:,}")
    print(f"Total Video Scenarios    : {len(video_files):,} video feeds")
    print(f"Corrupted Annotations    : {corrupt_labels}")
    print("\nOverall Class Distribution:")
    for cls_name in CLASS_NAMES:
        c = overall_class_counts.get(cls_name, 0)
        pct = (c / total_boxes * 100) if total_boxes > 0 else 0
        bar = "█" * int(pct / 2.5)
        print(f"  {cls_name:16s} : {c:7,d} ({pct:5.1f}%) {bar}")

    # Generate Ultralytics YOLO Data YAML with absolute paths
    yolo_config = {
        'path': str(DATASET_DIR),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'names': {i: name for i, name in enumerate(CLASS_NAMES)},
        'nc': len(CLASS_NAMES)
    }

    yaml_output_path = OUTPUT_DIR / "dataset.yaml"
    with open(yaml_output_path, 'w') as f:
        yaml.dump(yolo_config, f, sort_keys=False)
    print(f"\n✅ Generated YOLO training configuration: {yaml_output_path}")

    # Save summary metadata
    summary_output_path = OUTPUT_DIR / "dataset_summary.json"
    summary_data = {
        "dataset_name": "Nagar Drishti Multitask Indian Road Scenarios",
        "modalities": [
            "RoadDefects_Potholes_Cracks",
            "Vehicle_Classification_HMV_LMV",
            "Pedestrian_Safety_Hazards",
            "SpeedBump_UnsurfacedRoad"
        ],
        "total_images": total_images,
        "total_boxes": total_boxes,
        "total_videos": len(video_files),
        "classes": CLASS_NAMES,
        "class_counts": dict(overall_class_counts),
        "split_stats": split_stats
    }
    with open(summary_output_path, 'w') as f:
        json.dump(summary_data, f, indent=2)
    print(f"✅ Generated dataset metadata report: {summary_output_path}")

    return summary_data

if __name__ == "__main__":
    preprocess_and_validate()
