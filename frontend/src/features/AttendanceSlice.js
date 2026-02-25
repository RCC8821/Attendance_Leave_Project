// src/features/attendance/attendanceApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://attendance-leave-project-seven.vercel.app/api/',
    prepareHeaders: (headers) => {
      // Add auth token here later if needed
      // headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['Attendance', 'UserData', 'Dropdown'],

  endpoints: (builder) => ({

    // Get dropdown / user data
    getDropdownUserData: builder.query({
      query: () => 'DropdownUserData',
      providesTags: ['Dropdown'],
    }),

    // Get today's attendance records for one user
    getAttendanceByEmailAndDate: builder.query({
      query: ({ email, date }) => ({
        url: 'attendance',
        params: { email, date },
      }),
      providesTags: (result, error, { email }) => [{ type: 'Attendance', id: email }],
    }),

    // Submit attendance (Check-in / Check-out)
    submitAttendance: builder.mutation({
      query: (payload) => ({
        url: 'attendance-Form',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: 'Attendance', id: payload.email },
      ],
    }),

  }),
});

// Auto-generated hooks
export const {
  useGetDropdownUserDataQuery,
  useGetAttendanceByEmailAndDateQuery,
  useLazyGetAttendanceByEmailAndDateQuery,   // ← useful for manual trigger
  useSubmitAttendanceMutation,
} = attendanceApi;