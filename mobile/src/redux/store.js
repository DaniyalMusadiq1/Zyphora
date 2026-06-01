import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import scoreReducer from './slices/scoreSlice';
import streakReducer from './slices/streakSlice';
import referralReducer from './slices/referralSlice';
import taskReducer from './slices/taskSlice';
import leaderReducer from './slices/leaderSlice';
import kycReducer from './slices/kycSlice';
import { setAuthTokenGetter, setDeviceIdGetter } from './api';

const rootReducer = combineReducers({
  auth: authReducer,
  score: scoreReducer,
  streak: streakReducer,
  referral: referralReducer,
  task: taskReducer,
  leader: leaderReducer,
  kyc: kycReducer,
});

const persistConfig = {
  key: 'zyphora',
  storage: AsyncStorage,
  whitelist: ['auth', 'score', 'streak', 'referral', 'task', 'leader'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

setAuthTokenGetter(() => store.getState().auth.token);
setDeviceIdGetter(() => store.getState().auth.deviceId || '');
