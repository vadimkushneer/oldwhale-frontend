/** Mirrors `components.schemas` in oldwhale-backend OpenAPI — field names unchanged. */

export type UserRole = "user" | "admin";

export interface User {
  id: number;
  login: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
}

export interface AuthTokenResponse {
  token: string;
  user: User;
}

export interface UserListResponse {
  users: User[];
}

export interface UserWrapResponse {
  user: User;
}

export interface ApiErrorBody {
  error: string;
}

/** Public `GET /api/ai/models` */
export interface AiVariantPublic {
  id: number;
  slug: string;
  label: string;
  is_default: boolean;
}

export interface AiGroupPublic {
  id: number;
  slug: string;
  label: string;
  role: string;
  color: string;
  free: boolean;
  variants: AiVariantPublic[];
}

export interface AiCatalogPublicResponse {
  groups: AiGroupPublic[];
}

/** Admin nested variant row */
export interface AiVariantAdmin {
  id: number;
  group_id: number;
  slug: string;
  label: string;
  is_default: boolean;
  position: number;
  created_at: string;
}

export interface AiGroupAdmin {
  id: number;
  slug: string;
  label: string;
  role: string;
  color: string;
  free: boolean;
  position: number;
  created_at: string;
  variants: AiVariantAdmin[];
}

export interface AiGroupListAdminResponse {
  groups: AiGroupAdmin[];
}

export interface AiGroupWrapResponse {
  group: Omit<AiGroupAdmin, "variants">;
}

export interface AiVariantWrapResponse {
  variant: AiVariantAdmin;
}

export interface AiReorderRequest {
  ids: number[];
}
