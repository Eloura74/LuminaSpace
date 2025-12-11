from fastapi import APIRouter
import os

router = APIRouter()

GALLERY_DIR = "static/gallery"
os.makedirs(GALLERY_DIR, exist_ok=True)

@router.get("/gallery")
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
