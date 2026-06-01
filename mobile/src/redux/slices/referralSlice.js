import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  code: null,
  list: [],
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setReferralMeta(state, action) {
      state.code = action.payload.code ?? null;
    },
    setReferralList(state, action) {
      state.list = action.payload ?? [];
    },
  },
});

export const { setReferralMeta, setReferralList } = referralSlice.actions;
export default referralSlice.reducer;
