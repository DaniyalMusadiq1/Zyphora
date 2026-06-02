import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';


// Async Thunks
export const fetchScore = createAsyncThunk(
  'score/fetchScore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/score');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch score');
    }
  }
);

const initialState = {
  current: 0,
  momentum: 1.0,
  rank: 0,
  nextRankThreshold: 1000,
  loading: false,
  error: null,
  lastUpdated: null,
};

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    // Optimistic update when a task is completed locally
    incrementScore: (state, action) => {
      const points = action.payload.points || 0;
      const momentum = state.momentum || 1.0;
      
      state.current += Math.floor(points * momentum);
      state.lastUpdated = new Date().toISOString();
      
      // Simple rank estimation (can be refined based on backend logic)
      if (state.current >= state.nextRankThreshold) {
        state.rank += 1;
        state.nextRankThreshold = Math.floor(state.nextRankThreshold * 1.5);
      }
    },
    resetMomentum: (state) => {
      state.momentum = 1.0;
    },
    clearScoreError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScore.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current_score || 0;
        state.momentum = action.payload.momentum_multiplier || 1.0;
        state.rank = action.payload.global_rank || 0;
        state.nextRankThreshold = action.payload.next_rank_threshold || 1000;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  incrementScore, 
  resetMomentum, 
  clearScoreError 
} = scoreSlice.actions;

export default scoreSlice.reducer;