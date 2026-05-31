/**
 * Shared editor-core: multi-line paste -> blocks.
 *
 * Pasting multi-line clipboard text splits it into separate blocks. The
 * block-array computation is pure; the shell handler keeps the DOM work (reading
 * the selection, applying the splice, focusing the last block).
 *
 * Two variants, lifted verbatim from the god component's paste handler:
 *  - line modes (play / short / media) — every line becomes the base block type
 *    (or a spacer when blank).
 *  - film — each line is classified by a screenplay heuristic and scene/char
 *    lines are upper-cased. (The film classifier is film-specific and may move to
 *    `modes/film` once the FilmEditor page exists.)
 */
import type { EditorBlock } from "./blocks";

export interface PasteInput {
  block: EditorBlock;
  lines: string[];
  before: string;
  after: string;
  makeId: () => EditorBlock["id"];
}

export interface PasteResult {
  replacement: EditorBlock[];
  lastId: EditorBlock["id"];
  lastText: string;
}

/** play / short / media: lines become the base block type (blank -> spacer). */
export function buildLinePasteReplacement(input: PasteInput & { mode: string }): PasteResult {
  const { block, lines, before, after, makeId, mode } = input;
  const baseType =
    block.type !== "spacer" ? block.type : mode === "play" ? "line" : mode === "short" ? "action" : "anchor";
  const lineType = (l: string) => (l.trim() === "" ? "spacer" : baseType);
  const firstText = before + lines[0];
  const firstType = lineType(lines[0]) === "spacer" && before ? baseType : lineType(lines[0]);
  const lastId = makeId();
  const lastText = lines[lines.length - 1] + after;
  const lastType = lineType(lines[lines.length - 1]);
  const middle = lines.slice(1, -1);
  const replacement: EditorBlock[] = [
    { ...block, type: firstType, text: firstText },
    ...middle.map((l) => ({ id: makeId(), type: lineType(l), text: l })),
    { id: lastId, type: lastType, text: lastText },
  ];
  return { replacement, lastId, lastText };
}

/** Classify a pasted line as a screenplay block type. */
export function detectFilmType(line: string): string {
  const t = line.trim();
  if (!t) return "spacer";
  if (/^(?:\d+[.\s]+)?(?:ИНТ|INT)[.\s]/i.test(t)) return "scene";
  if (/^(?:\d+[.\s]+)?(?:НАТ|NAT|EXT)[.\s]/i.test(t)) return "scene";
  if (/^\(\s*.+\s*\)$/.test(t)) return "paren";
  if (/^(?:CUT TO|FADE|СМЕНА)/i.test(t)) return "trans";
  if (t === t.toUpperCase() && t.length <= 40 && /[A-ZА-ЯЁ]/.test(t)) return "char";
  return "action";
}

/** film: classify each line, upper-casing scene/char text. */
export function buildFilmPasteReplacement(input: PasteInput): PasteResult {
  const { block, lines, before, after, makeId } = input;
  const upMob = (t: string, tp: string) => (tp === "scene" || tp === "char" ? t.toUpperCase() : t);
  const firstType = before.trim() ? block.type : detectFilmType(lines[0]);
  const firstText = upMob(before + lines[0], firstType);
  const lastLineType = detectFilmType(lines[lines.length - 1]);
  const lastText = upMob(lines[lines.length - 1] + after, lastLineType);
  const middleLines = lines.slice(1, -1);
  const lastId = makeId();
  const replacement: EditorBlock[] = [
    { ...block, type: firstType, text: firstText },
    ...middleLines.map((l) => {
      const tp = detectFilmType(l);
      return { id: makeId(), type: tp, text: upMob(l, tp) };
    }),
    { id: lastId, type: lastLineType, text: lastText },
  ];
  return { replacement, lastId, lastText };
}
