import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
}