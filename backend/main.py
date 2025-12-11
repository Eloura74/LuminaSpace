from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import Routers
from app.routers import generation, detection, gallery, products, auth
from app.database import engine
from app import models

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lumina Spaces API")

# --- Configuration CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Frontend Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static Files ---
# Servir les fichiers statiques (images sauvegardées)
# Assurez-vous que le dossier static existe à la racine du backend
os.makedirs("static/gallery", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Routers ---
app.include_router(generation.router)
app.include_router(detection.router)
app.include_router(gallery.router)
app.include_router(products.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Lumina Spaces API is running 🚀"}
