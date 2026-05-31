/**
 * Play render bricks — the play-mode block renderers lifted out of the god
 * component (scene heading, the "ОТСТУП" spacer, and a dialogue line with its
 * speaker-name field). The play counterpart to film's FilmSceneBlock; first step
 * toward a standalone PlayEditor page.
 *
 * Extracted verbatim. Their props are the editor-core surface each needs — the
 * same shape BlockTextarea takes — so they'll consume `useEditorCore()` once it
 * exists. Static theme tokens are imported directly; the search overlay is a
 * render-prop so it stays in the shell.
 */
import { type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import { T1, T3 } from "../../legacy/ui/tokens";
import type { EditorBlock } from "../editor-core/blocks";

type Id = EditorBlock["id"];

interface OverlayRenderProp {
  (config: { scope: string; blockId: Id; text?: string; overlayStyle: CSSProperties }): ReactNode;
}

interface CommonCore {
  blockRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
  docFont?: string;
  autoH: (el: HTMLTextAreaElement) => void;
  updBlock: (id: Id, text: string) => void;
  setFoc: (id: Id) => void;
  setFocId: (updater: (f: Id | null) => Id | null) => void;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>, block: EditorBlock) => void;
  renderSearchOverlay: OverlayRenderProp;
}

export interface PlaySceneProps extends CommonCore {
  block: EditorBlock;
  blocks: readonly EditorBlock[];
  sceneAlign?: CSSProperties["textAlign"];
}

export function PlayScene({
  block,
  blocks,
  sceneAlign,
  blockRefs,
  docFont,
  autoH,
  updBlock,
  setFoc,
  setFocId,
  onKey,
  renderSearchOverlay,
}: PlaySceneProps) {
  const idx = blocks.findIndex((b) => b.id === block.id);
  let sceneInAct = 0;
  for (let i = 0; i <= idx; i++) {
    if (blocks[i].type === "act" && i < idx) sceneInAct = 0;
    if (blocks[i].type === "scene") sceneInAct++;
  }
  const autoLabel = "Сцена " + sceneInAct;
  const font = `${docFont || "Times New Roman"},serif`;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {renderSearchOverlay({
        scope: "block",
        blockId: block.id,
        text: block.text,
        overlayStyle: {
          boxSizing: "border-box",
          padding: "16px 0 4px",
          fontFamily: font,
          fontSize: "15px",
          lineHeight: "1.7",
          fontWeight: "bold",
          textAlign: sceneAlign || "left",
        },
      })}
      <textarea
        ref={(el) => {
          blockRefs.current[block.id] = el;
          if (el) autoH(el);
        }}
        value={block.text}
        onChange={(e) => {
          updBlock(block.id, e.target.value);
          autoH(e.target);
        }}
        onFocus={() => setFoc(block.id)}
        onBlur={() => setTimeout(() => setFocId((f) => (f === block.id ? null : f)), 300)}
        onKeyDown={(e) => onKey(e, block)}
        placeholder={autoLabel}
        className="scene-ph"
        spellCheck={false}
        rows={1}
        style={
          {
            width: "100%",
            display: "block",
            position: "relative",
            zIndex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            fontFamily: font,
            fontSize: "15px",
            lineHeight: "1.7",
            fontWeight: "bold",
            textAlign: sceneAlign || "left",
            color: T1,
            boxSizing: "border-box",
            padding: "16px 0 4px",
            "::placeholder": { color: T1, opacity: 1 },
          } as CSSProperties
        }
      />
    </div>
  );
}

export interface PlaySpacerProps {
  block: EditorBlock;
  focId: Id | null;
  accentColor: string;
  setFoc: (id: Id) => void;
  onKey: (e: React.KeyboardEvent<HTMLDivElement>, block: EditorBlock) => void;
}

export function PlaySpacer({ block, focId, accentColor, setFoc, onKey }: PlaySpacerProps) {
  const focused = focId === block.id;
  return (
    <div
      tabIndex={0}
      onFocus={() => setFoc(block.id)}
      onKeyDown={(e) => onKey(e, block)}
      className="no-print"
      style={{
        height: "24px",
        width: "100%",
        cursor: "text",
        outline: "none",
        borderLeft: focused ? `2px solid ${accentColor}55` : "2px solid transparent",
        transition: "border .15s",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: T3,
          fontSize: "9px",
          letterSpacing: "2px",
          opacity: focused ? 0.9 : 0.7,
          pointerEvents: "none",
          transition: "opacity .15s",
          paddingLeft: "6px",
          fontFamily: "inherit",
        }}
      >
        ОТСТУП
      </span>
    </div>
  );
}

export interface PlayLineProps extends CommonCore {
  block: EditorBlock;
  updBlockName: (id: Id, name: string) => void;
}

export function PlayLine({
  block,
  blockRefs,
  docFont,
  autoH,
  updBlock,
  updBlockName,
  setFoc,
  setFocId,
  onKey,
  renderSearchOverlay,
}: PlayLineProps) {
  const font = `${docFont || "Times New Roman"},serif`;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", paddingTop: "4px", fontFamily: font, fontSize: "15px", lineHeight: "1.7" }}>
      <input
        value={block.name || ""}
        onChange={(e) => updBlockName(block.id, e.target.value)}
        onFocus={() => setFoc(block.id)}
        onBlur={() => setTimeout(() => setFocId((f) => (f === block.id ? null : f)), 500)}
        onKeyDown={(e) => {
          if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
            blockRefs.current[block.id]?.focus();
          }
        }}
        placeholder="Имя"
        spellCheck={false}
        size={Math.max(3, (block.name || "").length + 1)}
        style={{ background: "transparent", border: "none", outline: "none", fontWeight: "bold", color: T1, fontFamily: font, fontSize: "15px", flexShrink: 0, padding: "0", margin: "0", minWidth: "30px" }}
      />
      <span style={{ color: T1, fontWeight: "bold", fontSize: "15px", marginRight: "7px", flexShrink: 0 }}>.</span>
      <div style={{ position: "relative", flex: 1 }}>
        {renderSearchOverlay({
          scope: "block",
          blockId: block.id,
          text: block.text,
          overlayStyle: { boxSizing: "border-box", padding: "0", margin: "0", fontFamily: font, fontSize: "15px", lineHeight: "1.7" },
        })}
        <textarea
          ref={(el) => {
            blockRefs.current[block.id] = el;
            if (el) autoH(el);
          }}
          value={block.text}
          onChange={(e) => {
            updBlock(block.id, e.target.value);
            autoH(e.target);
          }}
          onFocus={() => setFoc(block.id)}
          onBlur={() => setTimeout(() => setFocId((f) => (f === block.id ? null : f)), 500)}
          onKeyDown={(e) => onKey(e, block)}
          placeholder="текст реплики..."
          rows={1}
          style={{ width: "100%", display: "block", position: "relative", zIndex: 1, background: "transparent", border: "none", outline: "none", resize: "none", overflow: "hidden", color: T1, fontSize: "15px", lineHeight: "1.7", fontFamily: font, boxSizing: "border-box", padding: "0", margin: "0" }}
        />
      </div>
    </div>
  );
}
