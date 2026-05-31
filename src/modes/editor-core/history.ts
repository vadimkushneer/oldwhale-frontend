/**
 * Shared editor-core: undo/redo history stack.
 *
 * The editor keeps a per-mode stack of document snapshots (JSON strings) plus a
 * current index. The stack algorithm — initialize/clamp, push (truncating the
 * redo tail, de-duplicating, capping at a limit), step back, step forward — is
 * pure over a `{ snapshots, index }` value and is lifted here, tested.
 *
 * The shell keeps the per-mode ref maps that store these states and does the
 * JSON stringify/parse; this module never touches blocks or the DOM.
 */

export interface HistoryState {
  snapshots: string[];
  index: number;
}

/** Initialize a mode's history from a snapshot, or clamp a stale index. */
export function ensureHistory(state: Partial<HistoryState> | undefined, snapshot: string): HistoryState {
  const snapshots = state && Array.isArray(state.snapshots) ? state.snapshots : [];
  if (snapshots.length === 0) {
    return { snapshots: [snapshot], index: 0 };
  }
  let index = state ? (state.index as number) : -1;
  if (typeof index !== "number" || index < 0 || index >= snapshots.length) {
    index = snapshots.length - 1;
  }
  return { snapshots, index };
}

/**
 * Push a snapshot. Drops any redo tail past the current index, no-ops if it
 * equals the current snapshot, and caps the stack at `limit` (oldest dropped).
 */
export function pushSnapshot(state: HistoryState, snapshot: string, limit: number): HistoryState {
  const list = Array.isArray(state.snapshots) ? state.snapshots : [];
  const idx = typeof state.index === "number" ? state.index : list.length - 1;
  if (list[idx] === snapshot) return { snapshots: list, index: idx };
  const next = list.slice(0, idx + 1);
  next.push(snapshot);
  if (next.length > limit) next.shift();
  return { snapshots: next, index: next.length - 1 };
}

/** Step back one snapshot, or null if there's nothing to undo. */
export function undoSnapshot(state: HistoryState): { state: HistoryState; value: string } | null {
  const list = Array.isArray(state.snapshots) ? state.snapshots : [];
  const idx = state.index;
  if (idx <= 0 || list.length === 0) return null;
  return { state: { snapshots: list, index: idx - 1 }, value: list[idx - 1] };
}

/** Step forward one snapshot, or null if there's nothing to redo. */
export function redoSnapshot(state: HistoryState): { state: HistoryState; value: string } | null {
  const list = Array.isArray(state.snapshots) ? state.snapshots : [];
  const idx = state.index;
  if (typeof idx !== "number" || idx >= list.length - 1) return null;
  return { state: { snapshots: list, index: idx + 1 }, value: list[idx + 1] };
}
