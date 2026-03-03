import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserEntity {
  user_id: number;
  username: string;
  email: string;
  address?: string | null;
  role?: string | null;
}

export interface GetUsers {
  quantity: number;
  users: UserEntity[] | null;
}

const initialState: GetUsers = {
  quantity: 0,
  users: null,
};

const usersSlice = createSlice({
  name: "usersSlice",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<GetUsers>) => {
      state.quantity = action.payload.quantity;
      state.users = action.payload.users;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;

