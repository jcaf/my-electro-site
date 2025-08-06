from sqlalchemy import Column, Integer, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Comment(Base):
    __tablename__ = "comments"

    id           = Column(Integer, primary_key=True, index=True)
    proyecto_id  = Column(Integer, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"))
    texto        = Column(Text, nullable=True)  # Campo texto original
    estrellas    = Column(Integer)          # 1..5
    fecha        = Column(TIMESTAMP, nullable=True)  # Campo fecha original
    content_html = Column(Text, nullable=False)
    created_at   = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comentarios")
