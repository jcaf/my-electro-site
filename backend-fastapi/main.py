from fastapi import FastAPI
from database import engine, Base
from routers import comments  # Asegúrate de que existe routers/comments.py

from fastapi.middleware.cors import CORSMiddleware


# Importar modelos para que SQLAlchemy los registre
from models import comment, user

# Crear todas las tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="My Electro Site API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo permite todo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(comments.router)

@app.get("/")
def root():
    return {"status": "API funcionando correctamente"}
