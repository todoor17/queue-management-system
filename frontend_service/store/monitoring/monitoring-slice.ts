import { createSlice } from "@reduxjs/toolkit";
import type { MonitoringReport } from "./monitoring-types";
import { fetchMonitoringReport } from "./monitoring-thunks";

interface MonitoringState {
  report: MonitoringReport | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MonitoringState = {
  report: null,
  isLoading: false,
  error: null,
};

const monitoringSlice = createSlice({
  name: "monitoringSlice",
  initialState,
  reducers: {
    clearMonitoringReport: (state) => {
      state.report = null;
    },
    clearMonitoringError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.report = action.payload;
      })
      .addCase(fetchMonitoringReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load report";
      });
  },
});

export const { clearMonitoringError, clearMonitoringReport } =
  monitoringSlice.actions;
export default monitoringSlice.reducer;
