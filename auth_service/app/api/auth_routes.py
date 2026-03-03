from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.domain import (
    RegisterUserRequestDTO,
    RegisterUserResponseDTO,
    LoginUserRequestDTO,
    UpdateAccountRequestDTO,
)
from app.utils import get_db, get_current_user, require_role
from app.repository import AuthRepository
from app.service import AuthService

router = APIRouter()


@router.post("/register", response_model=RegisterUserResponseDTO)
async def register_user(request: RegisterUserRequestDTO, db: Session = Depends(get_db)):
    auth_repository = AuthRepository(db)
    auth_service = AuthService(auth_repository)

    return auth_service.register_user(request)


@router.post("/login")
async def login_user(request: LoginUserRequestDTO, db: Session = Depends(get_db)):
    auth_repository = AuthRepository(db)
    auth_service = AuthService(auth_repository)

    return auth_service.login_user(request)


# @router.put("/update-account-by-id/{user_id}")
# async def update_account_by_id(user_id: int, request: UpdateAccountRequestDTO, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     auth_repository = AuthRepository(db)
#     auth_service = AuthService(auth_repository)
#
#     return auth_service.update_account_by_id(user_id, request)


@router.delete("/delete-account-by-id/{user_id}")
async def delete_account_by_id(user_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    auth_repository = AuthRepository(db)
    auth_service = AuthService(auth_repository)

    return auth_service.delete_account_by_id(user_id)