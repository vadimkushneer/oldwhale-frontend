import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as mammoth from "mammoth";
import * as docx from "docx";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import { store } from "./store";
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

if (import.meta.env.PROD) {
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
