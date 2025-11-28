import { combineReducers, configureStore } from "@reduxjs/toolkit";
import notifySlice from "./notifySlice";
import themeConfigSlice from "./themeConfigSlice";

const rootReducer = combineReducers({
  themeConfig: themeConfigSlice,
  notify: notifySlice,
});
export default configureStore({
  reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
