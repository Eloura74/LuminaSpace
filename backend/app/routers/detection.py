from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import shutil
import os
from ..services.vision_service import vision_service

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """
    Endpoint pour détecter les objets dans une image (Shop the Look).
    """
    try:
        # Sauvegarde temporaire pour YOLO
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Détection
        objects = vision_service.detect_objects(file_location)
        
        return {"objects": objects}

    except Exception as e:
        print(f"Erreur détection: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
