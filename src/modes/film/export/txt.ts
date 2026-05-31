/**
 * Film (Сценарий) plain-text export — FROZEN.
 *
 * Lifted verbatim from `exportTXT` in the legacy editor. Do not change the
 * output: film is locked, and the golden test in `modes/export/txt.test.ts`
 * pins this byte-for-byte.
 */
import {
  center,
  wrap,
  type TxtExportContext,
  type TxtExportResult,
} from "../../export/shared/txt";

export function buildFilmTxt(ctx: TxtExportContext): TxtExportResult {
  const { projectName = "", blocks } = ctx;
  const tp = ctx.titlePage ?? {};
  const lines: string[] = [];

  // Title page
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "");
  lines.push(center((tp.title || projectName).toUpperCase()));
  if (tp.genre) lines.push(center(tp.genre));
  lines.push("");
  if (tp.author) {
    lines.push(center("Автор"));
    lines.push(center(tp.author));
  }
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
  if (tp.phone) lines.push("Тел.: " + tp.phone);
  if (tp.email) lines.push("Email: " + tp.email);
  if (tp.year) lines.push(tp.year);
  lines.push("", "");
  lines.push("=".repeat(60));
  lines.push("", "");

  // Script body
  for (const b of blocks) {
    if (b.type === "act") {
      lines.push("", "");
      lines.push(center((b.text || "").toUpperCase()));
      lines.push("", "");
    } else if (b.type === "scene") {
      lines.push("");
      lines.push((b.text || "").toUpperCase());
    } else if (b.type === "cast") {
      lines.push((b.text || "").toUpperCase());
      lines.push("");
    } else if (b.type === "action") {
      wrap(b.text || "", 0, 60).forEach((l) => lines.push(l));
      lines.push("");
    } else if (b.type === "char") {
      lines.push("");
      lines.push(center((b.text || "").toUpperCase()));
    } else if (b.type === "dialogue") {
      wrap(b.text || "", 20, 40).forEach((l) => lines.push(l));
      lines.push("");
    } else if (b.type === "paren") {
      wrap("(" + b.text + ")", 25, 30).forEach((l) => lines.push(l));
    } else if (b.type === "trans") {
      lines.push("");
      lines.push(" ".repeat(42) + (b.text || "").toUpperCase());
      lines.push("");
    } else if (b.type === "note") {
      wrap(b.text || "", 0, 60).forEach((l) => lines.push(l));
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
