from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.domain import CreateDeviceRequestDTO, CreateDeviceResponseDTO, UpdateDeviceRequestDTO, GetAllDevicesResponseDTO, DeviceResponseDTO
from app.repository import DeviceRepository
from app.service import DeviceService
from app.utils import get_db, get_current_user, require_role
from app.repository import UserDevicesRepository
from app.service import UserDevicesService


router = APIRouter()

@router.post("/create-device", response_model=CreateDeviceResponseDTO)
async def create_device(device: CreateDeviceRequestDTO, db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    device_service = DeviceService(device_repository=device_repo, user_device_repository=user_devices_repo)

    created = device_service.create_device(device)
    return CreateDeviceResponseDTO.model_validate(created)

@router.get("/get-all-devices", response_model=GetAllDevicesResponseDTO)
async def get_all_devices(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    device_service = DeviceService(device_repository=device_repo, user_device_repository=user_devices_repo)

    devices = device_service.get_all_devices()
    devices_dtos = [DeviceResponseDTO.model_validate(device) for device in devices]
    return GetAllDevicesResponseDTO(quantity=len(devices_dtos), devices=devices_dtos)


@router.get("/get-device-by-id/{device_id}", response_model=DeviceResponseDTO)
async def get_device_by_id(device_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    device_service = DeviceService(device_repository=device_repo, user_device_repository=user_devices_repo)

    device_data = device_service.get_device_by_id(device_id)
    return DeviceResponseDTO.model_validate(device_data)


@router.put("/update-device/{device_id}", response_model=DeviceResponseDTO, )
async def update_device(device_dto: UpdateDeviceRequestDTO, device_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    device_service = DeviceService(device_repository=device_repo, user_device_repository=user_devices_repo)

    updated = device_service.update_device(device_id, device_dto)
    return DeviceResponseDTO.model_validate(updated)


@router.delete("/delete-device/{device_id}")
async def delete_device(device_id: int, db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    device_service = DeviceService(device_repo, user_devices_repo)

    device_service.delete_device(device_id)
    return {"success": True}


@router.post("/link-device-to-user/{device_id}")
async def link_device_to_user(device_id: int, user_id: int = Query(...), db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    user_devices_repo = UserDevicesRepository(db)
    device_repo = DeviceRepository(db)
    user_devices_service=UserDevicesService(user_devices_repo, device_repo)

    user_devices_service.link_device_to_user(device_id, user_id)
    return {"detail": "Linking done successfully"}


@router.delete("/unlink-device-from-user/{device_id}")
async def unlink_device_from_user(device_id: int, user_id: int = Query(...), db: Session = Depends(get_db), current_user = Depends(require_role("ADMIN"))):
    user_devices_repo = UserDevicesRepository(db)
    device_repo = DeviceRepository(db)
    user_devices_service=UserDevicesService(user_devices_repo, device_repo)

    user_devices_service.unlink_device_from_user(device_id, user_id)
    return {"detail": "Unlinking done successfully"}


@router.get("/get-links-by-user-id/{user_id}")
async def get_links_by_user_id(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_devices_repo = UserDevicesRepository(db)
    user_devices_service = UserDevicesService(device_repository=None, user_devices_repository=user_devices_repo)

    return {"has devices": user_devices_service.get_links_by_user_id(user_id)}


@router.get("/get-users-by-device/{device_id}")
async def get_users_by_device(device_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    user_devices_service = UserDevicesService(device_repository=device_repo, user_devices_repository=user_devices_repo)

    return {"device_id": device_id, "user_ids": user_devices_service.get_users_by_device_id(device_id)}


@router.get("/get-devices-by-user/{user_id}")
async def get_devices_by_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    device_repo = DeviceRepository(db)
    user_devices_repo = UserDevicesRepository(db)
    user_devices_service = UserDevicesService(device_repository=device_repo, user_devices_repository=user_devices_repo)

    return {"user_id": user_id, "device_ids": user_devices_service.get_devices_by_user_id(user_id)}
