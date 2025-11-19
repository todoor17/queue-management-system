import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUsers, type GetUsers, type UserEntity } from "./user-slice";
import type { RootState } from "../store";

const isBrowser = typeof window !== "undefined";
const BASE = isBrowser
  ? process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? "http://user.localhost/users"
  : process.env.USER_SERVICE_URL ?? "http://user_service:8080/users";

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
    const response = await axios.get(`${BASE}/get-all-users`, { headers });
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
}

export const createUser = createAsyncThunk<
  UserEntity,
  CreateUserDTO,
  { rejectValue: string; state: RootState }
>("users/create", async (payload, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.post(`${BASE}/create-user`, payload, {
      headers,
    });
    thunkAPI.dispatch(fetchAllUsers());
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return thunkAPI.rejectWithValue("USER_EXISTS");
    }
    return thunkAPI.rejectWithValue(error.message ?? "FAILED_CREATE");
  }
});

export const updateUser = createAsyncThunk<
  UserEntity,
  { user_id: number; dto: CreateUserDTO },
  { rejectValue: string; state: RootState }
>("users/update", async ({ user_id, dto }, thunkAPI) => {
  try {
    const headers = buildAuthHeaders(thunkAPI.getState());
    const response = await axios.put(`${BASE}/update-user/${user_id}`, dto, {
      headers,
    });
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
    const response = await axios.delete(`${BASE}/delete-user/${user_id}`, {
      headers,
    });
    thunkAPI.dispatch(fetchAllUsers());

    return response.data;
  } catch (error: any) {
    alert("User deletion failed. Can't delete a user with linked devices.");
    return thunkAPI.rejectWithValue(error.message ?? "Failed to delete user");
  }
});
