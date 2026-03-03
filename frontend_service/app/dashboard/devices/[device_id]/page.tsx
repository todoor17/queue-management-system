"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMonitoringReport } from "@/store/monitoring/monitoring-thunks";

type ChartMode = "line" | "bar";

const formatToApiDate = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
};

const formatInputDate = (value: string) => {
  const [day, month, year] = value.split(".");
  if (!day || !month || !year) return "";
  return `${year}-${month}-${day}`;
};

export default function DeviceReportPage() {
  const params = useParams();
  const deviceIdParam = params?.device_id ?? params?.deviceId;
  const deviceId = useMemo(
    () => Number(deviceIdParam ?? Number.NaN),
    [deviceIdParam]
  );
  const dispatch = useDispatch<AppDispatch>();
  const { report, isLoading, error } = useSelector(
    (state: RootState) => state.monitoring
  );

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, "0");
    const dd = `${now.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [chartMode, setChartMode] = useState<ChartMode>("line");

  useEffect(() => {
    if (!deviceId || Number.isNaN(deviceId)) {
      return;
    }
    const apiDate = formatToApiDate(selectedDate);
    if (!apiDate) {
      return;
    }
    dispatch(fetchMonitoringReport({ device_id: deviceId, date: apiDate }));
  }, [deviceId, selectedDate, dispatch]);

  const displayDate =
    report?.date && formatInputDate(report.date)
      ? formatInputDate(report.date)
      : selectedDate;
  const invalidDevice = !deviceId || Number.isNaN(deviceId);
  const errorMessage = invalidDevice ? "Invalid device" : error;
  const loading = !invalidDevice && isLoading;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 24,
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontWeight: 700 }}>
          Select date:{" "}
          <input
            type="date"
            value={displayDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setChartMode("line")}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              backgroundColor: chartMode === "line" ? "#0ea5e9" : "#fff",
              color: chartMode === "line" ? "#fff" : "#111827",
              cursor: "pointer",
            }}
          >
            Line
          </button>
          <button
            onClick={() => setChartMode("bar")}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              backgroundColor: chartMode === "bar" ? "#0ea5e9" : "#fff",
              color: chartMode === "bar" ? "#fff" : "#111827",
              cursor: "pointer",
            }}
          >
            Bar
          </button>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 900,
          height: 420,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <span>Loading...</span>
        ) : errorMessage ? (
          <span style={{ color: "#dc2626" }}>{errorMessage}</span>
        ) : report && report.items?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === "line" ? (
              <LineChart data={report.items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="kWh"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={report.items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="kWh"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <span>No data for this date</span>
        )}
      </div>
    </div>
  );
}
