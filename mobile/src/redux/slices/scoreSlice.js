import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchScore = createAsyncThunk(
  'score/fetchScore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/score');
      return response.data.score || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch score');
    }
  }
);

const initialState = {
  snapshot: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    setScore: (state, action) => {
      state.snapshot = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    clearScoreError: (state) => {
      state.error = null;
    },
    resetScore: (state) => {
      state.snapshot = null;
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
        state.snapshot = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setScore,
  clearScoreError,
  resetScore,
} = scoreSlice.actions;

export default scoreSlice.reducer;
