import { createSlice } from "@reduxjs/toolkit";

// Global UI state: number of in-flight requests (loading) and sidebar toggle.
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loadingCount: 0,
    sidebarOpen: true,
  },
  reducers: {
    startLoading: (state) => {
      state.loadingCount += 1;
    },
    stopLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { startLoading, stopLoading, toggleSidebar, setSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
