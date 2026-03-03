import datetime

from app.domain import LogModel


class MonitoringService:
    def __init__(self, monitoring_repo):
        self.monitoring_repo = monitoring_repo


    def save_log(self, log: LogModel):
        self.monitoring_repo.save_log(log)


    def save_hourly(self, device_id: int, value: float, timestamp: datetime):
        self.monitoring_repo.save_hourly(device_id, value, timestamp)


    def delete_logs_by_device_id(self, device_id: int):
        self.monitoring_repo.delete_logs_by_device_id(device_id)
        self.monitoring_repo.delete_hourly_by_device_id(device_id)


    def get_all_logs(self):
        return self.monitoring_repo.get_all_logs()


    def get_all_hourly_logs(self):
        return self.monitoring_repo.get_all_hourly_logs()


    def get_logs_by_device_id(self, device_id: int):
        return self.monitoring_repo.get_logs_by_device_id(device_id)


    def get_hourly_logs_by_device_id(self, device_id: int):
        return self.monitoring_repo.get_hourly_logs_by_device_id(device_id)


    def get_24h_report(self, device_id: int, start: datetime, end: datetime):
        hourly_data = self.monitoring_repo.get_hourly_values_in_range(
            device_id, start, end
        )

        mapping = {entry["hour"]: entry["total_value"] for entry in hourly_data}

        result = []
        current = start

        for _ in range(24):
            hour_key = current.replace(minute=0, second=0, microsecond=0)

            result.append({
                "hour": hour_key.strftime("%H"),
                "value": mapping.get(hour_key, 0)
            })

            current += datetime.timedelta(hours=1)

        return result


    def add_device_details(self, device_id, max_consumption_value):
        return self.monitoring_repo.add_device_details(device_id, max_consumption_value)


    def update_device_details(self, device_id, max_consumption_value):
        return self.monitoring_repo.update_device_details(device_id, max_consumption_value)


    def delete_device_details(self, device_id):
        return self.monitoring_repo.delete_device_details(device_id)


