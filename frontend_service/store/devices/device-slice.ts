import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DeviceEntity {
  device_id: number;
  device_name: string;
  description: string;
  location: string;
  consumption_value: number;
  is_linked: boolean;
}

export interface GetDevices {
  quantity: number;
  devices: DeviceEntity[] | null;
}

const initialState: GetDevices = {
  quantity: 0,
  devices: null,
};

const devicesSlice = createSlice({
  name: "devicesSlice",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<GetDevices>) => {
      state.quantity = action.payload.quantity;
      state.devices = action.payload.devices;
    },
  },
});

export const { setDevices } = devicesSlice.actions;
export default devicesSlice.reducer;
