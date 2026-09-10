import os
import math
import numpy as np
import cv2
import imageio.v2 as imageio

def create_pothole_video():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 15
    total_frames = fps * duration_sec  # 450 frames

    output_path = os.path.abspath(os.path.join("public", "assets", "videos", "pothole_dashcam_clip.mp4"))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Base images
    brain_dir = r"C:\Users\AAKASH\.gemini\antigravity-ide\brain\f0e3df27-a35b-4b18-9771-cee3037584dd"
    img1_path = os.path.join(brain_dir, "pothole_approach_scene_1789017766082.jpg")
    img2_path = os.path.join(brain_dir, "pothole_dashcam_view_1789016752658.jpg")

    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        raise FileNotFoundError("Could not load source dashcam images.")

    img1 = cv2.resize(img1, (width, height), interpolation=cv2.INTER_LANCZOS4)
    img2 = cv2.resize(img2, (width, height), interpolation=cv2.INTER_LANCZOS4)

    # Convert to RGB since imageio expects RGB
    img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
    img2_rgb = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)

    print(f"Rendering {total_frames} frames to {output_path} with libx264...")
    writer = imageio.get_writer(
        output_path,
        fps=fps,
        codec='libx264',
        quality=8,
        pixelformat='yuv420p',
        macro_block_size=None
    )

    np.random.seed(42)

    for i in range(total_frames):
        time_sec = i / float(fps)  # 0.0 to 15.0

        # Phase logic:
        # Phase 1 (0.0 to 4.5s): Approach to intersection, camera zooms in smoothly
        # Phase 2 (4.5 to 9.5s): Close approach, pothole enters sharp focus, AI lock-on, confidence ramps to 98.4%, ticket alert
        # Phase 3 (9.5 to 15.0s): Vehicle steers slight left, navigates past crater, scans secondary cluster
        if time_sec < 4.0:
            blend_w2 = 0.0
            zoom = 1.0 + (time_sec / 4.0) * 0.14
            pan_x = 0.0
            speed = 36.0 - (time_sec / 4.0) * 2.0  # 36 -> 34 km/h
        elif time_sec < 6.5:
            blend_t = (time_sec - 4.0) / 2.5
            blend_w2 = 0.5 - 0.5 * math.cos(blend_t * math.pi)  # smooth cosine ease
            zoom = 1.0 + (blend_t * 0.10)
            pan_x = 0.0
            speed = 34.0 - blend_t * 4.0  # 34 -> 30 km/h
        elif time_sec < 10.5:
            blend_w2 = 1.0
            rel_t = (time_sec - 6.5) / 4.0
            zoom = 1.0 + rel_t * 0.15
            pan_x = -rel_t * 35.0  # driver starts steering slightly left
            speed = 30.0 - rel_t * 6.0  # 30 -> 24 km/h
        else:
            blend_w2 = 1.0
            rel_t = (time_sec - 10.5) / 4.5
            zoom = 1.15 + rel_t * 0.12
            pan_x = -35.0 - rel_t * 45.0  # continuing left avoidance maneuver
            speed = 24.0 - rel_t * 2.0  # 24 -> 22 km/h

        # Micro-rumble vibration from diesel bus engine & road
        vibe_y = math.sin(time_sec * 26.0) * 1.4 + np.random.uniform(-0.7, 0.7)
        vibe_x = math.cos(time_sec * 19.0) * 0.9 + np.random.uniform(-0.5, 0.5)

        center_x = width * 0.5 + pan_x
        center_y = height * 0.58

        M = cv2.getRotationMatrix2D((center_x, center_y), 0, zoom)
        M[0, 2] += vibe_x
        M[1, 2] += vibe_y

        f1 = cv2.warpAffine(img1_rgb, M, (width, height), borderMode=cv2.BORDER_REFLECT)
        f2 = cv2.warpAffine(img2_rgb, M, (width, height), borderMode=cv2.BORDER_REFLECT)

        if blend_w2 <= 0.0:
            frame = f1.copy()
        elif blend_w2 >= 1.0:
            frame = f2.copy()
        else:
            frame = cv2.addWeighted(f1, 1.0 - blend_w2, f2, blend_w2, 0)

        # Authentic CCTV color treatment: documentary wash
        frame = np.clip(frame.astype(np.float32) * 0.98 + 3.0, 0, 255).astype(np.uint8)

        # AI Detection Overlay (RGB format colors!)
        # Note: in RGB: Red is (255, 30, 30), Green is (30, 255, 30), Blue is (0, 113, 227)
        if 4.0 <= time_sec <= 11.0:
            box_t = min(1.0, (time_sec - 4.0) / 1.5)
            # Dynamic confidence ticking up from 82.4% -> 98.4%
            if time_sec < 5.0:
                conf = 82.4 + (time_sec - 4.0) * 8.8
            elif time_sec < 7.0:
                conf = 91.2 + (time_sec - 5.0) * 3.6
            else:
                conf = 98.4

            pulse = math.sin(time_sec * 8.0) * 0.2 + 0.8
            border_col = (int(255 * pulse), int(45 * pulse), int(45 * pulse))  # RGB Red

            approach_scale = 1.0 + (time_sec - 4.0) * 0.08
            bw = int(240 * approach_scale)
            bh = int(120 * approach_scale)
            bx = int((center_x - bw // 2) + pan_x * 0.5)
            by = int(center_y + 10 - bh // 2 + (time_sec - 4.0) * 12)

            # Red tint fill
            overlay = frame.copy()
            cv2.rectangle(overlay, (bx, by), (bx + bw, by + bh), (240, 25, 25), -1)
            alpha = 0.18 * box_t
            frame = cv2.addWeighted(overlay, alpha, frame, 1.0 - alpha, 0)

            # Bounding box outline
            cv2.rectangle(frame, (bx, by), (bx + bw, by + bh), border_col, 2)

            # High-tech corner brackets
            corner_len = 16
            cv2.line(frame, (bx, by), (bx + corner_len, by), (255, 0, 0), 3)
            cv2.line(frame, (bx, by), (bx, by + corner_len), (255, 0, 0), 3)
            cv2.line(frame, (bx + bw, by), (bx + bw - corner_len, by), (255, 0, 0), 3)
            cv2.line(frame, (bx + bw, by), (bx + bw, by + corner_len), (255, 0, 0), 3)
            cv2.line(frame, (bx, by + bh), (bx + corner_len, by + bh), (255, 0, 0), 3)
            cv2.line(frame, (bx, by + bh), (bx, by + bh - corner_len), (255, 0, 0), 3)
            cv2.line(frame, (bx + bw, by + bh), (bx + bw - corner_len, by + bh), (255, 0, 0), 3)
            cv2.line(frame, (bx + bw, by + bh), (bx + bw, by + bh - corner_len), (255, 0, 0), 3)

            # Label banner
            label_text = f"POTHOLE - {conf:.1f}% [CRITICAL]"
            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)
            cv2.rectangle(frame, (bx, by - 22), (bx + tw + 14, by), (220, 20, 20), -1)
            cv2.putText(frame, label_text, (bx + 7, by - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255, 255, 255), 1, cv2.LINE_AA)

            # Dimensions sub-tag
            dim_text = "W: 45cm | D: 15cm | Vol: 0.38m3"
            (dtw, dth), _ = cv2.getTextSize(dim_text, cv2.FONT_HERSHEY_SIMPLEX, 0.40, 1)
            cv2.rectangle(frame, (bx, by + bh), (bx + dtw + 12, by + bh + 18), (15, 15, 15), -1)
            cv2.putText(frame, dim_text, (bx + 6, by + bh + 13), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 230, 0), 1, cv2.LINE_AA)

        # Secondary Pothole Cluster ahead (Phase 3: t >= 9.5s)
        if time_sec >= 9.5:
            sec_t = min(1.0, (time_sec - 9.5) / 1.5)
            sbx = int(680 + (time_sec - 9.5) * 8)
            sby = int(350 + (time_sec - 9.5) * 10)
            sbw = 140
            sbh = 55

            amber_col = (255, 165, 0)
            overlay = frame.copy()
            cv2.rectangle(overlay, (sbx, sby), (sbx + sbw, sby + sbh), amber_col, -1)
            frame = cv2.addWeighted(overlay, 0.15 * sec_t, frame, 1.0 - 0.15 * sec_t, 0)
            cv2.rectangle(frame, (sbx, sby), (sbx + sbw, sby + sbh), amber_col, 1)

            sec_label = "CLUSTER 20m AHEAD (89.1%)"
            (st_w, st_h), _ = cv2.getTextSize(sec_label, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
            cv2.rectangle(frame, (sbx, sby - 18), (sbx + st_w + 8, sby), (220, 120, 0), -1)
            cv2.putText(frame, sec_label, (sbx + 4, sby - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)

        # Top Right: Automated Ticket Creation Toast Animation (Flashes at 6.5s - 13.5s)
        if 6.5 <= time_sec <= 13.5:
            toast_t = time_sec - 6.5
            toast_alpha = min(1.0, toast_t / 0.4)
            if time_sec > 12.5:
                toast_alpha = max(0.0, (13.5 - time_sec) / 1.0)

            tw = 380
            th = 64
            tx = width - tw - 24
            ty = 24

            toast_bg = frame[ty:ty+th, tx:tx+tw].copy()
            toast_box = np.full((th, tw, 3), (25, 25, 30), dtype=np.uint8)

            strobe = math.sin(toast_t * 12.0) > 0.0 if toast_t < 1.8 else False
            border_color = (0, 255, 120) if strobe else (0, 113, 227)

            cv2.rectangle(toast_box, (0, 0), (tw, th), border_color, 2)
            cv2.putText(toast_box, "AI AUTO-DISPATCH: TICKET CREATED", (14, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (0, 230, 255), 1, cv2.LINE_AA)
            cv2.putText(toast_box, "TK-8921 | SLA: 4H | ROADS & BRIDGES", (14, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(toast_box, "STATUS: HOT-MIX CREW NOTIFIED", (14, 56), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (100, 240, 140), 1, cv2.LINE_AA)

            blended_toast = cv2.addWeighted(toast_box, 0.88, toast_bg, 0.12, 0)
            frame[ty:ty+th, tx:tx+tw] = cv2.addWeighted(blended_toast, toast_alpha, toast_bg, 1.0 - toast_alpha, 0)

        # Top Left: CCTV Channel & Live Edge Metadata Bar
        cv2.rectangle(frame, (18, 18), (370, 52), (15, 15, 20), -1)
        cv2.rectangle(frame, (18, 18), (370, 52), (70, 70, 80), 1)
        rec_pulse = int(255 * (0.5 + 0.5 * math.sin(time_sec * 6.0)))
        cv2.circle(frame, (32, 35), 5, (rec_pulse, 0, 0), -1)  # RGB Red
        cv2.putText(frame, "CAM 01: FRONT DASHCAM POV (DTC)", (45, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (230, 230, 230), 1, cv2.LINE_AA)
        cv2.putText(frame, "YOLO-v8n-seg | JETSON ORIN | 30 FPS", (45, 47), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 180, 220), 1, cv2.LINE_AA)

        # Bottom Telemetry Strip: Speed 34 km/h | Lat 28.6139 | Sync 24ms
        hud_h = 42
        hud_overlay = frame[height - hud_h:height, 0:width].copy()
        cv2.rectangle(frame, (0, height - hud_h), (width, height), (14, 16, 20), -1)
        frame[height - hud_h:height, 0:width] = cv2.addWeighted(frame[height - hud_h:height, 0:width], 0.88, hud_overlay, 0.12, 0)
        cv2.line(frame, (0, height - hud_h), (width, height - hud_h), (55, 70, 90), 1)

        ms = int((time_sec % 1.0) * 100)
        sec = int(time_sec)
        time_str = f"24 OCT 2023  10:42:{sec:02d}.{ms:02d}"

        telemetry_str = f"DTC-BUS-402  |  SPEED: {int(speed)} KM/H  |  LAT: 28.6139*N  LONG: 77.2090*E  |  SYNC: 24ms  |  CONF: {min(98.4, 84.0 + time_sec * 1.5):.1f}%"
        
        cv2.putText(frame, time_str, (24, height - 16), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (160, 210, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, telemetry_str, (290, height - 16), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (240, 240, 240), 1, cv2.LINE_AA)

        status_text = "AUTO-ROUTING ACTIVE" if time_sec >= 7.0 else "AI SCANNING"
        badge_col = (80, 220, 100) if time_sec >= 7.0 else (0, 180, 255)
        cv2.putText(frame, status_text, (width - 190, height - 16), cv2.FONT_HERSHEY_SIMPLEX, 0.40, badge_col, 1, cv2.LINE_AA)

        writer.append_data(frame)

        if i % 60 == 0:
            print(f"Rendered frame {i}/{total_frames} ({(i/total_frames)*100:.1f}%)")

    writer.close()
    print("Video generation completed successfully with libx264!")
    file_size = os.path.getsize(output_path)
    print(f"Output: {output_path} ({file_size / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    create_pothole_video()
