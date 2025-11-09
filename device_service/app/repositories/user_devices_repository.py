from fastapi import HTTPException
from starlette import status

from app.domain import UserDevicesModel


class UserDevicesRepository:
    def __init__(self, db):
        self.db = db


    def check_existing_link(self, device_id, user_id):
        return self.db.query(UserDevicesModel).filter(
            UserDevicesModel.device_id == device_id,
            UserDevicesModel.user_id == user_id
        ).first()


    def link_device_to_user(self, device_id, user_id):
        new_link = UserDevicesModel(device_id=device_id, user_id=user_id)
        self.db.add(new_link)
        self.db.commit()
        self.db.refresh(new_link)


    def unlink_device_from_user(self, device_id, user_id):
        link = (self.db.query(UserDevicesModel)
                .filter(UserDevicesModel.device_id == device_id, UserDevicesModel.user_id == user_id).first())
        if not link:
            return None

        self.db.delete(link)
        self.db.commit()