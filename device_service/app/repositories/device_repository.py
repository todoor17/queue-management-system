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

