import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IonSpinner, IonText } from "@ionic/react";
import { Login } from "../legacy/routes/Login";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearFormError,
  completeRegistrationThunk,
  loginThunk,
  requestPasswordResetThunk,
  requestRegistrationOtpThunk,
  verifyRegistrationOtpThunk,
} from "../features/auth/authSlice";
import { buildLoginTarget } from "../features/auth/loginRedirect";
import type { LoginRedirectState } from "../features/auth/loginRedirect";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

function ensureEditorProfileIfMissing() {
  try {
    if (!localStorage.getItem("ow_profile")) {
      localStorage.setItem("ow_profile", JSON.stringify({ mode: "film" }));
    }
  } catch {
    /* ignore */
  }
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as { state?: LoginRedirectState };
  const dispatch = useAppDispatch();
  const lastError = useAppSelector((s) => s.auth.lastError);
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();
  const displayError = online ? lastError : t("login.offline");
  const offlineMessage = t("login.offline");

  const from = location.state?.from;
  const target = buildLoginTarget(from);

  useEffect(() => {
    if (token && user && restoreStatus === "ready") {
      ensureEditorProfileIfMissing();
      navigate(target, { replace: true });
    }
  }, [token, user, restoreStatus, navigate, target]);

  if (token && restoreStatus !== "ready") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#1a1b2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <IonSpinner name="crescent" style={{ color: "#5a587a", width: 32, height: 32 }} />
        <IonText
          style={{
            color: "#5a587a",
            fontFamily: "'Courier New',monospace",
            letterSpacing: "2px",
            fontSize: "11px",
          }}
        >
          {t("common.sessionRestore")}
        </IonText>
      </div>
    );
  }

  return (
    <Login
      authError={displayError}
      submitLogin={async (login, password) => {
        if (!navigator.onLine) throw new Error(offlineMessage);
        await dispatch(loginThunk({ login, password })).unwrap();
      }}
      submitRegisterEmail={async (email) => {
        if (!navigator.onLine) throw new Error(offlineMessage);
        await dispatch(requestRegistrationOtpThunk({ email })).unwrap();
      }}
      submitVerifyRegistrationOtp={async (email, otp) => {
        if (!navigator.onLine) throw new Error(offlineMessage);
        return await dispatch(verifyRegistrationOtpThunk({ email, otp })).unwrap();
      }}
      submitCompleteRegistration={async (email, setupToken, password) => {
        if (!navigator.onLine) throw new Error(offlineMessage);
        await dispatch(completeRegistrationThunk({ email, setupToken, password })).unwrap();
      }}
      submitPasswordReset={async (login) => {
        if (!navigator.onLine) throw new Error(offlineMessage);
        await dispatch(requestPasswordResetThunk({ login })).unwrap();
      }}
      onLogin={() => {
        dispatch(clearFormError());
        ensureEditorProfileIfMissing();
        navigate(target, { replace: true });
      }}
    />
  );
}
