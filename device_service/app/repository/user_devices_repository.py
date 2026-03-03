from app.domain import UserDevicesModel


class UserDevicesRepository:
    def __init__(self, db):
        self.db = db


    def check_existing_link(self, device_id, user_id):
        return self.db.query(UserDevicesModel).filter(
            UserDevicesModel.device_id == device_id,
            UserDevicesModel.user_id == user_id
        ).first()


    def check_links_by_user_id(self, user_id):
        return self.db.query(UserDevicesModel).filter(UserDevicesModel.user_id == user_id).count() > 0


    def check_links_by_device_id(self, device_id):
        return self.db.query(UserDevicesModel).filter(UserDevicesModel.device_id == device_id).count() > 0


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

    def get_users_for_device(self, device_id):
        return [row.user_id for row in self.db.query(UserDevicesModel).filter(UserDevicesModel.device_id == device_id).all()]


    def get_devices_for_user(self, user_id):
        return [row.device_id for row in self.db.query(UserDevicesModel).filter(UserDevicesModel.user_id == user_id).all()]


    def delete_links_by_device_id(self, device_id):
        (self.db.query(UserDevicesModel)
         .filter(UserDevicesModel.device_id == device_id)
         .delete(synchronize_session=False))
        self.db.commit()


    def delete_links_by_user_id(self, user_id):
        (self.db.query(UserDevicesModel)
         .filter(UserDevicesModel.user_id == user_id)
         .delete(synchronize_session=False))
        self.db.commit()

