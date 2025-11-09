import requests

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session

from app.domain import CreateDeviceRequestDTO, CreateDeviceResponseDTO, UpdateDeviceRequestDTO, GetAllDevicesResponseDTO, DeviceResponseDTO
from app.repositories import DeviceRepository
from app.services import DeviceService
from app.utils import get_db
from repositories.user_devices_repository import UserDevicesRepository
from services.user_devices_service import UserDevicesService

router = APIRouter()

@router.post("/create-device", response_model=CreateDeviceResponseDTO)
async def create_device(device: CreateDeviceRequestDTO, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.create_device(device)

@router.get("/get-all-devices", response_model=GetAllDevicesResponseDTO)
async def get_all_devices(db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.get_all_devices()


@router.get("/get-device-by-id/{device_id}", response_model=DeviceResponseDTO)
async def get_user_by_id(device_id: int, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.get_device_by_id(device_id)


@router.put("/update-device/{device_id}", response_model=DeviceResponseDTO)
async def update_user(device_dto: UpdateDeviceRequestDTO, device_id: int, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.update_device(device_id, device_dto)


@router.delete("/delete-device/{device_id}")
async def delete_user(device_id: int, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    device_service.delete_device(device_id)
    return {"success": True}


@router.post("/link-device-to-user/{device_id}")
async def link_device_to_user(device_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    user_devices_repo = UserDevicesRepository(db)
    device_repo = DeviceRepository(db)
    user_devices_service=UserDevicesService(user_devices_repo, device_repo)

    user_devices_service.link_device_to_user(device_id, user_id)
    return {"detail": "Linking done successfully"}


@router.delete("/unlink-device-from-user/{device_id}")
async def link_device_to_user(device_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    user_devices_repo = UserDevicesRepository(db)
    device_repo = DeviceRepository(db)
    user_devices_service=UserDevicesService(user_devices_repo, device_repo)

    user_devices_service.unlink_device_from_user(device_id, user_id)
    return {"detail": "Unlinking done successfully"}
