from datetime import datetime
from sqlmodel import SQLModel, Field


class LogModel(SQLModel, table=True):
    __tablename__ = "logs"
    id: int | None = Field(default=None, primary_key=True)
    device_id: int = Field(index=True)
    value: float
    timestamp: datetime = Field(index=True)


class HourlyMeasurement(SQLModel, table=True):
    __tablename__ = "hourly_measurements"
    id: int | None = Field(default=None, primary_key=True)
    device_id: int = Field(index=True)
    hour_start: datetime = Field(index=True)
    total_value: float
