import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchReferrals = createAsyncThunk(
  'referral/fetchReferrals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referral/list');
      return response.data.referrals || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch referrals');
    }
  }
);

export const shareReferral = createAsyncThunk(
  'referral/shareReferral',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const referralCode = state.auth.referralCode;
      
      // In a real app, this would use the native share API
      const shareUrl = `https://zyphora.app/r/${referralCode}`;
      
      // Simulate sharing - in production use expo-sharing or similar
      console.log('Sharing referral:', shareUrl);
      
      return { success: true, url: shareUrl };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to share referral');
    }
  }
);

const initialState = {
  referrals: [],
  referralCode: null,
  totalEarned: 0,
  totalCount: 0,
  loading: false,
  error: null,
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetReferrals: (state) => {
      state.referrals = [];
      state.referralCode = null;
      state.totalEarned = 0;
      state.totalCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Referrals
      .addCase(fetchReferrals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.referrals = action.payload || [];
        state.totalCount = action.payload?.length || 0;
        state.totalEarned = action.payload?.reduce((sum, r) => sum + (r.points_earned || 0), 0) || 0;
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Share Referral
      .addCase(shareReferral.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareReferral.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(shareReferral.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setReferralCode, clearError, resetReferrals } = referralSlice.actions;
export default referralSlice.reducer;
