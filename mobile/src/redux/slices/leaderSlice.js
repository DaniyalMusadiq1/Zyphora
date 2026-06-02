import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchLeaderboard = createAsyncThunk(
  'leader/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaderboard');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  entries: [],
  userRank: null,
  loading: false,
  error: null,
};

const leaderSlice = createSlice({
  name: 'leader',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetLeaderboard: (state) => {
      state.entries = [];
      state.userRank = null;
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
        state.entries = action.payload.entries || action.payload.leaderboard || [];
        state.userRank = action.payload.user_rank || action.payload.userRank || null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetLeaderboard } = leaderSlice.actions;
export default leaderSlice.reducer;
