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

/** POST /api/ai/chat */
export interface AiChatRequest {
  message: string;
  groupSlug: string;
  variantSlug: string;
}

export interface AiChatResponse {
  reply: string;
  userMessageId: string;
  assistantMessageId: string;
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
  /** Provider API key (sensitive; may be empty or omitted by API). */
  apiKey?: string;
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

/** Admin `GET /api/admin/ai/chat-logs` */
export interface AiChatLogUser {
  id: number;
  login: string;
  email: string;
}

export interface AiChatLogItem {
  id: number;
  created_at: string;
  user_id: number | null;
  message: string;
  group_slug: string;
  variant_slug: string;
  reply: string;
  user_message_id: string;
  assistant_message_id: string;
  client_ip: string | null;
  user_agent: string | null;
  user: AiChatLogUser | null;
}

export interface AiChatLogListResponse {
  items: AiChatLogItem[];
  total: number;
}

/** Query params for admin chat log listing (optional fields). */
export interface AiChatLogListParams {
  limit?: number;
  offset?: number;
  id?: number;
  from?: string;
  to?: string;
  user_id?: number;
  group_slug?: string;
  variant_slug?: string;
  message_contains?: string;
  reply_contains?: string;
  user_message_id?: string;
  assistant_message_id?: string;
  client_ip?: string;
  user_agent?: string;
  login_contains?: string;
  email_contains?: string;
}
