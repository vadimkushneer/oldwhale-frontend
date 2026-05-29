// @ts-nocheck
/**
 * Play-mode pagination — isolated from film Hollywood pipeline.
 * Screen layout: full A4-height budget (PAGE_H), Times typography from BLOCK_DEFS.
 */
import { SCREENPLAY_FORMAT } from "../../../../domain/screenplayFormat";
import {
  PLAY_TYPO,
  PLAY_BODY_FONT_PX,
  PLAY_BODY_LINE_HEIGHT,
} from "../../../../domain/blocks";

const PAGE_W = SCREENPLAY_FORMAT.PAGE_W;
const PAGE_H = SCREENPLAY_FORMAT.PAGE_H;

/** Must match EditorDocument.scss `.editor-document__page--play` padding. */
const PLAY_PAGE_PAD = { top: 48, right: 72, bottom: 48, left: 72 };
/** Text column inside play page margins (816 − 144 = 672). Not film TEXT_W (576). */
const PLAY_PAGE_TEXT_W = PAGE_W - PLAY_PAGE_PAD.left - PLAY_PAGE_PAD.right;
/** Content height inside play page padding (1056 − 96 = 960). */
const PLAY_PAGE_TEXT_H = PAGE_H - PLAY_PAGE_PAD.top - PLAY_PAGE_PAD.bottom;

/** Block types that split across page boundaries in play mode. */
const PLAY_PAGE_SPLIT_TYPES = ["stage", "line", "note", "cast"];

function ensureMeasureTextarea(id: string) {
  if (typeof document === "undefined") return null;

  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("textarea");
    el.id = id;
    el.setAttribute("aria-hidden", "true");
    el.tabIndex = -1;
    Object.assign(el.style, {
      position: "absolute",
      left: "-99999px",
      top: "0",
      width: `${PLAY_PAGE_TEXT_W}px`,
      minHeight: "0",
      height: "0",
      visibility: "hidden",
      pointerEvents: "none",
      resize: "none",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      boxSizing: "border-box",
      border: "none",
      outline: "none",
      margin: "0",
      background: "transparent",
      zIndex: "-1",
    });
    document.body.appendChild(el);
  }

  return el;
}

function ensurePlayLineMeasure() {
  if (typeof document === "undefined") return null;

  let root = document.getElementById("ow-play-line-measure");
  if (!root) {
    root = document.createElement("div");
    root.id = "ow-play-line-measure";
    root.setAttribute("aria-hidden", "true");
    Object.assign(root.style, {
      position: "absolute",
      left: "-99999px",
      top: "0",
      width: `${PLAY_PAGE_TEXT_W}px`,
      visibility: "hidden",
      pointerEvents: "none",
      boxSizing: "border-box",
      margin: "0",
      background: "transparent",
      zIndex: "-1",
    });

    const row = document.createElement("div");
    row.className = "ow-play-line-measure-row";
    Object.assign(row.style, {
      display: "flex",
      alignItems: "flex-start",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "'Times New Roman',Times,serif",
      fontSize: PLAY_TYPO.bodyFontSize,
      lineHeight: PLAY_TYPO.bodyLineHeight,
    });

    const name = document.createElement("span");
    name.className = "ow-play-line-measure-name";
    Object.assign(name.style, {
      fontWeight: "700",
      flexShrink: "0",
      padding: "0",
      margin: "0",
      minWidth: "30px",
      whiteSpace: "pre",
    });

    const dot = document.createElement("span");
    dot.className = "ow-play-line-measure-dot";
    dot.textContent = ".";
    Object.assign(dot.style, {
      fontWeight: "700",
      marginRight: "7px",
      flexShrink: "0",
      whiteSpace: "pre",
    });

    const body = document.createElement("div");
    body.className = "ow-play-line-measure-body";
    Object.assign(body.style, {
      flex: "1 1 auto",
      minWidth: "0",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      wordBreak: "normal",
      padding: "0",
      margin: "0",
      boxSizing: "border-box",
    });

    row.appendChild(name);
    row.appendChild(dot);
    row.appendChild(body);
    root.appendChild(row);
    document.body.appendChild(root);
  }

  return root;
}

