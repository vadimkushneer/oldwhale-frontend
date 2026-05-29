// @ts-nocheck
import { BLOCK_DEFS, PLAY_TYPO } from "../../../../domain/blocks";
import { SCREENPLAY_FORMAT } from "../../../../domain/screenplayFormat";
import { getPlayActDisplayText } from "../../../../util/doc";
import { buildPlayDocumentPages } from "./playPagination";
import {
  getPlayActNum,
  getPlayScenePlaceholder,
  resolvePlayDisplayText,
  type PlayExportBlock,
  type PlayHeaderLine,
  type PlayPageEntry,
} from "./playExportCommon";

const PAGE_W = SCREENPLAY_FORMAT.PAGE_W;
const PAGE_H = SCREENPLAY_FORMAT.PAGE_H;
const PAD = { top: 48, right: 72, bottom: 48, left: 72 };

const playFontFamily = (docFont?: string) => `'${docFont || "Times New Roman"}', Times, serif`;

function playBlockExportStyle(
  def: { st?: Record<string, string> },
  block: PlayExportBlock,
  continued: boolean,
  docFont?: string,
): string {
  const st = def.st || {};
  const pt = continued ? 0 : parseInt(String(st.paddingTop || "0"), 10) || 0;
  const pb = parseInt(String(st.paddingBottom || "0"), 10) || 0;
  const pl = parseInt(String(st.paddingLeft || "0"), 10) || 0;
  const pr = parseInt(String(st.paddingRight || "0"), 10) || 0;
  const font = playFontFamily(docFont);

  return [
    "margin:0",
    "box-sizing:border-box",
    `padding-top:${pt}px`,
    `padding-bottom:${pb}px`,
    `padding-left:${pl}px`,
    `padding-right:${pr}px`,
    `font-family:${font}`,
    `font-size:${st.fontSize || PLAY_TYPO.bodyFontSize}`,
    `line-height:${st.lineHeight || PLAY_TYPO.bodyLineHeight}`,
    `font-weight:${block.bold ? "bold" : block.semibold ? "600" : st.fontWeight || "normal"}`,
    `font-style:${block.italic ? "italic" : st.fontStyle || "normal"}`,
    `text-decoration:${block.underline ? "underline" : "none"}`,
    st.textTransform ? `text-transform:${st.textTransform}` : "",
    st.textAlign ? `text-align:${st.textAlign}` : "",
    st.letterSpacing ? `letter-spacing:${st.letterSpacing}` : "",
    "color:#000",
    "white-space:pre-wrap",
    "overflow-wrap:break-word",
  ]
    .filter(Boolean)
    .join(";");
}

function renderPlayLineHtml(
  block: PlayExportBlock,
  displayText: string,
  docFont?: string,
): string {
  const font = playFontFamily(docFont);
  const name = (block.name || "").toUpperCase();
  const bodyStyle = [
    "flex:1 1 auto",
    "min-width:0",
    "white-space:pre-wrap",
    "overflow-wrap:break-word",
    `font-family:${font}`,
    `font-size:${PLAY_TYPO.bodyFontSize}`,
    `line-height:${PLAY_TYPO.bodyLineHeight}`,
    block.bold ? "font-weight:bold" : block.semibold ? "font-weight:600" : "",
    block.italic ? "font-style:italic" : "",
    block.underline ? "text-decoration:underline" : "",
    "color:#000",
  ]
    .filter(Boolean)
    .join(";");

  return `<div style="display:flex;align-items:flex-start;width:100%;padding-top:4px;padding-bottom:0;font-family:${font};font-size:${PLAY_TYPO.bodyFontSize};line-height:${PLAY_TYPO.bodyLineHeight};color:#000;">${
    name
      ? `<span style="font-weight:700;flex-shrink:0;min-width:30px;white-space:pre;">${name}</span><span style="font-weight:700;margin-right:7px;flex-shrink:0;">.</span>`
      : ""
  }<span style="${bodyStyle}">${displayText}</span></div>`;
}

function renderPlayExportBlock(
  blocks: PlayExportBlock[],
  entry: PlayPageEntry,
  docFont?: string,
): string {
  const block = blocks[entry.bi];
  if (!block) return "";

  const defs = BLOCK_DEFS.play;
  const def = defs.find((item) => item.type === block.type) || defs[0];
  const continued = !!entry.continued;
  const displayText = resolvePlayDisplayText(blocks, entry);
  const style = playBlockExportStyle(def, block, continued, docFont);

  if (block.type === "line") {
    return renderPlayLineHtml(block, displayText, docFont);
  }

  let text = displayText;
  if (block.type === "act") {
    text = getPlayActDisplayText(block.text, getPlayActNum(blocks, entry.bi));
  } else if (block.type === "scene" && !text.trim()) {
    text = getPlayScenePlaceholder(blocks, entry.bi);
  } else if (block.type === "spacer") {
    text = "\u00a0";
  }

  return `<div style="${style}">${text}</div>`;
}

