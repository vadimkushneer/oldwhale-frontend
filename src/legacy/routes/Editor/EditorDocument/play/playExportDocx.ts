// @ts-nocheck
/**
 * Play DOCX export — same pages[] as the editor (buildPlayDocumentPages).
 * Does not touch the screen or playPagination.
 */
import { BLOCK_DEFS, PLAY_TYPO } from "../../../../domain/blocks";
import { SCREENPLAY_FORMAT } from "../../../../domain/screenplayFormat";
import { getPlayActDisplayText } from "../../../../util/doc";
import {
  getPlayActNum,
  getPlayScenePlaceholder,
  playExportBaseName,
  resolvePlayDisplayText,
} from "./playExportCommon";
import { buildPlayDocumentPages } from "./playPagination";

const PLAY_DOCX_FONT_SIZE = 28; // 14pt
const PLAY_DOCX_LINE_TWIP = 284; // 14px × 1.35 lh → twips (×15)

function playPxToTwip(px) {
  return Math.round(px * 15);
}

function playDocxLineSpacing(docx, beforePx = 0) {
  const { LineRuleType } = docx;
  return { before: playPxToTwip(beforePx), after: 0, line: PLAY_DOCX_LINE_TWIP, lineRule: LineRuleType.EXACT };
}

function playDocxBlockSpacing(docx, def, continued) {
  if (continued) return playDocxLineSpacing(docx, 0);
  const pt = parseInt(String(def?.st?.paddingTop || "0"), 10) || 0;
  return playDocxLineSpacing(docx, pt);
}

