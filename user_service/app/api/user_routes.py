from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.schemas.user_schema import CreateUserRequestDTO
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService
from app.utils.db_connector import get_db

router = APIRouter()

@router.post("/create_user")
async def create_user(create_user_dto: CreateUserRequestDTO, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return user_service.create_user(create_user_dto)

@router.get("/get_all_users")
async def get_all_users(db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return user_service.get_all_users();

