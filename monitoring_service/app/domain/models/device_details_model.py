from sqlmodel import SQLModel, Field


class DeviceDetails(SQLModel, table=True):
    __tablename__ = "device_details"
    device_id: int = Field(primary_key=True, unique=True)
    max_consumption_value: float = Field(..., nullable=False)