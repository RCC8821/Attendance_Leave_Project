// src/features/attendance/AttendanceSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',           // unique name for this api slice
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',                      // ← adjust if your API has different base path
    // prepareHeaders: (headers) => {
    //   headers.set('Authorization', `Bearer ${token}`);
    //   return headers;
    // },
  }),

  tagTypes: ['DropdownUsers'],            // for auto-refetching when needed

  endpoints: (builder) => ({

    // ────────────────────────────────────────────────
    //   Get all users for dropdown (your API)
    // ────────────────────────────────────────────────
    getDropdownUserData: builder.query({
      query: () => ({
        url: '/DropdownUserData',
        method: 'GET',
      }),

      // Optional: transform the response to make it easier to use
      transformResponse: (response) => {
        // response = { success: true, count: 42, data: [...] }
        if (!response?.success) {
          throw new Error(response?.error || 'Failed to load dropdown users');
        }
        return response.data || []; // return only the array of users
      },

      providesTags: ['DropdownUsers'],
    }),

    // ────────────────────────────────────────────────
    //   You can add more endpoints later, e.g.:
    // ────────────────────────────────────────────────
    // markAttendance: builder.mutation({...}),
    // getAttendanceSummary: builder.query({...}),

  }),
});

// Auto-generated hooks
export const {
  useGetDropdownUserDataQuery,
  // useMarkAttendanceMutation,
  // useGetAttendanceSummaryQuery,
} = attendanceApi;

// If you're using the older injectEndpoints style (less common now):
// export const enhancedApi = attendanceApi.enhanceEndpoints({ ... });