from enum import Enum

from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    CLIENT = "CLIENT"


class AuthModel(SQLModel, table=True):
    __tablename__ = 'auth'
    user_id: int = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True, min_length=3, max_length=64)
    email: str = Field(nullable=False, unique=True, min_length=5, max_length=64)
    password: str = Field(nullable=False, min_length=8, max_length=100)
    address: str = Field(nullable=False, max_length=100)
    role: UserRole = Field(default=UserRole.CLIENT, nullable=False)