from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProjectBase(BaseModel):
    titulo: str
    descripcion: str
    imagen_url: Optional[str] = None
    video_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    fecha_creacion: datetime

    class Config:
        orm_mode = True
