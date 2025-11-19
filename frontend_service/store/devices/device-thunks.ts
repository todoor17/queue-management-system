import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { DeviceEntity, GetDevices } from "./device-slice";
import { setDevices } from "./device-slice";
import type { RootState } from "../store";

const isBrowser = typeof window !== "undefined";
const BASE = isBrowser
  ? process.env.NEXT_PUBLIC_DEVICE_SERVICE_URL ??
    "http://device.localhost/devices"
  : process.env.DEVICE_SERVICE_URL ?? "http://device_service:8081/devices";

const buildAuthHeaders = (state: RootState) => {
  const token =
    state.auth?.token ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllDevices = createAsyncThunk<
  GetDevices,
  void,
  { rejectValue: string; state: RootState }
>("devices/fetchAll", async (_, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.get(`${BASE}/get-all-devices`, { headers });
    thunkAPI.dispatch(
      setDevices({
        quantity: response.data.quantity,
        devices: response.data.devices,
      })
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message ?? "Failed to fetch devices");
  }
});

export interface CreateDeviceDTO {
  device_name: string;
  description: string;
  location: string;
  consumption_value: number;
}

export const createDevice = createAsyncThunk<
  DeviceEntity,
  CreateDeviceDTO,
  { rejectValue: string; state: RootState }
>("devices/create", async (payload, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.post(`${BASE}/create-device`, payload, {
      headers,
    });
    thunkAPI.dispatch(fetchAllDevices());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return thunkAPI.rejectWithValue("DEVICE_EXISTS");
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_CREATE"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_CREATE");
  }
});

export const updateDevice = createAsyncThunk<
  DeviceEntity,
  { device_id: number; dto: CreateDeviceDTO; refreshMode?: "all" | "none" },
  { rejectValue: string; state: RootState }
>(
  "devices/update",
  async ({ device_id, dto, refreshMode = "all" }, thunkAPI) => {
    try {
      const headers = buildAuthHeaders(thunkAPI.getState());
      const response = await axios.put(
        `${BASE}/update-device/${device_id}`,
        dto,
        { headers }
      );
      if (refreshMode === "all") {
        thunkAPI.dispatch(fetchAllDevices());
      }
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          return thunkAPI.rejectWithValue("DEVICE_EXISTS");
        }
        if (error.response?.status === 404) {
          return thunkAPI.rejectWithValue("DEVICE_NOT_FOUND");
        }
        return thunkAPI.rejectWithValue(
          error.response?.data?.detail ?? "FAILED_UPDATE"
        );
      }
      return thunkAPI.rejectWithValue("FAILED_UPDATE");
    }
  }
);

export const deleteDevice = createAsyncThunk<
  { success: boolean },
  { device_id: number },
  { rejectValue: string; state: RootState }
>("devices/delete", async ({ device_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.delete(`${BASE}/delete-device/${device_id}`, {
      headers,
    });
    thunkAPI.dispatch(fetchAllDevices());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        return thunkAPI.rejectWithValue("DEVICE_LINKED");
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_DELETE"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_DELETE");
  }
});

export const getUsersForDevice = createAsyncThunk<
  { device_id: number; user_ids: number[] },
  { device_id: number },
  { rejectValue: string; state: RootState }
>("devices/getUsersForDevice", async ({ device_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.get(
      `${BASE}/get-users-by-device/${device_id}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_FETCH_LINKS"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_FETCH_LINKS");
  }
});

export const linkDeviceToUser = createAsyncThunk<
  { detail: string },
  { device_id: number; user_id: number },
  { rejectValue: string; state: RootState }
>("devices/linkToUser", async ({ device_id, user_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.post(
      `${BASE}/link-device-to-user/${device_id}`,
      null,
      {
        params: { user_id },
        headers,
      }
    );
    thunkAPI.dispatch(fetchAllDevices());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return thunkAPI.rejectWithValue("LINK_EXISTS");
      }
      if (error.response?.status === 503) {
        return thunkAPI.rejectWithValue("USER_SERVICE_UNAVAILABLE");
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_LINK"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_LINK");
  }
});

export const unlinkDeviceFromUser = createAsyncThunk<
  { detail: string },
  { device_id: number; user_id: number },
  { rejectValue: string; state: RootState }
>("devices/unlinkFromUser", async ({ device_id, user_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.delete(
      `${BASE}/unlink-device-from-user/${device_id}`,
      {
        params: { user_id },
        headers,
      }
    );
    thunkAPI.dispatch(fetchAllDevices());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_UNLINK"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_UNLINK");
  }
});

export const fetchDevicesByUser = createAsyncThunk<
  GetDevices,
  { user_id: number },
  { rejectValue: string; state: RootState }
>("devices/fetchByUser", async ({ user_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.get(`${BASE}/get-devices-by-user/${user_id}`, {
      headers,
    });
    const deviceIds: number[] = response.data?.device_ids ?? [];

    if (deviceIds.length === 0) {
      const emptyPayload: GetDevices = { quantity: 0, devices: [] };
      thunkAPI.dispatch(setDevices(emptyPayload));
      return emptyPayload;
    }

    const deviceResponses = await Promise.all(
      deviceIds.map((id) =>
        axios.get(`${BASE}/get-device-by-id/${id}`, { headers })
      )
    );

    const devices = deviceResponses.map((res) => res.data);
    const payload: GetDevices = { quantity: devices.length, devices };
    thunkAPI.dispatch(setDevices(payload));
    return payload;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail ?? "Failed to fetch devices";
      return thunkAPI.rejectWithValue(detail);
    }
    return thunkAPI.rejectWithValue("Failed to fetch devices");
  }
});
