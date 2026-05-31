/**
 * Film mode — the FROZEN, canonical reference module.
 *
 * Film is feature-complete and locked while play is being worked on. Its logic
 * still physically lives in the legacy god component; this module is the
 * isolated home it will be lifted into, and the reference shape every other
 * mode's module is measured against.
 *
 * Rules for this folder:
 *  - Do not change film behaviour here. Lifts out of the god component must be
 *    pure cut-and-paste (no rewrites), so the hard-won export fixes survive.
 *  - This module must never import a sibling mode (`modes/play`, etc.). The
 *    ESLint `no-restricted-imports` boundary enforces it.
 *
 * The film format constants (page geometry, indents, pagination budget) already
 * live in one place — `legacy/domain/screenplayFormat` — so they are re-exported
 * here as film's typography source of truth rather than copied.
 */
import { getEditorMode } from "../registry";
import type { EditorModeDescriptor } from "../EditorMode";
import {
  SCREENPLAY_FORMAT,
  buildScreenplayCssVars,
  buildFilmBlockCssVars,
  normalizeFilmBlockText,
} from "../../legacy/domain/screenplayFormat";

/** The film descriptor from the registry (data half of the contract). */
export const filmMode: EditorModeDescriptor = getEditorMode("film")!;

/** Film code is locked. */
export const FILM_FROZEN = true as const;

export {
  SCREENPLAY_FORMAT,
  buildScreenplayCssVars,
  buildFilmBlockCssVars,
  normalizeFilmBlockText,
};
