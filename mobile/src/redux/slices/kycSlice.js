import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async Thunks
export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/kyc/status');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const submitKycDocuments = createAsyncThunk(
  'kyc/submitDocuments',
  async ({ documentType, frontImage, backImage, selfieImage }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text data
      formData.append('document_type', documentType);
      
      // Append images with proper filename and type for backend processing
      if (frontImage) {
        formData.append('document_front', {
          uri: frontImage.uri || frontImage,
          name: frontImage.fileName || 'front.jpg',
          type: frontImage.mime || 'image/jpeg',
        });
      }
      
      if (backImage) {
        formData.append('document_back', {
          uri: backImage.uri || backImage,
          name: backImage.fileName || 'back.jpg',
          type: backImage.mime || 'image/jpeg',
        });
      }

      if (selfieImage) {
        formData.append('selfie', {
          uri: selfieImage.uri || selfieImage,
          name: selfieImage.fileName || 'selfie.jpg',
          type: selfieImage.mime || 'image/jpeg',
        });
      }

      const response = await api.post('/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('KYC Upload Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to upload documents');
    }
  }
);

const initialState = {
  status: 'not_started', // not_started, pending, verified, rejected
  tier: 0,
  rejectionReason: null,
  submittedAt: null,
  reviewedAt: null,
  loading: false,
  uploading: false,
  error: null,
  progress: 0, // For upload progress if implemented
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    resetKycState: (state) => {
      state.status = 'not_started';
      state.tier = 0;
      state.rejectionReason = null;
      state.error = null;
    },
    clearKycError: (state) => {
      state.error = null;
    },
    // Optimistic update if needed
    setLocalStatus: (state, action) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Status
      .addCase(fetchKycStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status || 'not_started';
        state.tier = action.payload.tier || 0;
        state.rejectionReason = action.payload.rejection_reason || null;
        state.submittedAt = action.payload.submitted_at || null;
        state.reviewedAt = action.payload.reviewed_at || null;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit Documents
      .addCase(submitKycDocuments.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(submitKycDocuments.fulfilled, (state, action) => {
        state.uploading = false;
        state.status = 'pending'; // Automatically set to pending after upload
        state.submittedAt = new Date().toISOString();
        state.rejectionReason = null;
        state.progress = 100;
      })
      .addCase(submitKycDocuments.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
        state.progress = 0;
      });
  },
});

export const { 
  resetKycState, 
  clearKycError, 
  setLocalStatus 
} = kycSlice.actions;

export default kycSlice.reducer;