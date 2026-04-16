import React from "react";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as mammoth from "mammoth";
import * as docx from "docx";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./app/App";
import "./legacy/global.css";

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
