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

@router.post("/inpaint")
async def inpaint_image(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    product_image: UploadFile = File(None), 
    product_image_url: str = Form(None), # Nouvelle option : URL directe
    prompt: str = Form(...)
):
    """
    Endpoint pour l'Inpainting (Remplacement d'objet).
    Supporte maintenant le Virtual Staging via IP-Adapter si product_image ou product_image_url est fourni.
    """
    try:
        from ..services.ml_service import inpainting_service
        from PIL import Image
        import io
        import urllib.request

        # 1. Lire Image et Masque
        print("📥 Reading inputs...")
        image_bytes = await image.read()
        mask_bytes = await mask.read()
        print(f"✅ Image read: {len(image_bytes)} bytes")
        print(f"✅ Mask read: {len(mask_bytes)} bytes")
        
        try:
            init_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            print("✅ Init image opened")
        except Exception as e:
            print(f"❌ Error opening init image: {e}")
            raise e

        try:
            mask_image = Image.open(io.BytesIO(mask_bytes)).convert("RGB")
            print("✅ Mask image opened")
        except Exception as e:
            print(f"❌ Error opening mask image: {e}")
            raise e

        # Redimensionner pour éviter OOM (max 1024px)
        init_image.thumbnail((1024, 1024), Image.LANCZOS)
        mask_image.thumbnail((1024, 1024), Image.LANCZOS)

        # 1b. Lire l'image produit (Fichier OU URL)
        ip_adapter_image = None
        
        # Priorité 1: Fichier uploadé (si valide)
        if product_image:
            print("📥 Reading product image from file...")
            product_bytes = await product_image.read()
            if len(product_bytes) > 100: # Simple check pour éviter les fichiers corrompus/vides
                try:
                    ip_adapter_image = Image.open(io.BytesIO(product_bytes)).convert("RGB")
                    print("✅ Product image opened from file")
                except Exception as e:
                    print(f"❌ Error opening product image file: {e}")

        # Priorité 2: URL (si pas d'image valide encore)
        if ip_adapter_image is None and product_image_url:
            print(f"📥 Downloading product image from URL: {product_image_url}")
            try:
                # Téléchargement via urllib avec User-Agent pour éviter 403/404 sur certains sites
                req = urllib.request.Request(
                    product_image_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
                )
                with urllib.request.urlopen(req) as response:
                    url_bytes = response.read()
                    ip_adapter_image = Image.open(io.BytesIO(url_bytes)).convert("RGB")
                    print("✅ Product image downloaded and opened")
            except Exception as e:
                print(f"❌ Error downloading product image: {e}")

        # Redimensionnement image produit
        if ip_adapter_image:
            ip_adapter_image.thumbnail((512, 512), Image.LANCZOS)

        # 2. Génération Inpainting
        generated_pil = inpainting_service.inpaint(
            prompt=prompt,
            image=init_image,
            mask_image=mask_image,
            ip_adapter_image=ip_adapter_image,
            negative_prompt="low quality, blurry, bad anatomy"
        )

        # 3. Sauvegarde
        output_filename = f"inpainted_{uuid.uuid4()}.png"
        output_path = os.path.join(GALLERY_DIR, output_filename)
        generated_pil.save(output_path)
        
        image_url = f"http://localhost:8000/static/gallery/{output_filename}"

        return {
            "message": "Inpainting successful", 
            "generated_image": image_url,
            "id": output_filename
        }

    except Exception as e:
        print(f"Erreur inpainting: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
