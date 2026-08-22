import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import uiReducer from "../features/ui/uiSlice.js";

// Redux Toolkit store: auth state + global UI state (loading, messages).
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});
