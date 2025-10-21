from app.domain import DeviceModel


class DeviceRepository:
    def __init__(self, db):
        self.db = db


    def create_device(self, Device: DeviceModel):
        self.db.add(Device)
        self.db.commit()
        self.db.refresh(Device)

        return Device


    def get_all_devices(self):
        return self.db.query(DeviceModel).all()


    def get_device_by_id(self, device_id):
        return self.db.query(DeviceModel).filter(DeviceModel.device_id == device_id).first()


    def update_device(self, device: DeviceModel):
        self.db.commit()
        self.db.refresh(device)
        return device


    def delete_device(self, device: DeviceModel):
        self.db.delete(device)
        self.db.commit()


