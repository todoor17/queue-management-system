from typing import List, Optional
from pydantic import BaseModel, Field


class BaseDeviceDTO(BaseModel):
    device_id: int
    device_name: str
    consumption_value: float


class CreateDeviceRequestDTO(BaseModel):
    device_name: str = Field(min_length=3, max_length=64)
    consumption_value: float = Field(gt=0)


class CreateDeviceResponseDTO(BaseDeviceDTO):
    pass


class UpdateDeviceRequestDTO(BaseModel):
    device_name: Optional[str] = Field(default=None, min_length=3, max_length=64)
    consumption_value: Optional[float] = Field(default=None, gt=0)


class DeviceResponseDTO(BaseDeviceDTO):
    pass


class GetAllDevicesResponseDTO(BaseModel):
    devices: List[DeviceResponseDTO]
