from fastapi import HTTPException, status

from app.domain import UserModel, CreateUserRequestDTO


class UserService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def create_user(self, dto: CreateUserRequestDTO):
        new_user = UserModel(**dto.model_dump())

        if not self.user_repository.check_uniqueness(new_user):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

        return self.user_repository.create_user(new_user)


    def get_all_users(self):
        users = self.user_repository.get_all_users()
        quantity = len(users)

        if not users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found")

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

        for key, value in dto.model_dump().items():
            setattr(user, key, value)

        return self.user_repository.update_user(user)


    def delete_user(self, user_id):
        user = self.user_repository.get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found")

        if user.role == "ADMIN":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You cannot delete an admin")

        self.user_repository.delete_user(user)



