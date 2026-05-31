/**
 * Per-mode project document model.
 *
 * On disk a project is one flat JSON blob (the `.whale` / localStorage schema)
 * that carries every field regardless of mode — see `serialize.ts`. In memory
 * we want the opposite: a discriminated union where each mode only exposes the
 * fields it actually owns, so a film code path can't read `playHeader` and a
 * play path can't read `titlePage`. That separation is half of "independent
 * editors" — each mode owns its data shape — and it becomes compiler-enforced
 * once `@ts-nocheck` is removed from the per-mode modules.
 *
 * `readProjectDoc` (in serialize.ts) is the bridge: flat blob -> typed ProjectDoc.
 */
import type { Block, EditorModeId } from "../EditorMode";

/** Title-page fields used by film. */
export interface TitlePage {
  title?: string;
  genre?: string;
  author?: string;
  phone?: string;
  email?: string;
  year?: string;
  [key: string]: unknown;
}

/** A header row (play / short / media headers are arrays of these). */
export interface HeaderItem {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/** Panel sizing/visibility — shared chrome, not mode-specific. */
export interface ProjectLayout {
  leftW?: number;
  rightW?: number;
  aiW?: number;
  leftPanelOpen?: boolean;
  rightPanelOpen?: boolean;
  aiOpen?: boolean;
  sceneCardsOpen?: boolean;
  sceneCardsMiniMode?: boolean;
  sceneCardsRect?: unknown;
}

/** Index/meta fields stored alongside every project. */
export interface ProjectMeta {
  id: string;
  name: string;
  mode: EditorModeId;
  updatedAt: number;
  blocksCount: number;
}

/** Fields shared by every mode (editor-core concerns, not mode logic). */
export interface ProjectShared {
  blocks: Block[];
  docFont?: string;
  sceneAlign?: string;
  sceneCardMeta?: unknown;
  markerHighlights?: unknown;
  layout?: ProjectLayout;
}

type Base = ProjectMeta & ProjectShared;

export interface FilmDoc extends Base {
  mode: "film";
  titlePage: TitlePage;
}
export interface PlayDoc extends Base {
  mode: "play";
  playHeader: HeaderItem[];
}
export interface ShortDoc extends Base {
  mode: "short";
  contentHeader: HeaderItem[];
  contentLogo?: string;
}
export interface MediaDoc extends Base {
  mode: "media";
  mediaHeader: HeaderItem[];
}
export interface NoteDoc extends Base {
  mode: "note";
  noteText: string;
}

/** A project document, narrowed to the fields its mode owns. */
export type ProjectDoc = FilmDoc | PlayDoc | ShortDoc | MediaDoc | NoteDoc;

export const isFilmDoc = (d: ProjectDoc): d is FilmDoc => d.mode === "film";
export const isPlayDoc = (d: ProjectDoc): d is PlayDoc => d.mode === "play";
export const isShortDoc = (d: ProjectDoc): d is ShortDoc => d.mode === "short";
export const isMediaDoc = (d: ProjectDoc): d is MediaDoc => d.mode === "media";
export const isNoteDoc = (d: ProjectDoc): d is NoteDoc => d.mode === "note";
