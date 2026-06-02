import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchReferrals = createAsyncThunk(
  'referral/fetchReferrals',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/referral/list');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch referrals');
    }
  }
);

export const generateReferralCode = createAsyncThunk(
  'referral/generateReferralCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referral/generate');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate referral code');
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
  shareUrl: null,
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
      state.shareUrl = null;
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
        // Backend returns: { referrals: [...] }
        const referralsData = action.payload.referrals || action.payload.data?.referrals || [];
        state.referrals = referralsData.map(r => ({
          id: r.id,
          refereeId: r.referee_id,
          refereeName: r.referee?.name || 'Unknown',
          refereeScore: r.referee?.depth_score_d || 0,
          qualityScore: r.quality_score || 0,
          gammaPenalty: r.gamma_penalty || 1,
          joinedAt: r.created_at,
        }));
        state.totalCount = state.referrals.length;
        state.totalEarned = state.referrals.reduce((sum, r) => sum + (r.qualityScore || 0), 0);
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Referral Code
      .addCase(generateReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.referralCode = action.payload.referral_code;
        state.shareUrl = action.payload.share_url;
      })
      .addCase(generateReferralCode.rejected, (state, action) => {
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
