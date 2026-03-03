from pydantic import Field
from sqlalchemy import PrimaryKeyConstraint
from sqlmodel import SQLModel


class UserDevicesModel(SQLModel, table=True):
    __tablename__ = "user_devices"

    device_id: int = Field(index=True, nullable=False)
    user_id: int = Field(index=True, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("device_id", "user_id"),
    )
