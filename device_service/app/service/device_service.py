from fastapi import HTTPException, status

from app.domain import DeviceModel
from app.domain import UpdateDeviceRequestDTO, CreateDeviceRequestDTO
from app.events import publish_event


class DeviceService:
    def __init__(self, device_repository, user_device_repository):
        self.device_repository = device_repository
        self.user_device_repository = user_device_repository


    def _is_device_linked(self, device_id: int) -> bool:
        if not self.user_device_repository:
            return False
        return self.user_device_repository.check_links_by_device_id(device_id)


    def _serialize_device(self, device: DeviceModel):
        data = device.model_dump()
        data["is_linked"] = self._is_device_linked(device.device_id)
        return data


    def create_device(self, device_dto: CreateDeviceRequestDTO):
        device = DeviceModel(**device_dto.model_dump())

        if self.device_repository.get_device_by_name(device_dto.device_name):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Device already exists")

        created = self.device_repository.create_device(device)

        publish_event(
            event_name="device_created",
            payload={"device_id": created.device_id, "max_consumption_value": device_dto.consumption_value},
        )

        return self._serialize_device(created)


    def get_all_devices(self):
        devices = self.device_repository.get_all_devices() or []

        # if not devices:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No devices found")

        return [self._serialize_device(device) for device in devices]


    def get_device_by_id(self, device_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        return self._serialize_device(device)


    def update_device(self, device_id, device_dto: UpdateDeviceRequestDTO):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        if not self.device_repository.check_unique(device_id, device_dto.device_name):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A device with that name already exists")

        for key, value in device_dto.model_dump().items():
            setattr(device, key, value)

        updated = self.device_repository.update_device(device)

        publish_event(
            event_name="device_updated",
            payload={"device_id": device_dto.device_id, "max_consumption_value": device_dto.consumption_value},
        )

        return self._serialize_device(updated)


    def delete_device(self, device_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        if self.user_device_repository.check_links_by_device_id(device_id):
            raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail="Can't delete a linked device. Unlink it firstly")

        self.user_device_repository.delete_links_by_device_id(device_id)
        self.device_repository.delete_device(device)

        publish_event(
            event_name="device_deleted",
            payload={"device_id": device_id},
        )



