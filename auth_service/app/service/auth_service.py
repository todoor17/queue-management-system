import os
import requests
import bcrypt
import jwt

from datetime import datetime, timedelta
from fastapi import HTTPException
from starlette import status
from dotenv import load_dotenv

from app.domain import AuthModel, LoginUserRequestDTO, RegisterUserRequestDTO, UserRole
from app.domain.schemas.auth_schema import UpdateAccountRequestDTO
from app.utils.security import build_service_headers

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

USER_SERVICE_URL = "http://user_service:8080"


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

        hashed_pw = bcrypt.hashpw(
            register_dto.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        payload = {
            "username": register_dto.username,
            "email": register_dto.email,
            "address": register_dto.address,
            "role": register_dto.role or UserRole.CLIENT,
        }

        service_headers = build_service_headers(subject="auth_service")

        try:
            response = requests.post(
                f"{USER_SERVICE_URL}/users/create-user",
                json=payload,
                headers=service_headers,
                timeout=5
            )

            if response.status_code == 409:
                raise HTTPException(409, "User already exists")

            if not response.ok:
                detail = response.json().get("detail", "Failed to create user")
                raise HTTPException(response.status_code, detail)

        except requests.exceptions.RequestException:
            raise HTTPException(503, "User service unavailable")

        created_user = response.json()

        auth_user = AuthModel(
            user_id=created_user["user_id"],
            username=register_dto.username,
            email=register_dto.email,
            password=hashed_pw,
            address=register_dto.address,
            role=register_dto.role or UserRole.CLIENT
        )

        try:
            return self.auth_repo.create_user(auth_user)
        except Exception:
            # attempt to clean up the remote user to avoid orphaned records
            try:
                requests.delete(
                    f"{USER_SERVICE_URL}/users/delete-user/{created_user['user_id']}",
                    headers=service_headers,
                    timeout=5
                )
            except requests.exceptions.RequestException:
                pass
            raise


    def login_user(self, login_dto: LoginUserRequestDTO):
        if login_dto.email:
            target_user = self.auth_repo.get_user_by_email(login_dto.email)
        else:
            target_user = self.auth_repo.get_user_by_username(login_dto.username)

        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        hashed_pw_bytes = target_user.password.encode("utf-8")
        result = bcrypt.checkpw(login_dto.password.encode("utf-8"), hashed_pw_bytes)

        if result:
            token = create_access_token(target_user.user_id, target_user.role)
            print(token)
            return {"access_token": token, "token_type": "bearer"}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized login attempt")


    def delete_account_by_id(self, user_id: int):
        to_delete = self.auth_repo.get_user_by_id(user_id)
        if not to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        self.auth_repo.delete_account(to_delete)
        return {"success": True}


    def update_account_by_id(self, user_id: int, update_dto: UpdateAccountRequestDTO):
        target_user = self.auth_repo.get_user_by_id(user_id)
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        updates = update_dto.model_dump(exclude_unset=True, exclude_none=True)
        for key, value in updates.items():
            setattr(target_user, key, value)

        return self.auth_repo.update_account(target_user)


