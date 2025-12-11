from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
import cv2
import numpy as np
from ..services.ml_service import ml_service
from ..services.image_utils import process_canny, image_to_base64

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
GALLERY_DIR = "static/gallery"
os.makedirs(GALLERY_DIR, exist_ok=True)

@router.post("/generate")
async def generate_image(
    file: UploadFile = File(...), 
    prompt: str = Form(...), 
    style: str = Form(...)
):
    """
    Endpoint pour générer une image d'intérieur.
    1. Sauvegarde l'image uploadée.
    2. Prépare l'image pour ControlNet (Canny).
    3. Lance la génération Stable Diffusion.
    4. Sauvegarde le résultat.
    """
    try:
        # 1. Sauvegarde temporaire
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Préparation (Canny)
        canny_image = process_canny(file_location)
        if canny_image is None:
            return JSONResponse(content={"error": "Impossible de traiter l'image"}, status_code=400)
        
        # Convertir numpy array (OpenCV) vers PIL Image pour Diffusers
        from PIL import Image
        canny_pil = Image.fromarray(canny_image)

        # 3. Génération
        # Enrichir le prompt selon le style
        style_prompts = {
            "scandi": "scandinavian style, minimalist, bright, wooden furniture, white walls, cozy",
            "indus": "industrial style, loft, brick walls, metal furniture, dark tones, raw materials",
            "japandi": "japandi style, zen, organic shapes, neutral colors, natural light, plants",
            "cyber": "cyberpunk style, neon lights, futuristic furniture, dark atmosphere, high tech",
            "lux": "luxury modern style, marble, gold accents, velvet, expensive, sophisticated"
        }
        full_prompt = f"{prompt}, {style_prompts.get(style, '')}, interior design, photorealistic, 8k, high quality"
        negative_prompt = "low quality, blurry, distorted, ugly, bad anatomy, watermark, text"

        generated_pil = ml_service.generate(
            prompt=full_prompt,
            image=canny_pil,
            negative_prompt=negative_prompt
        )

        # 4. Sauvegarde du résultat (Galerie)
        output_filename = f"generated_{uuid.uuid4()}.png"
        output_path = os.path.join(GALLERY_DIR, output_filename)
        generated_pil.save(output_path)
        
        # URL pour le frontend
        image_url = f"http://localhost:8000/static/gallery/{output_filename}"

        return {
            "message": "Image generated successfully", 
            "generated_image": image_url,
            "id": output_filename
        }

    except Exception as e:
        print(f"Erreur génération: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
