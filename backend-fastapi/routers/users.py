from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/by-email")
def get_user_by_email(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"id": user.id, "email": user.email, "role": getattr(user, "role", "user")}

# endpoint simple para setear rol (déjalo abierto solo en desarrollo)
@router.post("/set-role")
def set_role(email: str = Query(...), role: str = Query(...), db: Session = Depends(get_db)):
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Rol inválido")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.role = role
    db.commit()
    return {"ok": True, "email": user.email, "role": user.role}
