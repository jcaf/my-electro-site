# backend-fastapi/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os

from database import engine, Base

# Importa los modelos para que SQLAlchemy registre las tablas
# (IMPORTANTE: incluir project para que cree la tabla `projects`)
from models import comment, user, project  # noqa: F401

# Routers
from routers import comments, projects

# --- Asegurar carpetas de subida existen ---
# En este setup servimos /static -> carpeta "uploads"
UPLOAD_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(os.path.join(UPLOAD_ROOT, "projects"), exist_ok=True)

# --- Crear todas las tablas si no existen ---
Base.metadata.create_all(bind=engine)

# --- App ---
app = FastAPI(
    title="My Electro Site API",
    version="1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS (ajusta si lo necesitas) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Montar estáticos ---
# /static -> backend-fastapi/uploads
app.mount("/static", StaticFiles(directory=UPLOAD_ROOT), name="static")

# --- Incluir routers ---
app.include_router(projects.router)
app.include_router(comments.router)

# --- Rutas base ---
@app.get("/")
def root():
    return {
        "status": "API funcionando correctamente",
        "static_base": "/static",  # p.ej. /static/projects/archivo.jpg
        "routers": ["/projects", "/comments"],
    }

# (Opcional) Ejecutar directamente: `python main.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
