import type { ScriptBlock } from "@/domain/scriptBlock";

export function blocksToPlainText(blocks: ScriptBlock[], mode: string): string {
  let text = "";
  for (const b of blocks) {
    if (b.type === "scene" || b.type === "act" || b.type === "segment" || b.type === "video") {
      text += "\n\n" + (b.text || b.type).toUpperCase();
      continue;
    }
    if (b.type === "cast") {
      text += "\n" + b.text;
      continue;
    }
    if (b.type === "line") {
      text += "\n" + (b.name ? b.name.toUpperCase() + ". " : "") + b.text;
      continue;
    }
    if (b.type === "char") {
      text += "\n\n" + " ".repeat(20) + b.text;
      continue;
    }
    if (b.type === "dialogue") {
      text += "\n" + " ".repeat(10) + b.text;
      continue;
    }
    if (b.type === "paren") {
      text += "\n" + " ".repeat(15) + b.text;
      continue;
    }
    if (b.type === "trans") {
      text += "\n\n" + " ".repeat(30) + b.text;
      continue;
    }
    if (
      ["anchor", "sync", "vtr", "offscreen", "lower3", "question", "hook", "body", "cta"].includes(
        b.type,
      )
    ) {
      text += "\n" + b.text;
      continue;
    }
    if (b.type === "action" || b.type === "stage" || b.type === "note") {
      text += "\n\n" + b.text;
      continue;
    }
  }
  return text.trim();
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
