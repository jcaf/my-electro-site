from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from database import engine, Base
from routers import projects, comments
# importa modelos para que SQLAlchemy los registre
from models import project, comment, user

app = FastAPI(title="My Electro Site API", version="1.0")

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],          # en prod: restringe dominos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-User-Email"],
)

# Servir ficheros estáticos
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Routers
app.include_router(projects.router)
app.include_router(comments.router)

@app.get("/")
def root():
    return {"status": "API funcionando correctamente"}

# Descarga protegida (temporal por cabecera)
@app.get("/media/download")
def secure_download(path: str, x_user_email: str = Header(None)):
    if not x_user_email:
        raise HTTPException(status_code=401, detail="No autorizado")
    abs_path = STATIC_DIR / path
    if not abs_path.exists() or not abs_path.is_file():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(abs_path)
