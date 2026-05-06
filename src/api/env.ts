/**
 * Normalized API origin from `VITE_API_URL`: no trailing slashes, and no accidental
 * trailing `/api` segment (paths in this app already start with `/api/...`).
 */
export function apiBaseUrl(): string {
  let u = (import.meta.env.VITE_API_URL || "").trim();
  if (!u) return "";
  u = u.replace(/\/+$/, "");
  for (;;) {
    if (u.endsWith("/api")) {
      u = u.slice(0, -4).replace(/\/+$/, "");
      continue;
    }
    break;
  }
  return u;
}

/**
 * Base URL for JSON API requests: explicit `VITE_API_URL` when set, otherwise the
 * current page origin (and Vite `BASE_URL` when not `/`) so `/api/...` is not "orphaned"
 * from the app under a subpath.
 */
export function apiRequestBase(): string {
  const fromEnv = apiBaseUrl();
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined" || !window.location?.origin) return "";
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  if (!basePath || basePath === "/") return window.location.origin;
  return `${window.location.origin}${basePath}`;
}
