import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Login } from "../legacy/routes/Login";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearFormError, loginThunk, registerThunk } from "../features/auth/authSlice";

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

  const from = location.state?.from;
  const target = from?.pathname ? `${from.pathname}${from.search || ""}` : "/editor";

  useEffect(() => {
    if (token && user && restoreStatus === "ready") {
      ensureEditorProfileIfMissing();
      navigate(target, { replace: true });
    }
  }, [token, user, restoreStatus, navigate, target]);

  return (
    <Login
      authError={lastError}
      submitLogin={async (login, password) => {
        await dispatch(loginThunk({ login, password })).unwrap();
      }}
      submitRegister={async (login, email, password) => {
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
