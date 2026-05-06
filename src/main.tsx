import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as mammoth from "mammoth";
import * as docx from "docx";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { registerSW } from "virtual:pwa-register";
import { setupIonicReact } from "@ionic/react";
import { store } from "./store";

/*
 * Ionic CSS must be imported before the app's own styles so that legacy
 * tokens in `legacy/global.css` (body background, #root sizing, etc.) win
 * the cascade where they overlap. Order matches the Ionic React
 * "Adding to existing project" guide:
 *   - core.css      -> CSS custom properties + base resets
 *   - normalize.css -> cross-browser normalization
 *   - structure.css -> structural rules used by IonApp/IonPage/IonContent
 *   - typography.css + utility sheets -> opt-in helpers (padding, flex, etc.)
 */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

setupListeners(store.dispatch);
setupIonicReact({
  /*
   * The legacy editor surfaces are pixel-tuned and were never designed for
   * iOS-style page transitions; force the Material-Design ripple/transition
   * mode on every platform so visual baselines stay stable when the same
   * bundle runs in a Capacitor WebView on iOS.
   */
  mode: "md",
});
import App from "./app/App";
import "./legacy/global.css";
import "./legacy/textarea-scrollbars.scss";

const SPA_REDIRECT_KEY = "ow_spa_redirect";

function restoreSpaRedirect() {
  try {
    const pendingPath = window.sessionStorage.getItem(SPA_REDIRECT_KEY);
    if (!pendingPath) return;
    window.sessionStorage.removeItem(SPA_REDIRECT_KEY);
    const nextUrl = new URL(pendingPath, window.location.origin);
    const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextPath !== currentPath) {
      window.history.replaceState(null, "", nextPath);
    }
  } catch {
    /* ignore */
  }
}

restoreSpaRedirect();

/*
 * Inside a Capacitor WebView the service worker has no benefit (the bundle
 * is already on disk) and can confuse fetch interception, so only register
 * the PWA on a regular browser. `Capacitor.isNativePlatform()` is the
 * canonical detection in v7 and tolerates the global being undefined.
 */
function isCapacitorRuntime(): boolean {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

if (import.meta.env.PROD && !isCapacitorRuntime()) {
  registerSW({ immediate: true });
}

declare global {
  interface Window {
    html2canvas: typeof html2canvas;
    jspdf: { jsPDF: typeof jsPDF };
    mammoth: typeof mammoth;
    docx: typeof docx;
  }
}

window.html2canvas = html2canvas;
window.jspdf = { jsPDF };
window.mammoth = mammoth;
window.docx = docx;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
