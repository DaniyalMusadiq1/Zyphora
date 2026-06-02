import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchLeaderboard = createAsyncThunk(
  'leader/fetchLeaderboard',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/leaderboard');
      return response.data;
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
        // Backend returns: { leaderboard: [{user_id, name, ps_total}, ...] }
        const leaderboardData = action.payload.leaderboard || action.payload.data?.leaderboard || [];
        state.entries = leaderboardData.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id,
          name: entry.name || 'Miner',
          score: entry.ps_total || 0,
        }));
        // Calculate user rank if current user is in leaderboard
        const authState = getState().auth;
        const userEntry = leaderboardData.find(e => e.user_id === authState.userId);
        if (userEntry) {
          state.userRank = leaderboardData.indexOf(userEntry) + 1;
        }
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetLeaderboard } = leaderSlice.actions;
export default leaderSlice.reducer;
