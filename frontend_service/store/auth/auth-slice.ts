import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  type AuthenticatedUser,
} from "./auth-thunks";

type AuthActionType = "login" | "register" | null;

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  lastAction: AuthActionType;
  profile: AuthenticatedUser | null;
  isProfileLoading: boolean;
}

const storedToken =
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

if (storedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

const initialState: AuthState = {
  token: storedToken,
  isLoading: false,
  error: null,
  lastAction: null,
  profile: null,
  isProfileLoading: false,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.error = null;
      state.lastAction = null;
      state.profile = null;
      state.isProfileLoading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      delete axios.defaults.headers.common["Authorization"];
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastAction = "register";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.lastAction = "register";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.lastAction = "register";
        state.error = action.payload ?? "Failed to register";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastAction = "login";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lastAction = "login";
        state.token = action.payload.access_token;
        state.profile = action.payload.user ?? null;
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", action.payload.access_token);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${action.payload.access_token}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.lastAction = "login";
        state.error = action.payload ?? "Failed to login";
        state.profile = null;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.profile = null;
        if (
          action.payload === "INVALID_TOKEN" ||
          action.payload === "NO_TOKEN"
        ) {
          state.token = null;
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
          }
          delete axios.defaults.headers.common["Authorization"];
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
