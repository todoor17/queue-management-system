import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const isBrowser = typeof window !== "undefined";
const AUTH_BASE = isBrowser
  ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://auth.localhost/auth"
  : process.env.AUTH_SERVICE_URL ?? "http://auth_service:8082/auth";
const USER_BASE = isBrowser
  ? process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? "http://user.localhost/users"
  : process.env.USER_SERVICE_URL ?? "http://user_service:8080/users";

const buildAuthHeaders = (token: string | null | undefined) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

export interface AuthenticatedUser {
  user_id: number;
  username: string;
  email: string;
  address?: string | null;
  role?: string | null;
}

export interface RegisterUserPayload {
  username: string;
  email: string;
  password: string;
  address?: string | null;
  role?: string | null;
}

export interface RegisterUserResponse {
  user_id: number;
  username: string;
  email: string;
  address?: string | null;
  role?: string | null;
}

export interface LoginUserPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginUserResponse {
  access_token: string;
  token_type: string;
  user: AuthenticatedUser;
}

const decodeUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const parsed = JSON.parse(decoded);
    const sub = parsed?.sub;
    if (typeof sub === "number") return sub;
    if (typeof sub === "string" && sub.trim().length > 0) {
      const parsedNumber = Number(sub);
      return Number.isNaN(parsedNumber) ? null : parsedNumber;
    }
    return null;
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return null;
  }
};

export const registerUser = createAsyncThunk<
  RegisterUserResponse,
  RegisterUserPayload,
  { rejectValue: string }
>("auth/registerUser", async (payload, thunkAPI) => {
  try {
    const requestBody: Record<string, any> = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    };
    if (payload.address) {
      requestBody.address = payload.address;
    }
    if (payload.role) {
      requestBody.role = payload.role;
    }

    const response = await axios.post(`${AUTH_BASE}/register`, requestBody);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        return thunkAPI.rejectWithValue("User already exists");
      }
      if (error.response.status === 503) {
        return thunkAPI.rejectWithValue("Auth service unavailable");
      }
      const detail = error.response.data?.detail;
      return thunkAPI.rejectWithValue(detail ?? "Failed to register");
    }
    return thunkAPI.rejectWithValue("Failed to register");
  }
});

export const loginUser = createAsyncThunk<
  LoginUserResponse,
  LoginUserPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${AUTH_BASE}/login`, payload);
    const token: string | undefined = response.data?.access_token;
    if (!token) {
      return thunkAPI.rejectWithValue("Login succeeded without token");
    }
    const userId = decodeUserIdFromToken(token);
    if (userId == null) {
      return thunkAPI.rejectWithValue("Invalid token payload");
    }

    const profileResponse = await axios.get(`${USER_BASE}/get-user-by-id`, {
      params: { user_id: userId },
      headers: buildAuthHeaders(token),
    });

    return {
      ...response.data,
      user: profileResponse.data,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        return thunkAPI.rejectWithValue("Invalid credentials");
      }
      if (error.response.status === 404) {
        return thunkAPI.rejectWithValue("User not found");
      }
      const detail = error.response.data?.detail;
      return thunkAPI.rejectWithValue(detail ?? "Failed to login");
    }
    return thunkAPI.rejectWithValue("Failed to login");
  }
});

interface AuthStateWithToken {
  auth?: {
    token: string | null;
  };
}

export const fetchCurrentUser = createAsyncThunk<
  AuthenticatedUser,
  void,
  { state: AuthStateWithToken; rejectValue: string }
>("auth/fetchCurrentUser", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const token =
    state?.auth?.token ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null);

  if (!token) {
    return thunkAPI.rejectWithValue("NO_TOKEN");
  }

  const userId = decodeUserIdFromToken(token);
  if (userId == null) {
    return thunkAPI.rejectWithValue("INVALID_TOKEN");
  }

  try {
    const response = await axios.get(`${USER_BASE}/get-user-by-id`, {
      params: { user_id: userId },
      headers: buildAuthHeaders(token),
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const detail = error.response.data?.detail ?? "Failed to load profile";
      return thunkAPI.rejectWithValue(detail);
    }
    return thunkAPI.rejectWithValue("Failed to load profile");
  }
});
