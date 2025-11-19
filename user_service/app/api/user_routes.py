from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.schemas.user_schema import CreateUserRequestDTO, GetAllUsersResponseDTO, GetUserResponseDTO
from app.repository.user_repository import UserRepository
from app.service.user_service import UserService
from app.utils import get_db, get_current_user, require_role
from app.domain import CreateUserResponseDTO

router = APIRouter()


@router.post("/create-user", response_model=CreateUserResponseDTO)
async def create_user(create_user_dto: CreateUserRequestDTO, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return user_service.create_user(create_user_dto)


@router.get("/get-all-users", response_model=GetAllUsersResponseDTO)
async def get_all_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    quantity, users = user_service.get_all_users()

    return GetAllUsersResponseDTO(quantity=quantity, users=users)


@router.get("/get-user-by-id", response_model=GetUserResponseDTO)
async def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return user_service.get_user_by_id(user_id)


@router.put("/update-user/{user_id}", response_model=GetUserResponseDTO)
async def update_user(user_dto: CreateUserRequestDTO, user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return user_service.update_user(user_id, user_dto)


@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    user_service.delete_user(user_id)
    return {"success": True}



