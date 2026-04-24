import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { markRestoreSkipped, restoreSession } from "../features/auth/authSlice";
import { useGetPublicCatalogQuery } from "../features/ai-catalog/aiCatalogApi";
import { apiBaseUrl } from "../api/env";
import { OnboardingPage } from "../pages/OnboardingPage";
import { LoginPage } from "../pages/LoginPage";
import { EditorPage } from "../pages/EditorPage";
import { AdminPage } from "../pages/AdminPage";
import { AiModelsAdminPage } from "../pages/AiModelsAdminPage";

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
  const skip = !apiBaseUrl();
  useGetPublicCatalogQuery(undefined, { skip, refetchOnFocus: false });
  return null;
}

export default function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <SessionInit />
      <CatalogInit />
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/ai-models" element={<AiModelsAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