function getPlayBlockMetrics({ defs }, block, text, continued = false) {
  const def = defs.find((item) => item.type === block.type) || defs[0];
  const fs = parseFloat(def.st?.fontSize) || PLAY_BODY_FONT_PX;
  const lh = parseFloat(def.st?.lineHeight) || PLAY_BODY_LINE_HEIGHT;
  const pt = continued ? 0 : (parseInt(def.st?.paddingTop) || 0);
  const pb = parseInt(def.st?.paddingBottom) || 0;
  const colW = PLAY_PAGE_TEXT_W;
  const charsPerLine = Math.max(20, Math.round(colW / (fs * 0.6)));
  const safeText = text && text.length ? text : " ";
  const lineH = fs * lh;

  if (block.type === "line") {
    const root = ensurePlayLineMeasure();
    if (root) {
      const row = root.firstChild;
      const nameEl = row?.childNodes?.[0] ?? null;
      const dotEl = row?.childNodes?.[1] ?? null;
      const bodyEl = row?.childNodes?.[2] ?? null;

      root.style.width = `${PLAY_PAGE_TEXT_W}px`;
      root.style.paddingTop = `${pt}px`;
      root.style.paddingBottom = `${pb}px`;

      if (row) {
        row.style.paddingTop = "0px";
        row.style.paddingBottom = "0px";
        row.style.fontSize = `${fs}px`;
        row.style.lineHeight = String(lh);
      }
      if (nameEl) {
        nameEl.textContent = block.name || "";
        nameEl.style.fontSize = `${fs}px`;
        nameEl.style.lineHeight = String(lh);
        nameEl.style.fontStyle = block.italic ? "italic" : "normal";
      }
      if (dotEl) {
        dotEl.style.fontSize = `${fs}px`;
        dotEl.style.lineHeight = String(lh);
        dotEl.style.fontStyle = block.italic ? "italic" : "normal";
      }
      if (bodyEl) {
        bodyEl.textContent = safeText;
        bodyEl.style.fontSize = `${fs}px`;
        bodyEl.style.lineHeight = String(lh);
        bodyEl.style.fontStyle = block.italic ? "italic" : "normal";
        bodyEl.style.fontWeight = block.bold ? "bold" : block.semibold ? "600" : "400";
      }

      return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: root.scrollHeight };
    }
  }

  const el = ensureMeasureTextarea("ow-play-measure");
  if (el) {
    const padL = parseInt(def.st?.paddingLeft) || 0;
    const padR = parseInt(def.st?.paddingRight) || 0;
    el.value = safeText;
    el.rows = 1;
    el.style.width = `${PLAY_PAGE_TEXT_W}px`;
    el.style.fontFamily = "'Times New Roman',Times,serif";
    el.style.fontSize = `${fs}px`;
    el.style.lineHeight = String(lh);
    el.style.paddingTop = `${pt}px`;
    el.style.paddingBottom = `${pb}px`;
    el.style.paddingLeft = `${padL}px`;
    el.style.paddingRight = `${padR}px`;
    el.style.fontStyle = block.italic ? "italic" : (def.st?.fontStyle || "normal");
    el.style.fontWeight = block.bold ? "bold" : block.semibold ? "600" : (def.st?.fontWeight || "400");
    el.style.textTransform = def.st?.textTransform || "none";
    el.style.textAlign = def.st?.textAlign || "left";
    el.style.letterSpacing = def.st?.letterSpacing || "normal";
    el.style.borderLeft = def.st?.borderLeft || "none";
    el.style.borderRight = "none";
    el.style.borderTop = "none";
    el.style.borderBottom = "none";
    el.style.height = "0px";
    return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: el.scrollHeight };
  }

  const totalLines = Math.max(1, Math.ceil(safeText.length / charsPerLine));
  return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: pt + pb + totalLines * lineH };
}

function findWordSplit(text, approx) {
  if (!text || text.length < 2) return -1;

  let splitAt = Math.min(text.length - 1, Math.max(1, approx));
  while (splitAt > 0 && text[splitAt] !== " " && text[splitAt] !== "\n") splitAt--;
  if (splitAt <= 0) splitAt = Math.min(text.length - 1, Math.max(1, approx));

  return splitAt > 0 && splitAt < text.length ? splitAt : -1;
}

function findSplitByMeasure(config, block, text, remaining, continued = false) {
  if (!text || text.length < 2 || remaining <= 0) return -1;

  let lo = 1;
  let hi = text.length - 1;
  let best = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midH = getPlayBlockMetrics(config, block, text.substring(0, mid), continued).blockH;
    if (midH <= remaining) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best <= 0 || best >= text.length) return -1;

  const wordSplit = findWordSplit(text, best);
  return wordSplit > 0 && wordSplit < text.length ? wordSplit : best;
}

