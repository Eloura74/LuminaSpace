# Lumina Spaces - Backend 🧠

Ce dossier contient le serveur API (FastAPI) et les services d'IA (Stable Diffusion, YOLO, IP-Adapter).

## 🛠️ Installation & Démarrage

### 1. Pré-requis
Assurez-vous d'avoir **Python 3.10+** installé.

### 2. Activer l'environnement virtuel (Venv)
C'est ici que sont installées toutes les librairies (PyTorch, Diffusers, etc.).

**Windows (PowerShell) :**
```powershell
.\venv\Scripts\activate
```
*Si vous voyez `(venv)` au début de votre ligne de commande, c'est bon !*

**Si le venv n'existe pas encore :**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Lancer le Serveur
Une fois le venv activé, lancez le serveur avec :

```powershell
uvicorn main:app --reload
```

- `--reload` : Permet au serveur de redémarrer automatiquement si vous modifiez un fichier (utile en dev).
- Le serveur sera accessible sur : `http://localhost:8000`

## 📁 Structure des Dossiers

- **`app/`** : Code source de l'API.
    - `routers/` : Les points d'entrée (endpoints) de l'API (`generation`, `products`, etc.).
    - `services/` : La logique métier et IA (`ml_service`, `image_utils`).
- **`static/`** : Fichiers générés et stockés.
    - `gallery/` : Images générées par l'IA.
    - `products/` : Images des produits uploadés par l'utilisateur.
- **`data/`** : Base de données locale.
    - `products.json` : Liste des produits (nom, prix, lien, chemin image).

## 🆘 Dépannage

**Le serveur a planté ou "freezé" ?**
1.  Faites `CTRL + C` dans le terminal pour stopper le processus.
2.  Relancez avec `uvicorn main:app --reload`.

**Erreur "Torch not compiled with CUDA enabled" ?**
Vérifiez que vous avez bien installé la version CUDA de PyTorch.
```powershell
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```
