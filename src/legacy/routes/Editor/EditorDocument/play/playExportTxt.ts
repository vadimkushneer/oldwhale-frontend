// @ts-nocheck
/**
 * Play TXT export — same pages[] as editor / PDF / DOCX (buildPlayDocumentPages).
 */
import { BLOCK_DEFS } from "../../../../domain/blocks";
import { getPlayActDisplayText } from "../../../../util/doc";
import { buildPlayDocumentPages } from "./playPagination";
import {
  centerLine,
  getPlayActNum,
  getPlayScenePlaceholder,
  playExportBaseName,
  resolvePlayDisplayText,
  wrapLine,
  type PlayExportBlock,
  type PlayHeaderLine,
  type PlayPageEntry,
} from "./playExportCommon";

/** Title block from playHeader (same layout as legacy exportTXT). */
export function buildPlayTitleTxtLines(playHeader: PlayHeaderLine[]): string[] {
  const lines: string[] = [];
  const ph = playHeader.filter((h) => h.type !== "spacer");
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "");
  ph.forEach((h) => {
    if (h.text) lines.push(h.text);
  });
  lines.push("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
  lines.push("=".repeat(60));
  lines.push("", "");
  return lines;
}

function lineNamePrefix(block: PlayExportBlock, entry: PlayPageEntry): string {
  if (block.type !== "line" || !block.name) return "";
  if (entry.part === "second") return "";
  if (entry.part === "playSlice" && entry.continued) return "";
  if (entry.part === "first" || entry.part === "full" || entry.part === "playSlice") {
    return `${block.name.toUpperCase()}.  `;
  }
  return "";
}

function appendPlayEntryTxtLines(
  lines: string[],
  blocks: PlayExportBlock[],
  entry: PlayPageEntry,
  addTrailingBlank: boolean,
): void {
  const block = blocks[entry.bi];
  if (!block) return;

  const continued = !!entry.continued;
  const displayText = resolvePlayDisplayText(blocks, entry);

  if (block.type === "spacer") {
    if (!continued) lines.push("");
    return;
  }

  if (block.type === "act") {
    if (continued) return;
    const text = getPlayActDisplayText(block.text, getPlayActNum(blocks, entry.bi));
    lines.push("", "");
    lines.push(centerLine(text.toUpperCase()));
    lines.push("", "");
    return;
  }

  if (block.type === "scene") {
    if (!continued) lines.push("");
    const text = displayText.trim() ? displayText : getPlayScenePlaceholder(blocks, entry.bi);
    lines.push(text);
    if (addTrailingBlank) lines.push("");
    return;
  }

  if (block.type === "cast") {
    lines.push(`(${displayText})`);
    if (addTrailingBlank) lines.push("");
    return;
  }

  if (block.type === "stage") {
    wrapLine(displayText, 0, 60).forEach((l) => lines.push(l));
    if (addTrailingBlank) lines.push("");
    return;
  }

  if (block.type === "line") {
    const prefix = lineNamePrefix(block, entry);
    wrapLine(prefix + displayText, 0, 60).forEach((l) => lines.push(l));
    if (addTrailingBlank) lines.push("");
    return;
  }

  if (block.type === "note") {
    lines.push(`[${displayText}]`);
    if (addTrailingBlank) lines.push("");
  }
}

/** Script body via buildPlayDocumentPages (editor / PDF / DOCX parity). */
export function buildPlayScriptTxtLines(blocks: PlayExportBlock[]): string[] {
  const { pages } = buildPlayDocumentPages({ defs: BLOCK_DEFS.play, blocks });
  const entries: PlayPageEntry[] = [];
  pages.forEach((pageBlocks) => {
    pageBlocks.forEach((entry) => entries.push(entry as PlayPageEntry));
  });

  const lines: string[] = [];
  entries.forEach((entry, idx) => {
    const next = entries[idx + 1];
    const block = blocks[entry.bi];
    const blockDone = !next || next.bi !== entry.bi;
    const addTrailingBlank = blockDone && block?.type !== "act" && block?.type !== "spacer";
    appendPlayEntryTxtLines(lines, blocks, entry, addTrailingBlank);
  });

  return lines;
}

export function buildPlayTxtExport({
  playHeader,
  blocks,
  projectName,
}: {
  playHeader: PlayHeaderLine[];
  blocks: PlayExportBlock[];
  projectName?: string;
}): { text: string; fileName: string } {
  const lines = [...buildPlayTitleTxtLines(playHeader), ...buildPlayScriptTxtLines(blocks)];
  return {
    text: lines.join("\n"),
    fileName: `${playExportBaseName(playHeader, projectName)}.txt`,
  };
}

export function playTxtFileName(playHeader: PlayHeaderLine[] | undefined, projectName: string | undefined): string {
  return `${playExportBaseName(playHeader, projectName)}.txt`;
}
