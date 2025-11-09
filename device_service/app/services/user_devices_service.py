import requests

from fastapi import HTTPException
from starlette import status


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

        try:
            user_response = requests.get(f"http://localhost:8000/users/get-user-by-id?user_id={user_id}")
        except requests.exceptions.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="User service unavailable")

        if user_response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")

        self.user_devices_repository.link_device_to_user(device_id, user_id)


    def unlink_device_from_user(self, device_id, user_id):
        device = self.device_repository.get_device_by_id(device_id)

        try:
            user_response = requests.get(f"http://localhost:8000/users/get-user-by-id?user_id={user_id}")
        except requests.exceptions.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="User service unavailable")

        if user_response.status_code == 404:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")

        if not device:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No device found")

        link = self.user_devices_repository.check_existing_link(device_id, user_id)
        if not link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link does not exist")

        self.user_devices_repository.unlink_device_from_user(device_id, user_id)

