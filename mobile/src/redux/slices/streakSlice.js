import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchStreak = createAsyncThunk(
  'streak/fetchStreak',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/streak');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak');
    }
  }
);

export const claimStreak = createAsyncThunk(
  'streak/claimStreak',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.post('/streak/checkin');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim streak');
    }
  }
);

const initialState = {
  data: null,
  currentStreak: 0,
  longestStreak: 0,
  shieldsBanked: 0,
  lastActiveDate: null,
  lastClaimedAt: null,
  nextClaimAt: null,
  loading: false,
  error: null,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    setStreak: (state, action) => {
      state.data = action.payload;
      state.currentStreak = action.payload?.current_streak || 0;
      state.longestStreak = action.payload?.best_streak || 0;
      state.lastClaimedAt = new Date().toISOString();
      state.error = null;
    },
    clearStreakError: (state) => {
      state.error = null;
    },
    resetStreak: (state) => {
      state.data = null;
      state.currentStreak = 0;
      state.longestStreak = 0;
      state.shieldsBanked = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Streak
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: { current_streak, best_streak, shields_banked, ... } }
        const streakData = action.payload.data || action.payload.data?.data;
        if (streakData) {
          state.data = streakData;
          state.currentStreak = streakData.current_streak || 0;
          state.longestStreak = streakData.best_streak || 0;
          state.shieldsBanked = streakData.shields_banked || 0;
          state.lastActiveDate = streakData.last_active_date;
          state.streakBrokenAt = streakData.streak_broken_at;
        }
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Claim Streak
      .addCase(claimStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimStreak.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, message: '...', data: { current_streak, best_streak, points_earned, ... } }
        const claimData = action.payload.data || action.payload.data?.data;
        if (claimData) {
          state.data = claimData;
          state.currentStreak = claimData.current_streak || state.currentStreak;
          state.longestStreak = claimData.best_streak || state.longestStreak;
          state.pointsEarned = claimData.points_earned || 0;
          state.lastClaimedAt = new Date().toISOString();
        }
      })
      .addCase(claimStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStreakError, resetStreak, setStreak } = streakSlice.actions;
export default streakSlice.reducer;
