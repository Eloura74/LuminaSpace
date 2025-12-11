import os
import io
import cv2
import numpy as np
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from PIL import Image
from dotenv import load_dotenv
import base64

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(title="Lumina Spaces API (Local)")

# Configuration CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Chargement du Modèle (Au démarrage) ---
print("Chargement des modèles IA... Cela peut prendre quelques minutes.")
try:
    # 1. Charger ControlNet (Canny pour les bords/architecture)
    controlnet = ControlNetModel.from_pretrained(
        "lllyasviel/sd-controlnet-canny", 
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
    )

    # 2. Charger Stable Diffusion avec ControlNet
    # Utilisation de Realistic Vision pour un meilleur rendu photo que le SD1.5 de base
    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        "SG161222/Realistic_Vision_V5.1_noVAE", 
        controlnet=controlnet, 
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        safety_checker=None # Désactiver pour gagner de la VRAM/Temps (Optionnel)
    )

    # Optimisations
    pipe.scheduler = UniPCMultistepScheduler.from_config(pipe.scheduler.config)
    
    if torch.cuda.is_available():
        pipe.to("cuda")
        pipe.enable_model_cpu_offload() # Économise la VRAM
        pipe.enable_xformers_memory_efficient_attention() # Si xformers est installé
        print("Modèle chargé sur GPU (CUDA).")
    else:
        print("ATTENTION: GPU non détecté. Le modèle tournera sur CPU (Très lent).")

except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    pipe = None

def process_canny(image_bytes):
    """Prépare l'image pour ControlNet (Détection de contours Canny)."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = np.array(image)
    
    # Canny Edge Detection
    low_threshold = 100
    high_threshold = 200
    image = cv2.Canny(image, low_threshold, high_threshold)
    image = image[:, :, None]
    image = np.concatenate([image, image, image], axis=2)
    control_image = Image.fromarray(image)
    return control_image

@app.get("/")
def read_root():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    return {"status": "online", "mode": f"local_{device}", "model_loaded": pipe is not None}

# --- Configuration Galerie ---
import uuid
import os
from fastapi.staticfiles import StaticFiles

GALLERY_DIR = "static/gallery"
os.makedirs(GALLERY_DIR, exist_ok=True)

# Servir les fichiers statiques (images sauvegardées)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/generate")
async def generate_image(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    style: str = Form(...)
):
    if pipe is None:
        raise HTTPException(status_code=500, detail="Le modèle IA n'est pas chargé (Erreur serveur ou téléchargement en cours).")

    try:
        # Lire l'image
        contents = await file.read()
        
        # Préparer l'image de contrôle (Canny)
        control_image = process_canny(contents)
        
        # Prompt Engineering basique
        full_prompt = f"interior design, {style} style, {prompt}, photorealistic, 8k, high quality, masterpiece, architectural photography"
        negative_prompt = "low quality, blurry, distorted, ugly, worst quality, cartoon, anime, painting, watermark, text"

        # Génération
        output = pipe(
            prompt=full_prompt,
            negative_prompt=negative_prompt,
            image=control_image,
            num_inference_steps=20, # 20-30 est un bon compromis vitesse/qualité
            guidance_scale=7.0,
            controlnet_conditioning_scale=1.0,
        ).images[0]

        # --- Sauvegarde Galerie ---
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(GALLERY_DIR, filename)
        output.save(filepath)
        image_url = f"http://localhost:8000/static/gallery/{filename}"

        # Convertir en Base64 pour le frontend (affichage immédiat)
        buffered = io.BytesIO()
        output.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "generated_image": f"data:image/png;base64,{img_str}",
            "image_url": image_url,
            "id": filename
        }

    except Exception as e:
        print(f"Erreur génération: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gallery")
async def get_gallery():
    """Retourne la liste des images de la galerie"""
    try:
        images = []
        # Trier par date de modification (plus récent en premier)
        files = sorted(
            os.listdir(GALLERY_DIR),
            key=lambda x: os.path.getmtime(os.path.join(GALLERY_DIR, x)),
            reverse=True
        )
        
        for filename in files:
            if filename.endswith((".png", ".jpg", ".jpeg")):
                images.append({
                    "id": filename,
                    "url": f"http://localhost:8000/static/gallery/{filename}"
                })
        return {"images": images}
    except Exception as e:
        return {"images": [], "error": str(e)}

# --- YOLOv8 Object Detection ---
from ultralytics import YOLO

print("Chargement de YOLOv8...")
try:
    # Utilise le modèle nano (yolov8n.pt) pour la rapidité
    yolo_model = YOLO('yolov8n.pt')
    print("YOLOv8 chargé.")
except Exception as e:
    print(f"Erreur chargement YOLO: {e}")
    yolo_model = None

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    Détecte les objets dans l'image envoyée.
    Retourne une liste d'objets avec leurs coordonnées et labels.
    """
    if yolo_model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded")

    try:
        # Lire l'image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Inférence
        results = yolo_model(image)
        
        detected_objects = []
        
        # Mapping des classes YOLO (COCO) vers nos catégories "Déco"
        # COCO classes: 56: chair, 57: couch, 58: potted plant, 59: bed, 60: dining table, 61: toilet, 62: tv, 63: laptop, 64: mouse, 65: remote, 66: keyboard, 67: cell phone, 68: microwave, 69: oven, 70: toaster, 71: sink, 72: refrigerator, 73: book, 74: clock, 75: vase, 76: scissors, 77: teddy bear, 78: hair drier, 79: toothbrush
        RELEVANT_CLASSES = {
            56: "chair", 57: "couch", 58: "plant", 59: "bed", 
            60: "table", 62: "tv", 74: "clock", 75: "vase"
        }

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                if cls_id in RELEVANT_CLASSES:
                    # Coordonnées normalisées (0-1) pour le frontend
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    w_img, h_img = image.size
                    
                    # Centre de l'objet (pour placer le point)
                    cx = (x1 + x2) / 2 / w_img
                    cy = (y1 + y2) / 2 / h_img
                    
                    detected_objects.append({
                        "label": RELEVANT_CLASSES[cls_id],
                        "confidence": float(box.conf[0]),
                        "position": {"x": cx * 100, "y": cy * 100} # En pourcentage
                    })
        
        return {"objects": detected_objects}

    except Exception as e:
        print(f"Erreur détection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
