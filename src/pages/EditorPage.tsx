import { useCallback, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { EditorScreen } from "../legacy/legacyUiBundle";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearAuth } from "../features/auth/authSlice";

type Profile = { mode?: string; id?: string; label?: string; color?: string; desc?: string; num?: string };

function readProfile(): Profile | null {
  try {
    const raw = localStorage.getItem("ow_profile");
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function EditorPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);

  const profile = useMemo(() => readProfile(), []);

  const needsAuth = profile?.mode !== "note";
  const isGuest = profile?.mode === "note" && !token;

  const onLogout = useCallback(() => {
    dispatch(clearAuth());
    try {
      localStorage.removeItem("ow_profile");
    } catch {
      /* ignore */
    }
    navigate("/", { replace: true });
  }, [dispatch, navigate]);

  const onLogin = useCallback(() => {
    navigate("/login", { replace: false, state: { from: { pathname: "/editor", search: "" } } });
  }, [navigate]);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  if (needsAuth && !token && restoreStatus === "ready") {
    return <Navigate to="/login" replace state={{ from: { pathname: "/editor", search: "" } }} />;
  }

  if (needsAuth && token && restoreStatus !== "ready") {
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

  if (needsAuth && token && restoreStatus === "ready" && !user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/editor", search: "" } }} />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {user?.role === "admin" ? (
        <Link
          to="/admin"
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 2147483000,
            fontFamily: "'Courier New',monospace",
            fontSize: "10px",
            letterSpacing: "2px",
            color: "#7c6af7",
            textDecoration: "none",
            padding: "6px 10px",
            background: "#1f2040",
            boxShadow: "4px 4px 12px rgba(0,0,0,0.4), -2px -2px 7px rgba(255,255,255,0.032)",
            borderRadius: "8px",
          }}
        >
          АДМИН
        </Link>
      ) : null}
      <EditorScreen
        profile={profile}
        isGuest={Boolean(isGuest)}
        onLogout={onLogout}
        onLogin={onLogin}
      />
    </div>
  );
}
