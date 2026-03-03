import requests

from fastapi import HTTPException
from starlette import status

from app.utils.security import build_service_headers


class UserDevicesService:
    def __init__(self, user_devices_repository, device_repository):
        self.user_devices_repository = user_devices_repository
        self.device_repository = device_repository


    def link_device_to_user(self, device_id, user_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        link = self.user_devices_repository.check_existing_link(device_id, user_id)
        if link:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Link already exists")

        self.user_devices_repository.link_device_to_user(device_id, user_id)


    def unlink_device_from_user(self, device_id, user_id):
        device = self.device_repository.get_device_by_id(device_id)

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        link = self.user_devices_repository.check_existing_link(device_id, user_id)
        if not link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link does not exist")

        self.user_devices_repository.unlink_device_from_user(device_id, user_id)


    def get_links_by_user_id(self, user_id):
        return self.user_devices_repository.check_links_by_user_id(user_id)

    def get_users_by_device_id(self, device_id):
        return self.user_devices_repository.get_users_for_device(device_id)

    def get_devices_by_user_id(self, user_id):
        return self.user_devices_repository.get_devices_for_user(user_id)

    def delete_links_by_user_id(self, user_id):
        return self.user_devices_repository.delete_links_by_user_id(user_id)

