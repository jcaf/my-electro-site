from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
import datetime

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    texto = Column(String, nullable=False)
    estrellas = Column(Integer, default=5)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
