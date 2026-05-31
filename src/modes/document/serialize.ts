/**
 * Project (de)serialization.
 *
 *  - `buildProjectData` is the single source of truth for the on-disk schema.
 *    It produces the exact flat blob the editor has always written to
 *    localStorage and `.whale`, so existing files stay byte-compatible. The
 *    format is shared across modes on purpose (one schema, one file type).
 *
 *  - `readProjectDoc` is the bridge from that flat blob into the per-mode typed
 *    `ProjectDoc`. It is tolerant of legacy / missing fields (defaults applied)
 *    and normalizes an unknown mode to "film".
 *
 * Both are pure and unit-tested. The serializer is wired into the editor's
 * localStorage save paths; the reader is the typed entry point the per-mode
 * editor components will consume as the shell is split.
 */
import type { Block, EditorModeId } from "../EditorMode";
import type {
  HeaderItem,
  ProjectDoc,
  ProjectLayout,
  ProjectMeta,
  TitlePage,
} from "./ProjectDoc";

const MODE_IDS: ReadonlySet<string> = new Set(["film", "play", "short", "media", "note"]);

/** The mode-agnostic fields a serialized project carries. */
export interface ProjectFields {
  blocks: Block[];
  playHeader?: HeaderItem[];
  mediaHeader?: HeaderItem[];
  contentHeader?: HeaderItem[];
  contentLogo?: string;
  docFont?: string;
  sceneAlign?: string;
  noteText?: string;
  sceneCardMeta?: unknown;
  markerHighlights?: unknown;
  layout?: ProjectLayout;
  titlePage?: TitlePage;
}

/** The flat on-disk shape (meta + every field). */
export type ProjectData = ProjectMeta & ProjectFields;

/**
 * Build the flat project blob. Equivalent to the object literal the editor used
 * inline; centralizing it here makes the schema one place instead of four.
 */
export function buildProjectData(meta: ProjectMeta, fields: ProjectFields): ProjectData {
  return {
    ...meta,
    blocks: fields.blocks,
    playHeader: fields.playHeader,
    mediaHeader: fields.mediaHeader,
    contentHeader: fields.contentHeader,
    contentLogo: fields.contentLogo,
    docFont: fields.docFont,
    sceneAlign: fields.sceneAlign,
    noteText: fields.noteText,
    sceneCardMeta: fields.sceneCardMeta,
    markerHighlights: fields.markerHighlights,
    layout: fields.layout,
    titlePage: fields.titlePage,
  };
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

function normalizeMode(value: unknown): EditorModeId {
  return typeof value === "string" && MODE_IDS.has(value) ? (value as EditorModeId) : "film";
}

/** Parse a flat blob into the per-mode typed document (tolerant of legacy data). */
export function readProjectDoc(raw: unknown): ProjectDoc {
  const r = asRecord(raw);
  const mode = normalizeMode(r.mode);
  const blocks = Array.isArray(r.blocks) ? (r.blocks as Block[]) : [];
  const base = {
    id: typeof r.id === "string" ? r.id : "",
    name: typeof r.name === "string" ? r.name : "",
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
    blocksCount: typeof r.blocksCount === "number" ? r.blocksCount : 0,
    blocks,
    docFont: typeof r.docFont === "string" ? r.docFont : undefined,
    sceneAlign: typeof r.sceneAlign === "string" ? r.sceneAlign : undefined,
    sceneCardMeta: r.sceneCardMeta,
    markerHighlights: r.markerHighlights,
    layout: (r.layout as ProjectLayout | undefined) ?? undefined,
  };
  const headers = (v: unknown): HeaderItem[] => (Array.isArray(v) ? (v as HeaderItem[]) : []);

  switch (mode) {
    case "play":
      return { ...base, mode, playHeader: headers(r.playHeader) };
    case "short":
      return {
        ...base,
        mode,
        contentHeader: headers(r.contentHeader),
        contentLogo: typeof r.contentLogo === "string" ? r.contentLogo : undefined,
      };
    case "media":
      return { ...base, mode, mediaHeader: headers(r.mediaHeader) };
    case "note":
      return { ...base, mode, noteText: typeof r.noteText === "string" ? r.noteText : "" };
    case "film":
    default:
      return { ...base, mode: "film", titlePage: (r.titlePage as TitlePage | undefined) ?? {} };
  }
}
