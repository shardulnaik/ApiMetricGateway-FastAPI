from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    api_keys = relationship("APIKey", back_populates="owner")
