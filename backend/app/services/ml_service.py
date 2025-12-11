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
                try:
                    self.pipe.enable_xformers_memory_efficient_attention()
                    print("✅ xformers enabled for memory efficient attention")
                except Exception as e:
                    print(f"⚠️ xformers not available: {e}")
            
            self.pipe.to(self.device)
            self.log_gpu_info()
            print("✅ Model loaded successfully!")
            return self.pipe
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None

    def log_gpu_info(self):
        """Affiche les informations sur le GPU."""
        if torch.cuda.is_available():
            print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
            print(f"💾 VRAM Total: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
            print(f"💾 VRAM Allocated: {torch.cuda.memory_allocated(0) / 1024**3:.2f} GB")
        else:
            print("💻 Running on CPU")

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

# --- Inpainting Pipeline ---
from diffusers import StableDiffusionInpaintPipeline

class InpaintingService:
    def __init__(self):
        self.pipe = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🎨 Inpainting Service initialized on {self.device}")

    def load_model(self):
        if self.pipe is not None:
            return self.pipe
        
        print("⏳ Loading Inpainting Model...")
        try:
            self.pipe = StableDiffusionInpaintPipeline.from_pretrained(
                "runwayml/stable-diffusion-inpainting",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None
            )
            
            # Optimisations
            self.pipe.scheduler = UniPCMultistepScheduler.from_config(self.pipe.scheduler.config)
            if self.device == "cuda":
                self.pipe.enable_model_cpu_offload()
                try:
                    self.pipe.enable_xformers_memory_efficient_attention()
                except:
                    pass
            
            self.pipe.to(self.device)
            print("✅ Inpainting Model loaded!")
            return self.pipe
        except Exception as e:
            print(f"❌ Error loading inpainting model: {e}")
            return None

    def inpaint(self, prompt, image, mask_image, negative_prompt="", steps=20, guidance_scale=7.5):
        if self.pipe is None:
            self.load_model()
        
        output = self.pipe(
            prompt=prompt,
            image=image,
            mask_image=mask_image,
            negative_prompt=negative_prompt,
            num_inference_steps=steps,
            guidance_scale=guidance_scale
        )
        return output.images[0]

inpainting_service = InpaintingService()
