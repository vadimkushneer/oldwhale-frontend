/**
 * BlockTextarea — the shared per-block editing textarea, lifted out of the god
 * component's `renderTextarea`. Every mode's body text flows through this, so it
 * stays in editor-core (shared), not in a single mode.
 *
 * Its props ARE the editor-core surface this workhorse needs: block data + defs,
 * the mode and its fonts/icons, the block-element ref map, and the core handlers
 * (`onKey`, `updBlock`, `setFoc`, `autoH`, …). That is precisely the shape a
 * `useEditorCore()` hook will expose; once it exists, a mode page passes
 * `{...core}` here instead of threading each prop. The search overlay is a
 * render-prop so it can stay where it is for now.
 *
 * Behaviour is a verbatim port; the shell wrapper passes the same closure values.
 */
import { type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import { buildLinePasteReplacement, buildFilmPasteReplacement } from "./paste";
import type { EditorBlock } from "./blocks";

export interface BlockDef {
  type: string;
  ph?: string;
  spell?: boolean;
  st?: CSSProperties;
}

export interface RichBlock extends EditorBlock {
  bold?: boolean;
  semibold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
}

export interface BlockTextareaProps {
  block: RichBlock;
  defs: BlockDef[];
  mode: string;
  docFont?: string;
  shortSceneIcon?: string;
  shortCastIcon?: string;
  extraStyle?: CSSProperties & { paddingLeft?: string | number };
  blockRefs: MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
  spellOn: boolean;
  autoH: (el: HTMLTextAreaElement) => void;
  updBlock: (id: EditorBlock["id"], text: string) => void;
  setFoc: (id: EditorBlock["id"]) => void;
  setFocId: (updater: (f: EditorBlock["id"] | null) => EditorBlock["id"] | null) => void;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>, block: RichBlock) => void;
  uid: () => EditorBlock["id"];
  setBlocks: (updater: (bs: RichBlock[]) => RichBlock[]) => void;
  markDirty: () => void;
  renderSearchOverlay: (config: {
    scope: string;
    blockId: EditorBlock["id"];
    text?: string;
    overlayStyle: CSSProperties;
  }) => ReactNode;
}

const UPPER = ["cast", "char", "scene"];

export function BlockTextarea({
  block,
  defs,
  mode,
  docFont,
  shortSceneIcon,
  shortCastIcon,
  extraStyle = {},
  blockRefs,
  spellOn,
  autoH,
  updBlock,
  setFoc,
  setFocId,
  onKey,
  uid,
  setBlocks,
  markDirty,
  renderSearchOverlay,
}: BlockTextareaProps) {
  const def = defs.find((d) => d.type === block.type) || defs[0];
  const textareaStyle: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    fontSize: "16px",
    lineHeight: mode === "play" ? "1.7" : "1.85",
    fontFamily: mode === "play" ? `${docFont || "Times New Roman"},serif` : "'Courier New',monospace",
    boxSizing: "border-box",
    padding: "5px 0",
    position: "relative",
    zIndex: 1,
    display: "block",
    ...def.st,
    ...(mode === "short" && block.type === "scene"
      ? {
          backgroundImage: block.text ? "none" : shortSceneIcon,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 50%",
          backgroundSize: "11px 11px",
        }
      : {}),
    ...(mode === "short" && block.type === "cast"
      ? {
          backgroundImage: block.text ? "none" : shortCastIcon,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 50%",
          backgroundSize: "11px 11px",
        }
      : {}),
    ...(extraStyle.paddingLeft === "0" ? { paddingLeft: 0, paddingRight: 0, textAlign: "left" } : {}),
    ...extraStyle,
    fontWeight: block.bold ? "bold" : block.semibold ? "600" : def.st?.fontWeight,
    fontStyle: block.italic ? "italic" : def.st?.fontStyle,
    textDecoration: block.underline ? "underline" : def.st?.textDecoration,
    color: block.color || def.st?.color || "#e8e4d8",
  };
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {renderSearchOverlay({
        scope: "block",
        blockId: block.id,
        text: block.text,
        overlayStyle: {
          boxSizing: "border-box",
          padding: textareaStyle.padding,
          fontSize: textareaStyle.fontSize,
          lineHeight: textareaStyle.lineHeight,
          fontFamily: textareaStyle.fontFamily,
          fontWeight: textareaStyle.fontWeight,
          fontStyle: textareaStyle.fontStyle,
          textDecoration: textareaStyle.textDecoration,
          textAlign: textareaStyle.textAlign,
          paddingLeft: textareaStyle.paddingLeft,
          paddingRight: textareaStyle.paddingRight,
          paddingTop: textareaStyle.paddingTop,
          paddingBottom: textareaStyle.paddingBottom,
        },
      })}
      <textarea
        ref={(el) => {
          blockRefs.current[block.id] = el;
          if (el) autoH(el);
        }}
        value={block.text}
        onChange={(e) => {
          const val = UPPER.includes(block.type) ? e.target.value.toUpperCase() : e.target.value;
          updBlock(block.id, val);
          autoH(e.target);
        }}
        onFocus={() => setFoc(block.id)}
        onBlur={() =>
          setTimeout(() => {
            if (document.activeElement !== blockRefs.current[block.id]) setFocId((f) => (f === block.id ? null : f));
          }, 300)
        }
        onKeyDown={(e) => onKey(e, block)}
        onPaste={(e) => {
          const isLineMode = mode === "play" || mode === "short" || mode === "media";
          if (!isLineMode && mode !== "film") return;
          const text = e.clipboardData.getData("text/plain");
          const lines = text.split("\n");
          if (lines.length <= 1) return;
          e.preventDefault();
          const el = e.target as HTMLTextAreaElement;
          const selStart = el.selectionStart ?? 0;
          const selEnd = el.selectionEnd ?? 0;
          const curText = block.text || "";
          const before = curText.substring(0, selStart);
          const after = curText.substring(selEnd);
          const { replacement, lastId, lastText } = isLineMode
            ? buildLinePasteReplacement({ block, lines, before, after, mode, makeId: uid })
            : buildFilmPasteReplacement({ block, lines, before, after, makeId: uid });
          setBlocks((bs) => {
            const i = bs.findIndex((b) => b.id === block.id);
            if (i === -1) return bs;
            const next = [...bs];
            next.splice(i, 1, ...(replacement as RichBlock[]));
            return next;
          });
          markDirty();
          setTimeout(() => {
            const lastEl = blockRefs.current[lastId];
            if (!lastEl) return;
            try {
              lastEl.focus();
            } catch (err) {
              /* noop */
            }
            try {
              lastEl.setSelectionRange(lastText.length, lastText.length);
            } catch (err) {
              /* noop */
            }
            autoH(lastEl);
          }, 60);
        }}
        placeholder={def.ph}
        spellCheck={spellOn && def.spell}
        rows={1}
        autoCorrect={spellOn ? "on" : "off"}
        autoComplete="off"
        autoCapitalize={spellOn ? "sentences" : "off"}
        style={textareaStyle}
      />
    </div>
  );
}
