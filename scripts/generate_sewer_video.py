import os
import math
import cv2
import numpy as np
import imageio.v2 as imageio

def draw_biohazard_icon(img, cx, cy, size=14):
    """Draws a crisp amber warning triangle with hazard indicator."""
    h_tri = int(size * 1.5)
    w_tri = int(size * 1.7)
    pts = np.array([
        [cx, cy - h_tri // 2],
        [cx - w_tri // 2, cy + h_tri // 2],
        [cx + w_tri // 2, cy + h_tri // 2]
    ], np.int32)
    # Glowing amber fill (RGB format)
    cv2.fillPoly(img, [pts], (255, 185, 20), cv2.LINE_AA)
    cv2.polylines(img, [pts], True, (0, 0, 0), 1, cv2.LINE_AA)
    # Exclamation mark
    cv2.line(img, (cx, cy - h_tri // 2 + 5), (cx, cy + 1), (0, 0, 0), 2, cv2.LINE_AA)
    cv2.circle(img, (cx, cy + h_tri // 2 - 4), 1, (0, 0, 0), 2)

def generate_sewer_video():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 12
    total_frames = fps * duration_sec  # 360 frames

    output_dir = os.path.abspath(os.path.join("public", "assets", "videos"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "sewer_overflow_clip.mp4")

    # Load source rear dashcam image
    img_path = os.path.abspath(os.path.join("public", "assets", "defects", "sewer_overflow_dashcam.jpg"))
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        raise FileNotFoundError(f"Could not load image: {img_path}")

    # Standardize base frame to 1280x720
    base_frame = cv2.resize(img_bgr, (width, height), interpolation=cv2.INTER_LANCZOS4)
    base_frame_rgb = cv2.cvtColor(base_frame, cv2.COLOR_BGR2RGB)

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

        # Rear camera perspective:
        # As the bus accelerates away from the stop (18 -> 32 km/h),
        # the scene recedes backwards with slight lateral pan
        speed = 18.0 + (time_sec / 12.0) * 14.0  # 18 -> 32 km/h
        zoom = 1.12 - (time_sec / 12.0) * 0.10   # receding perspective
        pan_x = -(time_sec / 12.0) * 22.0        # bus drifting slightly right down the road lane
        pan_y = (time_sec / 12.0) * 8.0

        # Diesel bus chassis vibration & road bumps
        vibe_y = math.sin(time_sec * 22.0) * 1.1 + np.random.uniform(-0.5, 0.5)
        vibe_x = math.cos(time_sec * 16.0) * 0.7 + np.random.uniform(-0.4, 0.4)

        center_x = width * 0.5 + pan_x
        center_y = height * 0.55 + pan_y

        M = cv2.getRotationMatrix2D((center_x, center_y), 0, zoom)
        M[0, 2] += vibe_x
        M[1, 2] += vibe_y

        warped = cv2.warpAffine(base_frame_rgb, M, (width, height), borderMode=cv2.BORDER_REFLECT)
        frame = warped.copy()

        # Dynamic Fluid Effluent Ripples around the manhole (centered around x: 420, y: 520)
        spill_cx = int(450 * zoom + pan_x)
        spill_cy = int(540 * zoom + pan_y)
        sy1 = max(0, spill_cy - 90)
        sy2 = min(height, spill_cy + 90)
        sx1 = max(0, spill_cx - 150)
        sx2 = min(width, spill_cx + 150)

        if sy2 > sy1 and sx2 > sx1:
            spill_roi = frame[sy1:sy2, sx1:sx2]
            rh, rw = spill_roi.shape[:2]
            y_ind, x_ind = np.indices((rh, rw), dtype=np.float32)
            dist = np.sqrt(((x_ind - rw * 0.5) / (rw * 0.5)) ** 2 + ((y_ind - rh * 0.5) / (rh * 0.5)) ** 2)
            mask_spill = np.clip(1.0 - dist, 0.0, 1.0)
            mask_spill = cv2.GaussianBlur(mask_spill, (11, 11), 3.0)

            ripple_phase = time_sec * 14.0
            r_dx = (np.sin(y_ind * 0.15 + ripple_phase) * 1.8) * mask_spill
            r_dy = (np.cos(x_ind * 0.12 + ripple_phase) * 1.6) * mask_spill

            map_x = np.clip(x_ind + r_dx, 0, rw - 1).astype(np.float32)
            map_y = np.clip(y_ind + r_dy, 0, rh - 1).astype(np.float32)

            distorted_spill = cv2.remap(spill_roi, map_x, map_y, cv2.INTER_LINEAR)
            frame[sy1:sy2, sx1:sx2] = distorted_spill

        # Flashing Emergency Ticket Alert in top right (t >= 2.5s)
        if time_sec >= 2.5:
            ticket_alpha = min(1.0, (time_sec - 2.5) / 1.0)
            t_pulse = math.sin(time_sec * 6.0) * 0.15 + 0.85
            t_box_w = 430
            t_box_h = 56
            t_box_x = width - t_box_w - 24
            t_box_y = 20

            t_overlay = frame.copy()
            cv2.rectangle(t_overlay, (t_box_x, t_box_y), (t_box_x + t_box_w, t_box_y + t_box_h), (20, 20, 25), -1)
            frame = cv2.addWeighted(t_overlay, 0.88 * ticket_alpha, frame, 1.0 - 0.88 * ticket_alpha, 0)
            cv2.rectangle(frame, (t_box_x, t_box_y), (t_box_x + t_box_w, t_box_y + t_box_h), (int(255 * t_pulse), int(190 * t_pulse), 20), 2)

            draw_biohazard_icon(frame, t_box_x + 22, t_box_y + 28, size=14)
            cv2.putText(frame, "HIGH: SEWER LINE OVERFLOW (BIOHAZARD)", (t_box_x + 42, t_box_y + 24), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (255, 200, 30), 1, cv2.LINE_AA)
            cv2.putText(frame, "AUTO-TICKET: TK-8799 | SANITATION & WASTE SQUAD", (t_box_x + 42, t_box_y + 44), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (220, 220, 230), 1, cv2.LINE_AA)

        # Top-left DTC AI System Header
        hud_top_y = 20
        cv2.rectangle(frame, (20, hud_top_y), (360, hud_top_y + 36), (15, 18, 22), -1)
        cv2.rectangle(frame, (20, hud_top_y), (360, hud_top_y + 36), (60, 70, 80), 1)
        rec_blink = (int(time_sec * 2) % 2) == 0
        if rec_blink:
            cv2.circle(frame, (36, hud_top_y + 18), 5, (255, 30, 30), -1)
        cv2.putText(frame, "REC  DTC-BUS-309 | CAM 04 [REAR-VIEW]", (48, hud_top_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 255, 255), 1, cv2.LINE_AA)

        # Bottom Edge Vision Telemetry Bar
        hud_bar_h = 44
        hud_bar_y = height - hud_bar_h
        hud_overlay = frame.copy()
        cv2.rectangle(hud_overlay, (0, hud_bar_y), (width, height), (8, 12, 16), -1)
        frame = cv2.addWeighted(hud_overlay, 0.88, frame, 0.12, 0)
        cv2.line(frame, (0, hud_bar_y), (width, hud_bar_y), (255, 185, 20), 1)

        # Telemetry fields
        hh = 12
        mm = 35
        ss = int(48 + time_sec)
        time_str = f"24-OCT-2023  {hh:02d}:{mm:02d}:{ss:02d} IST"

        cv2.putText(frame, time_str, (20, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 210, 225), 1, cv2.LINE_AA)

        loc_text = "NEHRU PARK OUTER RING ROAD (GATE 3)"
        cv2.putText(frame, loc_text, (270, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

        coords_text = "28.5900 N, 77.1950 E"
        cv2.putText(frame, coords_text, (710, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (140, 180, 220), 1, cv2.LINE_AA)

        speed_text = f"SPEED: {speed:.1f} KM/H"
        cv2.putText(frame, speed_text, (940, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 200, 40), 1, cv2.LINE_AA)

        fps_text = "SYNC: 24ms | 89.0%"
        cv2.putText(frame, fps_text, (1130, hud_bar_y + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (120, 220, 140), 1, cv2.LINE_AA)

        writer.append_data(frame)

    writer.close()
    print(f"[OK] Video successfully written: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    generate_sewer_video()
