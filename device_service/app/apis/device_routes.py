from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.domain import CreateDeviceRequestDTO, UpdateDeviceRequestDTO
from app.repositories import DeviceRepository
from app.services import DeviceService
from app.utils import get_db

router = APIRouter()

@router.post("/create-device")
async def create_device(device: CreateDeviceRequestDTO, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.create_device(device)

@router.get("/get-all-devices")
async def get_all_devices(db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.get_all_devices()


@router.get("/get-device-by-id/{device_id}")
async def get_user_by_id(device_id: int, db: Session = Depends(get_db)):
    device_repo = DeviceRepository(db)
    device_service = DeviceService(device_repo)

    return device_service.get_device_by_id(device_id)


@router.put("/update-device/{device_id}")
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


# @router.put("/link-device-to-user/{device_id}")
# async def link_device_to_user(device_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
#     return
