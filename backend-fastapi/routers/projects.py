from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from database import get_db
from models.project import Project

router = APIRouter(prefix="/projects", tags=["Projects"])

# uploads/projects (relativa al backend)
BASE_DIR = os.path.dirname(__file__)
UPLOAD_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
UPLOAD_DIR = os.path.join(UPLOAD_ROOT, "projects")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _to_list(value) -> List[str]:
    """
    Convierte lo que venga de la DB a lista de strings:
    - None -> []
    - list -> igual
    - '{a,b,c}' (formato text[] de Postgres) -> ['a','b','c']
    - 'uploads/projects/...' -> ['uploads/projects/...']
    """
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        # Si es una sola ruta simple, devuélvela como lista de 1
        if value.startswith("uploads/") or value.startswith("projects/"):
            return [value]
        # Si viene como '{a,b,c}'
        s = value.strip().strip("{}")
        if not s:
            return []
        # quitar comillas y espacios
        parts = [p.strip().strip('"') for p in s.split(",")]
        return [p for p in parts if p]
    return []

def _rel_for_static(saved_abs_path: str) -> str:
    """
    Guarda SIEMPRE como 'projects/filename.ext' para servir con /static.
    """
    filename = os.path.basename(saved_abs_path)
    return f"projects/{filename}"

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    rows = db.query(Project).order_by(Project.fecha_creacion.desc()).all()
    # Normalizamos salida
    out = []
    for p in rows:
        imgs = _to_list(p.imagen_path)
        vids = _to_list(p.video_path)
        # Por compatibilidad: si algún elemento empieza con "uploads/", recórtalo
        imgs = [path[8:] if path.startswith("uploads/") else path for path in imgs]
        vids = [path[8:] if path.startswith("uploads/") else path for path in vids]
        out.append({
            "id": p.id,
            "titulo": p.titulo,
            "descripcion": p.descripcion,
            "imagen_path": imgs,
            "video_path": vids,
            "fecha_creacion": p.fecha_creacion,
        })
    return out

@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    imgs = _to_list(p.imagen_path)
    vids = _to_list(p.video_path)
    imgs = [path[8:] if path.startswith("uploads/") else path for path in imgs]
    vids = [path[8:] if path.startswith("uploads/") else path for path in vids]
    return {
        "id": p.id,
        "titulo": p.titulo,
        "descripcion": p.descripcion,
        "imagen_path": imgs,
        "video_path": vids,
        "fecha_creacion": p.fecha_creacion,
    }

@router.post("/")
def create_project(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    imagenes: List[UploadFile] = File(default=[]),
    videos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    imagen_paths: List[str] = []
    video_paths: List[str] = []

    # Guardar imágenes
    for img in imagenes:
        if not img.filename:
            continue
        filename = f"{int(datetime.now().timestamp()*1000)}_{img.filename}"
        abs_path = os.path.join(UPLOAD_DIR, filename)
        with open(abs_path, "wb") as f:
            f.write(img.file.read())
        # Guardamos como 'projects/filename'
        imagen_paths.append(_rel_for_static(abs_path))

    # Guardar videos
    for vid in videos:
        if not vid.filename:
            continue
        filename = f"{int(datetime.now().timestamp()*1000)}_{vid.filename}"
        abs_path = os.path.join(UPLOAD_DIR, filename)
        with open(abs_path, "wb") as f:
            f.write(vid.file.read())
        video_paths.append(_rel_for_static(abs_path))

    proyecto = Project(
        titulo=titulo,
        descripcion=descripcion,
        imagen_path=imagen_paths if imagen_paths else None,
        video_path=video_paths if video_paths else None,
    )
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return {
        "id": proyecto.id,
        "titulo": proyecto.titulo,
        "descripcion": proyecto.descripcion,
        "imagen_path": _to_list(proyecto.imagen_path),
        "video_path": _to_list(proyecto.video_path),
        "fecha_creacion": proyecto.fecha_creacion,
    }
