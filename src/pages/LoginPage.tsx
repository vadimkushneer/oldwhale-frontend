import { useNavigate, useLocation } from "react-router-dom";
import { Login } from "../legacy/routes/Login";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearFormError, loginThunk, registerThunk } from "../features/auth/authSlice";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string; search?: string } } };
  const dispatch = useAppDispatch();
  const lastError = useAppSelector((s) => s.auth.lastError);

  const from = location.state?.from;
  const target = from?.pathname ? `${from.pathname}${from.search || ""}` : "/editor";

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
        navigate(target, { replace: true });
      }}
    />
  );
}
