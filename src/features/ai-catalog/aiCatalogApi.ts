import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth } from "../auth/authSlice";
import { apiRequestBase } from "../../api/env";
import type {
  AdminEnvCheckRequest,
  AdminEnvCheckResponse,
  AiCatalogPublicResponse,
  AiGroupAdmin,
  AiGroupListAdminResponse,
  AiGroupWrapResponse,
  AiModelProviderListResponse,
  AiModelsImportBody,
  AiModelsImportResponse,
  AiReorderRequest,
  AiVariantAdmin,
  AiVariantWrapResponse,
  Uid,
} from "../../api/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiRequestBase(),
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
    verifyAdminEnvVar: build.mutation<AdminEnvCheckResponse, AdminEnvCheckRequest>({
      query: (body) => ({ url: "/api/admin/ai/env-check", method: "POST", body }),
    }),
    getAdminAiModelProviders: build.query<AiModelProviderListResponse, void>({
      query: () => ({ url: "/api/admin/ai/model-providers", method: "GET" }),
    }),
    importAdminAiModels: build.mutation<AiModelsImportResponse, { groupUid: Uid } & AiModelsImportBody>({
      query: ({ groupUid, ...body }) => ({
        url: `/api/admin/ai/groups/${groupUid}/models/import`,
        method: "POST",
        body,
      }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    createAiGroup: build.mutation<
      AiGroupAdmin,
      {
        slug: string;
        label: string;
        role?: string;
        color?: string;
        free?: boolean;
        api_key_env_var?: string;
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
        uid: Uid;
        slug?: string;
        label?: string;
        role?: string;
        color?: string;
        free?: boolean;
        api_key_env_var?: string;
        position?: number;
      }
    >({
      query: ({ uid, ...body }) => ({
        url: `/api/admin/ai/groups/${uid}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: AiGroupWrapResponse) => ({ ...r.group, variants: [] as AiVariantAdmin[] }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    deleteAiGroup: build.mutation<void, { uid: Uid }>({
      query: ({ uid }) => ({ url: `/api/admin/ai/groups/${uid}`, method: "DELETE" }),
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
      {
        groupUid: Uid;
        slug: string;
        provider_model_id: string;
        label?: string;
        is_default?: boolean;
        position?: number;
      }
    >({
      query: ({ groupUid, ...body }) => ({
        url: `/api/admin/ai/groups/${groupUid}/variants`,
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
        uid: Uid;
        slug?: string;
        provider_model_id?: string;
        label?: string;
        is_default?: boolean;
        position?: number;
      }
    >({
      query: ({ uid, ...body }) => ({
        url: `/api/admin/ai/variants/${uid}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r: AiVariantWrapResponse) => r.variant,
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    deleteAiVariant: build.mutation<void, { uid: Uid }>({
      query: ({ uid }) => ({ url: `/api/admin/ai/variants/${uid}`, method: "DELETE" }),
      invalidatesTags: () => [
        { type: "AiCatalog", id: "PUBLIC" },
        { type: "AiAdminGroups", id: "LIST" },
      ],
    }),
    reorderAiVariants: build.mutation<void, { groupUid: Uid } & AiReorderRequest>({
      query: ({ groupUid, uids }) => ({
        url: `/api/admin/ai/groups/${groupUid}/variants/order`,
        method: "PUT",
        body: { uids },
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
  useVerifyAdminEnvVarMutation,
  useGetAdminAiModelProvidersQuery,
  useImportAdminAiModelsMutation,
  useCreateAiGroupMutation,
  usePatchAiGroupMutation,
  useDeleteAiGroupMutation,
  useReorderAiGroupsMutation,
  useCreateAiVariantMutation,
  usePatchAiVariantMutation,
  useDeleteAiVariantMutation,
  useReorderAiVariantsMutation,
} = aiCatalogApi;
