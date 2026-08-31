import sys
import cv2
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

# ---------- Stage 1: Restoration (classical CV, runs on CPU, near-instant) ----------

def gray_world_white_balance(img_bgr: np.ndarray) -> np.ndarray:
    """Corrects color cast (e.g. yellow indoor tube-light) using the gray-world assumption."""
    img = img_bgr.astype(np.float32)
    b, g, r = cv2.split(img)
    avg_b, avg_g, avg_r = b.mean(), g.mean(), r.mean()
    avg_gray = (avg_b + avg_g + avg_r) / 3
    # Check if a single channel dominates extremely (to avoid gray-world failure on solid-color products)
    # If the ratio of max channel to min channel average is very high, we bypass white balance
    channel_means = [avg_b, avg_g, avg_r]
    if max(channel_means) / (min(channel_means) + 1e-6) > 2.0:
        return img_bgr  # Skip white balance to preserve strong single-color integrity

    b = b * (avg_gray / (avg_b + 1e-6))
    g = g * (avg_gray / (avg_g + 1e-6))
    r = r * (avg_gray / (avg_r + 1e-6))
    out = cv2.merge([b, g, r])
    return np.clip(out, 0, 255).astype(np.uint8)


def adaptive_contrast_and_exposure(img_bgr: np.ndarray) -> np.ndarray:
    """CLAHE on the L channel (LAB space) — lifts shadow detail without blowing out highlights."""
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def restore(img_bgr: np.ndarray) -> np.ndarray:
    img = gray_world_white_balance(img_bgr)
    img = adaptive_contrast_and_exposure(img)
    return img


# ---------- Stage 2: Segmentation (BiRefNet via rembg) ----------

_SESSION = None
MODEL_NAME = "isnet-general-use"

def get_session():
    global _SESSION
    if _SESSION is None:
        _SESSION = new_session(MODEL_NAME)
    return _SESSION


def segment(pil_img: Image.Image) -> Image.Image:
    """Returns an RGBA cutout with a clean alpha matte."""
    session = get_session()
    cutout = remove(
        pil_img,
        session=session,
        alpha_matting=True,              # refines fine edges (threads, hair-like detail)
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=5,
    )
    return cutout


# ---------- Stage 3: Composition (pure white bg + soft shadow) ----------

def make_contact_shadow(alpha: Image.Image, canvas_size, pad, blur=25, opacity=90) -> Image.Image:
    """Builds a soft dark ellipse under the product silhouette, shifted by pad to align correctly."""
    w, h = canvas_size
    shadow = Image.new("L", (w, h), 0)
    mask_np = np.array(alpha)
    ys, xs = np.where(mask_np > 10)
    if len(xs) == 0:
        return shadow
    
    # Calculate original bounds
    x0, x1 = xs.min(), xs.max()
    y_base = ys.max()
    
    shadow_np = np.array(shadow)
    cx, width_ellipse = (x0 + x1) // 2, int((x1 - x0) * 0.6)
    
    # Offset center and y_base by the padding applied to the cutout
    cx_padded = cx + pad
    y_base_padded = y_base + pad
    
    cv2.ellipse(
        shadow_np,
        (cx_padded, min(y_base_padded + 8, h - 1)),
        (max(width_ellipse, 10), 12),
        0, 0, 360, opacity, -1
    )
    shadow = Image.fromarray(shadow_np).filter(ImageFilter.GaussianBlur(blur))
    return shadow


def compose_on_white(cutout_rgba: Image.Image, pad_ratio=0.12) -> Image.Image:
    w, h = cutout_rgba.size
    pad = int(max(w, h) * pad_ratio)
    canvas_w, canvas_h = w + 2 * pad, h + 2 * pad

    canvas = Image.new("RGB", (canvas_w, canvas_h), (255, 255, 255))
    alpha = cutout_rgba.split()[-1]

    # Pass the pad to ensure shadow coordinates are correctly offset
    shadow = make_contact_shadow(alpha, (canvas_w, canvas_h), pad)
    shadow_rgb = Image.new("RGB", (canvas_w, canvas_h), (0, 0, 0))
    canvas = Image.composite(shadow_rgb, canvas, shadow)

    canvas.paste(cutout_rgba, (pad, pad), cutout_rgba)
    return canvas


# ---------- Pipeline entry point ----------

def process(input_path: str, output_prefix: str):
    # Load
    pil_raw = Image.open(input_path).convert("RGB")
    bgr_raw = cv2.cvtColor(np.array(pil_raw), cv2.COLOR_RGB2BGR)

    # Stage 1
    bgr_restored = restore(bgr_raw)
    pil_restored = Image.fromarray(cv2.cvtColor(bgr_restored, cv2.COLOR_BGR2RGB))

    # Stage 2
    cutout = segment(pil_restored)   # RGBA, transparent background
    cutout.save(f"{output_prefix}_transparent.png")

    # Stage 3
    studio = compose_on_white(cutout)
    studio.save(f"{output_prefix}_white_bg.jpg", quality=95)

    print(f"Done:\n  {output_prefix}_transparent.png\n  {output_prefix}_white_bg.jpg")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python studio_pipeline.py <input_image> <output_prefix>")
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
