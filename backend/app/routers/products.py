from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
import os
import shutil
import uuid
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .auth import verify_admin
from ..database import get_db
from ..models import Product as ProductModel

router = APIRouter()

PRODUCTS_DIR = "static/products"

# Pydantic Model for Response
class ProductResponse(BaseModel):
    id: str
    name: str
    price: str
    image: str
    category: str
    link: str
    match: str

    class Config:
        orm_mode = True

@router.get("/products", response_model=List[ProductResponse])
async def get_products(db: Session = Depends(get_db)):
    return db.query(ProductModel).all()

@router.post("/products", response_model=ProductResponse)
async def add_product(
    image: UploadFile = File(...),
    name: str = Form(...),
    price: str = Form(...),
    link: str = Form(...),
    category: str = Form("default"),
    authorized: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    # 1. Save Image
    file_extension = os.path.splitext(image.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(PRODUCTS_DIR, file_name)
    
    # Ensure directory exists
    os.makedirs(PRODUCTS_DIR, exist_ok=True)
    
    # Async read and write
    try:
        content = await image.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        print(f"❌ Error saving product image: {e}")
        raise HTTPException(status_code=500, detail="Could not save image file")
        
    # 2. Create Product Object (DB)
    image_url = f"http://localhost:8000/static/products/{file_name}"
    
    new_product = ProductModel(
        id=str(uuid.uuid4()),
        name=name,
        price=price,
        image=image_url,
        category=category,
        link=link,
        match="100%"
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str, 
    authorized: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(product)
    db.commit()
    
    return {"message": "Product deleted"}
