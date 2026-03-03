import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUsers, type GetUsers, type UserEntity } from "./user-slice";
import type { RootState } from "../store";
import { AUTH_BASE, USERS_BASE } from "@/env";

const DEFAULT_USER_PASSWORD = "defaultPass";

const buildAuthHeaders = (state: RootState) => {
  const token =
    state.auth?.token ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllUsers = createAsyncThunk<
  GetUsers,
  void,
  { rejectValue: string; state: RootState }
>("users/fetchAll", async (_, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.get(`${USERS_BASE}/get-all-users`, {
      headers,
    });
    thunkAPI.dispatch(
      setUsers({ quantity: response.data.quantity, users: response.data.users })
    );
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message ?? "Failed to fetch users");
  }
});

export interface CreateUserDTO {
  username: string;
  email: string;
  address?: string | null;
  role?: string | null;
  password?: string | null;
}

export const createUser = createAsyncThunk<
  UserEntity,
  CreateUserDTO,
  { rejectValue: string; state: RootState }
>("users/create", async (payload, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.post(
      `${AUTH_BASE}/register`,
      {
        ...payload,
        password: payload.password ?? DEFAULT_USER_PASSWORD,
      },
      {
        headers,
      }
    );
    thunkAPI.dispatch(fetchAllUsers());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return thunkAPI.rejectWithValue("USER_EXISTS");
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "FAILED_CREATE"
      );
    }
    return thunkAPI.rejectWithValue("FAILED_CREATE");
  }
});

export const updateUser = createAsyncThunk<
  UserEntity,
  { user_id: number; dto: CreateUserDTO },
  { rejectValue: string; state: RootState }
>("users/update", async ({ user_id, dto }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.put(
      `${USERS_BASE}/update-user/${user_id}`,
      dto,
      {
        headers,
      }
    );
    thunkAPI.dispatch(fetchAllUsers());
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message ?? "Failed to update user");
  }
});

export const deleteUser = createAsyncThunk<
  { success: boolean },
  { user_id: number },
  { rejectValue: string; state: RootState }
>("users/delete", async ({ user_id }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.delete(
      `${AUTH_BASE}/delete-account-by-id/${user_id}`,
      {
        headers,
      }
    );
    thunkAPI.dispatch(fetchAllUsers());

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return thunkAPI.rejectWithValue("CANNOT_DELETE_ADMIN");
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ?? "Failed to delete user"
      );
    }
    return thunkAPI.rejectWithValue("Failed to delete user");
  }
});
