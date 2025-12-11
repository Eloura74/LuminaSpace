from ultralytics import YOLO
import cv2
import numpy as np

class VisionService:
    def __init__(self):
        self.model = None
        print("👁️ Vision Service initialized")

    def load_model(self):
        """Charge le modèle YOLOv8."""
        if self.model is not None:
            return self.model
        
        print("⏳ Loading YOLOv8...")
        try:
            # Utilise 'yolov8n.pt' (nano) pour la rapidité. 
            # Il sera téléchargé automatiquement au premier lancement.
            self.model = YOLO('yolov8n.pt') 
            print("✅ YOLOv8 loaded!")
            return self.model
        except Exception as e:
            print(f"❌ Error loading YOLO: {e}")
            return None

    def detect_objects(self, image_path, conf_threshold=0.25):
        """Détecte les objets dans une image."""
        if self.model is None:
            self.load_model()

        results = self.model(image_path, conf=conf_threshold)
        
        detected_objects = []
        
        # Mapping des classes COCO vers nos catégories (simplifié)
        # COCO classes: 56: chair, 57: couch, 58: potted plant, 59: bed, 60: dining table, 63: laptop, 64: mouse, 65: remote, 66: keyboard, 67: cell phone, 72: refrigerator, 73: book, 74: clock, 75: vase, 76: scissors, 77: teddy bear, 78: hair drier, 79: toothbrush
        INTERESTING_CLASSES = {
            56: 'chair',
            57: 'couch',
            58: 'plant',
            59: 'bed',
            60: 'table',
            75: 'vase'
        }

        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                if cls_id in INTERESTING_CLASSES:
                    # Coordonnées normalisées (0-1) pour le frontend
                    # box.xywhn retourne [x_center, y_center, width, height] normalisé
                    x, y, w, h = box.xywhn[0].tolist()
                    
                    detected_objects.append({
                        "label": INTERESTING_CLASSES[cls_id],
                        "confidence": float(box.conf[0]),
                        "position": {
                            "x": x * 100, # Pourcentage CSS
                            "y": y * 100
                        },
                        "box": [x, y, w, h]
                    })
        
        return detected_objects

# Singleton instance
vision_service = VisionService()
