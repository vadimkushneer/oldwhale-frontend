// @ts-nocheck
import { useCallback, useMemo, type CSSProperties } from "react";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const NOTE_TOOLBAR_ITEMS = [
  { cmd: "bold", icon: "Ж", title: "Жирный", styleMod: "bold" },
  { cmd: "italic", icon: "К", title: "Курсив", styleMod: "italic" },
  { cmd: "underline", icon: "Ч", title: "Подчёркнутый", styleMod: "underline" },
  { cmd: "removeFormat", icon: "Н", title: "Убрать форматирование", tooltip: "Сбросить формат" },
  { sep: true },
  { cmd: "insertUnorderedList", icon: "•≡", title: "Список", compact: true },
  { cmd: "insertOrderedList", icon: "1≡", title: "Нумерованный список", compact: true },
  { sep: true },
  { cmd: "h1", icon: "H1", title: "Заголовок 1", isBlock: true, compact: true },
  { cmd: "h2", icon: "H2", title: "Заголовок 2", isBlock: true, compact: true },
  { cmd: "formatBlock", arg: "p", icon: "¶", title: "Обычный текст" },
];

export const NOTE_FONT_SIZES = [8, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36];
export const NOTE_COLORS = ["#e8e4d8", "#f472b6", "#60a5fa", "#4ade80", "#fbbf24", "#a78bfa", "#f87171", "#34d399"];

export const NOTE_ALIGN_OPTIONS = [
  { cmd: "justifyLeft", align: "left", label: "По левому краю" },
  { cmd: "justifyCenter", align: "center", label: "По центру" },
  { cmd: "justifyRight", align: "right", label: "По правому краю" },
];

const A4_H = 1027;
const PAGE_TEXT_W = 670;
const FILM_PAGE_SPLIT_TYPES = ["action", "paren", "note"];
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
      width: `${PAGE_TEXT_W}px`,
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
      width: `${PAGE_TEXT_W}px`,
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
      fontSize: "15px",
      lineHeight: "1.7",
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

function getBlockMetrics({ defs, mode }, block, text, continued = false) {
  const def = defs.find((item) => item.type === block.type) || defs[0];

  const basePt = parseInt(def.st?.paddingTop) || 0;
  const pt = continued ? 0 : basePt;
  const pb = parseInt(def.st?.paddingBottom) || 0;
  const fs = parseFloat(def.st?.fontSize) || (mode === "play" ? 15 : 14);
  const lh = parseFloat(def.st?.lineHeight) || (mode === "play" ? 1.7 : 1.85);

  let colW = 670;
  if (mode === "film") {
    if (block.type === "dialogue") colW = 340;
    else if (block.type === "paren" || block.type === "char") colW = 300;
    else colW = 566;
  }

  const charsPerLine = Math.max(20, Math.round(colW / (fs * 0.6)));
  const safeText = text && text.length ? text : " ";
  const lineH = fs * lh;

  if (mode === "film") {
    const el = ensureMeasureTextarea("ow-film-measure");
    if (el) {
      const padL = parseInt(def.st?.paddingLeft) || 0;
      const padR = parseInt(def.st?.paddingRight) || 0;
      el.value = safeText;
      el.rows = 1;
      el.style.width = `${PAGE_TEXT_W}px`;
      el.style.fontFamily = "'Courier New',Courier,monospace";
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
      return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: el.scrollHeight + 10 };
    }
  }

  if (mode === "play") {
    if (block.type === "line") {
      const root = ensurePlayLineMeasure();
      if (root) {
        const row = root.firstChild;
        const nameEl = row?.childNodes?.[0] ?? null;
        const dotEl = row?.childNodes?.[1] ?? null;
        const bodyEl = row?.childNodes?.[2] ?? null;

        root.style.width = `${PAGE_TEXT_W}px`;
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

        return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: root.scrollHeight + 10 };
      }
    }

    const el = ensureMeasureTextarea("ow-play-measure");
    if (el) {
      const padL = parseInt(def.st?.paddingLeft) || 0;
      const padR = parseInt(def.st?.paddingRight) || 0;
      el.value = safeText;
      el.rows = 1;
      el.style.width = `${PAGE_TEXT_W}px`;
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
      return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: el.scrollHeight + 10 };
    }
  }

  const totalLines = Math.max(1, Math.ceil(safeText.length / charsPerLine));
  return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: pt + pb + totalLines * lineH + 10 };
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
    const midH = getBlockMetrics(config, block, text.substring(0, mid), continued).blockH;
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

