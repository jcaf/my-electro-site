from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.project import Project
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["Projects"])

# ✅ Modelo para crear proyectos
class ProjectCreate(BaseModel):
    titulo: str
    descripcion: str
    imagen_url: Optional[str] = None
    video_url: Optional[str] = None

# ✅ Modelo para devolver proyectos (usa datetime)
class ProjectOut(BaseModel):
    id: int
    titulo: str
    descripcion: str
    imagen_url: Optional[str] = None
    video_url: Optional[str] = None
    fecha_creacion: datetime   # <- permite datetime real

    class Config:
        from_attributes = True  # ✅ Necesario para SQLAlchemy + Pydantic V2

# ✅ Obtener todos los proyectos
@router.get("/", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

# ✅ Crear un proyecto
@router.post("/", response_model=ProjectOut)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
