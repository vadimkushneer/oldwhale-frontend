import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth } from "../auth/authSlice";
import { apiBaseUrl } from "../../api/env";
import type {
  AiCatalogPublicResponse,
  AiGroupAdmin,
  AiGroupListAdminResponse,
  AiGroupWrapResponse,
  AiReorderRequest,
  AiVariantAdmin,
  AiVariantWrapResponse,
} from "../../api/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const t = (getState() as { auth: { token: string | null } }).auth.token;
    if (t) headers.set("Authorization", `Bearer ${t}`);
    return headers;
  },
});

export const aiCatalogApi = createApi({
  reducerPath: "aiCatalogApi",
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: async (args, api, extraOptions) => {
    const res = await rawBaseQuery(args, api, extraOptions);
    if (res.error?.status === 401) api.dispatch(clearAuth());
    return res;
  },
  tagTypes: ["AiCatalog", "AiAdminGroups"],
  endpoints: (build) => ({
    getPublicCatalog: build.query<AiCatalogPublicResponse, void>({
      query: () => ({ url: "/api/ai/models", method: "GET" }),
      providesTags: () => [{ type: "AiCatalog", id: "PUBLIC" }],
    }),
    getAdminAiGroups: build.query<AiGroupAdmin[], void>({
      query: () => ({ url: "/api/admin/ai/groups", method: "GET" }),
      transformResponse: (r: AiGroupListAdminResponse) => r.groups,
      providesTags: () => [{ type: "AiAdminGroups", id: "LIST" }],
    }),
    createAiGroup: build.mutation<
      AiGroupAdmin,
      {
        slug: string;
        label: string;
        role?: string;
        color?: string;
        free?: boolean;
        apiKey?: string;
        position?: number;
      }
    >({
      query: (body) => ({ url: "/api/admin/ai/groups", method: "POST", body }),
      transformResponse: (r: AiGroupWrapResponse) => ({ ...r.group, variants: [] as AiVariantAdmin[] }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    patchAiGroup: build.mutation<
      AiGroupAdmin,
      {
        id: number;
        slug?: string;
        label?: string;
        role?: string;
        color?: string;
        free?: boolean;
        apiKey?: string;
        position?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/ai/groups/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: AiGroupWrapResponse) => ({ ...r.group, variants: [] as AiVariantAdmin[] }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    deleteAiGroup: build.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/ai/groups/${id}`, method: "DELETE" }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    reorderAiGroups: build.mutation<void, AiReorderRequest>({
      query: (body) => ({ url: "/api/admin/ai/groups/order", method: "PUT", body }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    createAiVariant: build.mutation<
      AiVariantWrapResponse["variant"],
      { groupId: number; slug: string; label?: string; is_default?: boolean; position?: number }
    >({
      query: ({ groupId, ...body }) => ({
        url: `/api/admin/ai/groups/${groupId}/variants`,
        method: "POST",
        body,
      }),
      transformResponse: (r: AiVariantWrapResponse) => r.variant,
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    patchAiVariant: build.mutation<
      AiVariantWrapResponse["variant"],
      {
        id: number;
        slug?: string;
        label?: string;
        is_default?: boolean;
        position?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/ai/variants/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: AiVariantWrapResponse) => r.variant,
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    deleteAiVariant: build.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `/api/admin/ai/variants/${id}`, method: "DELETE" }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    reorderAiVariants: build.mutation<void, { groupId: number } & AiReorderRequest>({
      query: ({ groupId, ids }) => ({
        url: `/api/admin/ai/groups/${groupId}/variants/order`,
        method: "PUT",
        body: { ids },
      }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPublicCatalogQuery,
  useLazyGetPublicCatalogQuery,
  useGetAdminAiGroupsQuery,
  useCreateAiGroupMutation,
  usePatchAiGroupMutation,
  useDeleteAiGroupMutation,
  useReorderAiGroupsMutation,
  useCreateAiVariantMutation,
  usePatchAiVariantMutation,
  useDeleteAiVariantMutation,
  useReorderAiVariantsMutation,
} = aiCatalogApi;
