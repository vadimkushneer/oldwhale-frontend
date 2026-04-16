export function apiBaseUrl(): string {
  const u = (import.meta.env.VITE_API_URL || "").trim();
  if (!u) return "";
  return u.replace(/\/+$/, "");
}
