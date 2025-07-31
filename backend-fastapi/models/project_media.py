from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class ProjectMedia(Base):
    __tablename__ = "project_media"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    file_path = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # "imagen" o "video"
    fecha_subida = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="media")
