import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchStreak = createAsyncThunk(
  'streak/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/streak');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak');
    }
  }
);

export const claimStreak = createAsyncThunk(
  'streak/claimStreak',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/streak/claim');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim streak');
    }
  }
);

const initialState = {
  data: null,
  currentStreak: 0,
  longestStreak: 0,
  lastClaimedAt: null,
  nextClaimAt: null,
  loading: false,
  error: null,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    clearStreakError: (state) => {
      state.error = null;
    },
    resetStreak: (state) => {
      state.data = null;
      state.currentStreak = 0;
      state.longestStreak = 0;
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
        state.data = action.payload;
        state.currentStreak = action.payload.current_streak || 0;
        state.longestStreak = action.payload.longest_streak || 0;
        state.lastClaimedAt = action.payload.last_claimed_at || null;
        state.nextClaimAt = action.payload.next_claim_at || null;
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
        state.data = action.payload;
        state.currentStreak = action.payload.current_streak || state.currentStreak;
        state.lastClaimedAt = new Date().toISOString();
      })
      .addCase(claimStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStreakError, resetStreak } = streakSlice.actions;
export default streakSlice.reducer;
