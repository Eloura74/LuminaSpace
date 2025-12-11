from sqlalchemy import Column, String, Integer
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(String)
    image = Column(String)
    category = Column(String, index=True)
    link = Column(String)
    match = Column(String, default="100%")
