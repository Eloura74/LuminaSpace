import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
import os

# --- Configuration ML ---
# Utilisation de modèles optimisés pour la vitesse/mémoire si possible
# "lllyasviel/sd-controlnet-canny" est le standard pour ControlNet Canny 1.5
CONTROLNET_ID = "lllyasviel/sd-controlnet-canny"
MODEL_ID = "runwayml/stable-diffusion-v1-5" 

class MLService:
    def __init__(self):
        self.pipe = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 ML Service initialized on {self.device}")

    def load_model(self):
        """Charge le modèle Stable Diffusion + ControlNet en mémoire."""
        if self.pipe is not None:
            return self.pipe

        print("⏳ Loading Stable Diffusion & ControlNet...")
        try:
            controlnet = ControlNetModel.from_pretrained(
                CONTROLNET_ID, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            self.pipe = StableDiffusionControlNetPipeline.from_pretrained(
                MODEL_ID, 
                controlnet=controlnet, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None # Désactivé pour la vitesse et éviter les faux positifs
            )

            # Optimisation Scheduler
            self.pipe.scheduler = UniPCMultistepScheduler.from_config(self.pipe.scheduler.config)

            # Optimisation Mémoire
            if self.device == "cuda":
                self.pipe.enable_model_cpu_offload() # Très efficace pour économiser la VRAM
                self.pipe.enable_xformers_memory_efficient_attention() # Si xformers est installé
            
            self.pipe.to(self.device)
            print("✅ Model loaded successfully!")
            return self.pipe
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None

    def generate(self, prompt, image, negative_prompt="", steps=20, guidance_scale=7.5):
        """Génère une image à partir d'un prompt et d'une image de contrôle (Canny)."""
        if self.pipe is None:
            self.load_model()
        
        # Génération
        output = self.pipe(
            prompt,
            image=image,
            negative_prompt=negative_prompt,
            num_inference_steps=steps,
            guidance_scale=guidance_scale
        )
        
        return output.images[0]

# Singleton instance
ml_service = MLService()
