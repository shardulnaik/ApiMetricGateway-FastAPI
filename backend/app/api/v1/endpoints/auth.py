from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.core import security
from backend.app.core.config import ADMIN_REGISTER_KEY
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.schemas import user as user_schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
def register(user_data: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if not user_data.username:
        raise HTTPException(status_code=422, detail="Username is required")
    username = user_data.username.strip().lower()
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username is already taken")
    
    new_user = User(
        email=user_data.email, 
        username=username,
        hashed_password=security.get_password_hash(user_data.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully", "email": new_user.email, "username": username, "role": "user"}

@router.post("/register-admin", status_code=201)
def register_admin(user_data: user_schemas.UserCreate, admin_key: str = Header(...), db: Session = Depends(get_db)):
    if admin_key != ADMIN_REGISTER_KEY:
        raise HTTPException(status_code=403, detail="Invalid Admin Registration Key")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    admin_user = User(
        email=user_data.email, 
        hashed_password=security.get_password_hash(user_data.password),
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    return {"message": "Admin account created", "email": admin_user.email, "role": "admin"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identifier = form_data.username.strip()
    user = db.query(User).filter(or_(User.email == identifier, User.username == identifier.lower())).first()
    if user is None or not security.verify_password(form_data.password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Incorrect username/email or password")
    
    access_token = security.create_access_token(data={"sub": str(user.email), "role": str(user.role)})
    return {"access_token": access_token, "token_type": "bearer", "role": str(user.role), "email": str(user.email), "username": user.username}
