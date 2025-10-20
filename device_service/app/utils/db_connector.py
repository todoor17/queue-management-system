import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

url = os.environ.get('DATABASE_URL')
engine = create_engine(url)

SQLModel.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

def get_db():
    session = Session()
    try:
        yield session
    finally:
        session.close()