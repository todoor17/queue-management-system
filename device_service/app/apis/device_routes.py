from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.domain import CreateDeviceRequestDTO
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