function buildPlayDocxExternalStyles(docFont) {
  const font = docFont || "Times New Roman";
  const ln = PLAY_DOCX_LINE_TWIP;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${font}" w:eastAsia="${font}" w:hAnsi="${font}" w:cs="${font}"/>
        <w:sz w:val="${PLAY_DOCX_FONT_SIZE}"/>
        <w:szCs w:val="${PLAY_DOCX_FONT_SIZE}"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="${ln}" w:lineRule="exact"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="0" w:after="0" w:line="${ln}" w:lineRule="exact"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${font}" w:eastAsia="${font}" w:hAnsi="${font}" w:cs="${font}"/>
      <w:sz w:val="${PLAY_DOCX_FONT_SIZE}"/>
      <w:szCs w:val="${PLAY_DOCX_FONT_SIZE}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayAct">
    <w:name w:val="Play Act"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:rPr><w:b/><w:caps/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayScene">
    <w:name w:val="Play Scene"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayCast">
    <w:name w:val="Play Cast"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:i/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayStage">
    <w:name w:val="Play Stage"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:i/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayNote">
    <w:name w:val="Play Note"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:i/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="OWPlayPageNum">
    <w:name w:val="Play Page Number"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="right"/></w:pPr>
  </w:style>
</w:styles>`;
}

function styleForPlayType(type) {
  switch (type) {
    case "act":
      return "OWPlayAct";
    case "scene":
      return "OWPlayScene";
    case "cast":
      return "OWPlayCast";
    case "stage":
      return "OWPlayStage";
    case "note":
      return "OWPlayNote";
    default:
      return "Normal";
  }
}

function buildPlayDocxTitleParagraphs(playHeader, docFont, docx) {
  const { Paragraph, TextRun, AlignmentType } = docx;
  const font = docFont || "Times New Roman";
  const txt = (text, opts = {}) =>
    new TextRun({ text: text || "", font: opts.font || font, size: opts.size || PLAY_DOCX_FONT_SIZE, ...opts });

  const alignMap = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  };

  const paras = [];
  for (const h of playHeader) {
    if (h.type === "spacer") {
      paras.push(new Paragraph({ children: [txt("")], spacing: playDocxLineSpacing(docx, h.size || 24) }));
      continue;
    }
    paras.push(
      new Paragraph({
        alignment: alignMap[h.align] || AlignmentType.LEFT,
        children: [
          txt(h.text || "", {
            font: h.font || font,
            size: (h.size || 14) * 2,
            bold: h.bold,
            italics: h.italic,
            underline: h.underline ? {} : undefined,
          }),
        ],
        spacing: playDocxLineSpacing(docx, 0),
      }),
    );
  }
  return paras;
}

function buildPlayLineParagraph(block, displayText, docFont, docx, spacing, extra = {}) {
  const { Paragraph, TextRun } = docx;
  const font = docFont || "Times New Roman";
  const txt = (text, opts = {}) =>
    new TextRun({ text: text || "", font, size: PLAY_DOCX_FONT_SIZE, ...opts });
  const runs = [];
  if (block.name) runs.push(txt(`${block.name.toUpperCase()}.  `, { bold: true }));
  runs.push(
    txt(displayText, {
      bold: block.bold,
      italics: block.italic,
      underline: block.underline ? {} : undefined,
    }),
  );
  return new Paragraph({ children: runs, spacing, ...extra });
}

function buildPlayDocxPageParagraphs(pageBlocks, blocks, docFont, docx, { pageIdx = 0, pageBreakBefore = false } = {}) {
  const { Paragraph, TextRun, AlignmentType } = docx;
  const font = docFont || "Times New Roman";
  const txt = (text, opts = {}) =>
    new TextRun({ text: text || "", font, size: PLAY_DOCX_FONT_SIZE, ...opts });
  const defs = BLOCK_DEFS.play;
  const paras = [];
  let isFirst = true;

  if (pageIdx > 0) {
    paras.push(
      new Paragraph({
        style: "OWPlayPageNum",
        alignment: AlignmentType.RIGHT,
        children: [txt(`${pageIdx + 1}.`)],
        spacing: playDocxLineSpacing(docx, 0),
        ...(pageBreakBefore ? { pageBreakBefore: true } : {}),
      }),
    );
    isFirst = false;
  }

  for (const entry of pageBlocks) {
    const block = blocks[entry.bi];
    if (!block) continue;

    const def = defs.find((item) => item.type === block.type) || defs[0];
    const continued = !!entry.continued;
    const displayText = resolvePlayDisplayText(blocks, entry);
    const spacing = playDocxBlockSpacing(docx, def, continued);
    const breakOpts = isFirst && pageBreakBefore ? { pageBreakBefore: true } : {};

    if (block.type === "line") {
      paras.push(buildPlayLineParagraph(block, displayText, docFont, docx, spacing, breakOpts));
      isFirst = false;
      continue;
    }

    let text = displayText;
    if (block.type === "act") {
      text = getPlayActDisplayText(block.text, getPlayActNum(blocks, entry.bi));
    } else if (block.type === "scene" && !text.trim()) {
      text = getPlayScenePlaceholder(blocks, entry.bi);
    }

    const runOpts = {};
    if (block.type === "act") {
      runOpts.bold = true;
      runOpts.allCaps = true;
    } else if (block.type === "scene") {
      runOpts.bold = true;
    } else if (block.type === "cast" || block.type === "stage" || block.type === "note") {
      runOpts.italics = true;
    }
    if (block.bold) runOpts.bold = true;
    if (block.italic) runOpts.italics = true;

    paras.push(
      new Paragraph({
        style: styleForPlayType(block.type),
        children: [txt(text, runOpts)],
        spacing,
        ...breakOpts,
      }),
    );
    isFirst = false;
  }

  return paras;
}

function buildPlayDocxScriptParagraphs(pages, blocks, docFont, docx) {
  const scriptParas = [];
  pages.forEach((pageBlocks, pageIdx) => {
    scriptParas.push(
      ...buildPlayDocxPageParagraphs(pageBlocks, blocks, docFont, docx, {
        pageIdx,
        pageBreakBefore: pageIdx > 0,
      }),
    );
  });
  return scriptParas;
}

/** Play DOCX — pagination via buildPlayDocumentPages (same as editor/PDF). */
export function buildPlayDocxDocument({ blocks, playHeader, docFont, titleSepPage, projectName, docx }) {
  const { Document, convertInchesToTwip, LineRuleType } = docx;
  const { pages } = buildPlayDocumentPages({ defs: BLOCK_DEFS.play, blocks });

  const F = SCREENPLAY_FORMAT;
  const letterW = convertInchesToTwip(8.5);
  const letterH = convertInchesToTwip(11);
  const marginTop = convertInchesToTwip(F.PAGE_H > 0 ? 48 / 96 : 0.5);
  const marginSide = convertInchesToTwip(72 / 96);
  const marginBottom = convertInchesToTwip(48 / 96);
  const pageGrid = { type: "lines", linePitch: PLAY_DOCX_LINE_TWIP };

  const scriptSecProps = {
    page: {
      size: { width: letterW, height: letterH },
      margin: { top: marginTop, bottom: marginBottom, left: marginSide, right: marginSide },
    },
    grid: pageGrid,
  };

  const sections = [];

  if (titleSepPage && playHeader?.length) {
    sections.push({
      properties: {
        page: {
          size: { width: letterW, height: letterH },
          margin: { top: marginTop, bottom: marginBottom, left: marginSide, right: marginSide },
        },
        grid: pageGrid,
      },
      children: buildPlayDocxTitleParagraphs(playHeader, docFont, docx),
    });
  }

  sections.push({
    properties: scriptSecProps,
    children: buildPlayDocxScriptParagraphs(pages, blocks, docFont, docx),
  });

  return new Document({
    externalStyles: buildPlayDocxExternalStyles(docFont),
    sections,
  });
}

export function playDocxFileName(playHeader, projectName) {
  return `${playExportBaseName(playHeader, projectName)}.docx`;
}
