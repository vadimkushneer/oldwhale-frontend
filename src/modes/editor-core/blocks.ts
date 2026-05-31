/**
 * Shared editor-core: block transforms.
 *
 * The per-block keyboard handler (`onKey`) is irreducibly side-effecting — it
 * reads the caret from the DOM, restores focus, manipulates refs and queries
 * paginated film slices. But the actual *block-array* logic inside it is pure:
 * splitting a block's text, finding the speaker name above a dialogue line,
 * inserting/merging blocks, the spacing rule when merging, and the Tab/Enter
 * type rules. Those are lifted here verbatim so they can be unit-tested and so
 * the same logic stops being duplicated across the film and play branches.
 *
 * The handler keeps all the DOM/caret/focus work and just calls these for the
 * transforms.
 */

export interface EditorBlock {
  id: number | string;
  type: string;
  text?: string;
  name?: string;
}

export interface BlockDefLike {
  type: string;
  next?: string;
}

/** Split a block's text at `cursor`: the kept part, and the moved part (left-trimmed). */
export function splitBlockText(text: string | undefined, cursor: number): { before: string; after: string } {
  const t = text ?? "";
  return { before: t.substring(0, cursor), after: t.substring(cursor).trimStart() };
}

/**
 * Scan backwards from a block to the nearest character cue's text, stopping at a
 * scene/act boundary. Used when splitting a dialogue block to repeat the speaker.
 */
export function findPrecedingCharName(blocks: readonly EditorBlock[], blockId: EditorBlock["id"]): string {
  const bi = blocks.findIndex((b) => b.id === blockId);
  for (let i = bi - 1; i >= 0; i--) {
    if (blocks[i].type === "char") return blocks[i].text || "";
    if (blocks[i].type === "scene" || blocks[i].type === "act") break;
  }
  return "";
}

/** Insert new blocks immediately after `anchorId`. Returns a new array. */
export function insertBlocksAfter(
  blocks: readonly EditorBlock[],
  anchorId: EditorBlock["id"],
  newBlocks: readonly EditorBlock[],
): EditorBlock[] {
  const i = blocks.findIndex((b) => b.id === anchorId);
  const a = blocks.slice();
  if (i < 0) return a;
  a.splice(i + 1, 0, ...newBlocks);
  return a;
}

/** Whether a block type may be split mid-text on Enter. */
export function canSplitInline(type: string): boolean {
  return !["scene", "act", "spacer"].includes(type);
}

/** The type a new block gets when pressing Enter at the end of a block. */
export function nextEnterType(def: BlockDefLike | undefined, defs: readonly BlockDefLike[]): string {
  return (def && def.next) || (defs[0] && defs[0].type);
}

/**
 * Next block type on Tab, cycling through `defs` and skipping `protectedTypes`.
 * Returns null when the current type is protected or unknown.
 */
export function cycleBlockType(
  defs: readonly BlockDefLike[],
  currentType: string,
  protectedTypes: readonly string[] = [],
): string | null {
  if (protectedTypes.includes(currentType)) return null;
  const i = defs.findIndex((d) => d.type === currentType);
  if (i < 0) return null;
  return defs[(i + 1) % defs.length].type;
}

/** Spacing + resulting caret position when merging `curText` onto `prevText`. */
export function computeMergeJoiner(
  prevText: string | undefined,
  curText: string | undefined,
): { joiner: string; caretPos: number } {
  const p = prevText || "";
  const c = curText || "";
  const needsSpace = !!p && !!c && !/\s$/.test(p) && !/^\s/.test(c);
  const joiner = needsSpace ? " " : "";
  return { joiner, caretPos: p.length + joiner.length };
}

/**
 * Merge the current block's text onto the previous block (with `joiner`) and drop
 * the current block. No-op if either id is missing or out of order.
 */
export function mergeAdjacentBlocks(
  blocks: readonly EditorBlock[],
  prevId: EditorBlock["id"],
  curId: EditorBlock["id"],
  joiner: string,
): EditorBlock[] {
  const prevIdx = blocks.findIndex((b) => b.id === prevId);
  const curIdx = blocks.findIndex((b) => b.id === curId);
  const next = blocks.slice();
  if (prevIdx < 0 || curIdx < 0 || prevIdx >= curIdx) return next;
  const cur = blocks[curIdx];
  next[prevIdx] = { ...blocks[prevIdx], text: (blocks[prevIdx].text || "") + joiner + (cur.text || "") };
  next.splice(curIdx, 1);
  return next;
}
