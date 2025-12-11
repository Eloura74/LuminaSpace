import cv2
import numpy as np
import base64
from PIL import Image
import io

def process_canny(image_path):
    """Applique un filtre Canny sur l'image pour obtenir les contours."""
    image = cv2.imread(image_path)
    if image is None:
        return None
    
    # Convertir en niveaux de gris
    image = resize_image(image, max_size=1024) # Redimensionner pour éviter OOM
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Appliquer Canny
    edges = cv2.Canny(gray, 100, 200)
    
    # Inverser les couleurs (fond blanc, traits noirs) pour l'affichage si besoin,
    # mais pour ControlNet on garde souvent fond noir traits blancs.
    # Ici on retourne l'image telle quelle (numpy array)
    return edges

def resize_image(image, max_size=1024):
    """Redimensionne l'image pour ne pas dépasser max_size tout en gardant le ratio."""
    h, w = image.shape[:2]
    if h > max_size or w > max_size:
        scale = max_size / max(h, w)
        new_h, new_w = int(h * scale), int(w * scale)
        image = cv2.resize(image, (new_w, new_h))
    return image

def base64_to_image(base64_string):
    """Convertit une chaîne base64 en image PIL."""
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data))

def image_to_base64(image):
    """Convertit une image PIL en chaîne base64."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")
