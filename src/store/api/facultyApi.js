import { baseApi } from "./baseApi";

export const facultyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getFacultyDashboard: builder.query({
      query: () => "/faculty/dashboard",
      providesTags: ["Dashboard"],
    }),

    // Clubs - olib tashlangan fakultet filtri
    getFacultyClubs: builder.query({
      query: (params) => ({
        url: "/faculty/clubs",
        params,
      }),
      providesTags: ["Club"],
    }),

    createClub: builder.mutation({
      query: (data) => ({
        url: "/faculty/club",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Club", "Dashboard"],
    }),

    updateClub: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/faculty/club/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Club"],
    }),

    deleteClub: builder.mutation({
      query: (id) => ({
        url: `/faculty/club/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Club", "Dashboard"],
    }),

    // Tutors
    getFacultyTutors: builder.query({
      query: () => "/faculty/tutors",
      providesTags: ["Tutor"],
    }),

    createTutor: builder.mutation({
      query: (data) => ({
        url: "/faculty/tutor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tutor", "Dashboard"],
    }),

    updateTutor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/faculty/tutor/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tutor"],
    }),

    deleteTutor: builder.mutation({
      query: (id) => ({
        url: `/faculty/tutor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tutor", "Dashboard"],
    }),

    // Students - barcha studentlar (filtrlash orqali fakultet bo'yicha)
    getFacultyStudents: builder.query({
      query: (params) => ({
        url: "/faculty/students",
        params,
      }),
      providesTags: ["Student"],
    }),

    // Club enrollments - barcha fakultetlardan
    getClubEnrollments: builder.query({
      query: (params) => ({
        url: "/faculty/enrollments",
        params,
      }),
      providesTags: ["Enrollment"],
    }),

    // Process enrollment
    processEnrollment: builder.mutation({
      query: ({ id, action, rejectionReason }) => ({
        url: `/faculty/enrollment/${id}/process`,
        method: "POST",
        body: { action, rejectionReason },
      }),
      invalidatesTags: ["Enrollment", "Student", "Club"],
    }),

    // Attendance
    getFacultyAttendance: builder.query({
      query: (params) => ({
        url: "/faculty/attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    // Get all faculties for club creation
    getAllFaculties: builder.query({
      query: () => "/faculties",
      providesTags: ["Faculty"],
    }),

    // Get all groups
    getAllGroups: builder.query({
      query: (facultyId) => ({
        url: "/groups",
        params: facultyId ? { facultyId } : {},
      }),
      providesTags: ["Group"],
    }),
  }),
});

export const {
  useGetFacultyDashboardQuery,
  useGetFacultyClubsQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useGetFacultyTutorsQuery,
  useCreateTutorMutation,
  useUpdateTutorMutation,
  useDeleteTutorMutation,
  useGetFacultyStudentsQuery,
  useGetClubEnrollmentsQuery,
  useProcessEnrollmentMutation,
  useGetFacultyAttendanceQuery,
  useGetAllFacultiesQuery,
  useGetAllGroupsQuery,
} = facultyApi;
