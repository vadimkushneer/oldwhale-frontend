import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, restoreSession } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

/** Sends the user back to `/profile` after they re-authenticate from the login form. */
export const PROFILE_LOGIN_REDIRECT_STATE = { from: { pathname: "/profile", search: "" } };

export type ProfilePhase =
  | "redirect-login"
  | "session-restore"
  | "unavailable"
  | "ready";

export type ProfileFieldTone = "default" | "muted";

export interface ProfileField {
  key: string;
  label: string;
  value: string;
  tone: ProfileFieldTone;
}

export interface UseProfileResult {
  phase: ProfilePhase;
  online: boolean;
  refreshing: boolean;
  isAdmin: boolean;
  monogram: string;
  displayName: string;
  roleLabel: string;
  fields: ProfileField[];
  onRefresh: () => void;
  onLogout: () => void;
}

/** Renders an ISO timestamp using the local Russian locale, mirroring the admin tables. */
function formatCreatedAt(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return iso;
  }
}

/**
 * Backs the read-only personal profile screen. The account record is the same
 * `state.auth.user` populated from `GET /api/me` on session restore, so the
 * page never duplicates that fetch — "ОБНОВИТЬ" simply re-validates the JWT
 * through `restoreSession`, which refreshes the very same store slice.
 */
export function useProfile(): UseProfileResult {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();

  const onRefresh = useCallback(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  const onLogout = useCallback(() => {
    dispatch(clearAuth());
    try {
      localStorage.removeItem("ow_profile");
    } catch {
      /* ignore */
    }
    navigate("/", { replace: true });
  }, [dispatch, navigate]);

  const phase = useMemo<ProfilePhase>(() => {
    if (!token) return "redirect-login";
    if (user) return "ready";
    return restoreStatus === "ready" ? "unavailable" : "session-restore";
  }, [token, user, restoreStatus]);

  const isAdmin = user?.role === "admin";
  const displayName = user?.login ?? "";
  const roleLabel = isAdmin ? "Администратор" : "Пользователь";
  const monogram = (displayName.trim()[0] ?? "?").toUpperCase();

  const fields = useMemo<ProfileField[]>(() => {
    if (!user) return [];
    return [
      { key: "login", label: "ЛОГИН", value: user.login, tone: "default" },
      { key: "email", label: "ПОЧТА", value: user.email, tone: "default" },
      { key: "role", label: "РОЛЬ", value: roleLabel, tone: "default" },
      { key: "status", label: "СТАТУС", value: user.disabled ? "Отключён" : "Активен", tone: "default" },
      { key: "created", label: "РЕГИСТРАЦИЯ", value: formatCreatedAt(user.created_at), tone: "muted" },
      { key: "id", label: "ID", value: String(user.id), tone: "muted" },
    ];
  }, [user, roleLabel]);

  return {
    phase,
    online,
    refreshing: restoreStatus === "restoring",
    isAdmin,
    monogram,
    displayName,
    roleLabel,
    fields,
    onRefresh,
    onLogout,
  };
}
