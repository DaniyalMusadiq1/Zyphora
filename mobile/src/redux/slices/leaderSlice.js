import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rows: [],
};

const leaderSlice = createSlice({
  name: 'leader',
  initialState,
  reducers: {
    setLeaderboard(state, action) {
      state.rows = action.payload ?? [];
    },
  },
});

export const { setLeaderboard } = leaderSlice.actions;
export default leaderSlice.reducer;
