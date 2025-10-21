from fastapi import HTTPException, status

from app.domain import DeviceModel
from app.domain import UpdateDeviceRequestDTO, CreateDeviceRequestDTO


class DeviceService:
    def __init__(self, device_repository):
        self.device_repository = device_repository


    def create_device(self, device_dto: CreateDeviceRequestDTO):
        Device = DeviceModel(**device_dto.model_dump())
        return self.device_repository.create_device(Device)


    def get_all_devices(self):
        devices = self.device_repository.get_all_devices()

        if not devices:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No devices found")

        return devices


    def get_device_by_id(self, device_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        return self.device_repository.get_device_by_id(device_id)


    def update_device(self, device_id, device_dto: UpdateDeviceRequestDTO):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        for key, value in device_dto.model_dump().items():
            setattr(device, key, value)

        return self.device_repository.update_device(device)


    def delete_device(self, device_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        self.device_repository.delete_device(device)
