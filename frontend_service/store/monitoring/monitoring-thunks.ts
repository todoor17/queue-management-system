import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { MonitoringReport } from "./monitoring-types";
import type { RootState } from "../store";
import { MONITORING_BASE } from "@/env";

const buildAuthHeaders = (state: RootState) => {
  const token =
    state.auth?.token ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const fetchMonitoringReport = createAsyncThunk<
  MonitoringReport,
  { device_id: number; date: string },
  { rejectValue: string; state: RootState }
>("monitoring/fetchReport", async ({ device_id, date }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.get<MonitoringReport>(
      `${MONITORING_BASE}/report/${device_id}`,
      {
        params: { date },
        headers,
      }
    );

    return {
      ...response.data,
      items: (response.data?.items ?? []).map((item) => ({
        hour: item.hour,
        value: Number(item.value ?? 0),
      })),
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? error.message ?? "Failed to load report"
      );
    }
    return thunkAPI.rejectWithValue("Failed to load report");
  }
});
