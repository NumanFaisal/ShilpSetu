import io
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

# Import pipeline functions
from studio_pipeline import restore, segment, compose_on_white

app = FastAPI(
    title="AI Image Enhancer & Studio API",
    description="API to enhance product photos. The `/enhance` endpoint returns a side-by-side comparison of the original photo and the marketplace-ready studio output."
)

@app.post("/enhance", summary="Upload a product photo and get a side-by-side comparison")
async def enhance_image(file: UploadFile = File(...)):
    # 1. Read input image
    contents = await file.read()
    try:
        pil_raw = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot identify image file. Please ensure you are uploading a valid image format (e.g., JPEG, PNG, or HEIC)."
        )

    bgr_raw = cv2.cvtColor(np.array(pil_raw), cv2.COLOR_RGB2BGR)

    # 2. Run Restoration (Stage 1)
    bgr_restored = restore(bgr_raw)
    pil_restored = Image.fromarray(cv2.cvtColor(bgr_restored, cv2.COLOR_BGR2RGB))

    # 3. Run Segmentation (Stage 2)
    cutout = segment(pil_restored)

    # 4. Run Composition (Stage 3)
    studio = compose_on_white(cutout)

    # 5. Create a side-by-side comparison image
    # Resize the raw image to match the height of the studio (processed) image
    h_studio = studio.height
    w_raw_resized = int(pil_raw.width * (h_studio / pil_raw.height))
    raw_resized = pil_raw.resize((w_raw_resized, h_studio), Image.Resampling.LANCZOS)

    # Combine side-by-side: [Raw Resized] | [Grey space divider] | [Studio Image]
    divider_width = 15
    total_width = w_raw_resized + divider_width + studio.width
    comparison_img = Image.new("RGB", (total_width, h_studio), (220, 220, 220)) # Light grey divider
    
    comparison_img.paste(raw_resized, (0, 0))
    comparison_img.paste(studio, (w_raw_resized + divider_width, 0))

    # Save the comparison image to memory
    img_byte_arr = io.BytesIO()
    comparison_img.save(img_byte_arr, format="JPEG", quality=95)
    img_byte_arr.seek(0)

    return StreamingResponse(img_byte_arr, media_type="image/jpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
