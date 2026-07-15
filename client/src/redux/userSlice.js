import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
  },
  reducers: {
    setUserData: (state, action) => {
      if (action.payload) {
        const token = action.payload.token || localStorage.getItem("token");
        state.userData = { ...action.payload, token };
        if (token) {
          localStorage.setItem("token", token);
        }
      } else {
        state.userData = null;
        localStorage.removeItem("token");
      }
    },
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;
