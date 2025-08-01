# models/project.py
from sqlalchemy import Column, Integer, String, Text, ARRAY, TIMESTAMP
from database import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id            = Column(Integer, primary_key=True, index=True)
    titulo        = Column(String(255), nullable=False)
    descripcion   = Column(Text, nullable=False)
    imagen_path   = Column(ARRAY(Text))         # varias imágenes
    video_path    = Column(ARRAY(Text))         # varios vídeos
    fecha_creacion = Column(
        TIMESTAMP, default=datetime.utcnow, nullable=False
    )
    tags          = Column(ARRAY(String))       # 👈 NUEVO
