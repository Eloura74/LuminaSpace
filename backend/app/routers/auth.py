from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import secrets

router = APIRouter()

# --- Configuration ---
# Pour la démo, on utilise un token statique simple
# En production, utilisez JWT + Hachage de mot de passe
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"
SECRET_TOKEN = "lumina_secret_admin_token_123"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint de login simple.
    Vérifie user/pass et retourne un token statique.
    """
    if form_data.username == ADMIN_USERNAME and form_data.password == ADMIN_PASSWORD:
        return {"access_token": SECRET_TOKEN, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def verify_admin(token: str = Depends(oauth2_scheme)):
    """
    Dépendance pour protéger les routes admin.
    Vérifie si le token est valide.
    """
    if token != SECRET_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True
