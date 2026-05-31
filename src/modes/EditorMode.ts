/**
 * Canonical editor-mode contract — the single source of truth for how the five
 * editor modes (film, play, short, media, note) plug into the editor shell.
 *
 * Today the editor lives in one ~9.5k-line component (`legacy/routes/Editor`)
 * where every mode shares the same state and ~168 `if (mode === "...")` branches,
 * so a change to one mode can break another. The end state is the opposite: the
 * shell knows nothing about any specific mode — it only ever talks to a mode
 * through this contract, and each mode lives in its own isolated module under
 * `src/modes/<id>/` that does NOT import its siblings.
 *
 * This file is intentionally split in two:
 *
 *  1. `EditorModeDescriptor` — the DATA half. Fully implemented today by
 *     `registry.ts`, which adapts the existing `BLOCK_DEFS` / `INIT` / `MODES`
 *     domain tables. This is live and unit-tested.
 *
 *  2. `EditorMode` — the full BEHAVIOURAL target. The pagination / export /
 *     serialization that currently lives inside the god component will be
 *     carved out, one mode at a time, to implement this. Declaring it here
 *     first gives the carve a fixed shape to aim at (film is the reference
 *     implementation — see `modes/film`).
 */

/** The five editor modes. Mirrors the ids in `legacy/domain/blocks` `MODES`. */
export type EditorModeId = "film" | "play" | "short" | "media" | "note";

/** A block-type definition (toolbar entry + styling) for one mode. */
export interface BlockDef {
  type: string;
  label: string;
  hotkey?: string;
  spell?: boolean;
  ph?: string;
  next?: string;
  /** Inline style map applied to the block's textarea. */
  st?: Record<string, string | number>;
}

/** A single document block as stored in a project. */
export interface Block {
  id?: number;
  type: string;
  text?: string;
  name?: string;
}

/** Export targets a mode must be able to produce. */
export type ExportFormat = "pdf" | "docx" | "txt" | "fdx" | "whale";

/**
 * DATA half of a mode — what the registry can supply today, with no behaviour
 * carved out of the god component yet. Stable and safe to depend on now.
 */
export interface EditorModeDescriptor {
  /** Stable id used in the URL (`/editor/:id`) and as the storage namespace. */
  readonly id: EditorModeId;
  /** Human label shown on the mode tab. */
  readonly label: string;
  /**
   * Frozen modes are code-locked: their module must not be edited and the carve
   * treats them as the reference shape, not a work-in-progress. `film` is frozen
   * while `play` is being worked on, so play work cannot regress film.
   */
  readonly frozen: boolean;
  /** Block-type palette for this mode. */
  readonly blockDefs: readonly BlockDef[];
  /** Fresh starter document for a brand-new project in this mode. */
  initialBlocks(): Block[];
}

/**
 * FULL target contract. Not implemented by the registry yet — this is the shape
 * the per-mode modules will grow into as logic is lifted out of the god
 * component. The shell will only ever call these methods, never reach into a
 * mode's internal state.
 *
 * @typeParam TDoc - the mode's own document shape (e.g. film carries a title
 * page, play carries a header). Each mode owns its own `TDoc`; the shell treats
 * it as opaque.
 */
export interface EditorMode<TDoc = unknown> extends EditorModeDescriptor {
  /** Lay the blocks out into pages (Hollywood pagination for film, etc.). */
  paginate(blocks: readonly Block[]): unknown;
  /** Serialize the mode's document to the `.whale` JSON payload. */
  serialize(doc: TDoc): unknown;
  /** Rebuild the mode's document from a `.whale` / imported payload. */
  deserialize(raw: unknown): TDoc;
  /** Produce a downloadable file for the given format. */
  exportTo(format: ExportFormat, doc: TDoc): Promise<Blob> | Blob;
}