export function buildPlayDocumentPages({ defs, blocks }) {
  const config = { defs };
  const pageBudgetH = PLAY_PAGE_TEXT_H;
  const pageBreaks = new Map();
  let runH = 0;

  blocks.forEach((block, bi) => {
    const metrics = getPlayBlockMetrics(config, block, block.text || "", false);
    const text = block.text || " ";
    const pageStart = Math.floor(runH / pageBudgetH);
    const pageEnd = Math.floor((runH + metrics.blockH) / pageBudgetH);

    if (bi > 0 && pageEnd > pageStart) {
      const remaining = pageBudgetH * (pageStart + 1) - runH - metrics.pt;
      const linesFit = Math.floor(remaining / metrics.lineH);
      if (linesFit <= 0) {
        pageBreaks.set(bi, -1);
      } else {
        let splitAt = linesFit * metrics.charsPerLine;
        if (splitAt >= text.length) {
          pageBreaks.set(bi, -1);
        } else {
          while (splitAt > 0 && text[splitAt] !== " " && text[splitAt] !== "\n") splitAt--;
          pageBreaks.set(bi, splitAt > 0 ? splitAt : linesFit * metrics.charsPerLine);
        }
      }
    }

    runH += metrics.blockH;
  });

  const pages = [];
  let curPage = [];
  runH = 0;

  const pageRemaining = () => {
    const used = runH % pageBudgetH;
    return used === 0 ? pageBudgetH : pageBudgetH - used;
  };

  const pushPage = () => {
    if (curPage.length > 0) pages.push(curPage);
    curPage = [];
    runH = Math.ceil(runH / pageBudgetH) * pageBudgetH;
  };

  blocks.forEach((block, bi) => {
    if (PLAY_PAGE_SPLIT_TYPES.includes(block.type)) {
      const fullText = block.text || "";
      const firstMetrics = getPlayBlockMetrics(config, block, fullText, false);

      if (firstMetrics.blockH <= pageRemaining()) {
        curPage.push({ bi, part: "full", split: -1 });
        runH += firstMetrics.blockH;
        return;
      }

      let rest = fullText;
      let start = 0;
      let continued = false;
      let sliceIx = 0;

      while (true) {
        const metrics = getPlayBlockMetrics(config, block, rest, continued);
        const remaining = pageRemaining();

        if (metrics.blockH <= remaining) {
          curPage.push({ bi, part: "playSlice", start, end: fullText.length, continued, editable: true, sliceIx });
          runH += metrics.blockH;
          break;
        }

        const splitLocal = findSplitByMeasure(config, block, rest, remaining, continued);
        if (splitLocal <= 0 || splitLocal >= rest.length) {
          pushPage();
          continued = start > 0;
          continue;
        }

        curPage.push({ bi, part: "playSlice", start, end: start + splitLocal, continued, editable: true, sliceIx });
        runH += getPlayBlockMetrics(config, block, rest.substring(0, splitLocal), continued).blockH;
        pushPage();

        const rawRest = rest.substring(splitLocal);
        rest = rawRest.replace(/^\s+/, "");
        start = fullText.length - rest.length;
        continued = true;
        sliceIx += 1;
      }

      return;
    }

    if (pageBreaks.has(bi) && curPage.length > 0) {
      const split = pageBreaks.get(bi);
      if (split > 0) {
        const firstText = (block.text || "").substring(0, split);
        const secondText = ((block.text || "").substring(split)).trimStart();
        curPage.push({ bi, part: "first", split });
        runH += getPlayBlockMetrics(config, block, firstText, false).blockH;
        pushPage();
        curPage.push({ bi, part: "second", split });
        runH += getPlayBlockMetrics(config, block, secondText, false).blockH;
      } else {
        pushPage();
        curPage.push({ bi, part: "full", split: -1 });
        runH += getPlayBlockMetrics(config, block, block.text || "", false).blockH;
      }
    } else {
      curPage.push({ bi, part: "full", split: -1 });
      runH += getPlayBlockMetrics(config, block, block.text || "", false).blockH;
    }
  });

  if (curPage.length > 0) pages.push(curPage);

  return { pages, pagePadMode: "play" };
}
