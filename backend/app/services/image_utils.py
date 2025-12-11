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

def get_dominant_color(pil_image):
    """
    Détermine la couleur dominante en ignorant le fond blanc/clair.
    """
    # Redimensionner pour l'analyse
    img = pil_image.copy()
    img.thumbnail((100, 100))
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    data = np.array(img)
    # Reshape en liste de pixels (N, 3)
    pixels = data.reshape(-1, 3)
    
    # Filtrer les pixels trop clairs (fond blanc probable)
    # On garde les pixels dont la luminosité moyenne est < 240
    # (Ou on peut être plus strict si le fond est pur blanc 255)
    mask = np.mean(pixels, axis=1) < 230
    filtered_pixels = pixels[mask]
    
    # Si on a tout filtré (image blanche ?), on fallback sur tout
    if len(filtered_pixels) == 0:
        filtered_pixels = pixels
        
    # Moyenne des pixels restants (l'objet)
    avg_color = np.mean(filtered_pixels, axis=0)
    r, g, b = avg_color
    
    print(f"🎨 Color Analysis - R:{r:.1f} G:{g:.1f} B:{b:.1f}")
    
    # Classification
    # 1. Niveaux de gris (R, G, B proches)
    if abs(r - g) < 25 and abs(r - b) < 25 and abs(g - b) < 25:
        if r < 70: return "black" # Seuil augmenté (était 40)
        if r > 200: return "white"
        return "grey"
        
    # 2. Couleurs
    if r > g + 30 and r > b + 30:
        if g > 100: return "orange"
        return "red"
    if g > r + 30 and g > b + 30:
        return "green"
    if b > r + 30 and b > g + 30:
        if r > 100: return "purple"
        return "blue"
    if r > 150 and g > 150 and b < 100:
        return "yellow"
    if r > 100 and g < 100 and b < 100:
        return "brown"
        
    return ""
