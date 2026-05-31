/**
 * Media (Медиа) plain-text export.
 *
 * Lifted verbatim from `exportTXT`. Built from `mediaHeader` + the media block
 * loop.
 */
import { type TxtExportContext, type TxtExportResult } from "../../export/shared/txt";

export function buildMediaTxt(ctx: TxtExportContext): TxtExportResult {
  const { projectName = "", blocks, mediaHeader = [] } = ctx;
  const out: string[] = [];

  mediaHeader
    .filter((h) => h.type !== "spacer" && h.text)
    .forEach((h) => {
      if (h.text) out.push(h.text);
    });
  out.push("=".repeat(60), "", "");

  for (const b of blocks) {
    if (b.type === "segment") {
      out.push("", "");
      out.push((b.text || "").toUpperCase());
      out.push("-".repeat(40));
    } else if (b.type === "anchor") {
      out.push("");
      out.push(b.text || "");
    } else if (b.type === "sync") {
      out.push("  | " + (b.text || ""));
    } else if (b.type === "vtr") {
      out.push("[ВТР] " + (b.text || ""));
    } else if (b.type === "offscreen") {
      out.push("[ЗАКАДР] " + (b.text || ""));
    } else if (b.type === "lower3") {
      out.push("[ПЛАШКА] " + (b.text || ""));
    } else if (b.type === "question") {
      out.push("");
      out.push("? " + (b.text || ""));
    } else if (b.type === "note") {
      out.push("  (" + (b.text || "") + ")");
    } else if (b.type === "spacer") {
      out.push("");
    }
  }

  return {
    filename: (projectName || "media") + ".txt",
    text: out.join("\n"),
  };
}
