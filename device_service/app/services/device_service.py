from app.domain import DeviceModel

class DeviceService:
    def __init__(self, device_repository):
        self.device_repository = device_repository

    def create_device(self, CreateDeviceRequestDTO):
        Device = DeviceModel(**CreateDeviceRequestDTO.dict())
        return self.device_repository.create_device(Device)

    def get_all_devices(self):
        return self.device_repository.get_all_devices()