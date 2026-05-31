/**
 * Short / video (Видео) plain-text export.
 *
 * Lifted verbatim from `exportTXT`. Built entirely from `contentHeader` + the
 * short block loop (the legacy title-page section was dead for this mode, since
 * the short branch returned with its own `shortLines`).
 */
import { type TxtExportContext, type TxtExportResult } from "../../export/shared/txt";

export function buildShortTxt(ctx: TxtExportContext): TxtExportResult {
  const { projectName = "", blocks, contentHeader = [] } = ctx;
  const out: string[] = [];

  contentHeader
    .filter((h) => h.type !== "spacer" && h.text)
    .forEach((h) => {
      if (h.text) out.push(h.text);
    });
  out.push("=".repeat(60), "", "");

  for (const b of blocks) {
    if (b.type === "scene") {
      out.push("", "");
      out.push((b.text || "").toUpperCase());
      out.push("-".repeat(40));
    } else if (b.type === "hook") {
      out.push("");
      out.push("▶ " + (b.text || ""));
    } else if (b.type === "body") {
      out.push("  " + (b.text || ""));
    } else if (b.type === "cta") {
      out.push("");
      out.push("→ " + (b.text || ""));
    } else if (b.type === "action") {
      out.push(b.text || "");
    } else if (b.type === "spacer") {
      out.push("");
    }
  }

  return {
    filename: (projectName || "content") + ".txt",
    text: out.join("\n"),
  };
}
