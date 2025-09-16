import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://dogerek-server.vercel.app/api";

// Load auth from localStorage
const loadAuthFromStorage = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    return { token, user: JSON.parse(user) };
  }
  return { token: null, user: null };
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }) => {
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      username,
      password,
    });
    return response.data;
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

const initialState = {
  ...loadAuthFromStorage(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.token = action.payload.data.token;
          state.user = action.payload.data.user;
          localStorage.setItem("token", action.payload.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(action.payload.data.user)
          );
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.data;
          localStorage.setItem("user", JSON.stringify(action.payload.data));
        }
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
