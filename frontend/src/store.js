// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { attendanceApi } from '../src/features/AttendanceSlice';
export const store = configureStore({
  reducer: {
    [attendanceApi.reducerPath]: attendanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(attendanceApi.middleware),
});



