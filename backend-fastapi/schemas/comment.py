from pydantic import BaseModel
from datetime import datetime

class CommentBase(BaseModel):
    proyecto_id: int
    user_id: int
    texto: str
    estrellas: int

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True