export function buildDocumentPages({
  mode,
  defs,
  blocks,
  mediaHeader,
  contentHeader,
  mediaHeaderFoc,
  contentHeaderFoc,
}) {
  if (mode === "note" || !defs?.length) {
    return { pages: [], pagePadMode: "film" };
  }

  const config = { defs, mode };
  const pageBreaks = new Map();

  const estimateDesktopTitleEditorH = () => {
    const items = mode === "media" ? mediaHeader : mode === "short" ? contentHeader : [];
    if (!items.length || (mode !== "media" && mode !== "short")) return 0;

    const rowsH = items.reduce((sum, item) => {
      if (item.type === "spacer") return sum + Math.max(34, (item.size || 24) + 16);
      const text = String(item.text || item.label || "");
      const lines = Math.max(1, text.split(/\n+/).length);
      return sum + 58 + Math.max(0, lines - 1) * 22;
    }, 0);

    const logoH = mode === "short" ? 96 : 0;
    const focusExtra = mode === "media" ? (mediaHeaderFoc ? 48 : 0) : (contentHeaderFoc ? 48 : 0);

    return Math.min(A4_H - 140, rowsH + logoH + 92 + focusExtra);
  };

  const desktopTitleEditorH = estimateDesktopTitleEditorH();
  let runH = desktopTitleEditorH;

  blocks.forEach((block, bi) => {
    if (mode === "film" && block.type === "act") return;

    const metrics = getBlockMetrics(config, block, block.text || "", false);
    const text = block.text || " ";
    const pageStart = Math.floor(runH / A4_H);
    const pageEnd = Math.floor((runH + metrics.blockH) / A4_H);

    if (bi > 0 && pageEnd > pageStart) {
      const remaining = A4_H * (pageStart + 1) - runH - metrics.pt;
      const linesFit = Math.floor(remaining / metrics.lineH);
      if (linesFit <= 0) {
        pageBreaks.set(bi, -1);
      } else {
        let splitAt = linesFit * metrics.charsPerLine;
        if (splitAt >= text.length) {
          pageBreaks.set(bi, -1);
        } else {
          if (block.type === "dialogue") {
            let sentenceEnd = -1;
            for (let si = splitAt; si > 0; si--) {
              const current = text[si];
              const next = text[si + 1];
              if (".!?".includes(current) && (!next || next === " " || next === "\n")) {
                sentenceEnd = si + 1;
                break;
              }
            }
            if (sentenceEnd > 0) splitAt = sentenceEnd;
            else while (splitAt > 0 && text[splitAt] !== " " && text[splitAt] !== "\n") splitAt--;
          } else {
            while (splitAt > 0 && text[splitAt] !== " " && text[splitAt] !== "\n") splitAt--;
          }
          pageBreaks.set(bi, splitAt > 0 ? splitAt : linesFit * metrics.charsPerLine);
        }
      }
    }

    runH += metrics.blockH;
  });

  const pages = [];
  let curPage = [];
  runH = desktopTitleEditorH;

  const pageRemaining = () => {
    const used = runH % A4_H;
    return used === 0 ? A4_H : A4_H - used;
  };

  const pushPage = () => {
    if (curPage.length > 0) pages.push(curPage);
    curPage = [];
    runH = Math.ceil(runH / A4_H) * A4_H;
  };

  blocks.forEach((block, bi) => {
    if (mode === "film" && block.type === "act") return;

    if (mode === "film" && FILM_PAGE_SPLIT_TYPES.includes(block.type)) {
      const fullText = block.text || "";
      const firstMetrics = getBlockMetrics(config, block, fullText, false);

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
        const metrics = getBlockMetrics(config, block, rest, continued);
        const remaining = pageRemaining();

        if (metrics.blockH <= remaining) {
          curPage.push({ bi, part: "filmSlice", start, end: fullText.length, continued, editable: true, sliceIx });
          runH += metrics.blockH;
          break;
        }

        const splitLocal = findSplitByMeasure(config, block, rest, remaining, continued);
        if (splitLocal <= 0 || splitLocal >= rest.length) {
          pushPage();
          continued = start > 0;
          continue;
        }

        curPage.push({ bi, part: "filmSlice", start, end: start + splitLocal, continued, editable: true, sliceIx });
        runH += getBlockMetrics(config, block, rest.substring(0, splitLocal), continued).blockH;
        pushPage();

        const rawRest = rest.substring(splitLocal);
        rest = rawRest.replace(/^\s+/, "");
        start = fullText.length - rest.length;
        continued = true;
        sliceIx += 1;
      }

      return;
    }

    if (mode === "play" && PLAY_PAGE_SPLIT_TYPES.includes(block.type)) {
      const fullText = block.text || "";
      const firstMetrics = getBlockMetrics(config, block, fullText, false);

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
        const metrics = getBlockMetrics(config, block, rest, continued);
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
        runH += getBlockMetrics(config, block, rest.substring(0, splitLocal), continued).blockH;
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
        runH += getBlockMetrics(config, block, firstText, false).blockH;
        pushPage();
        curPage.push({ bi, part: "second", split });
        runH += getBlockMetrics(config, block, secondText, false).blockH;
      } else {
        pushPage();
        curPage.push({ bi, part: "full", split: -1 });
        runH += getBlockMetrics(config, block, block.text || "", false).blockH;
      }
    } else {
      curPage.push({ bi, part: "full", split: -1 });
      runH += getBlockMetrics(config, block, block.text || "", false).blockH;
    }
  });

  if (curPage.length > 0) pages.push(curPage);

  return {
    pages,
    pagePadMode: mode === "play" ? "play" : mode === "short" || mode === "media" ? "other" : "film",
  };
}

