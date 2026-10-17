from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = Field(default=None, min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_.]+$")

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
