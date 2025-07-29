from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.comment import Comment
from schemas.comment import CommentCreate, CommentOut

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

# ✅ GET: obtener todos los comentarios de todos los proyectos
@router.get("/", response_model=List[CommentOut])
def get_all_comments(db: Session = Depends(get_db)):
    comentarios = db.query(Comment).all()
    return comentarios
    
# ✅ POST: crear un comentario nuevo
@router.post("/", response_model=CommentOut)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    nuevo_comentario = Comment(
        proyecto_id=comment.proyecto_id,
        user_id=comment.user_id,
        texto=comment.texto,
        estrellas=comment.estrellas
    )
    db.add(nuevo_comentario)
    db.commit()
    db.refresh(nuevo_comentario)
    return nuevo_comentario
