/**
 * Plain-text export dispatcher.
 *
 * The editor shell calls `buildModeTxt(mode, ctx)` and handles the
 * download/share itself. Returns `null` for modes without a structured text
 * builder here (note is handled inline by the shell because its source is HTML
 * that must be flattened via the DOM).
 */
import type { EditorModeId } from "../EditorMode";
import type { TxtExportContext, TxtExportResult } from "./shared/txt";
import { buildFilmTxt } from "../film/export/txt";
import { buildPlayTxt } from "../play/export/txt";
import { buildShortTxt } from "../short/export/txt";
import { buildMediaTxt } from "../media/export/txt";

export function buildModeTxt(
  mode: EditorModeId | string,
  ctx: TxtExportContext,
): TxtExportResult | null {
  switch (mode) {
    case "film":
      return buildFilmTxt(ctx);
    case "play":
      return buildPlayTxt(ctx);
    case "short":
      return buildShortTxt(ctx);
    case "media":
      return buildMediaTxt(ctx);
    default:
      return null;
  }
}

export type { TxtExportContext, TxtExportResult } from "./shared/txt";
