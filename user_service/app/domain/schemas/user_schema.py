from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field

class UserBaseDTO(BaseModel):
    username: str
    email: str
    address: Optional[str] = None
    role: Optional[str] = Field(default="CLIENT")

    class Config:
        from_attributes = True


class CreateUserRequestDTO(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr = Field(min_length=3, max_length=50)
    address: Optional[str] = Field(max_length=50)
    role: Optional[str] = Field(default="CLIENT")


class CreateUserResponseDTO(UserBaseDTO):
    user_id: int


class GetAllUsersResponseDTO(BaseModel):
    quantity: int
    users: List[CreateUserResponseDTO]


class GetUserResponseDTO(UserBaseDTO):
    user_id: int