export function getGutterTopPx({ def, mode, continued }) {
  let pt = 5;
  if (continued) pt = 0;
  else if (def.st?.paddingTop !== undefined) pt = parseInt(def.st.paddingTop) || 0;
  else if (def.st?.padding !== undefined) pt = parseInt(def.st.padding) || 0;

  const mt = parseInt(def.st?.marginTop) || 0;
  const fs = parseFloat(def.st?.fontSize) || (mode === "play" ? 15 : 14);
  const lh = parseFloat(def.st?.lineHeight) || (mode === "play" ? 1.7 : 1.85);

  return mt + pt + Math.round((fs * lh) / 2);
}

export function buildBlockRowVars({ def, mode, continued, block }) {
  const vars: CSSProperties = {
    "--ed-gutter-top": `${getGutterTopPx({ def, mode, continued })}px`,
  } as CSSProperties;

  if (block?.color) {
    (vars as any)["--ed-block-color"] = block.color;
  }

  return vars;
}

export function buildStandardBlockOverlayStyle({ mode, def, block, continued }) {
  return {
    boxSizing: "border-box",
    fontSize: mode === "play" ? "15px" : "14px",
    lineHeight: mode === "play" ? "1.7" : "1.85",
    fontFamily: mode === "play" ? "'Times New Roman',Times,serif" : "'Courier New',Courier,monospace",
    ...def.st,
    ...(continued ? { paddingTop: "0" } : {}),
    fontWeight: block.bold ? "bold" : block.semibold ? "600" : def.st?.fontWeight,
    fontStyle: block.italic ? "italic" : def.st?.fontStyle,
    textDecoration: block.underline ? "underline" : def.st?.textDecoration,
    textAlign: def.st?.textAlign,
  };
}

export function buildPlayLineOverlayStyle() {
  return {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    fontFamily: "'Times New Roman',Times,serif",
    fontSize: "15px",
    lineHeight: "1.7",
  };
}

