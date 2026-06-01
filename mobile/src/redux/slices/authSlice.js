import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  token: null,
  userId: null,
  referralCode: null,
  deviceId: null,
  phone: '',
  email: '',
  displayName: "ali",
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {     
      state.token = action.payload.token ?? null;
      state.userId = action.payload.userId ?? null;
      state.referralCode = action.payload.referralCode ?? null;
    },
    setProfile(state, action) {
      const u = action.payload || {};
      if (u.id != null) {
        state.userId = u.id;
      }
      if (u.referral_code != null) {
        state.referralCode = u.referral_code;
      }
      const raw = u.name;
      state.displayName = raw != null && String(raw).trim() ? String(raw).trim() : '';
      state.email = u.email != null ? String(u.email) : '';
    },
    setDeviceId(state, action) {
      state.deviceId = action.payload;
    },
    setPhone(state, action) {
      state.phone = action.payload;
    },
    logout(state) {
      state.token = null;
      state.userId = null;
      state.referralCode = null;
      state.displayName = '';
      state.email = '';
    },
  },
});

export const { setCredentials, setDeviceId, setPhone, setProfile, logout } = authSlice.actions;
export default authSlice.reducer;
