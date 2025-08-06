#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
# Importar todos los modelos para que las relaciones funcionen
from models.user import User
from models.comment import Comment
from models.project import Project
import hashlib

def create_admin_user():
    # Crear las tablas si no existen
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Verificar si el usuario admin ya existe
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            print("Usuario admin@example.com ya existe")
            return
        
        # Crear hash simple de la contraseña (en producción usar bcrypt)
        password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        
        # Crear el usuario admin
        admin_user = User(
            email="admin@example.com",
            hashed_password=password_hash,
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Usuario admin creado exitosamente:")
        print(f"  ID: {admin_user.id}")
        print(f"  Email: {admin_user.email}")
        print(f"  Role: {admin_user.role}")
        
    except Exception as e:
        print(f"Error creando usuario admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()