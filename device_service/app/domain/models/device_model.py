from sqlmodel import SQLModel, Field


class DeviceModel(SQLModel, table=True):
    __tablename__ = 'devices'
    device_id: int = Field(primary_key=True)
    device_name: str = Field(nullable=False, unique=True, min_length=3, max_length=128)
    consumption_value: int = Field(gt=0, nullable=False)

