/**
 * Shared types and helpers for plain-text (.txt) export.
 *
 * These are lifted verbatim from the `exportTXT` function that used to live
 * inside `legacy/routes/Editor/index.tsx`. The per-mode builders under
 * `modes/<mode>/export/txt.ts` consume them; the editor shell only gathers
 * state, calls the dispatcher, and handles the download/share side effects.
 */

export interface TxtBlock {
  type: string;
  text?: string;
  name?: string;
  id?: number;
}

export interface TxtHeaderItem {
  type: string;
  text?: string;
}

export interface TxtTitlePage {
  title?: string;
  genre?: string;
  author?: string;
  phone?: string;
  email?: string;
  year?: string;
}

/** Everything a text builder may need. Each mode reads only the parts it uses. */
export interface TxtExportContext {
  projectName?: string;
  blocks: readonly TxtBlock[];
  titlePage?: TxtTitlePage;
  playHeader?: readonly TxtHeaderItem[];
  contentHeader?: readonly TxtHeaderItem[];
  mediaHeader?: readonly TxtHeaderItem[];
}

/** A built export: the file name (without BOM) and its text body. */
export interface TxtExportResult {
  filename: string;
  text: string;
}

/** Centre a string within a fixed-width column (verbatim from the editor). */
export function center(s: string, w = 60): string {
  const p = Math.max(0, Math.floor((w - s.length) / 2));
  return " ".repeat(p) + s;
}

/** Greedy word-wrap with a left indent (verbatim from the editor). */
export function wrap(s: string, indent = 0, width = 60): string[] {
  const words = s.split(" ");
  const rows: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      rows.push(" ".repeat(indent) + cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) rows.push(" ".repeat(indent) + cur.trim());
  return rows;
}
