from typing import Optional

from pydantic import BaseModel, Field


class CreateDeviceRequestDTO(BaseModel):
    device_name: str = Field(min_length=3, max_length=64)
    consumption_value: int = Field(gt=0)


class UpdateDeviceRequestDTO(BaseModel):
    user_id: Optional[int] = Field(default=None, gt=0)
    device_name: str = Field(min_length=3, max_length=64)
    consumption_value: int = Field(gt=0)
