import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

url = os.environ.get('DATABASE_URL')
# url = "postgresql://postgres:Norocel17@localhost:5432/ds-users"

engine = create_engine(url)
SQLModel.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