export function useEditorDocument({
  mode,
  zoom,
  docFont,
  projectId,
  scrollRef,
  theme,
  note,
  headers,
  blocksState,
}) {
  const cssVars = useMemo(
    () =>
      ({
        "--ed-bg": theme.BG,
        "--ed-surf": theme.SURF,
        "--ed-t1": theme.T1,
        "--ed-t2": theme.T2,
        "--ed-t3": theme.T3,
        "--ed-t3-22": `${theme.T3}22`,
        "--ed-t3-33": `${theme.T3}33`,
        "--ed-t3-44": `${theme.T3}44`,
        "--ed-t3-55": `${theme.T3}55`,
        "--ed-t3-66": `${theme.T3}66`,
        "--ed-t3-99": `${theme.T3}99`,
        "--ed-accent": theme.mc,
        "--ed-accent-15": `${theme.mc}15`,
        "--ed-accent-22": `${theme.mc}22`,
        "--ed-accent-44": `${theme.mc}44`,
        "--ed-accent-66": `${theme.mc}66`,
        "--ed-sh-sm": theme.SH_SM,
        "--ed-sh-in": theme.SH_IN,
        "--ed-zoom": `${zoom}%`,
        "--ed-zoom-width": `${zoom}%`,
        "--ed-doc-font": docFont || "Times New Roman",
        "--ed-note-font": docFont || "Courier New",
      }) as CSSProperties,
    [docFont, theme.BG, theme.SH_IN, theme.SH_SM, theme.SURF, theme.T1, theme.T2, theme.T3, theme.mc, zoom],
  );

  const shortLogoInputId = useMemo(
    () => `editor-document-short-logo-${String(projectId ?? "default").replace(/\s+/g, "-")}`,
    [projectId],
  );

  const onDocumentMouseDown = useCallback(
    (e) => {
      if (e.button !== 1) return;
      e.preventDefault();

      const el = scrollRef.current;
      if (!el) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = el.scrollLeft;
      const startTop = el.scrollTop;

      const onMove = (ev) => {
        el.scrollLeft = startLeft - (ev.clientX - startX);
        el.scrollTop = startTop - (ev.clientY - startY);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [scrollRef],
  );

  const saveNoteSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) note.noteSelRangeRef.current = sel.getRangeAt(0).cloneRange();
  }, [note.noteSelRangeRef]);

  const restoreNoteSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel) return false;

    sel.removeAllRanges();
    if (note.noteSelRangeRef.current) {
      sel.addRange(note.noteSelRangeRef.current);
      return true;
    }

    return false;
  }, [note.noteSelRangeRef]);

  const syncNoteHtml = useCallback(
    (html, options = {}) => {
      note.noteTextRef.current = html;
      note.setNoteText(html);
      note.markDirty();
      if (options.snapshot) {
        note.scheduleNoteHistorySnapshot(html);
      }
    },
    [note.markDirty, note.noteTextRef, note.scheduleNoteHistorySnapshot, note.setNoteText],
  );

  const execNoteCommand = useCallback(
    (item) => {
      const editor = note.noteEditorRef.current;
      if (!editor) return;

      editor.focus();
      restoreNoteSelection();

      if (item.isBlock) {
        const currentBlock = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        document.execCommand("formatBlock", false, currentBlock === item.cmd.toLowerCase() ? "p" : item.cmd);
      } else {
        document.execCommand(item.cmd, false, item.arg || null);
      }

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
    },
    [note.noteEditorRef, restoreNoteSelection, saveNoteSelection, syncNoteHtml],
  );

  const applyFontSize = useCallback(
    (pt) => {
      const editor = note.noteEditorRef.current;
      if (!editor) return;

      editor.focus();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${pt}pt`;

      try {
        range.surroundContents(span);
      } catch (error) {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }

      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      note.noteSelRangeRef.current = nextRange.cloneRange();

      syncNoteHtml(editor.innerHTML);
    },
    [note.noteEditorRef, note.noteSelRangeRef, syncNoteHtml],
  );

  const applyNoteColor = useCallback(
    (color) => {
      const editor = note.noteEditorRef.current;
      if (!editor) return;

      editor.focus();
      restoreNoteSelection();
      document.execCommand("foreColor", false, color);

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      note.setNoteColorOpen(false);
    },
    [note.noteEditorRef, note.setNoteColorOpen, restoreNoteSelection, syncNoteHtml],
  );

  const pageModel = useMemo(
    () =>
      buildDocumentPages({
        mode,
        defs: blocksState.defs,
        blocks: blocksState.blocks,
        mediaHeader: headers.mediaHeader,
        contentHeader: headers.contentHeader,
        mediaHeaderFoc: headers.mediaHeaderFoc,
        contentHeaderFoc: headers.contentHeaderFoc,
      }),
    [
      blocksState.blocks,
      blocksState.defs,
      headers.contentHeader,
      headers.contentHeaderFoc,
      headers.mediaHeader,
      headers.mediaHeaderFoc,
      mode,
    ],
  );

  return {
    cssVars,
    shortLogoInputId,
    onDocumentMouseDown,
    saveNoteSelection,
    restoreNoteSelection,
    execNoteCommand,
    applyFontSize,
    applyNoteColor,
    pages: pageModel.pages,
    pagePadMode: pageModel.pagePadMode,
  };
}
