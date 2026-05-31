/**
 * Shared editor-core: search-highlight overlay.
 *
 * The editor paints search hits behind each textarea via an overlay. Two pieces
 * of that are pure and were embedded in the god component's render: turning the
 * global match list into local highlight ranges for one block/header slice, and
 * rendering those ranges to marked HTML. They're lifted here (paired with the
 * `search.ts` matcher) and tested. The React wrapper, the open/query UI guards,
 * and the positioned overlay element stay in the shell.
 */
import type { SearchMatch } from "./search";

export interface OverlayConfig {
  text?: string;
  scope: "block" | "header";
  blockId?: unknown;
  headerScope?: string | null;
  headerKey?: unknown;
  /** Absolute offset of this slice's text within the block (paginated film). */
  sliceStart?: number;
}

export interface OverlayRange {
  start: number;
  end: number;
  active: boolean;
}

function escapeSearchHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Filter the match list to this slice and map to clamped local ranges. */
export function computeOverlayRanges(
  matches: readonly SearchMatch[] | null | undefined,
  config: OverlayConfig,
  activeKey: string | null,
): OverlayRange[] {
  const raw = String(config?.text ?? "");
  if (!raw) return [];
  const sliceStart = Number.isFinite(Number(config?.sliceStart)) ? Number(config.sliceStart) : 0;
  const list = Array.isArray(matches) ? matches : [];
  const ranges: OverlayRange[] = [];
  for (const match of list) {
    const matches_scope =
      config?.scope === "block"
        ? match.scope === "block" && match.blockId === config.blockId
        : config?.scope === "header"
          ? match.scope === "header" &&
            match.headerScope === config.headerScope &&
            match.headerKey === config.headerKey
          : false;
    if (!matches_scope) continue;
    const localStart = Math.max(0, match.start - sliceStart);
    const localEnd = Math.min(raw.length, Math.max(localStart, match.end - sliceStart));
    if (localEnd <= localStart) continue;
    ranges.push({ start: localStart, end: localEnd, active: match.key === activeKey });
  }
  return ranges.sort((a, b) => a.start - b.start || a.end - b.end);
}

/** Render text + ranges to overlay HTML (transparent text with <mark> hits). */
export function buildSearchOverlayHtml(text: unknown, ranges: readonly OverlayRange[]): string {
  const raw = String(text ?? "");
  if (!raw || !Array.isArray(ranges) || !ranges.length) return "";
  let html = "";
  let cursor = 0;
  ranges.forEach((range) => {
    const start = Math.max(cursor, Math.min(raw.length, range.start));
    const end = Math.max(start, Math.min(raw.length, range.end));
    if (start > cursor) html += escapeSearchHtml(raw.slice(cursor, start));
    if (end > start) {
      const bg = range.active ? "rgba(250, 204, 21, 0.44)" : "rgba(250, 204, 21, 0.24)";
      const stroke = range.active ? "rgba(255, 241, 173, 0.34)" : "rgba(255, 241, 173, 0.18)";
      html += `<mark style="background:${bg};color:transparent;padding:0;border-radius:2px;box-shadow:inset 0 0 0 1px ${stroke};">${escapeSearchHtml(raw.slice(start, end))}</mark>`;
    }
    cursor = end;
  });
  if (cursor < raw.length) html += escapeSearchHtml(raw.slice(cursor));
  return html;
}
