/**
 * Play (Пьеса) plain-text export.
 *
 * Lifted verbatim from `exportTXT` in the legacy editor: the title page is built
 * from `playHeader`, and the body uses the play block loop. The file name keeps
 * the original behaviour of falling back through the film title page / project
 * name, so output matches the old editor exactly.
 */
import { getPlayActDisplayText } from "../../../legacy/util/doc";
import {
  center,
  wrap,
  type TxtExportContext,
  type TxtExportResult,
} from "../../export/shared/txt";

export function buildPlayTxt(ctx: TxtExportContext): TxtExportResult {
  const { projectName = "", blocks, playHeader = [] } = ctx;
  const tp = ctx.titlePage ?? {};
  const lines: string[] = [];

  // Title page from playHeader
  const ph = playHeader.filter((h) => h.type !== "spacer");
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "");
  ph.forEach((h) => {
    if (h.text) lines.push(h.text);
  });
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
  lines.push("=".repeat(60));
  lines.push("", "");

  // Script body
  let actNum = 0;
  let sceneInAct = 0;
  for (const b of blocks) {
    if (b.type === "act") {
      actNum++;
      sceneInAct = 0;
      lines.push("", "");
      lines.push(center(getPlayActDisplayText(b.text, actNum).toUpperCase()));
      lines.push("", "");
    } else if (b.type === "scene") {
      sceneInAct++;
      lines.push("");
      lines.push(b.text || "Сцена " + sceneInAct);
    } else if (b.type === "cast") {
      lines.push("(" + b.text + ")");
      lines.push("");
    } else if (b.type === "stage") {
      wrap(b.text || "", 0, 60).forEach((l) => lines.push(l));
      lines.push("");
    } else if (b.type === "line") {
      const prefix = b.name ? b.name.toUpperCase() + ".  " : "";
      wrap(prefix + (b.text || ""), 0, 60).forEach((l) => lines.push(l));
      lines.push("");
    } else if (b.type === "note") {
      lines.push("[" + b.text + "]");
      lines.push("");
    } else if (b.type === "spacer") {
      lines.push("");
    }
  }

  return {
    filename: (tp.title || projectName || "screenplay") + ".txt",
    text: lines.join("\n"),
  };
}
