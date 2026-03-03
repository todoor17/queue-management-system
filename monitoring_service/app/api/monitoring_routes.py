from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.domain import GetAllLogsResponse, LogResponse, GetAllHourlyLogsResponse, HourlyLogResponse, DailyReportResponse
from app.utils import get_db, get_current_user
from app.repository import MonitoringRepository
from app.service import MonitoringService

router = APIRouter()


@router.get("/get-all-logs", response_model=GetAllLogsResponse)
async def get_all_logs(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    monitoring_repo = MonitoringRepository(db)
    monitoring_service = MonitoringService(monitoring_repo)

    logs = monitoring_service.get_all_logs()

    return GetAllLogsResponse(
        quantity=len(logs),
        items=[LogResponse.model_validate(log) for log in logs]
    )


@router.get("/get-all-hourly-logs", response_model=GetAllHourlyLogsResponse)
async def get_all_hourly_logs(db: Session = Depends(get_db)):
    monitoring_repo = MonitoringRepository(db)
    monitoring_service = MonitoringService(monitoring_repo)

    logs = monitoring_service.get_all_hourly_logs()

    return GetAllHourlyLogsResponse(
        quantity=len(logs),
        items=[HourlyLogResponse.model_validate(log) for log in logs]
    )


@router.get("/get-all-logs/{device_id}", response_model=GetAllLogsResponse)
async def get_logs_by_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    monitoring_service = MonitoringService(MonitoringRepository(db))

    logs = monitoring_service.get_logs_by_device_id(device_id)

    return GetAllLogsResponse(
        quantity=len(logs),
        items=[LogResponse.model_validate(log) for log in logs]
    )


@router.get("/get-all-logs-hourly/{device_id}", response_model=GetAllHourlyLogsResponse)
async def get_hourly_logs_by_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    monitoring_service = MonitoringService(MonitoringRepository(db))

    logs = monitoring_service.get_hourly_logs_by_device_id(device_id)

    return GetAllHourlyLogsResponse(
        quantity=len(logs),
        items=[HourlyLogResponse.model_validate(log) for log in logs]
    )


@router.get("/report/{device_id}", response_model=DailyReportResponse)
async def get_daily_report(
    device_id: int,
    date: str = Query(..., description="Format: DD.MM.YYYY"),
    db: Session = Depends(get_db),
):
    monitoring_service = MonitoringService(MonitoringRepository(db))

    day = datetime.strptime(date, "%d.%m.%Y")
    start = datetime(day.year, day.month, day.day, 0, 0, 0)
    end = start + timedelta(days=1)

    items = monitoring_service.get_24h_report(device_id, start, end)

    return DailyReportResponse(
        device_id=device_id,
        date=date,
        items=items
    )
