/**
 * Shared editor-core: scene reordering (scene-cards drag & drop).
 *
 * Dragging a scene card moves a whole scene — the scene block plus everything
 * under it up to the next scene boundary — to a new position. That block-array
 * transform is pure and was duplicated across `moveScene` and
 * `moveSceneDirectional`; it lives here now, tested. The shell keeps the
 * DOM/geometry bit (`getSceneCardsDropSide`) and applies the result via
 * `setBlocks` / `markDirty`.
 */
import type { EditorBlock } from "./blocks";

const FILM_PLAY_BOUNDARY = ["scene", "act"];
// In film/play, `action` is scene *content*; elsewhere each content type is its
// own card, so the boundary set is wider.
const GENERIC_BOUNDARY = [
  "scene", "act", "segment", "video", "anchor", "sync", "vtr",
  "offscreen", "lower3", "question", "hook", "body", "cta", "action",
];

/** Block types that begin a new scene card, per mode. */
export function sceneBoundaryTypes(mode: string): string[] {
  return mode === "film" || mode === "play" ? [...FILM_PLAY_BOUNDARY] : [...GENERIC_BOUNDARY];
}

/**
 * Scene-card label shown in the navigator. Structured modes (play/short/media)
 * with an act number render `act.sub` (no trailing dot); otherwise `num.`.
 * Pure mirror of the duplicated inline expressions in the editor.
 */
export function formatSceneLabel(
  mode: string,
  scene: { actNum?: number; subNum?: number; num?: number },
): string {
  const structured = mode === "play" || mode === "short" || mode === "media";
  return structured && scene.actNum ? `${scene.actNum}.${scene.subNum}` : `${scene.num}.`;
}

/** The `[start, end)` block range owned by the scene starting at `fromId`. */
export function getSceneBlockRange(
  blocks: readonly EditorBlock[],
  fromId: EditorBlock["id"],
  mode: string,
): { start: number; end: number } | null {
  const start = blocks.findIndex((b) => b.id === fromId);
  if (start === -1) return null;
  const boundary = sceneBoundaryTypes(mode);
  let end = blocks.length;
  for (let j = start + 1; j < blocks.length; j++) {
    if (boundary.includes(blocks[j].type)) {
      end = j;
      break;
    }
  }
  return { start, end };
}

/**
 * Move the scene owned by `fromId` next to `toId`. Returns the reordered array,
 * or null when the move is invalid (same block, unknown source, or target lands
 * inside the moved range). Does not mutate `blocks`.
 */
export function moveSceneRange(
  blocks: readonly EditorBlock[],
  fromId: EditorBlock["id"],
  toId: EditorBlock["id"],
  opts: { mode: string; insertAfter: boolean },
): EditorBlock[] | null {
  if (fromId === toId) return null;
  const range = getSceneBlockRange(blocks, fromId, opts.mode);
  if (!range) return null;
  const fromBlocks = blocks.slice(range.start, range.end);
  const nb = blocks.filter((b) => !fromBlocks.includes(b));
  const targetIndex = nb.findIndex((b) => b.id === toId);
  if (targetIndex === -1) return null;
  const insertAt = opts.insertAfter ? targetIndex + 1 : targetIndex;
  nb.splice(insertAt, 0, ...fromBlocks);
  return nb;
}
