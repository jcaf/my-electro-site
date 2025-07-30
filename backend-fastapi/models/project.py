from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from database import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    imagen_url = Column(String(500))
    video_url = Column(String(500))
    fecha_creacion = Column(TIMESTAMP, default=datetime.utcnow)
