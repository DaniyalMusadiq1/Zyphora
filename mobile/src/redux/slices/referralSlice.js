import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api'; // Ensure this path matches your api utility

// Async Thunks
export const fetchReferrals = createAsyncThunk(
  'referrals/fetchReferrals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch referrals');
    }
  }
);

export const shareReferral = createAsyncThunk(
  'referrals/shareReferral',
  async ({ code }, { rejectWithValue }) => {
    try {
      // Logic for sharing (usually client-side clipboard, but can track analytics here)
      return { success: true, code };
    } catch (error) {
      return rejectWithValue('Failed to share referral');
    }
  }
);

const initialState = {
  list: [],
  code: null,
  loading: false,
  error: null,
  totalEarnings: 0,
};

const referralSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    setReferralCode: (state, action) => {
      state.code = action.payload;
    },
    clearReferralError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferrals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.totalEarnings = action.payload.total_earnings || 0;
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(shareReferral.pending, (state) => {
        state.loading = true;
      })
      .addCase(shareReferral.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setReferralCode, clearReferralError } = referralSlice.actions;
export default referralSlice.reducer;