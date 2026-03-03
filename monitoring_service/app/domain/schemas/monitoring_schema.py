import datetime

from typing import Optional, List
from pydantic import BaseModel


class LogResponse(BaseModel):
    id: int
    device_id: int
    value: float
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class GetAllLogsResponse(BaseModel):
    quantity: int
    items: List[LogResponse]


class HourlyLogResponse(BaseModel):
    id: int
    device_id: int
    hour_start: datetime.datetime
    total_value: float

    class Config:
        from_attributes = True


class GetAllHourlyLogsResponse(BaseModel):
    quantity: int
    items: List[HourlyLogResponse]


class HourReport(BaseModel):
    hour: str
    value: float


class DailyReportResponse(BaseModel):
    device_id: int
    date: str
    items: List[HourReport]
