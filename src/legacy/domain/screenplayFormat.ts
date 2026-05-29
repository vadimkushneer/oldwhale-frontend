// @ts-nocheck
/**
 * Hollywood screenplay format — single source of truth.
 *
 * All page geometry, typography and per-block indentation lives here.
 * `blocks.tsx` reads block indents from this file; `EditorDocument.scss`
 * reads page geometry via the `--ed-*` CSS vars below; `useEditorDocument.ts`
 * reads pagination constants from `SCREENPLAY_FORMAT`.
 *
 * Anchors: industry-standard 12pt Courier on US Letter (8.5" × 11"),
 * left margin 1.5", right/top/bottom 1.0", ~55 lines/page, 1 page ≈ 1 minute.
 * https://www.studiobinder.com/blog/screenplay-margins/
 */
import type { CSSProperties } from "react";

/** 1 inch at standard screen DPI. */
const PX_PER_INCH = 96;
const inch = (n: number) => Math.round(n * PX_PER_INCH);

/** 12pt = 16px at 96dpi. Courier 12pt is the industry standard. */
const FONT_SIZE_PX = 16;
/** Single-spaced — Hollywood is NOT double-spaced. ~55 lines/page falls out of this. */
const LINE_HEIGHT = 1;
const LINE_PX = FONT_SIZE_PX * LINE_HEIGHT;

export const SCREENPLAY_FORMAT = {
  /** US Letter, 8.5" × 11" at 96dpi. */
  PAGE_W: inch(8.5),    // 816
  PAGE_H: inch(11),     // 1056

  /** Margins — asymmetric left (1.5") for binding hole-punch. */
  MARGIN_LEFT:   inch(1.5),  // 144
  MARGIN_RIGHT:  inch(1.0),  // 96
  MARGIN_TOP:    inch(1.0),  // 96
  MARGIN_BOTTOM: inch(1.0),  // 96

  /** Text column inside the margins. */
  get TEXT_W() { return this.PAGE_W - this.MARGIN_LEFT - this.MARGIN_RIGHT; }, // 576
  get TEXT_H() { return this.PAGE_H - this.MARGIN_TOP - this.MARGIN_BOTTOM; }, // 864

  /** Typography. */
  FONT_FAMILY_FILM: "'Courier New', Courier, monospace",
  FONT_SIZE: FONT_SIZE_PX,
  LINE_HEIGHT,
  LINE_PX,

  /** Target lines per page (54-55 falls out of 864/16). */
  get LINES_PER_PAGE() { return Math.floor(this.TEXT_H / LINE_PX); },

  /**
   * Per-block indentation, measured from the LEFT MARGIN (i.e. from the start
   * of the text column, not from the page edge). These are the canonical
   * Hollywood numbers.
   *
   *   Scene/Action: flush left          → 0
   *   Dialogue:     2.5" from page = 1.0" from margin
   *   Parenthetical: 3.1" from page = 1.6" from margin
   *   Character:    3.7" from page = 2.2" from margin
   *   Dialogue right margin: 1.5" from margin (so it ends ~2.0" from right edge)
   *   Parenthetical right margin: 2.0" from margin
   */
  INDENT: {
    SCENE_LEFT:    0,
    ACTION_LEFT:   0,
    CAST_LEFT:     0,
    NOTE_LEFT:     inch(0.15), // 14 — small, with left border accent
    TRANS_RIGHT:   0,          // flush right via text-align

    DIALOGUE_LEFT:  inch(1.0),  // 96
    DIALOGUE_RIGHT: inch(1.5),  // 144

    PAREN_LEFT:  inch(1.6),  // 154
    PAREN_RIGHT: inch(2.0),  // 192

    CHAR_LEFT: inch(2.2),  // 211
  },

  /**
   * Vertical spacing between blocks, in lines. Single-spaced page: each
   * block needs explicit top padding to read cleanly.
   *   1 blank line before SCENE  → padding-top: 2 lines (extra breathing)
   *   1 blank line before ACTION → padding-top: 1 line
   *   No blank line for CAST, DIALOGUE, PAREN under CHAR
   */
  SPACE: {
    /** Blank lines before SCENE when it is not the first script line on page 1. */
    BEFORE_SCENE:  2 * LINE_PX, // 32
    BEFORE_ACTION: 1 * LINE_PX, // 16
    BEFORE_CHAR:   1 * LINE_PX, // 16
    BEFORE_NOTE:   1 * LINE_PX, // 16
    BEFORE_TRANS:  1 * LINE_PX, // 16
  },
} as const;

/** Horizontal padding for a film block (text column, not page edge). */
export function getFilmBlockIndent(blockType: string) {
  const I = SCREENPLAY_FORMAT.INDENT;
  switch (blockType) {
    case "dialogue":
      return { padL: I.DIALOGUE_LEFT, padR: I.DIALOGUE_RIGHT };
    case "paren":
      return { padL: I.PAREN_LEFT, padR: I.PAREN_RIGHT };
    case "char":
      return { padL: I.CHAR_LEFT, padR: 0 };
    case "note":
      return { padL: I.NOTE_LEFT, padR: 0 };
    default:
      return { padL: 0, padR: 0 };
  }
}

/**
 * First scene on script page 1 (pageIdx 0) — not “entry 0”, so cast above INT
 * does not steal opening-scene zero padding.
 */
