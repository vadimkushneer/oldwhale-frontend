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
