import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    setStreak(state, action) {
      state.data = action.payload;
    },
  },
});

export const { setStreak } = streakSlice.actions;
export default streakSlice.reducer;
