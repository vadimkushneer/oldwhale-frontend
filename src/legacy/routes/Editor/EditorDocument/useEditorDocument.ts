// @ts-nocheck
import { useCallback, useMemo, type CSSProperties } from "react";
import {
  SCREENPLAY_FORMAT,
  buildScreenplayCssVars,
  buildFilmBlockCssVars,
  filmBlockPaddingTop,
} from "../../../domain/screenplayFormat";
import { buildPlayDocumentPages } from "./play/playPagination";
import {
  PLAY_TYPO,
  PLAY_BODY_FONT_PX,
  PLAY_BODY_LINE_HEIGHT,
} from "../../../domain/blocks";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/** Shared editor surface CSS variables (desktop `EditorDocument` + mobile note shell). */
export function buildEditorDocumentCssVars({
  theme,
  docFont,
  zoom,
}: {
  theme: {
    BG: string;
    SURF: string;
    T1: string;
    T2: string;
    T3: string;
    mc: string;
    SH_SM: string;
    SH_IN: string;
  };
  docFont: string | undefined;
  zoom: number;
}) {
  return {
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
    // Hollywood screenplay format — single source of truth.
    ...buildScreenplayCssVars(),
    ...buildFilmBlockCssVars(),
  } as CSSProperties;
}

const PAGE_H = SCREENPLAY_FORMAT.PAGE_H;       // 1056 — US Letter at 96dpi
const PAGE_TEXT_H = SCREENPLAY_FORMAT.TEXT_H;  // 864 — text column inside 1" top/bottom margins
const PAGE_TEXT_W = SCREENPLAY_FORMAT.TEXT_W;  // 576 — 6.0" inside 1.5"/1.0" margins
/**
 * Block types that can be split across page boundaries with a (MORE)/(CONT'D)
 * marker. `dialogue` is included because long monologues legitimately span
 * multiple pages — without this the second page just overflows past the bottom.
 */
const FILM_PAGE_SPLIT_TYPES = ["action", "paren", "note", "dialogue"];
/** Hollywood (ДАЛЬШЕ) / (ПРОД.) — one line in the fixed page budget. */
const FILM_DIALOGUE_META_H = SCREENPLAY_FORMAT.LINE_PX;

/** Text height available on the current page slice (864 px budget minus dialogue meta). */
function filmTextBudget(remaining, block, continued, reserveMore) {
  let budget = remaining;
  if (block.type === "dialogue") {
    if (continued) budget -= FILM_DIALOGUE_META_H;
    if (reserveMore) budget -= FILM_DIALOGUE_META_H;
  }
  return Math.max(0, budget);
}

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

/**
 * Indent table for film blocks — read from SCREENPLAY_FORMAT, not from
 * `def.st`. This is the source of truth for both the measure textarea and
 * for the real textarea's padding (via CSS vars). Keeping it in one place
 * stops the historical drift between `blocks.tsx`, `EditorDocument.scss`
 * and `buildStandardBlockOverlayStyle`.
 */
function getFilmBlockIndent(blockType: string) {
  const I = SCREENPLAY_FORMAT.INDENT;
  switch (blockType) {
    case "dialogue": return { padL: I.DIALOGUE_LEFT, padR: I.DIALOGUE_RIGHT };
    case "paren":    return { padL: I.PAREN_LEFT,    padR: I.PAREN_RIGHT };
    case "char":     return { padL: I.CHAR_LEFT,     padR: 0 };
    case "note":     return { padL: I.NOTE_LEFT,     padR: 0 };
    // scene, cast, action, trans, spacer: flush to text column
    default:         return { padL: 0,               padR: 0 };
  }
}

