import { createSlice } from "@reduxjs/toolkit";

interface NotifyState {
  total_read: number;
  total_unread: number;
  is_refresh_notify: boolean;
}



const initialState: NotifyState = {
  total_read: 0,
  total_unread: 0,
  is_refresh_notify: false,
};

const NotifyStateSlice = createSlice({
  name: "NotifyState",
  initialState: initialState,
  reducers: {
    setCountNotify(state, { payload }) {
      state.total_read = payload.total_read;
      state.total_unread = payload.total_unread;
    },

    setRefreshNotify(state, { payload }) {
      state.is_refresh_notify = payload.is_refresh_notify;
    },

  },
});

export const { setCountNotify, setRefreshNotify } = NotifyStateSlice.actions;

export default NotifyStateSlice.reducer;
