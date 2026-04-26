import { useCallback, useMemo } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { MODES } from "../legacy/domain/blocks";
import { EditorScreen } from "../legacy/routes/Editor";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearAuth } from "../features/auth/authSlice";

type Profile = { mode?: string; id?: string; label?: string; color?: string; desc?: string; num?: string };

/** When JWT is valid but onboarding profile was never stored (or was cleared), editor still loads. */
const FALLBACK_AUTH_PROFILE: Profile = { mode: "film" };
const EDITOR_MODE_IDS = MODES.map((mode: { id: string }) => mode.id);
const EDITOR_MODE_SET = new Set<string>(EDITOR_MODE_IDS);

function normalizeEditorMode(value?: string): string | null {
  if (!value) return null;
  return EDITOR_MODE_SET.has(value) ? value : null;
}

function getEditorPath(mode: string) {
  return `/editor/${mode}`;
}

function readProfile(): Profile | null {
  try {
    const raw = localStorage.getItem("ow_profile");
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

function RestoringSessionScreen() {
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

export function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { modeName } = useParams<{ modeName?: string }>();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const restoreStatus = useAppSelector((s) => s.auth.restoreStatus);

  const storedProfile = useMemo(() => readProfile(), []);
  const requestedMode = normalizeEditorMode(modeName);
  const storedMode = normalizeEditorMode(storedProfile?.mode);
  const resolvedMode = requestedMode ?? storedMode ?? FALLBACK_AUTH_PROFILE.mode ?? "film";
  const canonicalPath = getEditorPath(resolvedMode);
  const profile: Profile = {
    ...(storedProfile ?? {}),
    mode: resolvedMode,
  };
  const needsAuth = resolvedMode !== "note";
  const isGuest = resolvedMode === "note" && !token;

  /**
   * Presence of a JWT is the source of truth for "logged-in". `user` may be
   * temporarily null while `/api/me` is restoring, or if restore fails with a
   * non-401 error (e.g. network hiccup). In either case we should NOT force
   * the user back through the login form — the token is still valid and any
   * protected API call will surface a real 401 if it isn't.
   */
  const onLogout = useCallback(() => {
    dispatch(clearAuth());
    try {
      localStorage.removeItem("ow_profile");
    } catch {
      /* ignore */
    }
    navigate("/", { replace: true });
  }, [dispatch, navigate]);

  /**
   * "На главную" navigates back to onboarding without touching the session:
   * the JWT (`ow_token`) must survive so the next visit to a protected route
   * doesn't demand credentials. The explicit `⏻ Выйти` button still calls
   * `onLogout`, which fully clears auth.
   */
  const onGoHome = useCallback(() => {
    navigate("/", { replace: false });
  }, [navigate]);

  const onLogin = useCallback(() => {
    navigate("/login", {
      replace: false,
      state: {
        from: {
          pathname: canonicalPath,
          search: location.search,
        },
      },
    });
  }, [canonicalPath, location.search, navigate]);

  const onModeRouteChange = useCallback(
    (nextMode: string) => {
      const normalizedMode = normalizeEditorMode(nextMode);
      if (!normalizedMode) return;
      const nextPath = getEditorPath(normalizedMode);
      if (nextPath === location.pathname) return;
      navigate(
        {
          pathname: nextPath,
          search: location.search,
          hash: location.hash,
        },
        { replace: false },
      );
    },
    [location.hash, location.pathname, location.search, navigate],
  );

  if (location.pathname !== canonicalPath) {
    return (
      <Navigate
        to={{ pathname: canonicalPath, search: location.search, hash: location.hash }}
        replace
      />
    );
  }

  if (needsAuth && !token && restoreStatus !== "ready") {
    return <RestoringSessionScreen />;
  }

  if (needsAuth && !token && restoreStatus === "ready") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: canonicalPath, search: location.search } }}
      />
    );
  }

  if (needsAuth && token && restoreStatus !== "ready") {
    return <RestoringSessionScreen />;
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
        onGoHome={onGoHome}
        onLogin={onLogin}
        routeMode={resolvedMode}
        onModeRouteChange={onModeRouteChange}
      />
    </div>
  );
}
