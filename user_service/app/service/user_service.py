from fastapi import HTTPException, status

from app.domain import UserModel, CreateUserRequestDTO
from app.utils.security import build_service_headers
from app.events import publish_event

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

        if dto.username and dto.username != user.username:
            if not self.user_repository.check_username_uniqueness(dto.username, user.user_id):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

        if dto.email and dto.email != user.email:
            if not self.user_repository.check_email_uniqueness(dto.email, user.user_id):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already taken")

        for key, value in dto.model_dump(exclude_unset=True).items():
            setattr(user, key, value)

        updated = self.user_repository.update_user(user)

        payload = {
            "username": updated.username,
            "email": updated.email,
            "address": updated.address,
            "role": updated.role,
        }

        publish_event(
            event_name="user_updated",
            payload={
                "user_id": user_id,
                "update_data": payload,
            }
        )

        return updated


    def delete_user(self, user_id):
        user = self.user_repository.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")

        if user.role == "ADMIN":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete an admin")

        self.user_repository.delete_user(user)

