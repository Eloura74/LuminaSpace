from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import json
import os
import shutil
import uuid
from pydantic import BaseModel

router = APIRouter()

PRODUCTS_FILE = "data/products.json"
PRODUCTS_DIR = "static/products"

class Product(BaseModel):
    id: str
    name: str
    price: str
    image: str
    category: str
    link: str
    match: str = "100%"

def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        return []
    try:
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def save_products(products):
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

@router.get("/products", response_model=List[Product])
async def get_products():
    return load_products()

@router.post("/products", response_model=Product)
async def add_product(
    image: UploadFile = File(...),
    name: str = Form(...),
    price: str = Form(...),
    link: str = Form(...),
    category: str = Form("default")
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
        
    # 2. Create Product Object
    # URL relative for frontend
    image_url = f"http://localhost:8000/static/products/{file_name}"
    
    new_product = {
        "id": str(uuid.uuid4()),
        "name": name,
        "price": price,
        "image": image_url,
        "category": category,
        "link": link,
        "match": "100%" # User added products are perfect matches
    }
    
    # 3. Save to JSON
    products = load_products()
    products.append(new_product)
    save_products(products)
    
    return new_product

@router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    products = load_products()
    updated_products = [p for p in products if p["id"] != product_id]
    
    if len(products) == len(updated_products):
        raise HTTPException(status_code=404, detail="Product not found")
        
    save_products(updated_products)
    return {"message": "Product deleted"}
