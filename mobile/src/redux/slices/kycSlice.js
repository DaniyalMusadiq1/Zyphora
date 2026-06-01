import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/kyc/status');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const initiateKyc = createAsyncThunk(
  'kyc/initiate',
  async (tierRequested, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/kyc/initiate', { tier_requested: tierRequested });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate KYC');
    }
  }
);

export const submitKycDocuments = createAsyncThunk(
  'kyc/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/kyc/submit', payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit documents');
    }
  }
);

const initialState = {
  kycData: null,
  loading: false,
  error: null,
  verificationId: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearKycError: (state) => {
      state.error = null;
    },
    resetKyc: (state) => {
      state.kycData = null;
      state.error = null;
      state.verificationId = null;
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
        state.kycData = action.payload;
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
        state.verificationId = action.payload.verification_id;
        state.kycData = {
          ...state.kycData,
          ...action.payload,
          status: 'pending',
        };
      })
      .addCase(initiateKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Documents
      .addCase(submitKycDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKycDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.kycData = {
          ...state.kycData,
          ...action.payload,
          status: 'reviewing',
        };
      })
      .addCase(submitKycDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearKycError, resetKyc } = kycSlice.actions;
export default kycSlice.reducer;
