/**
 * Project-store: pure operations on the project index (`ow_index`).
 *
 * The editor keeps a list of saved projects in localStorage. The list logic —
 * move/insert an entry to the front, drop an entry, find the most recent entry
 * for a mode — was inlined and duplicated across save / open / delete. It's pure
 * (array in, array out), so it lives here, tested, while the shell keeps the
 * localStorage read/write.
 *
 * Entries are the `ProjectMeta` shape, but the ops are generic so they preserve
 * whatever entry type the caller passes (and tolerate legacy entries missing
 * `mode`, which default to "film" — matching the editor's long-standing behaviour).
 */

export interface ProjectIndexEntry {
  id: string;
  name?: string;
  mode?: string;
  updatedAt?: number;
  blocksCount?: number;
}

/** Insert/move an entry to the front (newest-first), de-duplicating by id. */
export function upsertProjectEntry<T extends { id: string }>(index: readonly T[], entry: T): T[] {
  return [entry, ...index.filter((p) => p.id !== entry.id)];
}

/** Remove the entry with the given id. */
export function removeProjectEntry<T extends { id: string }>(index: readonly T[], id: string): T[] {
  return index.filter((p) => p.id !== id);
}

/** The first (most recent) entry for a mode, treating a missing mode as "film". */
export function findLatestEntryForMode<T extends { mode?: string }>(
  index: readonly T[],
  mode: string,
): T | null {
  return index.find((p) => (p.mode || "film") === mode) ?? null;
}
