import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchKycStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/kyc/status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const initiateKyc = createAsyncThunk(
  'kyc/initiateKyc',
  async (tierRequested, { rejectWithValue, getState }) => {
    try {
      const response = await api.post('/kyc/initiate', { tier_requested: tierRequested });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate KYC');
    }
  }
);

export const submitKycDocuments = createAsyncThunk(
  'kyc/submitKycDocuments',
  async (data, { rejectWithValue, getState }) => {
    try {
      const response = await api.post('/kyc/submit', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC documents');
    }
  }
);

const initialState = {
  kycStatus: null,
  kycData: null,
  loading: false,
  submitting: false,
  error: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetKyc: (state) => {
      state.kycStatus = null;
      state.kycData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch KYC Status
      .addCase(fetchKycStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: { verification_id?, status, tier, kyc_tier, steps: [...], ... } }
        const kycResponse = action.payload.data || action.payload.data?.data;
        if (kycResponse) {
          state.kycStatus = kycResponse.status || 'not_started';
          state.kycData = {
            verificationId: kycResponse.verification_id,
            status: kycResponse.status,
            tier: kycResponse.tier || 0,
            kycTier: kycResponse.kyc_tier || 0,
            providerReference: kycResponse.provider_reference,
            redirectUrl: kycResponse.redirect_url,
            tierCap: kycResponse.tier_cap,
            steps: kycResponse.steps || [],
            createdAt: kycResponse.created_at,
            updatedAt: kycResponse.updated_at,
          };
        }
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Initiate KYC
      .addCase(initiateKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateKyc.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: { verification_id, redirect_url, tier_cap, status, tier } }
        const initData = action.payload.data || action.payload.data?.data;
        if (initData) {
          state.kycData = {
            verificationId: initData.verification_id,
            redirectUrl: initData.redirect_url,
            tierCap: initData.tier_cap,
            status: initData.status,
            tier: initData.tier,
          };
          state.kycStatus = initData.status;
        }
      })
      .addCase(initiateKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit KYC Documents
      .addCase(submitKycDocuments.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitKycDocuments.fulfilled, (state, action) => {
        state.submitting = false;
        // Backend returns: { success: true, message: '...', data: { verification_id, status } }
        const submitData = action.payload.data || action.payload.data?.data;
        if (submitData) {
          state.kycData = {
            ...state.kycData,
            verificationId: submitData.verification_id,
            status: submitData.status,
          };
          state.kycStatus = submitData.status;
        }
      })
      .addCase(submitKycDocuments.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetKyc } = kycSlice.actions;
export default kycSlice.reducer;