export function isFilmOpeningSceneEntry(
  pageIdx: number,
  blockType: string,
  continued: boolean,
  hasEarlierSceneOnPage: boolean,
) {
  return pageIdx === 0 && blockType === "scene" && !continued && !hasEarlierSceneOnPage;
}

/** Inline layout for film `<textarea>` — must match `ow-film-measure` in pagination. */
export function buildFilmTextareaLayoutStyle(
  blockType: string,
  opts: { continued?: boolean; openingScene?: boolean } = {},
): CSSProperties {
  const ind = getFilmBlockIndent(blockType);
  const pt = filmBlockPaddingTop(blockType, opts);
  const F = SCREENPLAY_FORMAT;
  return {
    margin: 0,
    boxSizing: "border-box",
    lineHeight: `${F.LINE_PX}px`,
    paddingTop: `${pt}px`,
    paddingBottom: 0,
    paddingLeft: `${ind.padL}px`,
    paddingRight: `${ind.padR}px`,
  };
}

/** Top padding for a film block — shared by editor, measure textarea, and PDF HTML. */
export function filmBlockPaddingTop(
  blockType: string,
  opts: { continued?: boolean; openingScene?: boolean } = {},
) {
  if (opts.continued) return 0;
  const S = SCREENPLAY_FORMAT.SPACE;
  switch (blockType) {
    case "scene":
      return opts.openingScene ? 0 : S.BEFORE_SCENE;
    case "action":
      return S.BEFORE_ACTION;
    case "char":
      return S.BEFORE_CHAR;
    case "note":
      return S.BEFORE_NOTE;
    case "trans":
      return S.BEFORE_TRANS;
    default:
      return 0;
  }
}

/** CSS variables for page geometry — consumed by EditorDocument.scss. */
export function buildScreenplayCssVars(): CSSProperties {
  const F = SCREENPLAY_FORMAT;
  return {
    "--ed-page-w": `${F.PAGE_W}px`,
    "--ed-page-h": `${F.PAGE_H}px`,
    "--ed-margin-left":   `${F.MARGIN_LEFT}px`,
    "--ed-margin-right":  `${F.MARGIN_RIGHT}px`,
    "--ed-margin-top":    `${F.MARGIN_TOP}px`,
    "--ed-margin-bottom": `${F.MARGIN_BOTTOM}px`,
    "--ed-text-w": `${F.TEXT_W}px`,
    "--ed-text-h": `${F.TEXT_H}px`,
    "--ed-film-fs": `${F.FONT_SIZE}px`,
    "--ed-film-lh": `${F.LINE_HEIGHT}`,
    "--ed-film-line-px": `${F.LINE_PX}px`,
  } as CSSProperties;
}

/**
 * Per-block CSS variables — consumed by `.editor-document__textarea--<type>`
 * in EditorDocument.scss. Keeping the indent numbers in JS so the measure
 * textarea + overlay + real textarea all read the SAME source.
 */
export function buildFilmBlockCssVars(): CSSProperties {
  const I = SCREENPLAY_FORMAT.INDENT;
  const S = SCREENPLAY_FORMAT.SPACE;
  return {
    "--ed-film-dialogue-l": `${I.DIALOGUE_LEFT}px`,
    "--ed-film-dialogue-r": `${I.DIALOGUE_RIGHT}px`,
    "--ed-film-paren-l":    `${I.PAREN_LEFT}px`,
    "--ed-film-paren-r":    `${I.PAREN_RIGHT}px`,
    "--ed-film-char-l":     `${I.CHAR_LEFT}px`,
    "--ed-film-note-l":     `${I.NOTE_LEFT}px`,
    "--ed-film-pt-scene":   `${S.BEFORE_SCENE}px`,
    "--ed-film-pt-action":  `${S.BEFORE_ACTION}px`,
    "--ed-film-pt-char":    `${S.BEFORE_CHAR}px`,
    "--ed-film-pt-note":    `${S.BEFORE_NOTE}px`,
    "--ed-film-pt-trans":   `${S.BEFORE_TRANS}px`,
  } as CSSProperties;
}

/** Film block types that use sentence case (not ALL CAPS). */
export const FILM_CAPITALIZE_START_TYPES = ["action", "dialogue", "note"] as const;

/**
 * Uppercase the first letter of a block, before the first newline only.
 * Does not touch later lines — "hello\nworld" → "Hello\nworld".
 */
export function capitalizeBlockStart(text: string) {
  if (!text) return text;
  const firstLineEnd = text.indexOf("\n");
  const end = firstLineEnd === -1 ? text.length : firstLineEnd;
  for (let i = 0; i < end; i += 1) {
    const ch = text[i];
    if (/[a-zа-яё]/i.test(ch) && ch === ch.toLowerCase() && ch !== ch.toUpperCase()) {
      return text.slice(0, i) + ch.toUpperCase() + text.slice(i + 1);
    }
    if (/[A-ZА-ЯЁ]/.test(ch)) return text;
  }
  return text;
}

export function normalizeFilmBlockText(blockType: string, text: string) {
  if (!FILM_CAPITALIZE_START_TYPES.includes(blockType)) return text;
  return capitalizeBlockStart(text ?? "");
}
