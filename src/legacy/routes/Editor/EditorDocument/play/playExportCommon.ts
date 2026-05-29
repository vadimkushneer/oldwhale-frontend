// @ts-nocheck
/**
 * Shared play export helpers (pagination entries, filenames, plain-text layout).
 */
import { getPlayActDisplayText } from "../../../../util/doc";

export type PlayExportBlock = {
  type: string;
  text?: string;
  name?: string;
  bold?: boolean;
  semibold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type PlayHeaderLine = {
  key?: string;
  type?: string;
  text?: string;
  size?: number;
  font?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: string;
};

export type PlayPageEntry = {
  bi: number;
  part: string;
  split?: number;
  start?: number;
  end?: number | null;
  continued?: boolean;
};

export function playExportBaseName(playHeader: PlayHeaderLine[] | undefined, projectName: string | undefined): string {
  return playHeader?.find?.((h) => h.key === "title")?.text?.trim() || projectName?.trim() || "play";
}

export function getPlayActNum(blocks: PlayExportBlock[], blockIndex: number): number {
  let actNum = 0;
  for (let i = 0; i <= blockIndex; i += 1) {
    if (blocks[i]?.type === "act") actNum += 1;
  }
  return actNum;
}

export function getPlayScenePlaceholder(blocks: PlayExportBlock[], blockIndex: number): string {
  let sceneInAct = 0;
  for (let i = 0; i <= blockIndex; i += 1) {
    if (blocks[i]?.type === "act" && i < blockIndex) sceneInAct = 0;
    if (blocks[i]?.type === "scene") sceneInAct += 1;
  }
  return `Сцена ${sceneInAct}`;
}

export function resolvePlayDisplayText(blocks: PlayExportBlock[], entry: PlayPageEntry): string {
  const block = blocks[entry.bi];
  if (!block) return "";
  const blockText = block.text || "";
  const { part, split = -1, start = 0, end = null } = entry;

  if (part === "playSlice") return blockText.substring(start, end ?? blockText.length);
  if (part === "first") return blockText.substring(0, split);
  if (part === "second") return blockText.substring(split).replace(/^\s+/, "");
  return blockText;
}

export function resolvePlayBlockLabel(
  blocks: PlayExportBlock[],
  block: PlayExportBlock,
  blockIndex: number,
  displayText: string,
): string {
  if (block.type === "act") {
    return getPlayActDisplayText(block.text, getPlayActNum(blocks, blockIndex));
  }
  if (block.type === "scene" && !displayText.trim()) {
    return getPlayScenePlaceholder(blocks, blockIndex);
  }
  return displayText;
}

export function centerLine(s: string, width = 60): string {
  const p = Math.max(0, Math.floor((width - s.length) / 2));
  return " ".repeat(p) + s;
}

export function wrapLine(s: string, indent = 0, width = 60): string[] {
  const words = s.split(" ");
  const rows: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      rows.push(" ".repeat(indent) + cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) rows.push(" ".repeat(indent) + cur.trim());
  return rows;
}

export function escapeFdxText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
