import { useCallback, useMemo } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { EDITOR_MODE_IDS } from "../modes/registry";
import { getEditorShell } from "../modes/editorShells";
import { PlayEditorNext } from "../modes/play/PlayEditorNext";
import type { EditorModeId } from "../modes/EditorMode";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearAuth } from "../features/auth/authSlice";
import { buildLoginRedirectState } from "../features/auth/loginRedirect";
import type { LoginRedirectFrom } from "../features/auth/loginRedirect";

type Profile = { mode?: string; id?: string; label?: string; color?: string; desc?: string; num?: string };
type EditorLocationState = { aiVariantGuid?: string; from?: LoginRedirectFrom } | null;

/** When JWT is valid but onboarding profile was never stored (or was cleared), editor still loads. */
const FALLBACK_AUTH_PROFILE: Profile = { mode: "film" };
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
  const locationState = location.state as EditorLocationState;
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
      state: buildLoginRedirectState({
        pathname: canonicalPath,
        search: location.search,
        hash: location.hash,
      }),
    });
  }, [canonicalPath, location.hash, location.search, navigate]);

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
        { replace: false, state: locationState },
      );
    },
    [location.hash, location.pathname, location.search, locationState, navigate],
  );

  const onAiVariantRouteStateChange = useCallback(
    (aiVariantGuid: string) => {
      if (!aiVariantGuid || locationState?.aiVariantGuid === aiVariantGuid) return;
      navigate(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        {
          replace: true,
          state: {
            ...(locationState ?? {}),
            aiVariantGuid,
          },
        },
      );
    },
    [location.hash, location.pathname, location.search, locationState, navigate],
  );

  if (location.pathname !== canonicalPath) {
    return (
      <Navigate
        to={{ pathname: canonicalPath, search: location.search, hash: location.hash }}
        replace
        state={locationState}
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
        state={buildLoginRedirectState({
          pathname: canonicalPath,
          search: location.search,
          hash: location.hash,
        })}
      />
    );
  }

  if (needsAuth && token && restoreStatus !== "ready") {
    return <RestoringSessionScreen />;
  }

  const EditorModeShell = getEditorShell(resolvedMode as EditorModeId);
  const usePlayNext = resolvedMode === "play" && new URLSearchParams(location.search).get("next") === "1";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {usePlayNext ? (
        <PlayEditorNext key="play-next" />
      ) : (
        <EditorModeShell
        key={resolvedMode}
        profile={profile}
        isGuest={Boolean(isGuest)}
        onLogout={onLogout}
        onGoHome={onGoHome}
        onLogin={onLogin}
        onModeRouteChange={onModeRouteChange}
        routeAiVariantGuid={locationState?.aiVariantGuid}
        onAiVariantRouteStateChange={onAiVariantRouteStateChange}
        showAdminLink={user?.role === "admin"}
      />
      )}
    </div>
  );
}
