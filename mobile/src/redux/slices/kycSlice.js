import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchKycStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kyc/status');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const initiateKyc = createAsyncThunk(
  'kyc/initiateKyc',
  async (tierRequested, { rejectWithValue }) => {
    try {
      const response = await api.post('/kyc/initiate', { tier_requested: tierRequested });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate KYC');
    }
  }
);

export const submitKycDocuments = createAsyncThunk(
  'kyc/submitKycDocuments',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/kyc/submit', data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC documents');
    }
  }
);

const initialState = {
  kycStatus: null,
  kycData: null,
  loading: false,
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
        state.kycStatus = action.payload;
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
        state.kycData = action.payload;
      })
      .addCase(initiateKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit KYC Documents
      .addCase(submitKycDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitKycDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.kycData = action.payload;
      })
      .addCase(submitKycDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetKyc } = kycSlice.actions;
export default kycSlice.reducer;
