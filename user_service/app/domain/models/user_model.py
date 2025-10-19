from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    __tablename__ = 'user'
    user_id: int = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True, min_length=3, max_length=64)
    email: str = Field(nullable=False, unique=True, min_length=5, max_length=64)
    password: str = Field(nullable=False)
    address: str = Field(nullable=False, min_length=100)