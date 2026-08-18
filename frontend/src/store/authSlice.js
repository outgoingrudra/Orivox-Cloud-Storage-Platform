import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "checking", // checking | authenticated | unauthenticated
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setAuthenticated(state, action) {
      state.user = action.payload;
      state.status = "authenticated";
    },

    setUnauthenticated(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const {
  setAuthenticated,
  setUnauthenticated,
} = authSlice.actions;

export default authSlice.reducer;