import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { IonApp } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { markRestoreSkipped, restoreSession } from "../features/auth/authSlice";
import { useGetPublicCatalogQuery } from "../features/ai-catalog/aiCatalogApi";
import { apiRequestBase } from "../api/env";
import { OnboardingPage } from "../pages/OnboardingPage";
import { LoginPage } from "../pages/LoginPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { EditorPage } from "../pages/EditorPage";
import { ProfilePage } from "../pages/ProfilePage";
import { AdminPage } from "../pages/AdminPage";
import { AiChatLogsAdminPage } from "../pages/AiChatLogsAdminPage";
import { AiModelsAdminPage } from "../pages/AiModelsAdminPage";
import { IonicRouteShell } from "./IonicRouteShell";
import { SessionExpiredRedirect } from "./SessionExpiredRedirect";

function SessionInit() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  useEffect(() => {
    if (!token) {
      dispatch(markRestoreSkipped());
      return;
    }
    /*
     * When offline at boot there's no point holding the editor on
     * "ВОССТАНОВЛЕНИЕ СЕССИИ…" — mark ready immediately and re-validate the
     * JWT via /api/me once the browser regains connectivity.
     */
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      dispatch(markRestoreSkipped());
      const onOnline = () => {
        void dispatch(restoreSession());
      };
      window.addEventListener("online", onOnline, { once: true });
      return () => window.removeEventListener("online", onOnline);
    }
    void dispatch(restoreSession());
  }, [dispatch, token]);
  return null;
}

function CatalogInit() {
  const token = useAppSelector((s) => s.auth.token);
  const skip = !apiRequestBase();
  const { refetch } = useGetPublicCatalogQuery(undefined, { skip, refetchOnFocus: false });
  useEffect(() => {
    if (!skip) void refetch();
  }, [refetch, skip, token]);
  return null;
}

export default function App() {
  const basename = import.meta.env.BASE_URL;
  /*
   * `IonApp` provides Ionic's root container (CSS variables, safe-area
   * inset propagation, status-bar interaction in a Capacitor WebView).
   *
   * We intentionally keep `BrowserRouter` from react-router-dom@6
   * instead of `IonReactRouter`: as of Ionic React 8.x the router
   * integration package still pins react-router@5, and the rest of the
   * app (13+ files using `useNavigate` / v6 `Routes`) targets v6. Each
   * route is wrapped in `IonicRouteShell` so individual pages still
   * receive `IonPage` lifecycle and Ionic styling; native swipe-back
   * page-stack transitions (which need `IonRouterOutlet`) are out of
   * scope for this integration.
   */
  return (
    <IonApp>
      <BrowserRouter basename={basename}>
        <SessionInit />
        <SessionExpiredRedirect />
        <CatalogInit />
        <Routes>
          <Route
            path="/"
            element={
              <IonicRouteShell>
                <OnboardingPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/login"
            element={
              <IonicRouteShell>
                <LoginPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/reset-password"
            element={
              <IonicRouteShell>
                <ResetPasswordPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/editor"
            element={
              <IonicRouteShell>
                <EditorPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/editor/:modeName"
            element={
              <IonicRouteShell>
                <EditorPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/profile"
            element={
              <IonicRouteShell>
                <ProfilePage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/admin"
            element={
              <IonicRouteShell>
                <AdminPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/admin/ai-chat-logs"
            element={
              <IonicRouteShell>
                <AiChatLogsAdminPage />
              </IonicRouteShell>
            }
          />
          <Route
            path="/admin/ai-models"
            element={
              <IonicRouteShell>
                <AiModelsAdminPage />
              </IonicRouteShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </IonApp>
  );
}
