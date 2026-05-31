import { FilmEditor } from "./film/FilmEditor";
import { PlayEditor } from "./play/PlayEditor";
import { ShortEditor } from "./short/ShortEditor";
import { MediaEditor } from "./media/MediaEditor";
import { NoteEditor } from "./note/NoteEditor";
import type { EditorModeId } from "./EditorMode";
import type { EditorShellComponent } from "./EditorShell";

/**
 * Composition root mapping each mode id to its editor shell. This is the only
 * place allowed to reference every mode (the per-mode folders stay isolated from
 * one another). EditorPage looks the shell up by resolved mode.
 */
const EDITOR_SHELLS: Record<EditorModeId, EditorShellComponent> = {
  film: FilmEditor,
  play: PlayEditor,
  short: ShortEditor,
  media: MediaEditor,
  note: NoteEditor,
};

export function getEditorShell(id: EditorModeId): EditorShellComponent {
  return EDITOR_SHELLS[id];
}
