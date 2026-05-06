/** Mirrors `components.schemas` in oldwhale-backend OpenAPI — field names unchanged. */

/** UUID string (`components.schemas.UID` in backend OpenAPI). */
export type Uid = string;

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

/** Current-user `GET /api/ai/models` (optional auth; guests receive free groups only). */
export interface AiVariantPublic {
  uid: Uid;
  slug: string;
  label: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiGroupPublic {
  uid: Uid;
  slug: string;
  label: string;
  role: string;
  color: string;
  free: boolean;
  variants: AiVariantPublic[];
  created_at: string;
  updated_at: string;
}

export interface AiCatalogPublicResponse {
  groups: AiGroupPublic[];
}

export type EditorMode = "note" | "media" | "short" | "play" | "film";

/** One message in the AI panel thread (POST /api/ai/chat noteContext). */
export interface AiChatConversationMessage {
  id: string;
  role: "user" | "ai" | "sys";
  text: string;
  model?: string;
  modelVariant?: string;
}

export interface AiChatNoteContextRequest {
  conversationHistory: AiChatConversationMessage[];
  workfieldHtml: string;
}

/** POST /api/ai/chat (JSON keys match OpenAPI / Go `json` tags). */
export interface AiChatRequest {
  message: string;
  group_uid: Uid;
  variant_uid: Uid;
  editor_mode?: EditorMode;
  note_context?: AiChatNoteContextRequest;
}

export interface AiChatAcceptedResponse {
  request_uid: Uid;
  user_message_uid: Uid;
  assistant_message_uid: Uid;
}

export interface AiChatResponse {
  reply: string;
  user_message_uid: Uid;
  assistant_message_uid: Uid;
}

/** Admin nested variant row — mirrors `AiVariantAdmin` in OpenAPI. */
export interface AiVariantAdmin {
  uid: Uid;
  group_uid: Uid;
  slug: string;
  provider_model_id: string;
  label: string;
  is_default: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/** Admin group row — mirrors `AiGroupAdmin` in OpenAPI. */
export interface AiGroupAdmin {
  uid: Uid;
  slug: string;
  label: string;
  role: string;
  color: string;
  free: boolean;
  api_key_env_var: string;
  api_key_present: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
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
  uids: Uid[];
}

/** Admin `POST /api/admin/ai/env-check` — presence only; secret value is never returned. */
export interface AdminEnvCheckRequest {
  name: string;
}

export interface AdminEnvCheckResponse {
  name: string;
  present: boolean;
}

/** Admin `GET /api/admin/ai/model-providers` */
export interface AiModelProvider {
  id: string;
  label: string;
  modelsUrl: string;
}

export interface AiModelProviderListResponse {
  providers: AiModelProvider[];
}

/** Body for `POST /api/admin/ai/groups/{uid}/models/import` */
export interface AiModelsImportBody {
  providerId: string;
  modelsUrl: string;
  envVarName: string;
}

export interface AiModelsImportResponse {
  group: AiGroupAdmin;
  imported: number;
  modelsUrl: string;
}

/** Admin `GET /api/admin/ai/chat-logs` */
export interface AiChatLogUser {
  id: number;
  login: string;
  email: string;
}

/** Admin AI chat log table column visibility keys. */
export type AiChatLogColumnKey =
  | "id"
  | "time"
  | "user"
  | "message"
  | "reply"
  | "model"
  | "message_ids"
  | "ip_ua"
  | "editor_mode"
  | "note_context";

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
  editor_mode?: string | null;
  note_context?: Record<string, unknown> | null;
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
  editor_mode?: EditorMode;
}

export interface AiChatLogTableSettings {
  columns: Partial<Record<AiChatLogColumnKey, boolean>>;
  updated_at?: string | null;
}

export interface AdminUiSettingsResponse {
  aiChatLogTable: AiChatLogTableSettings;
}

export interface AdminUiSettingsPutRequest {
  aiChatLogTable: {
    columns: Partial<Record<AiChatLogColumnKey, boolean>>;
  };
}
