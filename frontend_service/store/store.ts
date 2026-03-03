import { configureStore } from "@reduxjs/toolkit";
import devicesReducer from "./devices/device-slice";
import usersReducer from "./users/user-slice";
import authReducer from "./auth/auth-slice";
import monitoringReducer from "./monitoring/monitoring-slice";

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    users: usersReducer,
    auth: authReducer,
    monitoring: monitoringReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
