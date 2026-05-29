// @ts-nocheck
/**
 * Play FDX export — flat blocks[] pipeline (extracted from index.tsx exportFDX).
 */
import { getPlayActDisplayText } from "../../../../util/doc";
import { escapeFdxText, playExportBaseName, type PlayExportBlock, type PlayHeaderLine } from "./playExportCommon";

function buildPlayFdxContent(blocks: PlayExportBlock[]): string {
  let xml = "";
  let actNum = 0;
  let sceneInAct = 0;

  for (const b of blocks) {
    let type = "";
    let text = b.text || "";
    if (b.type === "act") {
      actNum += 1;
      sceneInAct = 0;
      type = "Scene Heading";
      text = getPlayActDisplayText(text, actNum).toUpperCase();
    } else if (b.type === "scene") {
      sceneInAct += 1;
      type = "Scene Heading";
      text = text || `${actNum}.${sceneInAct}`;
    } else if (b.type === "cast") {
      type = "Action";
      text = `(${text})`;
    } else if (b.type === "stage") {
      type = "Action";
    } else if (b.type === "line") {
      type = "Action";
      text = (b.name ? `${b.name.toUpperCase()}.  ` : "") + text;
    } else if (b.type === "note") {
      type = "Action";
      text = `[${text}]`;
    }
    if (!type) continue;
    xml += `<Paragraph Type="${type}"><Text>${escapeFdxText(text)}</Text></Paragraph>\n`;
  }

  return xml;
}

function buildPlayFdxTitlePage(playHeader: PlayHeaderLine[], projectName: string | undefined): string {
  const title = playHeader.find((h) => h.key === "title")?.text?.trim() || projectName || "";
  const genre = playHeader.find((h) => h.key === "genre")?.text?.trim() || "";
  const author = playHeader.find((h) => h.key === "author")?.text?.trim() || "";
  const remark = playHeader.find((h) => h.key === "remark")?.text?.trim() || "";

  let xml = `<TitlePage><Content>`;
  if (title) {
    xml += `<Paragraph Type="Title"><Text>${escapeFdxText(title.toUpperCase())}</Text></Paragraph>`;
  }
  if (genre) {
    xml += `<Paragraph Type="SubTitle"><Text>${escapeFdxText(genre)}</Text></Paragraph>`;
  }
  if (author) {
    xml += `<Paragraph Type="WrittenBy"><Text>Автор</Text></Paragraph>`;
    xml += `<Paragraph Type="Author"><Text>${escapeFdxText(author)}</Text></Paragraph>`;
  }
  if (remark) {
    xml += `<Paragraph Type="Contact"><Text>${escapeFdxText(remark)}</Text></Paragraph>`;
  }
  xml += `</Content></TitlePage>\n`;
  return xml;
}

export function buildPlayFdxExport({
  blocks,
  playHeader,
  projectName,
}: {
  blocks: PlayExportBlock[];
  playHeader: PlayHeaderLine[];
  projectName?: string;
}): { xml: string; fileName: string } {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  xml += `<FinalDraft DocumentType="Script" Template="No" Version="3">\n`;
  xml += `<Content>\n`;
  xml += buildPlayFdxContent(blocks);
  xml += `</Content>\n`;
  xml += buildPlayFdxTitlePage(playHeader, projectName);
  xml += `</FinalDraft>`;

  return {
    xml,
    fileName: `${playExportBaseName(playHeader, projectName)}.fdx`,
  };
}
