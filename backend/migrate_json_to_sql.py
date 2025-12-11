import json
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Product

# Ensure tables exist
Base.metadata.create_all(bind=engine)

PRODUCTS_JSON_PATH = "data/products.json"

def migrate():
    if not os.path.exists(PRODUCTS_JSON_PATH):
        print(f"❌ {PRODUCTS_JSON_PATH} not found.")
        return

    db: Session = SessionLocal()
    
    try:
        with open(PRODUCTS_JSON_PATH, "r", encoding="utf-8") as f:
            products_data = json.load(f)
            
        print(f"Found {len(products_data)} products in JSON.")
        
        count = 0
        for item in products_data:
            # Check if product already exists to avoid duplicates
            existing = db.query(Product).filter(Product.id == item["id"]).first()
            if existing:
                print(f"Skipping existing product: {item['name']}")
                continue
                
            new_product = Product(
                id=item["id"],
                name=item["name"],
                price=item["price"],
                image=item["image"],
                category=item["category"],
                link=item["link"],
                match=item.get("match", "100%")
            )
            db.add(new_product)
            count += 1
            
        db.commit()
        print(f"✅ Successfully migrated {count} products to SQLite.")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
