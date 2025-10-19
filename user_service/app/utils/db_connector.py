from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from domain.models.user_model import User

url = URL.create(drivername="postgresql",
    username="postgres",
    host="localhost",
    password="Norocel17",
    database="sd-users"
)

engine = create_engine(url)
SQLModel.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
