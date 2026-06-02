import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchLeaderboard = createAsyncThunk(
  'leader/fetchLeaderboard',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard', { params });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  rows: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const leaderSlice = createSlice({
  name: 'leader',
  initialState,
  reducers: {
    clearLeaderError: (state) => {
      state.error = null;
    },
    resetLeaderboard: (state) => {
      state.rows = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload.rows || action.payload || [];
        state.lastFetched = new Date();
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLeaderError, resetLeaderboard } = leaderSlice.actions;
export default leaderSlice.reducer;