function getBlockMetrics({ defs, mode }, block, text, continued = false, openingScene = false) {
  const def = defs.find((item) => item.type === block.type) || defs[0];

  // For film we read typography + indentation from SCREENPLAY_FORMAT; for
  // other modes we still defer to `def.st` (those modes are being reworked
  // separately and aren't strict Hollywood).
  const isFilm = mode === "film";
  const fs = isFilm
    ? SCREENPLAY_FORMAT.FONT_SIZE
    : parseFloat(def.st?.fontSize) || (mode === "play" ? PLAY_BODY_FONT_PX : 14);
  const lh = isFilm
    ? SCREENPLAY_FORMAT.LINE_HEIGHT
    : parseFloat(def.st?.lineHeight) || (mode === "play" ? PLAY_BODY_LINE_HEIGHT : 1.85);
  const pt = isFilm
    ? filmBlockPaddingTop(block.type, { continued, openingScene })
    : (continued ? 0 : (parseInt(def.st?.paddingTop) || 0));
  const pb = isFilm ? 0 : (parseInt(def.st?.paddingBottom) || 0);

  let colW = PAGE_TEXT_W;
  if (isFilm) {
    const ind = getFilmBlockIndent(block.type);
    colW = PAGE_TEXT_W - ind.padL - ind.padR;
  }

  const charsPerLine = Math.max(20, Math.round(colW / (fs * 0.6)));
  const safeText = text && text.length ? text : " ";
  const lineH = fs * lh;

  if (isFilm) {
    const el = ensureMeasureTextarea("ow-film-measure");
    if (el) {
      const { padL, padR } = getFilmBlockIndent(block.type);
      el.value = safeText;
      el.rows = 1;
      el.style.width = `${PAGE_TEXT_W}px`;
      el.style.fontFamily = SCREENPLAY_FORMAT.FONT_FAMILY_FILM;
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
      el.style.letterSpacing = "normal";
      el.style.borderLeft = "none";
      el.style.borderRight = "none";
      el.style.borderTop = "none";
      el.style.borderBottom = "none";
      el.style.height = "0px";
      return { def, pt, pb, fs, lh, colW, charsPerLine, lineH, blockH: el.scrollHeight };
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

  if (mode === "play") {
    return buildPlayDocumentPages({ defs, blocks });
  }

  const config = { defs, mode };
  // Film: paginate inside margins (~54 lines). Other modes keep full page height.
  const pageBudgetH = mode === "film" ? PAGE_TEXT_H : PAGE_H;
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

    return Math.min(PAGE_H - 140, rowsH + logoH + 92 + focusExtra);
  };

  const desktopTitleEditorH = estimateDesktopTitleEditorH();
  let runH = desktopTitleEditorH;

  // Film uses a single measure pass (864 px budget). Pass 1 is for short/media only.
  if (mode !== "film") {
    blocks.forEach((block, bi) => {
      if (mode === "film" && block.type === "act") return;

      const metrics = getBlockMetrics(config, block, block.text || "", false);
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
  }

  const pages = [];
  let curPage = [];
  runH = desktopTitleEditorH;

  const pageRemaining = () => {
    const used = runH % pageBudgetH;
    return used === 0 ? pageBudgetH : pageBudgetH - used;
  };

  const pushPage = () => {
    if (curPage.length > 0) pages.push(curPage);
    curPage = [];
    runH = Math.ceil(runH / pageBudgetH) * pageBudgetH;
  };

  const isOpeningSceneBlock = (block) =>
    mode === "film" &&
    block.type === "scene" &&
    pages.length === 0 &&
    curPage.length === 0;

  blocks.forEach((block, bi) => {
    if (mode === "film" && block.type === "act") return;

    if (mode === "film" && FILM_PAGE_SPLIT_TYPES.includes(block.type)) {
      const fullText = block.text || "";
      const openingScene = isOpeningSceneBlock(block);
      const firstMetrics = getBlockMetrics(config, block, fullText, false, openingScene);

      if (firstMetrics.blockH <= filmTextBudget(pageRemaining(), block, false, false)) {
        curPage.push({ bi, part: "full", split: -1 });
        runH += firstMetrics.blockH;
        return;
      }

      let rest = fullText;
      let start = 0;
      let continued = false;
      let sliceIx = 0;

      while (true) {
        const remaining = pageRemaining();
        const metrics = getBlockMetrics(config, block, rest, continued, false);

        if (metrics.blockH <= filmTextBudget(remaining, block, continued, false)) {
          if (block.type === "dialogue" && continued) runH += FILM_DIALOGUE_META_H;
          curPage.push({ bi, part: "filmSlice", start, end: fullText.length, continued, editable: true, sliceIx });
          runH += metrics.blockH;
          break;
        }

        const splitLocal = findSplitByMeasure(
          config,
          block,
          rest,
          filmTextBudget(remaining, block, continued, block.type === "dialogue"),
          continued,
        );
        if (splitLocal <= 0 || splitLocal >= rest.length) {
          pushPage();
          continued = start > 0;
          continue;
        }

        if (block.type === "dialogue" && continued) runH += FILM_DIALOGUE_META_H;
        curPage.push({ bi, part: "filmSlice", start, end: start + splitLocal, continued, editable: true, sliceIx });
        runH += getBlockMetrics(config, block, rest.substring(0, splitLocal), continued, false).blockH;
        if (block.type === "dialogue") runH += FILM_DIALOGUE_META_H;
        pushPage();

        const rawRest = rest.substring(splitLocal);
        rest = rawRest.replace(/^\s+/, "");
        start = fullText.length - rest.length;
        continued = true;
        sliceIx += 1;
      }

      return;
    }

    if (mode === "film") {
      const openingScene = isOpeningSceneBlock(block);
      const metrics = getBlockMetrics(config, block, block.text || "", false, openingScene);
      if (metrics.blockH > pageRemaining() && curPage.length > 0) pushPage();
      curPage.push({ bi, part: "full", split: -1 });
      runH += metrics.blockH;
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

export function getGutterTopPx({ def, mode, continued, block, openingScene = false }) {
  // In film mode, gutter alignment must match the block's actual padding-top
  // and typography — both of which now live in SCREENPLAY_FORMAT.
  if (mode === "film") {
    const blockType = block?.type ?? def?.type;
    const pt = filmBlockPaddingTop(blockType, { continued, openingScene });
    const fs = SCREENPLAY_FORMAT.FONT_SIZE;
    const lh = SCREENPLAY_FORMAT.LINE_HEIGHT;
    return pt + Math.round((fs * lh) / 2);
  }

  let pt = 5;
  if (continued) pt = 0;
  else if (def.st?.paddingTop !== undefined) pt = parseInt(def.st.paddingTop) || 0;
  else if (def.st?.padding !== undefined) pt = parseInt(def.st.padding) || 0;

  const mt = parseInt(def.st?.marginTop) || 0;
  const fs = parseFloat(def.st?.fontSize) || (mode === "play" ? PLAY_BODY_FONT_PX : 14);
  const lh = parseFloat(def.st?.lineHeight) || (mode === "play" ? PLAY_BODY_LINE_HEIGHT : 1.85);

  return mt + pt + Math.round((fs * lh) / 2);
}

export function buildBlockRowVars({ def, mode, continued, block, openingScene = false }) {
  const vars: CSSProperties = {
    "--ed-gutter-top": `${getGutterTopPx({ def, mode, continued, block, openingScene })}px`,
  } as CSSProperties;

  if (block?.color) {
    (vars as any)["--ed-block-color"] = block.color;
  }

  return vars;
}

export function buildStandardBlockOverlayStyle({ mode, def, block, continued, openingScene = false }) {
  // For film, padding/font come from SCREENPLAY_FORMAT so the search/marker
  // overlay sits pixel-perfect over the real textarea. `def.st` is no longer
  // consulted for layout in film mode (only for visual styling like color/
  // textTransform).
  if (mode === "film") {
    const ind = getFilmBlockIndent(block.type);
    const pt = filmBlockPaddingTop(block.type, { continued, openingScene });
    return {
      boxSizing: "border-box",
      fontSize: `${SCREENPLAY_FORMAT.FONT_SIZE}px`,
      lineHeight: String(SCREENPLAY_FORMAT.LINE_HEIGHT),
      fontFamily: SCREENPLAY_FORMAT.FONT_FAMILY_FILM,
      paddingLeft: `${ind.padL}px`,
      paddingRight: `${ind.padR}px`,
      paddingTop: `${pt}px`,
      paddingBottom: "0",
      color: def.st?.color,
      textTransform: def.st?.textTransform,
      textAlign: def.st?.textAlign,
      fontWeight: block.bold ? "bold" : block.semibold ? "600" : def.st?.fontWeight,
      fontStyle: block.italic ? "italic" : def.st?.fontStyle,
      textDecoration: block.underline ? "underline" : def.st?.textDecoration,
    };
  }

  return {
    boxSizing: "border-box",
    fontSize: mode === "play" ? PLAY_TYPO.bodyFontSize : "14px",
    lineHeight: mode === "play" ? PLAY_TYPO.bodyLineHeight : "1.85",
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
    fontSize: PLAY_TYPO.bodyFontSize,
    lineHeight: PLAY_TYPO.bodyLineHeight,
  };
}

export function useEditorDocument({
  mode,
  zoom,
  docFont,
  projectId,
  scrollRef,
  theme,
  headers,
  blocksState,
}) {
  const cssVars = useMemo(
    () => buildEditorDocumentCssVars({ theme, docFont, zoom }),
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
    pages: pageModel.pages,
    pagePadMode: pageModel.pagePadMode,
  };
}
