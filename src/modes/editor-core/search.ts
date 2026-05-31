/**
 * Shared editor-core: search matching.
 *
 * Pure, mode-agnostic primitives lifted verbatim from the god component's
 * `buildEditorSearchMatches`. Every mode searches the same way; only the data
 * sources differ (blocks, the note's plain text, or a mode's header rows), so
 * the shell passes those in via `SearchContext`. No DOM, no refs, no React —
 * which is exactly why this can be unit-tested directly.
 *
 * The one DOM-coupled bit (flattening note HTML to text) stays in the shell; it
 * passes the already-plain string in as `notePlainText`.
 */

export interface SearchOccurrence {
  start: number;
  end: number;
}

export interface NoteSearchMatch extends SearchOccurrence {
  key: string;
  scope: "note";
}
export interface BlockSearchMatch extends SearchOccurrence {
  key: string;
  scope: "block";
  blockId: unknown;
}
export interface HeaderSearchMatch extends SearchOccurrence {
  key: string;
  scope: "header";
  headerScope: string | null;
  headerKey: unknown;
  headerIndex: number;
}

export type SearchMatch = NoteSearchMatch | BlockSearchMatch | HeaderSearchMatch;

export interface SearchContext {
  mode: string;
  blocks?: ReadonlyArray<{ id?: unknown; text?: string }>;
  notePlainText?: string;
  headerItems?: ReadonlyArray<{ key?: unknown; text?: string }>;
  headerScope?: string | null;
}

/** Collapse whitespace, trim, lower-case — the canonical search needle. */
export function normalizeSearchNeedle(value: unknown): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

/** A needle plus, for "#tag" queries, the same needle without the leading "#". */
export function getSearchNeedleVariants(value: unknown): string[] {
  const base = normalizeSearchNeedle(value);
  if (!base) return [];
  const next = [base];
  if (base.startsWith("#") && base.length > 1) next.push(base.slice(1));
  return [...new Set(next.filter(Boolean))];
}

/** All non-overlapping occurrences of `query` (any variant) within `text`. */
export function collectSearchOccurrences(text: unknown, query: unknown): SearchOccurrence[] {
  const raw = String(text || "");
  const lower = raw.toLocaleLowerCase();
  const variants = getSearchNeedleVariants(query);
  if (!lower || !variants.length) return [];
  const found: SearchOccurrence[] = [];
  variants.forEach((variant) => {
    let from = 0;
    while (from <= lower.length) {
      const idx = lower.indexOf(variant, from);
      if (idx === -1) break;
      found.push({ start: idx, end: idx + variant.length });
      from = idx + Math.max(1, variant.length);
    }
  });
  return found
    .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || a.end - b.end)
    .reduce<SearchOccurrence[]>((acc, item) => {
      const prev = acc[acc.length - 1];
      if (!prev || item.start >= prev.end) acc.push(item);
      return acc;
    }, []);
}

/**
 * Build all search matches for the active document. Verbatim port of
 * `buildEditorSearchMatches`, with refs replaced by `ctx`.
 */
export function computeSearchMatches(query: unknown, ctx: SearchContext): SearchMatch[] {
  const clean = normalizeSearchNeedle(query);
  if (!clean) return [];

  if (ctx.mode === "note") {
    return collectSearchOccurrences(ctx.notePlainText || "", clean).map((pos, idx) => ({
      key: `note_${idx}_${pos.start}`,
      scope: "note",
      start: pos.start,
      end: pos.end,
    }));
  }

  const matches: SearchMatch[] = [];

  (ctx.blocks ?? []).forEach((block) => {
    collectSearchOccurrences(block?.text, clean).forEach((pos, idx) => {
      matches.push({
        key: `block_${block.id}_${pos.start}_${idx}`,
        scope: "block",
        blockId: block.id,
        start: pos.start,
        end: pos.end,
      });
    });
  });

  const scope = ctx.headerScope ?? null;
  (ctx.headerItems ?? []).forEach((item, idx) => {
    collectSearchOccurrences(item?.text, clean).forEach((pos, occIdx) => {
      matches.push({
        key: `header_${scope}_${item.key}_${pos.start}_${occIdx}`,
        scope: "header",
        headerScope: scope,
        headerKey: item.key,
        headerIndex: idx,
        start: pos.start,
        end: pos.end,
      });
    });
  });

  return matches;
}
