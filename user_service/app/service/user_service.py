import os
import requests
from fastapi import HTTPException, status

from app.domain import UserModel, CreateUserRequestDTO
from app.utils.security import build_service_headers

AUTH_SERVICE_URL = "http://auth_service:8082"
DEVICE_SERVICE_URL = "http://device_service:8081"


def _restore_user_state(user, repository, previous_state):
    for key, value in previous_state.items():
        setattr(user, key, value)
    repository.update_user(user)


class UserService:
    def __init__(self, user_repository):
        self.user_repository = user_repository


    def create_user(self, dto: CreateUserRequestDTO):
        new_user = UserModel(**dto.model_dump())

        if not self.user_repository.check_uniqueness(new_user):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

        created_user = self.user_repository.create_user(new_user)

        return created_user


    def get_all_users(self):
        users = self.user_repository.get_all_users()
        quantity = len(users)

        # if not users:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")

        return quantity, users


    def get_user_by_id(self, user_id):
        user = self.user_repository.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")
        return user


    def update_user(self, user_id, dto: CreateUserRequestDTO):
        user = self.user_repository.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        previous_state = {
            "username": user.username,
            "email": user.email,
            "address": user.address,
            "role": user.role,
        }

        if dto.username and dto.username != user.username:
            if not self.user_repository.check_username_uniqueness(dto.username, user.user_id):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

        if dto.email and dto.email != user.email:
            if not self.user_repository.check_email_uniqueness(dto.email, user.user_id):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already taken")

        for key, value in dto.model_dump().items():
            setattr(user, key, value)

        updated = self.user_repository.update_user(user)

        payload = {
            "username": updated.username,
            "email": updated.email,
            "address": updated.address,
            "role": updated.role,
        }

        service_headers = build_service_headers(subject="user_service")

        try:
            response = requests.put(
                f"{AUTH_SERVICE_URL}/auth/update-account-by-id/{user_id}",
                json=payload,
                headers=service_headers,
                timeout=5,
            )
            if not response.ok:
                _restore_user_state(user, self.user_repository, previous_state)
                raise HTTPException(status_code=response.status_code,
                                    detail=response.json().get("detail", "Failed to sync account"))
        except requests.exceptions.RequestException:
            _restore_user_state(user, self.user_repository, previous_state)
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth service unavailable")

        return updated

    def delete_user(self, user_id):
        user = self.user_repository.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")

        if user.role == "ADMIN":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete an admin")

        service_headers = build_service_headers(subject="user_service")

        try:
            device_response = requests.get(
                f"{DEVICE_SERVICE_URL}/devices/get-links-by-user-id/{user_id}",
                headers=service_headers,
                timeout=5,
            )

            if device_response.json().get("has devices"):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Can't delete a user with linked devices")
        except requests.exceptions.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Device service unavailable")

        try:
            response = requests.delete(
                f"{AUTH_SERVICE_URL}/auth/delete-account-by-id/{user_id}",
                headers=service_headers,
                timeout=5,
            )
            if not response.ok:
                raise HTTPException(status_code=response.status_code,
                                    detail=response.json().get("detail", "Failed to sync account"))
        except requests.exceptions.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth service unavailable")

        self.user_repository.delete_user(user)
