import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { acknowledgeSessionExpired } from "../features/auth/authSlice";
import { buildLoginRedirectState } from "../features/auth/loginRedirect";
import { useAppDispatch, useAppSelector } from "../hooks";

export function SessionExpiredRedirect() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired);

  useEffect(() => {
    if (!sessionExpired) return;

    if (location.pathname !== "/login") {
      navigate("/login", {
        replace: true,
        state: buildLoginRedirectState(location),
      });
    }

    dispatch(acknowledgeSessionExpired());
  }, [
    dispatch,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    sessionExpired,
  ]);

  return null;
}
