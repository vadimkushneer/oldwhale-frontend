import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth } from "../auth/authSlice";
import { apiBaseUrl } from "../../api/env";
import type { User, UserListResponse, UserWrapResponse } from "../../api/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const t = (getState() as { auth: { token: string | null } }).auth.token;
    if (t) headers.set("Authorization", `Bearer ${t}`);
    return headers;
  },
});

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: async (args, api, extraOptions) => {
    const res = await rawBaseQuery(args, api, extraOptions);
    if (res.error?.status === 401) api.dispatch(clearAuth());
    return res;
  },
  tagTypes: ["UserList"],
  endpoints: (build) => ({
    listUsers: build.query<User[], void>({
      query: () => ({ url: "/api/admin/users", method: "GET" }),
      transformResponse: (r: UserListResponse) => r.users,
      providesTags: () => [{ type: "UserList", id: "LIST" }],
    }),
    createUser: build.mutation<
      User,
      { login: string; email: string; password: string; role?: "user" | "admin" }
    >({
      query: (body) => ({ url: "/api/admin/users", method: "POST", body }),
      transformResponse: (r: UserWrapResponse) => r.user,
      invalidatesTags: () => [{ type: "UserList", id: "LIST" }],
    }),
    patchUser: build.mutation<
      User,
      { id: number; disabled?: boolean; role?: "user" | "admin" }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/users/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: UserWrapResponse) => r.user,
      invalidatesTags: () => [{ type: "UserList", id: "LIST" }],
    }),
    deleteUser: build.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: () => [{ type: "UserList", id: "LIST" }],
    }),
  }),
});

export const { useListUsersQuery, useCreateUserMutation, usePatchUserMutation, useDeleteUserMutation } =
  adminApi;
