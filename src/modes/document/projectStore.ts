import { buildProjectData, type ProjectData, type ProjectFields } from "./serialize";
import { findLatestEntryForMode, upsertProjectEntry, type ProjectIndexEntry } from "./projectIndex";
import type { ProjectMeta } from "./ProjectDoc";

/**
 * projectStore — shared localStorage load/save for projects, composed from the
 * already-extracted `serialize` (blob shape) + `projectIndex` (the index) + the
 * exact LS keys the editor uses. Lets per-mode editors (e.g. PlayEditorNext) read
 * and persist the SAME projects as the legacy EditorScreen without duplicating the
 * format. (EditorScreen keeps its own inline copy for now; both use the same
 * serialize/index, so the on-disk shape is identical.)
 */
const OW_ACTIVE_PROJECT_KEY = "ow_active_project";
const OW_INDEX_KEY = "ow_index";
const projKey = (id: string) => "ow_proj_" + id;

export function readProjectSnapshot(id: string | null): ProjectData | null {
  if (!id) return null;
  try {
    return JSON.parse(localStorage.getItem(projKey(id)) || "null") as ProjectData | null;
  } catch {
    return null;
  }
}

function readIndex(): ProjectIndexEntry[] {
  try {
    return JSON.parse(localStorage.getItem(OW_INDEX_KEY) || "[]") as ProjectIndexEntry[];
  } catch {
    return [];
  }
}

/** Active project if it matches `mode`, else the most-recent indexed one. */
export function loadLastProjectForMode(mode: string): ProjectData | null {
  try {
    const active = readProjectSnapshot(localStorage.getItem(OW_ACTIVE_PROJECT_KEY));
    if (active && (active.mode || "film") === mode) return active;
    const meta = findLatestEntryForMode(readIndex(), mode);
    return meta ? readProjectSnapshot(meta.id) : null;
  } catch {
    return null;
  }
}

function persistActiveProjectId(id: string): void {
  if (!id) return;
  try {
    localStorage.setItem(OW_ACTIVE_PROJECT_KEY, id);
  } catch {
    /* noop */
  }
}

/** Write a project blob + upsert the index + mark it active. */
export function saveProjectForMode(
  id: string,
  name: string,
  blocks: ProjectFields["blocks"],
  mode: string,
  fields: Omit<ProjectFields, "blocks"> = {},
): void {
  try {
    const meta: ProjectMeta = {
      id,
      name,
      mode: mode as ProjectMeta["mode"],
      updatedAt: Date.now(),
      blocksCount: blocks.filter((b) => b.type === "scene").length,
    };
    const data = buildProjectData(meta, { blocks, ...fields });
    localStorage.setItem(projKey(id), JSON.stringify(data));
    const next = upsertProjectEntry(readIndex(), meta as ProjectIndexEntry);
    localStorage.setItem(OW_INDEX_KEY, JSON.stringify(next));
    persistActiveProjectId(id);
  } catch {
    /* noop */
  }
}
