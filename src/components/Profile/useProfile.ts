import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { clearAuth, restoreSession, topUpCreditsThunk } from "../../features/auth/authSlice";
import { createPaymentThunk, type CreatePaymentRejected } from "../../features/payments/paymentsThunks";
import { CREDITS_TOPUP_PRESETS, formatCredits } from "../../features/credits/credits";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { formatAppDateTime } from "../../i18n/locale";

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

export function useProfile(): UseProfileResult {
  const { t } = useTranslation();
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
        const payment = await dispatch(createPaymentThunk({ credits: amount })).unwrap();
        window.location.href = payment.formUrl;
      } catch (e: unknown) {
        const rejected = e as CreatePaymentRejected | string;
        if (typeof rejected === "object" && rejected?.status === 503) {
          try {
            await dispatch(topUpCreditsThunk({ amount })).unwrap();
            return;
          } catch (fallbackError: unknown) {
            setTopUpError(
              typeof fallbackError === "string" ? fallbackError : t("profile.topUpFailed"),
            );
            return;
          }
        }
        const message =
          typeof rejected === "object" && rejected?.message
            ? rejected.message
            : typeof e === "string"
              ? e
              : t("profile.paymentStartFailed");
        setTopUpError(message);
      } finally {
        setTopUpBusy(false);
      }
    },
    [dispatch, t],
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
  const roleLabel = isAdmin ? t("profile.roleAdmin") : t("profile.roleUser");
  const monogram = (displayName.trim()[0] ?? "?").toUpperCase();

  const fields = useMemo<ProfileField[]>(() => {
    if (!user) return [];
    return [
      { key: "login", label: t("profile.fields.login"), value: user.login, tone: "default" },
      { key: "email", label: t("profile.fields.email"), value: user.email, tone: "default" },
      { key: "role", label: t("profile.fields.role"), value: roleLabel, tone: "default" },
      {
        key: "status",
        label: t("profile.fields.status"),
        value: user.disabled ? t("profile.statusDisabled") : t("profile.statusActive"),
        tone: "default",
      },
      {
        key: "created",
        label: t("profile.fields.created"),
        value: formatAppDateTime(user.created_at),
        tone: "muted",
      },
      { key: "id", label: "ID", value: String(user.id), tone: "muted" },
    ];
  }, [user, roleLabel, t]);

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
