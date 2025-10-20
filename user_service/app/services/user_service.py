from app.domain.models.user_model import User


class UserService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def create_user(self, dto):
        new_user = User(**dto.dict())
        return self.user_repository.create_user(new_user)

    def get_all_users(self):
        return self.user_repository.get_all_users()