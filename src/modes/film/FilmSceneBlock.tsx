/**
 * FilmSceneBlock — the film scene-heading editor (INT/EXT · LOCATION · TIME).
 *
 * First render brick lifted out of the god component toward a standalone
 * `FilmEditor` page (goal: variant A — per-mode editors that don't touch each
 * other). Extracted verbatim; film is frozen, so behaviour must not change.
 *
 * Its props ARE the dependency surface this piece needs from the editor core
 * (block data, the block-element ref map, and focus/update callbacks). As more
 * film bricks come out, the shared surface across them becomes `useEditorCore()`
 * and these props collapse into consuming it. Theme tokens are static, so they're
 * imported directly rather than threaded through.
 */
import { type MutableRefObject } from "react";
import { BG, SURF, SH_IN, SH_SM, T1, T3 } from "../../legacy/ui/tokens";
import type { EditorBlock } from "../editor-core/blocks";

export interface FilmSceneBlockProps {
  block: EditorBlock;
  blocks: readonly EditorBlock[];
  blockRefs: MutableRefObject<Record<string, HTMLElement | null>>;
  onFocusBlock: (id: EditorBlock["id"]) => void;
  onBlurBlock: (id: EditorBlock["id"]) => void;
  onUpdateBlock: (id: EditorBlock["id"], text: string) => void;
}

export function FilmSceneBlock({
  block,
  blocks,
  blockRefs,
  onFocusBlock,
  onBlurBlock,
  onUpdateBlock,
}: FilmSceneBlockProps) {
  const parts = (block.text || "").split(".").map((s) => s.trim());
  const intExt = parts[0] || "ИНТ";
  const location = parts[1] || "";
  const time = parts[2] || "";
  return (
    <div style={{ paddingTop: "28px", paddingBottom: "0" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {/* ИНТ/НАТ */}
        <div style={{ display: "flex", background: BG, borderRadius: "8px", boxShadow: SH_IN, padding: "2px" }}>
          {["ИНТ", "НАТ"].map((v) => (
            <button
              key={v}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onFocusBlock(block.id);
                const p = [...parts];
                p[0] = v;
                onUpdateBlock(block.id, p.filter(Boolean).join(". ") + ".");
              }}
              style={{
                padding: "5px 10px",
                border: "none",
                borderRadius: "6px",
                background: intExt === v ? SURF : "transparent",
                boxShadow: intExt === v ? SH_SM : "none",
                color: intExt === v ? T1 : T3,
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "'Courier New',monospace",
                letterSpacing: "1px",
              }}
            >
              {v}.
            </button>
          ))}
        </div>
        {/* Локация */}
        <input
          value={location}
          onChange={(e) => {
            const p = [...parts];
            p[1] = e.target.value.toUpperCase();
            onUpdateBlock(block.id, p.slice(0, 3).filter(Boolean).join(". ") + ".");
          }}
          onFocus={() => onFocusBlock(block.id)}
          onBlur={() => onBlurBlock(block.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // ищем cast блок после этой сцены
              const idx = blocks.findIndex((b) => b.id === block.id);
              const castBlock = blocks[idx + 1];
              if (castBlock?.type === "cast") {
                onFocusBlock(castBlock.id);
                setTimeout(() => blockRefs.current[castBlock.id]?.focus(), 50);
              }
            }
          }}
          placeholder="ЛОКАЦИЯ"
          style={{
            flex: 1,
            minWidth: "80px",
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${T3}44`,
            outline: "none",
            color: T1,
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "'Courier New',monospace",
            letterSpacing: "1px",
            padding: "4px 2px",
            textTransform: "uppercase",
          }}
        />
        {/* Время */}
        <div style={{ display: "flex", background: BG, borderRadius: "8px", boxShadow: SH_IN, padding: "2px", flexWrap: "wrap" }}>
          {["ДЕНЬ", "НОЧЬ", "УТРО", "ВЕЧЕР"].map((v) => (
            <button
              key={v}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onFocusBlock(block.id);
                const p = [...parts];
                p[2] = v;
                onUpdateBlock(block.id, p.slice(0, 3).filter(Boolean).join(". ") + ".");
                const idx = blocks.findIndex((b) => b.id === block.id);
                const castBlock = blocks[idx + 1];
                if (castBlock?.type === "cast")
                  setTimeout(() => {
                    onFocusBlock(castBlock.id);
                    blockRefs.current[castBlock.id]?.focus();
                  }, 80);
              }}
              style={{
                padding: "5px 8px",
                border: "none",
                borderRadius: "6px",
                background: time === v ? SURF : "transparent",
                boxShadow: time === v ? SH_SM : "none",
                color: time === v ? T1 : T3,
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: "'Courier New',monospace",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
