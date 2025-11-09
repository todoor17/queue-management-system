import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# url = os.environ.get('DATABASE_URL')
url = "postgresql://postgres:Norocel17@localhost:5432/ds-devices"

engine = create_engine(url)

SQLModel.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

def get_db():
    session = Session()
    try:
        yield session
    finally:
        session.close()