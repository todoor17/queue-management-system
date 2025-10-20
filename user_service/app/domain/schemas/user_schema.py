from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class CreateUserRequestDTO(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr = Field(min_length=3, max_length=50)
    password: str = Field(min_length=7, max_length=50)
    address: Optional[str] = Field(max_length=50)
    role: Optional[str] = Field(default="CLIENT")
