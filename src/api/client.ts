const base = () => import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

export function getToken(): string | null {
  try {
    return localStorage.getItem("ow_token");
  } catch {
    return null;
  }
}

export function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem("ow_token", t);
    else localStorage.removeItem("ow_token");
  } catch {
    /* ignore */
  }
}

async function req<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const r = await fetch(`${base()}${path}`, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!r.ok) {
    const err = (data as { error?: string })?.error || r.statusText;
    throw new Error(err);
  }
  return data as T;
}

export type User = {
  id: number;
  login: string;
  email: string;
  role: string;
  disabled: boolean;
  created_at: string;
};

export const api = {
  login: (login: string, password: string) =>
    req<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      json: { login, password },
    }),
  register: (login: string, email: string, password: string) =>
    req<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      json: { login, email, password },
    }),
  me: () => req<User>("/api/me"),
  adminUsers: () => req<{ users: User[] }>("/api/admin/users"),
  adminCreateUser: (body: {
    login: string;
    email: string;
    password: string;
    role?: string;
  }) => req<{ user: User }>("/api/admin/users", { method: "POST", json: body }),
  adminPatchUser: (id: number, body: { disabled?: boolean; role?: string }) =>
    req<{ user: User }>(`/api/admin/users/${id}`, { method: "PATCH", json: body }),
  adminDeleteUser: (id: number) =>
    req<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
};
