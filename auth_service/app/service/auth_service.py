import os, bcrypt, jwt

from datetime import datetime, timedelta
from fastapi import HTTPException
from starlette import status
from dotenv import load_dotenv


from app.domain import AuthModel, RegisterUserRequestDTO, UserRole, LoginUserRequestDTO, UpdateAccountRequestDTO
from app.events import publish_event

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def create_access_token(user_id: int, user_role: UserRole):
    expire = datetime.now() + timedelta(minutes=30)
    payload = {"sub": str(user_id), "role": user_role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class AuthService:
    def __init__(self, auth_repo):
        self.auth_repo = auth_repo


    def register_user(self, register_dto: RegisterUserRequestDTO):

        if self.auth_repo.username_exists(register_dto.username):
            raise HTTPException(status.HTTP_409_CONFLICT, "Username already exists")

        if self.auth_repo.email_exists(register_dto.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")

        if not register_dto.password:
            register_dto.password = "defaultPass"

        hashed_pw = bcrypt.hashpw(
            register_dto.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        auth_user = AuthModel(
            username=register_dto.username,
            email=register_dto.email,
            password=hashed_pw,
            role=register_dto.role or UserRole.CLIENT
        )

        created_user =  self.auth_repo.create_account(auth_user)

        payload = {
            "user_id": created_user.user_id,
            "username": created_user.username,
            "email": created_user.email,
            "address": register_dto.address,
            "role": register_dto.role or UserRole.CLIENT,
        }

        publish_event(
            event_name="user_created",
            payload=payload
        )

        return created_user


    def login_user(self, login_request: LoginUserRequestDTO):
        target_user = self.auth_repo.get_user_by_username(login_request.username)


        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        hashed_pw_bytes = target_user.password.encode("utf-8")
        result = bcrypt.checkpw(login_request.password.encode("utf-8"), hashed_pw_bytes)

        if result:
            token = create_access_token(target_user.user_id, target_user.role)
            return {"access_token": token, "token_type": "bearer"}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized login attempt")


    def delete_account_by_id(self, user_id: int):
        to_delete = self.auth_repo.get_user_by_id(user_id)

        if not to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if to_delete.role == UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An admin cannot be deleted")

        publish_event(
            event_name="user_deleted",
            payload={"user_id": user_id},
        )

        self.auth_repo.delete_account(to_delete)
        return {"success": True}


    # def update_account_by_id(self, user_id: int, update_dto: UpdateAccountRequestDTO):
    #     target_user = self.auth_repo.get_user_by_id(user_id)
    #     if not target_user:
    #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    #
    #     updates = update_dto.model_dump(exclude_unset=True, exclude_none=True)
    #     for key, value in updates.items():
    #         setattr(target_user, key, value)
    #
    #     return self.auth_repo.update_account(target_user)


