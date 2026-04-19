import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Login } from "../legacy/routes/Login";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearFormError, loginThunk, registerThunk } from "../features/auth/authSlice";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

const OFFLINE_MESSAGE = "Нет подключения к сети — вход и регистрация недоступны.";

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
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string; search?: string } } };
  const dispatch = useAppDispatch();
  const lastError = useAppSelector((s) => s.auth.lastError);
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);
  const online = useOnlineStatus();
  const displayError = online ? lastError : OFFLINE_MESSAGE;

  const from = location.state?.from;
  const target = from?.pathname ? `${from.pathname}${from.search || ""}` : "/editor";

  /**
   * Do not trap a still-authenticated user on the login form. As soon as the
   * persisted session is confirmed (restore finished with a user), bounce back
   * to the original destination.
   */
  useEffect(() => {
    if (token && user && restoreStatus === "ready") {
      ensureEditorProfileIfMissing();
      navigate(target, { replace: true });
    }
  }, [token, user, restoreStatus, navigate, target]);

  /**
   * While the app is revalidating an existing token against `/api/me`, show a
   * restoring indicator instead of the login form — otherwise a logged-in user
   * briefly sees (and could accidentally re-submit to) the credentials screen.
   */
  if (token && restoreStatus !== "ready") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#1a1b2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5a587a",
          fontFamily: "'Courier New',monospace",
          letterSpacing: "2px",
          fontSize: "11px",
        }}
      >
        ВОССТАНОВЛЕНИЕ СЕССИИ…
      </div>
    );
  }

  return (
    <Login
      authError={displayError}
      submitLogin={async (login, password) => {
        if (!navigator.onLine) throw new Error(OFFLINE_MESSAGE);
        await dispatch(loginThunk({ login, password })).unwrap();
      }}
      submitRegister={async (login, email, password) => {
        if (!navigator.onLine) throw new Error(OFFLINE_MESSAGE);
        await dispatch(registerThunk({ login, email, password })).unwrap();
      }}
      onLogin={() => {
        dispatch(clearFormError());
        ensureEditorProfileIfMissing();
        navigate(target, { replace: true });
      }}
    />
  );
}
