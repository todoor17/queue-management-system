import datetime

from app.domain import LogModel, HourlyMeasurement, DeviceDetails
from app.events import publish_event

class MonitoringRepository:
    def __init__(self, db):
        self.db = db


    def save_log(self, log: LogModel):
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log


    def save_hourly(self, device_id: int, value: float, timestamp: datetime):
        hour_start = timestamp.replace(minute=0, second=0, microsecond=0)
        device = self.db.query(DeviceDetails).filter(DeviceDetails.device_id == device_id).first()

        if device:
            max_consumption_value = device.max_consumption_value

            hourly = (
                self.db.query(HourlyMeasurement)
                .filter(
                    HourlyMeasurement.device_id == device_id,
                    HourlyMeasurement.hour_start == hour_start
                )
                .first()
            )

            if hourly:
                hourly.total_value += value
                if hourly.total_value > max_consumption_value:
                    data = {
                        "device_id": device_id,
                        "value": hourly.total_value,
                        "max_consumption_value": max_consumption_value,
                    }
                    publish_event(
                        event_name="alert_created",
                        payload=data
                    )
            else:
                if value > max_consumption_value:
                    data = {
                        "device_id": device_id,
                        "value": value,
                        "max_consumption_value": max_consumption_value,
                    }
                    publish_event(
                        event_name="alert_created",
                        payload=data
                    )
                hourly = HourlyMeasurement(
                    device_id=device_id,
                    hour_start=hour_start,
                    total_value=value
                )
                self.db.add(hourly)

            self.db.commit()
            return hourly

        else:
            print(f"Warning: Device with id {device_id} does not exist")
            return None

    def delete_logs_by_device_id(self, device_id: int):
        self.db.query(LogModel).filter(LogModel.device_id == device_id).delete()
        self.db.commit()


    def delete_hourly_by_device_id(self, device_id: int):
        self.db.query(HourlyMeasurement).filter(HourlyMeasurement.device_id == device_id).delete()
        self.db.commit()


    def get_all_logs(self):
        return self.db.query(LogModel).all()


    def get_all_hourly_logs(self):
        return self.db.query(HourlyMeasurement).all()


    def get_logs_by_device_id(self, device_id: int):
        return (
            self.db
            .query(LogModel)
            .filter(LogModel.device_id == device_id)
            .all()
        )


    def get_hourly_logs_by_device_id(self, device_id: int):
        return (
            self.db
            .query(HourlyMeasurement)
            .filter(HourlyMeasurement.device_id == device_id)
            .all()
        )


    def get_hourly_values_in_range(self, device_id: int, start, end):
        rows = (
            self.db.query(HourlyMeasurement.hour_start.label("hour"),
                          HourlyMeasurement.total_value.label("total_value"))
            .filter(HourlyMeasurement.device_id == device_id)
            .filter(HourlyMeasurement.hour_start >= start)
            .filter(HourlyMeasurement.hour_start < end)
            .all()
        )

        return [
            {"hour": r.hour, "total_value": r.total_value}
            for r in rows
        ]

    def add_device_details(self, device_id: int, max_consumption_value: float):
        to_add = DeviceDetails(device_id=device_id, max_consumption_value=max_consumption_value)
        self.db.add(to_add)
        self.db.commit()
        self.db.refresh(to_add)


    def update_device_details(self, device_id: int, max_consumption_value: float):
        target_device = self.db.query(DeviceDetails).filter(DeviceDetails.device_id == device_id).first()
        target_device.max_consumption_value = max_consumption_value
        self.db.commit()
        self.db.refresh(target_device)


    def delete_device_details(self, device_id: int):
        target = self.db.query(DeviceDetails).filter(DeviceDetails.device_id == device_id).first()

        if target:
            self.db.delete(target)
            self.db.commit()


    def get_max_consumption_value(self, device_id: int):
        target = self.db.query(DeviceDetails).filter(DeviceDetails.device_id == device_id).first()

        if target:
            return target.max_consumption_value
        return 1000 # fallback value


