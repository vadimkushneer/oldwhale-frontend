import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, createPaymentThunk, restoreSession } from "../../features/auth/authSlice";
import { CREDITS_TOPUP_PRESETS, formatCredits } from "../../features/credits/credits";
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
  creditsText: string;
  topUpPresets: readonly number[];
  topUpBusy: boolean;
  topUpError: string | null;
  onTopUp: (amount: number) => void;
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

  const [topUpBusy, setTopUpBusy] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  const onTopUp = useCallback(
    async (amount: number) => {
      setTopUpError(null);
      setTopUpBusy(true);
      try {
        // Register the order on the gateway, then hand the browser off to the
        // hosted payment page. Credits are granted only after the gateway
        // confirms payment (handled by the /payment/return page on the way back).
        const payment = await dispatch(createPaymentThunk({ credits: amount })).unwrap();
        if (payment.formUrl) {
          window.location.assign(payment.formUrl);
          return; // navigating away — keep the busy state so buttons stay disabled
        }
        setTopUpError("Платёжный шлюз не вернул ссылку на оплату");
        setTopUpBusy(false);
      } catch (e: unknown) {
        setTopUpError(typeof e === "string" ? e : "Не удалось начать оплату");
        setTopUpBusy(false);
      }
    },
    [dispatch],
  );

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
    creditsText: formatCredits(user?.credits ?? 0),
    topUpPresets: CREDITS_TOPUP_PRESETS,
    topUpBusy,
    topUpError,
    onTopUp,
    onRefresh,
    onLogout,
  };
}
