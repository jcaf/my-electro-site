"""
Routers: Comments
=================
• GET  /comments/{project_id}              → lista paginada
• GET  /comments/summary/{project_id}      → stats (avg, count, distribución)
• POST /comments/                          → crear comentario
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any, Optional

from database import get_db
from models.comment import Comment

router = APIRouter(prefix="/comments", tags=["Comments"])


# ---------- Utilidades ---------- #
def serialize_comment(c: Comment) -> Dict[str, Any]:
    """Convierte un Comment ORM en dict JSON-ready."""
    return {
        "id": c.id,
        "proyecto_id": c.proyecto_id,
        "user_id": c.user_id,
        "texto": c.texto,
        "estrellas": c.estrellas,
        "fecha": c.fecha,
    }


# ---------- Endpoints ---------- #
@router.get("/{project_id}")
def get_comments(
    project_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Devuelve comentarios paginados de un proyecto.
    Parámetros:
      • page (1-N)
      • page_size (1-100)
    """
    q = db.query(Comment).filter(Comment.proyecto_id == project_id)

    total = q.count()
    items = (
        q.order_by(desc(Comment.fecha))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [serialize_comment(c) for c in items],
    }


@router.get("/summary/{project_id}")
def summary(project_id: int, db: Session = Depends(get_db)):
    """
    Promedio de estrellas, total y distribución.
    """
    # AVG y COUNT
    count, avg = (
        db.query(
            func.count(Comment.id),
            func.avg(Comment.estrellas),
        )
        .filter(Comment.proyecto_id == project_id)
        .first()
    )

    # Distribución: {5: n, 4: n, ...}
    distribution = (
        db.query(Comment.estrellas, func.count(Comment.id))
        .filter(Comment.proyecto_id == project_id)
        .group_by(Comment.estrellas)
        .all()
    )
    dist_list = [{"stars": s, "count": c} for s, c in distribution]

    return {
        "count": count or 0,
        "avg": float(avg) if avg is not None else 0.0,
        "distribution": dist_list,
    }


@router.post("/")
def create_comment(
    proyecto_id: int,
    user_id: int,
    texto: str,
    estrellas: int = Query(..., ge=1, le=5),
    db: Session = Depends(get_db),
):
    """
    Crea un comentario.
    Requiere:
      • proyecto_id
      • user_id
      • texto
      • estrellas (1-5)
    """
    c = Comment(
        proyecto_id=proyecto_id,
        user_id=user_id,
        texto=texto,
        estrellas=estrellas,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return serialize_comment(c)
