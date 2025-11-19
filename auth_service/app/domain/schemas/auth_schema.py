from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class BaseUserModel(BaseModel):
    username: Optional[str] = Field(min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(min_length=3, max_length=50)
    address: Optional[str] = Field(max_length=50)
    role: Optional[str] = Field(default="CLIENT")

    class Config:
        from_attributes = True


class RegisterUserRequestDTO(BaseUserModel):
    password: str = Field(min_length=8, max_length=50)


class RegisterUserResponseDTO(BaseUserModel):
    user_id: int


class LoginUserRequestDTO(BaseModel):
    username: Optional[str] = Field(min_length=3, max_length=50, default=None)
    email: Optional[EmailStr] = Field(min_length=3, max_length=50, default=None)
    password: str = Field(min_length=8, max_length=100)


class UpdateAccountRequestDTO(BaseUserModel):
    pass



