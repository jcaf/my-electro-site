from fastapi import (
    APIRouter, Depends, HTTPException,
    UploadFile, File, Form, Query
)
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pathlib import Path
from datetime import datetime

from database import get_db
from models.project import Project

UPLOAD_ROOT = Path("static")
PROJECT_DIR = UPLOAD_ROOT / "projects"
PROJECT_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_DOC_EXT = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip"}

router = APIRouter(prefix="/projects", tags=["Projects"])

def _to_list(val):
    if val is None:
        return []
    if isinstance(val, list):
        return val
    if isinstance(val, str) and val.startswith("{"):
        return [x.strip('"') for x in val.strip("{}").split(",") if x]
    return list(val)

def _save_file(file: UploadFile, subdir: Path) -> str:
    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename.replace(' ', '_')}"
    dest = subdir / filename
    with open(dest, "wb") as f:
        f.write(file.file.read())
    return str(dest.relative_to(UPLOAD_ROOT))

def _allowed(file: UploadFile, allowed_exts: set[str]) -> bool:
    return Path(file.filename).suffix.lower() in allowed_exts

@router.get("/")
def get_projects(
    q: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),            # csv: "iot,plc"
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    order: str = Query("date_desc"),              # date_desc | date_asc | title
    db: Session = Depends(get_db),
):
    qry = db.query(Project)

    if q:
        like = f"%{q}%"
        qry = qry.filter((Project.titulo.ilike(like)) | (Project.descripcion.ilike(like)))

    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        for t in tag_list:
            qry = qry.filter(func.array_to_string(Project.tags, ",").ilike(f"%{t}%"))

    if order == "date_asc":
        qry = qry.order_by(Project.fecha_creacion.asc())
    elif order == "title":
        qry = qry.order_by(Project.titulo.asc())
    else:
        qry = qry.order_by(Project.fecha_creacion.desc())

    total = qry.count()
    rows = qry.offset((page - 1) * page_size).limit(page_size).all()

    def norm(arr):
        return [p[8:] if p.startswith("uploads/") else p for p in _to_list(arr)]

    items = []
    for p in rows:
        items.append({
            "id": p.id,
            "titulo": p.titulo,
            "descripcion": p.descripcion,
            "imagen_path": norm(p.imagen_path),
            "video_path": norm(p.video_path),
            "doc_path":   norm(p.doc_path),
            "tags": _to_list(p.tags),
            "fecha_creacion": p.fecha_creacion,
        })
    return {"total": total, "page": page, "page_size": page_size, "items": items}

@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    def norm(arr):
        return [p[8:] if p.startswith("uploads/") else p for p in _to_list(arr)]
    
    return {
        "id": p.id,
        "titulo": p.titulo,
        "descripcion": p.descripcion,
        "imagen_path": norm(p.imagen_path),
        "video_path": norm(p.video_path),
        "doc_path":   norm(p.doc_path),
        "tags": _to_list(p.tags),
        "fecha_creacion": p.fecha_creacion,
    }

@router.post("/")
async def create_project(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    tags: List[str] = Form(default=[]),
    imagenes: List[UploadFile] = File(default=[]),
    videos:   List[UploadFile] = File(default=[]),
    documentos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    img_paths, vid_paths, doc_paths = [], [], []

    for img in imagenes:
        img_paths.append(_save_file(img, PROJECT_DIR))

    for vid in videos:
        vid_paths.append(_save_file(vid, PROJECT_DIR))

    for doc in documentos:
        if not _allowed(doc, ALLOWED_DOC_EXT):
            raise HTTPException(status_code=400, detail=f"Extensión no permitida: {doc.filename}")
        doc_paths.append(_save_file(doc, PROJECT_DIR))

    proyecto = Project(
        titulo=titulo,
        descripcion=descripcion,
        imagen_path=img_paths,
        video_path=vid_paths,
        doc_path=doc_paths,
        tags=tags,
        fecha_creacion=datetime.utcnow(),
    )
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return {"id": proyecto.id}

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    for rel in _to_list(p.imagen_path) + _to_list(p.video_path) + _to_list(p.doc_path):
        f = UPLOAD_ROOT / rel
        try:
            if f.exists():
                f.unlink()
        except Exception:
            pass

    db.delete(p)
    db.commit()
    return {"ok": True}
