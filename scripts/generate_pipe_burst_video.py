import os
import math
import cv2
import numpy as np
import imageio.v2 as imageio

def draw_warning_icon(img, cx, cy, size=14):
    """Draws an ultra-crisp hazard warning triangle with exclamation."""
    h_tri = int(size * 1.5)
    w_tri = int(size * 1.7)
    pts = np.array([
        [cx, cy - h_tri // 2],
        [cx - w_tri // 2, cy + h_tri // 2],
        [cx + w_tri // 2, cy + h_tri // 2]
    ], np.int32)
    # Vibrant emergency red-orange fill (RGB format)
    cv2.fillPoly(img, [pts], (255, 55, 30), cv2.LINE_AA)
    cv2.polylines(img, [pts], True, (255, 255, 255), 1, cv2.LINE_AA)
    # Exclamation mark
    cv2.line(img, (cx, cy - h_tri // 2 + 5), (cx, cy + 1), (255, 255, 255), 2, cv2.LINE_AA)
    cv2.circle(img, (cx, cy + h_tri // 2 - 4), 1, (255, 255, 255), 2)

def draw_water_wave_icon(img, cx, cy, size=12):
    """Draws a hydrology alert icon (water wave)."""
    # RGB cyan-blue wave
    cv2.circle(img, (cx, cy), size // 2 + 2, (0, 160, 255), -1, cv2.LINE_AA)
    pts = []
    for x in range(cx - 7, cx + 8):
        y = cy + int(math.sin((x - cx) * 0.6) * 3)
        pts.append([x, y])
    cv2.polylines(img, [np.array(pts, np.int32)], False, (255, 255, 255), 2, cv2.LINE_AA)

def generate_pipe_burst_video():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 12
    total_frames = fps * duration_sec  # 360 frames

    output_dir = os.path.abspath(os.path.join("public", "assets", "videos"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "pipe_burst_dashcam_clip.mp4")

    # Load source dashcam image
    img_path = os.path.abspath(os.path.join("public", "assets", "defects", "pipe_burst_dashcam.jpg"))
    if not os.path.exists(img_path):
        # Fallback to brain artifact
        brain_dir = r"C:\Users\AAKASH\.gemini\antigravity-ide\brain\f0e3df27-a35b-4b18-9771-cee3037584dd"
        img_path = os.path.join(brain_dir, "pipe_burst_dashcam_view_1789020915800.jpg")

    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Could not load image: {img_path}")

    # Standardize base frame to 1280x720
    base_frame = cv2.resize(img_bgr, (width, height), interpolation=cv2.INTER_LANCZOS4)
    base_frame_rgb = cv2.cvtColor(base_frame, cv2.COLOR_BGR2RGB)

    # In 1280x720, the water geyser & rupture zone is roughly centered at:
    # x: 420 to 860, y: 180 to 580
    plume_cx = 640
    plume_cy = 380

    # Create persistent water droplets on the left-side bus window
    np.random.seed(101)
    num_droplets = 24
    droplet_coords = []
    for _ in range(num_droplets):
        dx = np.random.randint(60, width - 60)
        dy = np.random.randint(40, height - 80)
        dr = np.random.randint(3, 8)
        droplet_coords.append((dx, dy, dr))

    print(f"Rendering {total_frames} frames to {output_path} (12.0s @ 30fps)...")
    writer = imageio.get_writer(
        output_path,
        fps=fps,
        codec='libx264',
        quality=8,
        pixelformat='yuv420p',
        macro_block_size=None
    )

    for i in range(total_frames):
        time_sec = i / float(fps)  # 0.0 to 12.0

        # Phase timing:
        # 0.0 - 3.5s: Approach at 22 km/h, road flooding visible, initial water spray
        # 3.5 - 8.5s: Close approach, AI locks onto 600mm ruptured flange geyser, confidence ramps 87% -> 96.5%
        # 8.5 - 12.0s: Slow-crawl past the 1.8m flooded section at 14 km/h, ticket auto-created & logged
        if time_sec < 3.5:
            rel_t = time_sec / 3.5
            zoom = 1.0 + rel_t * 0.08
            pan_x = rel_t * 15.0
            pan_y = 0.0
            speed = 22.0 - rel_t * 4.0  # 22 -> 18 km/h
        elif time_sec < 8.5:
            rel_t = (time_sec - 3.5) / 5.0
            zoom = 1.08 + rel_t * 0.12
            pan_x = 15.0 + rel_t * 25.0
            pan_y = rel_t * 8.0
            speed = 18.0 - rel_t * 4.0  # 18 -> 14 km/h
        else:
            rel_t = (time_sec - 8.5) / 3.5
            zoom = 1.20 + rel_t * 0.04
            pan_x = 40.0 + rel_t * 15.0
            pan_y = 8.0
            speed = 14.0 - rel_t * 1.5  # 14 -> 12.5 km/h

        # Low-frequency diesel bus engine rumble + uneven wet road chassis oscillation
        vibe_y = math.sin(time_sec * 24.0) * 1.3 + np.random.uniform(-0.6, 0.6)
        vibe_x = math.cos(time_sec * 18.0) * 0.8 + np.random.uniform(-0.4, 0.4)

        # Build transform matrix
        center_x = width * 0.5 + pan_x
        center_y = height * 0.52 + pan_y

        M = cv2.getRotationMatrix2D((center_x, center_y), 0, zoom)
        M[0, 2] += vibe_x
        M[1, 2] += vibe_y

        warped = cv2.warpAffine(base_frame_rgb, M, (width, height), borderMode=cv2.BORDER_REFLECT)
        frame = warped.copy()

        # Dynamic Water Geyser Simulation:
        # Simulate the turbulent, pulsing 800L/min hydraulic plume in the central spray zone
        # Create a localized turbulent displacement map
        gy1 = max(0, int(160 * zoom))
        gy2 = min(height, int(560 * zoom))
        gx1 = max(0, int(420 * zoom - pan_x * 0.5))
        gx2 = min(width, int(860 * zoom - pan_x * 0.5))

        if gy2 > gy1 and gx2 > gx1:
            plume_roi = frame[gy1:gy2, gx1:gx2]
            ph, pw = plume_roi.shape[:2]

            # Oscillating turbulent water ripple
            water_phase = time_sec * 18.0
            y_indices, x_indices = np.indices((ph, pw), dtype=np.float32)
            dist_from_plume = np.sqrt(((x_indices - pw * 0.5) / (pw * 0.5)) ** 2 + ((y_indices - ph * 0.6) / (ph * 0.6)) ** 2)
            mask_plume = np.clip(1.0 - dist_from_plume, 0.0, 1.0)
            mask_plume = cv2.GaussianBlur(mask_plume, (15, 15), 5.0)

            # High-velocity hydraulic turbulence
            warp_dx = (np.sin(y_indices * 0.12 + water_phase) * 2.5 + np.cos(x_indices * 0.08 - water_phase * 1.4) * 2.0) * mask_plume
            warp_dy = (np.cos(x_indices * 0.10 + water_phase * 1.2) * 3.2 + np.sin(y_indices * 0.15 - water_phase) * 1.8) * mask_plume

            map_x = np.clip(x_indices + warp_dx, 0, pw - 1).astype(np.float32)
            map_y = np.clip(y_indices + warp_dy, 0, ph - 1).astype(np.float32)

            distorted_plume = cv2.remap(plume_roi, map_x, map_y, cv2.INTER_LINEAR)

            # Add dynamic high-pressure white foaming highlights in the geyser core
            foam_intensity = (math.sin(time_sec * 22.0) * 0.25 + 0.75) * mask_plume
            foam_rgb = np.zeros_like(plume_roi, dtype=np.float32)
            foam_rgb[:, :] = [240, 248, 255]

            blended_roi = distorted_plume.astype(np.float32) * (1.0 - foam_intensity[:, :, np.newaxis] * 0.35) + \
                          foam_rgb * (foam_intensity[:, :, np.newaxis] * 0.35)
            frame[gy1:gy2, gx1:gx2] = np.clip(blended_roi, 0, 255).astype(np.uint8)

        # Dynamic Water Droplets on Bus Side Window (slight refractions)
        for (dx, dy, dr) in droplet_coords:
            # Droplets jitter subtly with bus engine vibration
            cur_dx = int(dx + vibe_x * 0.4)
            cur_dy = int(dy + vibe_y * 0.4)
            if 0 < cur_dx < width and 0 < cur_dy < height:
                # Glass droplet ring
                cv2.circle(frame, (cur_dx, cur_dy), dr, (20, 30, 40), 1, cv2.LINE_AA)
                cv2.circle(frame, (cur_dx - 1, cur_dy - 1), max(1, dr // 2), (240, 245, 255), -1, cv2.LINE_AA)

        # Flashing Emergency Ticket Alert in top right (t >= 3.0s)
        if time_sec >= 3.0:
            ticket_alpha = min(1.0, (time_sec - 3.0) / 1.0)
            t_pulse = math.sin(time_sec * 6.0) * 0.15 + 0.85
            t_box_w = 420
            t_box_h = 54
            t_box_x = width - t_box_w - 24
            t_box_y = 20

            t_overlay = frame.copy()
            cv2.rectangle(t_overlay, (t_box_x, t_box_y), (t_box_x + t_box_w, t_box_y + t_box_h), (20, 20, 25), -1)
            frame = cv2.addWeighted(t_overlay, 0.88 * ticket_alpha, frame, 1.0 - 0.88 * ticket_alpha, 0)
            cv2.rectangle(frame, (t_box_x, t_box_y), (t_box_x + t_box_w, t_box_y + t_box_h), (int(255 * t_pulse), 45, 45), 2)

            draw_warning_icon(frame, t_box_x + 22, t_box_y + 26, size=14)
            cv2.putText(frame, "CRITICAL: 600mm WATER MAIN BURST", (t_box_x + 42, t_box_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (255, 60, 60), 1, cv2.LINE_AA)
            cv2.putText(frame, "AUTO-TICKET: TK-8855 | WATER SUPPLY & SANITATION", (t_box_x + 42, t_box_y + 42), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (220, 220, 230), 1, cv2.LINE_AA)

        # Top-left DTC AI System Header
        hud_top_y = 20
        cv2.rectangle(frame, (20, hud_top_y), (360, hud_top_y + 36), (15, 18, 22), -1)
        cv2.rectangle(frame, (20, hud_top_y), (360, hud_top_y + 36), (60, 70, 80), 1)
        # Red REC blinker
        rec_blink = (int(time_sec * 2) % 2) == 0
        if rec_blink:
            cv2.circle(frame, (36, hud_top_y + 18), 5, (255, 30, 30), -1)
        cv2.putText(frame, "REC  DTC-BUS-204 | CAM 03 [SIDE-LEFT]", (48, hud_top_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 255, 255), 1, cv2.LINE_AA)

        # Bottom Edge Vision Telemetry Bar
        hud_bar_h = 44
        hud_bar_y = height - hud_bar_h
        hud_overlay = frame.copy()
        cv2.rectangle(hud_overlay, (0, hud_bar_y), (width, height), (8, 12, 16), -1)
        frame = cv2.addWeighted(hud_overlay, 0.88, frame, 0.12, 0)
        cv2.line(frame, (0, hud_bar_y), (width, hud_bar_y), (0, 160, 255), 1)

        # Telemetry fields
        hh = 10
        mm = 28
        ss = int(11 + time_sec)
        time_str = f"24-OCT-2023  {hh:02d}:{mm:02d}:{ss:02d} IST"

        cv2.putText(frame, time_str, (20, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 210, 225), 1, cv2.LINE_AA)

        loc_text = "CIVIL LINES (OPP. DISTRICT COURT GATE 1)"
        cv2.putText(frame, loc_text, (280, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

        coords_text = "28.6700 N, 77.2250 E"
        cv2.putText(frame, coords_text, (730, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (140, 180, 220), 1, cv2.LINE_AA)

        speed_text = f"SPEED: {speed:.1f} KM/H"
        cv2.putText(frame, speed_text, (960, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 200, 40), 1, cv2.LINE_AA)

        fps_text = "SYNC: 28ms | 30 FPS"
        cv2.putText(frame, fps_text, (1130, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (120, 220, 140), 1, cv2.LINE_AA)

        writer.append_data(frame)

    writer.close()
    print(f"[OK] Video successfully written: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    generate_pipe_burst_video()
