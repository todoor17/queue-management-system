from typing import List
from pydantic import BaseModel, Field


class BaseDeviceDTO(BaseModel):
    device_id: int
    device_name: str
    description: str
    location: str
    consumption_value: float
    is_linked: bool

    class Config:
        from_attributes = True


class CreateDeviceRequestDTO(BaseModel):
    device_name: str = Field(min_length=3, max_length=128)
    description: str = Field(min_length=3, max_length=128)
    location: str = Field(min_length=3, max_length=128)
    consumption_value: float = Field(gt=0)


class CreateDeviceResponseDTO(BaseDeviceDTO):
    pass


class UpdateDeviceRequestDTO(BaseModel):
    device_name: str = Field(min_length=3, max_length=128)
    description: str = Field(min_length=3, max_length=128)
    location: str = Field(min_length=3, max_length=128)
    consumption_value: float = Field(gt=0)


class DeviceResponseDTO(BaseDeviceDTO):
    pass


class GetAllDevicesResponseDTO(BaseModel):
    quantity: int
    devices: List[DeviceResponseDTO]
