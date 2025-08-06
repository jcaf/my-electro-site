from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import bleach

from database import get_db
from models.comment import Comment
from models.user import User

router = APIRouter(prefix="/comments", tags=["Comments"])

# --- Sanitización HTML segura ---
# ALLOWED_TAGS es un frozenset => usamos unión de conjuntos y lo convertimos a lista
ALLOWED_TAGS = list(
    set(bleach.sanitizer.ALLOWED_TAGS)
    | {
        "p", "br", "ul", "ol", "li",
        "strong", "em", "h1", "h2", "h3",
        "blockquote", "code", "pre", "a",
      }
)

# Partimos de los atributos por defecto y extendemos los de <a>
ALLOWED_ATTRS = {**bleach.sanitizer.ALLOWED_ATTRIBUTES}
ALLOWED_ATTRS["a"] = list(
    set(ALLOWED_ATTRS.get("a", [])) | {"href", "title", "target", "rel"}
)

class CommentIn(BaseModel):
    proyecto_id: int
    user_email: str
    estrellas: int = Field(ge=1, le=5)
    content_html: str

@router.post("/")
def create_comment(payload: CommentIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.user_email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Usuario no existe")

    # Limpia el HTML (evita XSS) manteniendo el subset permitido
    clean_html = bleach.clean(
        payload.content_html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        strip=True,
    )

    c = Comment(
        proyecto_id=payload.proyecto_id,
        user_id=user.id,
        texto=clean_html,  # También llenar el campo texto para compatibilidad
        estrellas=payload.estrellas,
        fecha=datetime.utcnow(),  # También llenar el campo fecha para compatibilidad
        content_html=clean_html,
        created_at=datetime.utcnow(),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"ok": True, "id": c.id}

@router.get("/{proyecto_id}")
def list_comments(
    proyecto_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    base = db.query(Comment).filter(Comment.proyecto_id == proyecto_id)
    total = base.count()
    rows = (
        base.options(joinedload(Comment.user))
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        {
            "id": r.id,
            "proyecto_id": r.proyecto_id,
            "estrellas": r.estrellas,
            "content_html": r.content_html,
            "created_at": r.created_at,
            "user": {"id": r.user.id, "email": r.user.email} if r.user else None,
        }
        for r in rows
    ]

    avg = db.query(func.avg(Comment.estrellas)).filter(Comment.proyecto_id == proyecto_id).scalar()
    cnt = db.query(func.count(Comment.id)).filter(Comment.proyecto_id == proyecto_id).scalar()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
        "avg_estrellas": float(avg) if avg else 0.0,
        "count": int(cnt or 0),
    }
