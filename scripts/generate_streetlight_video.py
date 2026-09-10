import os
import math
import cv2
import numpy as np
import imageio.v2 as imageio

def draw_warning_icon(img, cx, cy, size=14):
    """Draws a clean, high-tech yellow equilateral warning triangle with an exclamation mark."""
    h_tri = int(size * 1.5)
    w_tri = int(size * 1.7)
    pts = np.array([
        [cx, cy - h_tri // 2],
        [cx - w_tri // 2, cy + h_tri // 2],
        [cx + w_tri // 2, cy + h_tri // 2]
    ], np.int32)
    # Glowing amber fill
    cv2.fillPoly(img, [pts], (20, 185, 255), cv2.LINE_AA)
    cv2.polylines(img, [pts], True, (0, 0, 0), 1, cv2.LINE_AA)
    # Exclamation mark
    cv2.line(img, (cx, cy - h_tri // 2 + 5), (cx, cy + 1), (0, 0, 0), 2, cv2.LINE_AA)
    cv2.circle(img, (cx, cy + h_tri // 2 - 4), 1, (0, 0, 0), 2)

def draw_chip_icon(img, cx, cy, size=12):
    """Draws an AI edge processor badge with digital node pins."""
    hs = size // 2
    cv2.rectangle(img, (cx - hs, cy - hs), (cx + hs, cy + hs), (60, 220, 90), -1)
    cv2.rectangle(img, (cx - hs + 2, cy - hs + 2), (cx + hs - 2, cy + hs - 2), (20, 30, 20), -1)
    # Inner glowing core
    cv2.circle(img, (cx, cy), 2, (70, 240, 100), -1)
    # Pins
    for dx in [-3, 0, 3]:
        cv2.line(img, (cx + dx, cy - hs - 2), (cx + dx, cy - hs), (60, 220, 90), 1)
        cv2.line(img, (cx + dx, cy + hs), (cx + dx, cy + hs + 2), (60, 220, 90), 1)

def generate_streetlight_video():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 12
    total_frames = fps * duration_sec  # 360 frames

    output_dir = os.path.abspath(os.path.join("public", "assets", "videos"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "streetlight_dashcam_clip.mp4")

    brain_dir = r"C:\Users\AAKASH\.gemini\antigravity-ide\brain\f0e3df27-a35b-4b18-9771-cee3037584dd"
    img_approach_path = os.path.join(brain_dir, "streetlight_approach_view_1789019994160.jpg")

    img_raw = cv2.imread(img_approach_path)
    if img_raw is None:
        raise FileNotFoundError(f"Could not load approach image: {img_approach_path}")

    # Standardize base frame to 1280x720
    base_frame = cv2.resize(img_raw, (width, height), interpolation=cv2.INTER_LANCZOS4)

    # Coordinates in 1280x720:
    # Luminaire head area: y: 230 to 395, x: 675 to 815
    # Luminaire top suspension pivot: (745, 235)
    # Pole top arm apex: (648, 142)

    lum_y1, lum_y2 = 230, 395
    lum_x1, lum_x2 = 675, 815
    piv_x, piv_y = 745, 235

    # Extract luminaire head
    lum_crop = base_frame[lum_y1:lum_y2, lum_x1:lum_x2].copy()
    ch, cw = lum_crop.shape[:2]

    # Create feathered alpha mask for the luminaire
    lum_mask = np.zeros((ch, cw), dtype=np.float32)
    # Approximate polygon around the metal housing and hanging bulb
    poly_lum = np.array([
        [745 - lum_x1 - 15, 235 - lum_y1],
        [745 - lum_x1 + 35, 235 - lum_y1],
        [795 - lum_x1, 310 - lum_y1],
        [810 - lum_x1, 360 - lum_y1],
        [765 - lum_x1, 390 - lum_y1],
        [695 - lum_x1, 390 - lum_y1],
        [680 - lum_x1, 340 - lum_y1],
        [710 - lum_x1, 280 - lum_y1]
    ], np.int32)
    cv2.fillPoly(lum_mask, [poly_lum], 1.0)
    lum_mask = cv2.GaussianBlur(lum_mask, (7, 7), 2.0)

    # Clean background behind the luminaire by sampling the adjacent tree/sky line
    clean_bg = base_frame.copy()
    sample_patch = base_frame[lum_y1:lum_y2, lum_x2 + 10:lum_x2 + 10 + cw].copy()
    if sample_patch.shape[1] == cw:
        m3 = lum_mask[:, :, np.newaxis]
        clean_bg[lum_y1:lum_y2, lum_x1:lum_x2] = (sample_patch * m3 + clean_bg[lum_y1:lum_y2, lum_x1:lum_x2] * (1.0 - m3)).astype(np.uint8)

    print(f"Rendering {total_frames} frames to {output_path} (12.0s @ 30fps)...")
    writer = imageio.get_writer(
        output_path,
        fps=fps,
        codec='libx264',
        quality=8,
        pixelformat='yuv420p',
        macro_block_size=None
    )

    np.random.seed(118)

    for i in range(total_frames):
        t = i / float(fps)  # 0.0 to 12.0 seconds

        # ----------------------------------------------------
        # 1. Vehicle Motion & Deceleration Dynamics
        # ----------------------------------------------------
        if t < 3.5:
            speed_kmh = 32.0 - (t / 3.5) * 2.0  # 32 -> 30 km/h
            brake_dive = 0.0
            travel_prog = t / 12.0 * 0.35
        elif t < 6.0:
            rel = (t - 3.5) / 2.5
            speed_kmh = 30.0 - rel * 6.0  # 30 -> 24 km/h
            brake_dive = math.sin(rel * math.pi) * 1.5
            travel_prog = 0.35 * (3.5 / 12.0) + rel * 0.28
        elif t < 9.0:
            rel = (t - 6.0) / 3.0
            speed_kmh = 24.0 - rel * 10.0  # 24 -> 14 km/h
            brake_dive = 2.8 * (1.0 - rel * 0.5)  # suspension pitch dip under braking
            travel_prog = 0.55 + rel * 0.25
        else:
            rel = (t - 9.0) / 3.0
            speed_kmh = 14.0 - rel * 2.0  # 14 -> 12 km/h (safety crawl past hazard)
            brake_dive = 0.5 * (1.0 - rel)
            travel_prog = 0.80 + rel * 0.18

        # ----------------------------------------------------
        # 2. Authentic Engine Vibration & Camera Rumble
        # ----------------------------------------------------
        vibe_freq = 24.0 if speed_kmh > 20 else 16.0
        vibe_y = math.sin(t * vibe_freq) * 0.9 + np.random.uniform(-0.4, 0.4) + brake_dive
        vibe_x = math.cos(t * (vibe_freq * 0.7)) * 0.6 + np.random.uniform(-0.3, 0.3)

        # ----------------------------------------------------
        # 3. 3D Perspective Road Forward Flow
        # ----------------------------------------------------
        fwd_scale = 1.0 + travel_prog * 0.20

        M_cam = cv2.getRotationMatrix2D((width * 0.5, height * 0.55), 0, fwd_scale)
        M_cam[0, 2] += vibe_x - travel_prog * 16.0
        M_cam[1, 2] += vibe_y + travel_prog * 10.0

        cur_bg = cv2.warpAffine(clean_bg, M_cam, (width, height), borderMode=cv2.BORDER_REFLECT)

        # ----------------------------------------------------
        # 4. Elastic Structural Pole Wind Sway
        # ----------------------------------------------------
        pole_sway_deg = math.sin(t * 1.6) * 1.1 + math.sin(t * 3.1) * 0.4

        # ----------------------------------------------------
        # 5. Compound Pendulum Swinging of the Dangling Luminaire
        # ----------------------------------------------------
        swing_deg = math.sin(t * 2.5) * 6.5 + math.sin(t * 4.9 + 0.4) * 2.2 + math.sin(t * 1.1) * 1.2
        total_rot = swing_deg + pole_sway_deg

        # Transformed suspension pivot position
        local_piv_x = piv_x - lum_x1
        local_piv_y = piv_y - lum_y1

        cur_piv_x = piv_x * fwd_scale + M_cam[0, 2] - (piv_x * (fwd_scale - 1.0) * 0.5)
        cur_piv_y = piv_y * fwd_scale + M_cam[1, 2] - (piv_y * (fwd_scale - 1.0) * 0.45)
        cur_piv_x += math.sin(math.radians(pole_sway_deg)) * 22.0

        # Rotate the luminaire head around suspension pivot
        M_rot = cv2.getRotationMatrix2D((local_piv_x, local_piv_y), total_rot, fwd_scale)
        warped_lum = cv2.warpAffine(lum_crop, M_rot, (cw, ch), borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0))
        warped_mask = cv2.warpAffine(lum_mask, M_rot, (cw, ch), borderMode=cv2.BORDER_CONSTANT, borderValue=0)

        # Target coordinates on canvas
        dst_x1 = int(cur_piv_x - local_piv_x * fwd_scale)
        dst_y1 = int(cur_piv_y - local_piv_y * fwd_scale)
        dst_x2 = dst_x1 + cw
        dst_y2 = dst_y1 + ch

        # Bounds clipping
        src_x1 = max(0, -dst_x1)
        src_y1 = max(0, -dst_y1)
        src_x2 = cw - max(0, dst_x2 - width)
        src_y2 = ch - max(0, dst_y2 - height)

        clip_dx1 = max(0, dst_x1)
        clip_dy1 = max(0, dst_y1)
        clip_dx2 = min(width, dst_x2)
        clip_dy2 = min(height, dst_y2)

        if clip_dx2 > clip_dx1 and clip_dy2 > clip_dy1 and src_x2 > src_x1 and src_y2 > src_y1:
            crop_bg = cur_bg[clip_dy1:clip_dy2, clip_dx1:clip_dx2]
            crop_fg = warped_lum[src_y1:src_y2, src_x1:src_x2]
            crop_m = warped_mask[src_y1:src_y2, src_x1:src_x2][:, :, np.newaxis]

            blended = (crop_fg * crop_m + crop_bg * (1.0 - crop_m)).astype(np.uint8)
            cur_bg[clip_dy1:clip_dy2, clip_dx1:clip_dx2] = blended

        frame = cur_bg

        # ----------------------------------------------------
        # 6. Flexible Dangling Electrical Cables
        # ----------------------------------------------------
        # Pole arm apex transformed
        pole_tip_x = int(648 * fwd_scale + M_cam[0, 2] - (648 * (fwd_scale - 1.0) * 0.5) + math.sin(math.radians(pole_sway_deg)) * 22.0)
        pole_tip_y = int(142 * fwd_scale + M_cam[1, 2] - (142 * (fwd_scale - 1.0) * 0.45))

        # Dynamic catenary wire curve that flexes with the swing
        wire_pts = []
        for step in np.linspace(0.0, 1.0, 12):
            wx = pole_tip_x + (cur_piv_x - pole_tip_x) * step
            # Catenary sag and harmonic flex
            sag = math.sin(step * math.pi) * (24.0 + math.sin(t * 3.5) * 5.0)
            wy = pole_tip_y + (cur_piv_y - pole_tip_y) * step + sag
            wire_pts.append((int(wx), int(wy)))

        # Draw insulated copper cable bundle (3-core)
        for w_idx in range(len(wire_pts) - 1):
            cv2.line(frame, wire_pts[w_idx], wire_pts[w_idx + 1], (30, 30, 35), 3, cv2.LINE_AA)
            cv2.line(frame, (wire_pts[w_idx][0] + 1, wire_pts[w_idx][1]), (wire_pts[w_idx + 1][0] + 1, wire_pts[w_idx + 1][1]), (60, 60, 70), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 7. Intermittent Live Wire Electrical Arc / Micro-Sparks
        # ----------------------------------------------------
        is_sparking = False
        spark_intensity = 0.0
        spark_times = [3.6, 6.2, 8.8, 10.9]
        for st in spark_times:
            dt = t - st
            if 0.0 <= dt < 0.12:  # ~3-4 frames duration
                is_sparking = True
                spark_intensity = math.sin((dt / 0.12) * math.pi)

        wire_sever_x = int(cur_piv_x + math.sin(math.radians(total_rot)) * 115.0)
        wire_sever_y = int(cur_piv_y + math.cos(math.radians(total_rot)) * 115.0)

        if is_sparking and 0 <= wire_sever_x < width and 0 <= wire_sever_y < height:
            # Blue-white electrical corona flash
            glow_rad = int(22 + spark_intensity * 32)
            spark_glow = np.zeros((height, width, 3), dtype=np.float32)
            cv2.circle(spark_glow, (wire_sever_x, wire_sever_y), glow_rad, (255, 240, 180), -1)
            cv2.circle(spark_glow, (wire_sever_x, wire_sever_y), int(glow_rad * 0.45), (255, 255, 255), -1)
            spark_glow = cv2.GaussianBlur(spark_glow, (25, 25), 8)
            frame = np.clip(frame.astype(np.float32) + spark_glow * (0.65 * spark_intensity), 0, 255).astype(np.uint8)

            # High-voltage arc tendril
            for k in range(3):
                arc_end_x = wire_sever_x + np.random.randint(-16, 16)
                arc_end_y = wire_sever_y + np.random.randint(-16, 16)
                cv2.line(frame, (wire_sever_x, wire_sever_y), (arc_end_x, arc_end_y), (255, 255, 255), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 8. Dynamic Headlight Cones on Road & Pole
        # ----------------------------------------------------
        beam_overlay = np.zeros((height, width), dtype=np.float32)
        cv2.ellipse(beam_overlay, (int(width * 0.42), height + 40), (int(260 * fwd_scale), int(420 * fwd_scale)), -12, 0, 360, 1.0, -1)
        cv2.ellipse(beam_overlay, (int(width * 0.58), height + 40), (int(290 * fwd_scale), int(440 * fwd_scale)), 8, 0, 360, 1.0, -1)
        beam_overlay = cv2.GaussianBlur(beam_overlay, (101, 101), 45)

        headlight_gain = 0.08 + travel_prog * 0.12
        frame = np.clip(frame.astype(np.float32) + (beam_overlay[:, :, np.newaxis] * headlight_gain * 255.0), 0, 255).astype(np.uint8)

        # ----------------------------------------------------
        # 9. AI Bounding Box Tracking the Swaying Hazard
        # ----------------------------------------------------
        center_box_x = int(cur_piv_x + math.sin(math.radians(total_rot)) * 85.0 + 15.0)
        center_box_y = int(cur_piv_y + math.cos(math.radians(total_rot)) * 85.0 + 15.0)

        box_w = int(160 * fwd_scale)
        box_h = int(210 * fwd_scale)
        bx1 = center_box_x - box_w // 2
        by1 = center_box_y - box_h // 2
        bx2 = bx1 + box_w
        by2 = by1 + box_h

        if t >= 3.0:
            if t < 6.0:
                conf = 78.5 + ((t - 3.0) / 3.0) * 13.5  # 78.5% -> 92.0%
            else:
                conf = 92.0 + np.random.uniform(-0.2, 0.2)

            amber_color = (15, 175, 255)  # Amber / Yellow in BGR

            # Corner brackets
            line_len = 22
            thick = 2
            cv2.line(frame, (bx1, by1), (bx1 + line_len, by1), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx1, by1), (bx1, by1 + line_len), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx2, by1), (bx2 - line_len, by1), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx2, by1), (bx2, by1 + line_len), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx1, by2), (bx1 + line_len, by2), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx1, by2), (bx1, by2 - line_len), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx2, by2), (bx2 - line_len, by2), amber_color, thick, cv2.LINE_AA)
            cv2.line(frame, (bx2, by2), (bx2 - line_len, by2), amber_color, thick, cv2.LINE_AA)

            # Bounding box rectangle
            overlay_box = frame.copy()
            cv2.rectangle(overlay_box, (bx1, by1), (bx2, by2), amber_color, 1, cv2.LINE_AA)
            cv2.addWeighted(overlay_box, 0.55, frame, 0.45, 0, frame)

            # Animated laser scanning beam
            scan_y = by1 + int(((t * 1.5) % 1.0) * (by2 - by1))
            cv2.line(frame, (bx1 + 4, scan_y), (bx2 - 4, scan_y), (100, 220, 255), 1, cv2.LINE_AA)

            # Bounding box tag header
            tag_text = f"ELECTRICAL HAZARD {conf:.1f}%"
            (tw, th), _ = cv2.getTextSize(tag_text, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
            cv2.rectangle(frame, (bx1, by1 - 22), (bx1 + tw + 16, by1), (15, 175, 255), -1)
            cv2.rectangle(frame, (bx1, by1 - 22), (bx1 + tw + 16, by1), (0, 0, 0), 1)
            cv2.putText(frame, tag_text, (bx1 + 7, by1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 0), 2, cv2.LINE_AA)

            # Dimension tag
            dim_text = "POLE: 8m | DEFL: 45 | CABLE: ~30cm"
            (dtw, _), _ = cv2.getTextSize(dim_text, cv2.FONT_HERSHEY_SIMPLEX, 0.35, 1)
            cv2.rectangle(frame, (bx1, by2), (bx1 + dtw + 12, by2 + 18), (0, 0, 0), -1)
            cv2.putText(frame, dim_text, (bx1 + 6, by2 + 13), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (20, 200, 255), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 10. Emergency Alert Banner (Top Center)
        # ----------------------------------------------------
        if t >= 5.5:
            alert_w, alert_h = 580, 40
            ax1 = (width - alert_w) // 2
            ay1 = 28
            ax2 = ax1 + alert_w
            ay2 = ay1 + alert_h

            overlay_alert = frame.copy()
            cv2.rectangle(overlay_alert, (ax1, ay1), (ax2, ay2), (12, 12, 18), -1)
            cv2.rectangle(overlay_alert, (ax1, ay1), (ax2, ay2), (20, 90, 255), 2)  # Glowing amber border
            cv2.addWeighted(overlay_alert, 0.88, frame, 0.12, 0, frame)

            # Vector warning triangle
            draw_warning_icon(frame, ax1 + 22, ay1 + 20, size=11)

            # Hazard Alert Text
            alert_str = "ELECTRICAL HAZARD: LIVE WIRE EXPOSURE - POLE LGT-401"
            cv2.putText(frame, alert_str, (ax1 + 42, ay1 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (255, 255, 255), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 11. Auto-Ticket Creation Badge (Top Right)
        # ----------------------------------------------------
        if t >= 6.8:
            slide_t = min(1.0, (t - 6.8) / 0.5)
            card_w, card_h = 370, 58
            cx2 = int(width - 24 + (1.0 - slide_t) * 400)
            cx1 = cx2 - card_w
            cy1 = 26
            cy2 = cy1 + card_h

            if cx2 > 0 and cx1 < width:
                overlay_ticket = frame.copy()
                cv2.rectangle(overlay_ticket, (cx1, cy1), (cx2, cy2), (20, 24, 22), -1)
                cv2.rectangle(overlay_ticket, (cx1, cy1), (cx2, cy2), (50, 200, 70), 2)
                cv2.addWeighted(overlay_ticket, 0.90, frame, 0.10, 0, frame)

                draw_chip_icon(frame, cx1 + 22, cy1 + 22, size=12)
                cv2.putText(frame, "AI AUTO-DISPATCH: TICKET CREATED", (cx1 + 38, cy1 + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (70, 240, 100), 1, cv2.LINE_AA)
                cv2.putText(frame, "TK-8890 | SLA: 04h 00m | ELECTRICAL & LIGHTING", (cx1 + 14, cy1 + 44), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (220, 220, 220), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 12. Top Status Bar
        # ----------------------------------------------------
        cv2.rectangle(frame, (0, 0), (width, 24), (10, 10, 14), -1)
        rec_dot_color = (0, 0, 240) if (int(t * 2) % 2 == 0) else (80, 80, 110)
        cv2.circle(frame, (22, 12), 4, rec_dot_color, -1)
        cv2.putText(frame, "REC [DTC-EDGE-AI]", (34, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (220, 220, 220), 1, cv2.LINE_AA)

        status_msg = "SAFETY SLOWDOWN: 12 KM/H - EVIDENCE LOGGED" if t >= 9.5 else ("LIVE WIRE DETECTED - HIGH HAZARD" if t >= 6.0 else "CAM: FRONT-DASH | DTC-BUS-118")
        cv2.putText(frame, status_msg, (220, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (20, 210, 255) if t >= 6.0 else (180, 180, 180), 1, cv2.LINE_AA)

        fps_text = f"29.8 FPS | 1080p H.264 | 24 OCT 2023 20:18:{int(42 + t):02d}"
        (fw, _), _ = cv2.getTextSize(fps_text, cv2.FONT_HERSHEY_SIMPLEX, 0.36, 1)
        cv2.putText(frame, fps_text, (width - fw - 16, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (180, 180, 180), 1, cv2.LINE_AA)

        # ----------------------------------------------------
        # 13. CCTV Telemetry Strip (Bottom HUD)
        # ----------------------------------------------------
        hud_h = 32
        cv2.rectangle(frame, (0, height - hud_h), (width, height), (10, 10, 12), -1)
        
        telemetry_str = (
            f"DTC-BUS-118 | SECTOR 14 MAIN AVE (POLE LGT-401) | "
            f"SPEED: {speed_kmh:.1f} KM/H | LAT: 28.6250N LONG: 77.2180E | "
            f"EDGE SYNC: 19ms | {'HAZARD LOGGED' if t >= 9.0 else 'ANALYZING STREAM'}"
        )
        cv2.putText(frame, telemetry_str, (18, height - 11), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 225, 255) if speed_kmh < 18 else (210, 210, 210), 1, cv2.LINE_AA)

        # Tone & color balance
        frame = np.clip(frame.astype(np.float32) * 0.98 + 2.0, 0, 255).astype(np.uint8)

        # Append RGB frame
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        writer.append_data(frame_rgb)

        if i % 60 == 0 or i == total_frames - 1:
            print(f"Rendered frame {i+1}/{total_frames} ({t:.1f}s) - Speed: {speed_kmh:.1f} km/h")

    writer.close()
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[SUCCESS] Generated streetlight dashcam video: {output_path} ({file_size_mb:.2f} MB)")

if __name__ == "__main__":
    generate_streetlight_video()
