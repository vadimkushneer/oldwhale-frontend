import { EditorScreen } from "../../legacy/routes/Editor";
import type { EditorShellProps } from "../EditorShell";

/**
 * NoteEditor — the "note" editor shell (variant A entry point).
 *
 * Today a thin wrapper that fixes routeMode="note" and delegates to the shared
 * EditorScreen; "note"-specific rendering/logic migrates here out of the god
 * component over time. Mounted with key={mode} by EditorPage, so a mode switch
 * remounts this shell (per-mode LS isolation + flush-on-unmount preserved).
 */
export function NoteEditor(props: EditorShellProps) {
  return <EditorScreen {...props} routeMode="note" />;
}
