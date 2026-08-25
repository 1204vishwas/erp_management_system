import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import uiReducer from "../features/ui/uiSlice.js";
import { loadState, saveState, throttle } from "./persist.js";

// Redux Toolkit store: auth state + global UI state (loading, messages).
// State is persisted to localStorage via the persist helper so the session
// and preferences survive a page refresh.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  // Seed the store from any previously saved state.
  preloadedState: loadState(),
});

// Save (a throttled subset of) the store to localStorage on every change.
store.subscribe(
  throttle(() => {
    saveState(store.getState());
  })
);
