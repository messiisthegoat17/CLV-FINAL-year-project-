from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas, auth
from jose import jwt, JWTError

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        is_verified=True  # Auto-verify — no email SMTP configured
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "verification":
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    if user.is_verified:
        return {"msg": "Email already verified"}
        
    user.is_verified = True
    db.commit()
    return {"msg": "Email verified successfully. You can now log in."}

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
        
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")
        
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
    
@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(token: str, db: Session = Depends(database.get_db)):
     # For simplicity, passing token as query param for now. Usually it's in Authorization header.
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
