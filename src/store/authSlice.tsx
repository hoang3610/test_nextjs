import { createSlice } from "@reduxjs/toolkit";
import CookieUtils from "../utils/cookie-utils";

interface AuthState {
  isLogin: boolean;
}

const userCookie = CookieUtils.getCookie("user");
const isLoggedIn = userCookie && userCookie !== "";
const initialState: AuthState = {
  isLogin: isLoggedIn ? true : false,
};

const authStateSlice = createSlice({
  name: "authState",
  initialState: initialState,
  reducers: {
    setIsLogin(state, { payload }) {
      state.isLogin = payload;
    },
    login(state) {
      state.isLogin = true;
    },
  },
});

export const { setIsLogin, login } = authStateSlice.actions;

export default authStateSlice.reducer;
