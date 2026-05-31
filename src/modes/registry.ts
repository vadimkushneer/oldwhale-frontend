/**
 * Editor-mode registry — the one place the shell looks up a mode.
 *
 * It adapts the existing domain tables (`BLOCK_DEFS`, `INIT`, `MODES` from
 * `legacy/domain/blocks`) into stable `EditorModeDescriptor`s. Those tables are
 * already keyed by mode, so the data is effectively decoupled today; this file
 * just gives the shell a typed, mode-agnostic way to reach them so that the
 * scattered `if (mode === "...")` checks can collapse into `getEditorMode(id)`.
 *
 * Nothing here mutates shared state: `initialBlocks()` always returns a fresh
 * deep-ish copy, mirroring the `.map(b => ({ ...b }))` the editor does today, so
 * one mode can never hand another a live reference into `INIT`.
 */
import { BLOCK_DEFS, INIT, MODES } from "../legacy/domain/blocks";
import type { Block, BlockDef, EditorModeDescriptor, EditorModeId } from "./EditorMode";

/** Modes whose code is locked (see `EditorModeDescriptor.frozen`). */
const FROZEN_MODE_IDS: ReadonlySet<EditorModeId> = new Set<EditorModeId>(["film"]);

/* The source tables come from a `@ts-nocheck` module and keep precise literal
 * shapes, so widen through `unknown` to the contract types. */
const blockDefsByMode = BLOCK_DEFS as unknown as Record<string, BlockDef[] | undefined>;
const initByMode = INIT as unknown as Record<string, Block[] | undefined>;
const modeCatalog = MODES as unknown as ReadonlyArray<{ id: EditorModeId; label: string }>;

function cloneBlocks(blocks: readonly Block[]): Block[] {
  return blocks.map((b) => ({ ...b }));
}

function makeDescriptor(id: EditorModeId, label: string): EditorModeDescriptor {
  const blockDefs = blockDefsByMode[id] ?? [];
  const starter = initByMode[id] ?? [];
  return {
    id,
    label,
    frozen: FROZEN_MODE_IDS.has(id),
    blockDefs,
    initialBlocks: () => cloneBlocks(starter),
  };
}

/** All modes keyed by id, derived from the existing `MODES` catalog. */
export const EDITOR_MODES: Readonly<Record<EditorModeId, EditorModeDescriptor>> =
  Object.freeze(
    modeCatalog.reduce(
      (acc, { id, label }) => {
        acc[id] = makeDescriptor(id, label);
        return acc;
      },
      {} as Record<EditorModeId, EditorModeDescriptor>,
    ),
  );

/** Ordered list of valid mode ids (tab order). */
export const EDITOR_MODE_IDS: readonly EditorModeId[] = modeCatalog.map((m) => m.id);

/** Look up a mode descriptor; `null` for unknown ids (route validation). */
export function getEditorMode(id: string | undefined | null): EditorModeDescriptor | null {
  if (!id) return null;
  return (EDITOR_MODES as Record<string, EditorModeDescriptor | undefined>)[id] ?? null;
}

/** True when a mode is code-locked and must not be edited. */
export function isFrozenMode(id: string | undefined | null): boolean {
  const mode = getEditorMode(id);
  return mode ? mode.frozen : false;
}

/** All descriptors in tab order. */
export function listEditorModes(): EditorModeDescriptor[] {
  return EDITOR_MODE_IDS.map((id) => EDITOR_MODES[id]);
}
