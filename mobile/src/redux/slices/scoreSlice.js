import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snapshot: null,
  lastSyncedAt: null,
};

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    setScore(state, action) {
      state.snapshot = action.payload;
      state.lastSyncedAt = new Date().toISOString();
    },
    clearScore(state) {
      state.snapshot = null;
      state.lastSyncedAt = null;
    },
  },
});

export const { setScore, clearScore } = scoreSlice.actions;
export default scoreSlice.reducer;
