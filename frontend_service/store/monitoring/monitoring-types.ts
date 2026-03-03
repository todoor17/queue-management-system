export interface HourlyItem {
  hour: string;
  value: number;
}

export interface MonitoringReport {
  device_id: number;
  date: string;
  items: HourlyItem[];
}
