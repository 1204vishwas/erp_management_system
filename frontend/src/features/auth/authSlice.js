import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Rehydrate auth state from localStorage so sessions survive refreshes.
const storedUser = JSON.parse(localStorage.getItem("erp_user") || "null");
const storedToken = localStorage.getItem("erp_token") || null;

const persist = (user, token) => {
  localStorage.setItem("erp_user", JSON.stringify(user));
  localStorage.setItem("erp_token", token);
};

// We use a bare axios call here (not the interceptor instance) to avoid a
// circular import between the store and the api module.
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, credentials);
      persist(data.user, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, payload);
      persist(data.user, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      localStorage.removeItem("erp_user");
      localStorage.removeItem("erp_token");
    },
    // Keep the local user in sync after a profile update.
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("erp_user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