function buildPlayTitleHtml(playHeader: PlayHeaderLine[], docFont?: string): string {
  const font = playFontFamily(docFont);
  return playHeader
    .map((h) =>
      h.type === "spacer"
        ? `<div style="height:${h.size || 24}px"></div>`
        : `<p style="margin:0 0 4px;font-family:${h.font ? `'${h.font}', serif` : font};font-size:${h.size || 14}px;font-weight:${h.bold ? "bold" : "normal"};font-style:${h.italic ? "italic" : "normal"};text-decoration:${h.underline ? "underline" : "none"};text-align:${h.align || "left"};color:#000;">${h.text || ""}</p>`,
    )
    .join("");
}

function buildPlayScriptPagesHtml(blocks: PlayExportBlock[], docFont?: string, forPDF = false): string {
  const { pages } = buildPlayDocumentPages({ defs: BLOCK_DEFS.play, blocks });
  const pageClass = forPDF ? "script-page pdf-export-page" : "script-page";

  let html = "";
  pages.forEach((pageBlocks, pageIdx) => {
    let blocksHtml = "";
    pageBlocks.forEach((entry) => {
      blocksHtml += renderPlayExportBlock(blocks, entry, docFont);
    });
    const pageNumber =
      pageIdx > 0 ? `<div style="position:absolute;right:24px;top:24px;font-size:14px;color:#000;font-family:'Courier New',monospace;">${pageIdx + 1}.</div>` : "";
    html += `<div class="${pageClass}">${pageNumber}${blocksHtml}</div>`;
  });
  return html;
}

/** Play export/preview — те же pages[] что в редакторе (buildPlayDocumentPages). */
export function buildPlayScriptExportHTML({
  playHeader,
  blocks,
  docFont,
  titleSepPage,
  forPDF = false,
}: {
  playHeader: PlayHeaderLine[];
  blocks: PlayExportBlock[];
  docFont?: string;
  projectName?: string;
  titleSepPage?: boolean;
  forPDF?: boolean;
}): string {
  const font = playFontFamily(docFont);
  const scriptPagesHtml = buildPlayScriptPagesHtml(blocks, docFont, forPDF);
  const titleHtml = buildPlayTitleHtml(playHeader, docFont);
  const titlePageClass = forPDF && titleSepPage ? "title-page pdf-export-page" : "title-page";

  const previewScreenCss = forPDF
    ? ""
    : `
      html { background: #888; }
      body { margin: 0 auto; }
      .script-page { box-shadow: 0 4px 24px rgba(0,0,0,0.3); margin-bottom: 32px; }
      .script-page:last-child { margin-bottom: 0; }`;

  const previewScript = forPDF
    ? "window.__pdfReady = true;"
    : `function scale(){
        if (window.matchMedia('print').matches) return;
        var s = window.innerWidth / ${PAGE_W};
        document.body.style.transform = 'scale(' + s + ')';
        document.documentElement.style.height = Math.ceil(document.body.scrollHeight * s) + 'px';
      }
      window.addEventListener('beforeprint', function(){
        document.body.style.transform = 'none';
        document.body.style.width = 'auto';
      });
      window.addEventListener('afterprint', function(){ scale(); });
      document.addEventListener('DOMContentLoaded', scale);
      window.addEventListener('resize', scale);`;

  const titleBlock =
    titleSepPage && (forPDF || titleHtml.trim())
      ? `<div class="${titlePageClass}"><div style="display:flex;flex-direction:column;">${titleHtml}</div></div>`
      : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=${PAGE_W}">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; ${forPDF ? "background: #fff;" : ""} }
  body { width: ${PAGE_W}px; font-family: ${font}; color: #000; transform-origin: top left; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .title-page { ${titleSepPage ? "page-break-after: always;" : ""} position: relative; min-height: ${PAGE_H}px; padding: ${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px; font-family: ${font}; background: #fff; }
  .script-page { position: relative; width: ${PAGE_W}px; height: ${PAGE_H}px; padding: ${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px; background: #fff; overflow: hidden; margin: 0; }
  .pdf-export-page { width: ${PAGE_W}px; height: ${PAGE_H}px; background: #fff; overflow: hidden; position: relative; margin: 0; }
  ${previewScreenCss}
</style>
<script>${previewScript}<\/script>
</head><body>
${titleBlock}
${scriptPagesHtml}
</body></html>`;
}
