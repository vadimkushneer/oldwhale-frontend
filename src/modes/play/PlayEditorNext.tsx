import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useEditorCore } from "../editor-core/useEditorCore";
import { PlayScene, PlaySpacer, PlayLine } from "./PlayBlocks";
import {
  computeMergeJoiner,
  cycleBlockType,
  insertBlocksAfter,
  mergeAdjacentBlocks,
  nextEnterType,
  splitBlockText,
  type EditorBlock,
} from "../editor-core/blocks";
import { EDITOR_MODES } from "../registry";
import { loadLastProjectForMode, saveProjectForMode } from "../document/projectStore";
import { autoH, getPlayActTitle, getScenes } from "../../legacy/util/doc";
import { formatSceneLabel } from "../editor-core/scenes";
import { BG, SURF, T1, T2, T3 } from "../../legacy/ui/tokens";

/**
 * PlayEditorNext — standalone play editor (variant A, path 2).
 *
 * Increment 2: play keyboard at parity with EditorScreen's `onKey` play paths —
 * em-dash insert, Enter (line at edge -> new line; line mid -> split; scene/act/
 * spacer -> nextEnterType), Tab (cycle, protecting scene/line/act), Backspace at
 * start (line -> edit speaker name; otherwise blank-delete / convert-to-prev-type
 * / merge-into-prev with caret restore). No `mode === "..."` branches; built on
 * useEditorCore + PlayBlocks. Reachable only behind `?next=1`; production play
 * stays on EditorScreen.
 *
 * Still NOT parity: real project load/save, toolbar, scene navigator, import/
 * export, title page, paginated document frame.
 */
const PLAY_ACCENT = "#a78bfa";
const COLORS = ["#e8e4d8", "#f472b6", "#60a5fa", "#4ade80", "#fbbf24", "#a78bfa", "#f87171", "#34d399"];
const PROT = ["scene", "act"]; // can't retype these via the type buttons
const PANEL: { type: string; label: string }[] = [
  { type: "scene", label: "Сцена" },
  { type: "line", label: "Реплика" },
  { type: "spacer", label: "Отступ" },
];
const newId = () => "p" + Math.random().toString(36).slice(2, 10);

function findNameInput(el: HTMLElement): HTMLInputElement | null {
  let row: HTMLElement | null = el.parentElement;
  while (row && !row.querySelector("input")) row = row.parentElement;
  return row ? row.querySelector("input") : null;
}

export function PlayEditorNext() {
  const saved = useMemo(() => loadLastProjectForMode("play"), []);
  const modeRef = useRef("play");
  const [, setSaved] = useState(true);
  const scheduleAutosaveRef = useRef<() => void>(() => {});
  const projectIdRef = useRef(saved?.id || "play_" + Date.now());
  const projectNameRef = useRef(saved?.name || "Пьеса");
  const playHeaderRef = useRef(saved?.playHeader);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const getInitialBlocks = () =>
    (saved?.blocks?.length ? saved.blocks.map((b) => ({ ...b })) : EDITOR_MODES.play.initialBlocks()) as unknown as EditorBlock[];

  const core = useEditorCore({
    mode: "play",
    modeRef,
    setSaved,
    getInitialBlocks: getInitialBlocks as never,
    scheduleAutosaveRef,
  });

  const defs = EDITOR_MODES.play.blockDefs;
  const blocks = core.blocks as unknown as EditorBlock[];
  const refOf = (id: EditorBlock["id"]) =>
    core.blockRefs.current[String(id)] as unknown as (HTMLTextAreaElement | null);

  const doSave = () =>
    saveProjectForMode(projectIdRef.current, projectNameRef.current, core.blocksRef.current as never, "play", {
      playHeader: playHeaderRef.current,
      docFont: "Times New Roman",
    });
  scheduleAutosaveRef.current = () => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { setSaved(true); doSave(); }, 1500);
  };
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); doSave(); }, []);

  const chType = (id: EditorBlock["id"], type: string) =>
    core.applyBlocks((core.blocksRef.current as unknown as EditorBlock[]).map((b) => (b.id === id ? { ...b, type } : b)) as never);

  const delBlock = (id: EditorBlock["id"]) =>
    core.applyBlocks((core.blocksRef.current as unknown as EditorBlock[]).filter((b) => b.id !== id) as never);

  const addAfter = (id: EditorBlock["id"], type: string) => {
    const nid = newId();
    const next = insertBlocksAfter(core.blocksRef.current as unknown as EditorBlock[], id, [{ id: nid, type, text: "" }]);
    core.applyBlocks(next as never);
    if (type === "scene" || type === "act") core.setActiveSceneId(nid);
    setTimeout(() => core.setFoc(nid), 0);
  };

  // ---- toolbar -------------------------------------------------------------
  const [colorOpen, setColorOpen] = useState(false);
  // render-time, for button highlight only
  const activeId = core.getActiveBlockId() as EditorBlock["id"] | null;
  const activeBlock = activeId != null ? blocks.find((b) => b.id === activeId) || null : null;
  const curType = activeBlock?.type;

  // Actions resolve the active block FRESH at click time via core refs — never the
  // value captured at render. Toolbar buttons keep textarea focus (onMouseDown
  // preventDefault), so the focused block is the target even before re-render.
  const mapActive = (fn: (b: EditorBlock) => EditorBlock) => {
    const id = core.getActiveBlockId();
    if (id == null) return;
    core.applyBlocks((core.blocksRef.current as unknown as EditorBlock[]).map((b) => (b.id === id ? fn(b) : b)) as never);
  };
  const toggleFmt = (field: "italic" | "underline") => mapActive((b) => ({ ...b, [field]: !b[field] }));
  const resetFmt = () => mapActive((b) => ({ ...b, bold: false, italic: false, underline: false, semibold: false, color: null }));
  const setColor = (color: string | null) => { mapActive((b) => ({ ...b, color })); setColorOpen(false); };
  const setType = (t: string) => {
    const id = core.getActiveBlockId() as EditorBlock["id"] | null;
    if (id == null) return;
    const b = (core.blocksRef.current as unknown as EditorBlock[]).find((x) => x.id === id);
    if (!b) return;
    if (b.type === t) addAfter(id, t);
    else if (!PROT.includes(b.type)) chType(id, t);
  };
  const addSceneEnd = () => {
    const cur = core.blocksRef.current as unknown as EditorBlock[];
    const last = cur[cur.length - 1];
    if (last) addAfter(last.id, "scene");
  };
  const insertAct = () => {
    const cur = core.blocksRef.current as unknown as EditorBlock[];
    let targetId: EditorBlock["id"] | null = null;
    const asid = core.activeSceneId as EditorBlock["id"] | null;
    if (asid != null && cur.some((b) => b.id === asid && b.type === "scene")) targetId = asid;
    if (targetId == null && core.focId != null) {
      const fi = cur.findIndex((b) => b.id === core.focId);
      for (let j = fi; j >= 0; j--) {
        if (cur[j].type === "scene") { targetId = cur[j].id; break; }
        if (cur[j].type === "act") break;
      }
    }
    const nid = newId();
    if (targetId != null) {
      const ti = cur.findIndex((b) => b.id === targetId);
      const actNumber = cur.slice(0, ti).filter((b) => b.type === "act").length + 1;
      const a = [...cur];
      a.splice(ti, 0, { id: nid, type: "act", text: getPlayActTitle(actNumber) });
      core.applyBlocks(a as never);
    } else {
      const actNumber = cur.filter((b) => b.type === "act").length + 1;
      core.applyBlocks([...cur, { id: nid, type: "act", text: getPlayActTitle(actNumber) }] as never);
    }
    core.setActiveSceneId(nid);
    setTimeout(() => { refOf(nid)?.focus?.(); core.setFoc(nid); }, 60);
  };

  const tbBtn = (label: string, active: boolean, onClick: () => void, extra: CSSProperties = {}) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        height: "26px", padding: "0 10px", borderRadius: "7px", marginRight: "4px", cursor: "pointer",
        background: active ? `${PLAY_ACCENT}22` : BG, border: `1px solid ${active ? PLAY_ACCENT : PLAY_ACCENT + "33"}`,
        color: active ? PLAY_ACCENT : T2, fontSize: "11px", fontFamily: "inherit", whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", justifyContent: "center", ...extra,
      }}
    >
      {label}
    </button>
  );

  const renderToolbar = () => (
    <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px", padding: "8px 12px", background: SURF, borderBottom: `1px solid ${PLAY_ACCENT}22` }}>
      {tbBtn("+ Акт", false, insertAct)}
      {tbBtn("+ Сцена", false, addSceneEnd)}
      <span style={{ width: "1px", height: "18px", background: T3, margin: "0 6px" }} />
      {PANEL.map((d) => tbBtn(d.label, curType === d.type, () => setType(d.type)))}
      <span style={{ width: "1px", height: "18px", background: T3, margin: "0 6px" }} />
      {tbBtn("К", !!activeBlock?.italic, () => toggleFmt("italic"), { fontStyle: "italic", width: "26px", padding: 0 })}
      {tbBtn("Ч", !!activeBlock?.underline, () => toggleFmt("underline"), { textDecoration: "underline", width: "26px", padding: 0 })}
      {tbBtn("Н", false, resetFmt, { width: "26px", padding: 0 })}
      <div style={{ position: "relative", display: "inline-flex" }}>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setColorOpen((o) => !o)}
          style={{ width: "26px", height: "26px", borderRadius: "7px", cursor: "pointer", background: activeBlock?.color ? activeBlock.color + "22" : BG, border: `2px solid ${activeBlock?.color || PLAY_ACCENT + "44"}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: activeBlock?.color || T2 }} />
        </button>
        {colorOpen && (
          <div style={{ position: "absolute", top: "30px", right: 0, background: SURF, borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", padding: "8px", zIndex: 100, display: "flex", flexWrap: "wrap", width: "112px" }}>
            {COLORS.map((c) => (
              <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => setColor(c)}
                style={{ width: "20px", height: "20px", borderRadius: "50%", background: c, border: activeBlock?.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", margin: "0 4px 4px 0" }} />
            ))}
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setColor(null)}
              style={{ width: "20px", height: "20px", borderRadius: "50%", background: "transparent", border: `1px dashed ${T3}`, cursor: "pointer", color: T3, fontSize: "11px", lineHeight: "16px" }}>×</button>
          </div>
        )}
      </div>
    </div>
  );

  const onKey = (e: React.KeyboardEvent<HTMLElement>, block: EditorBlock) => {
    if (!defs || defs.length === 0) return;
    const def = defs.find((d) => d.type === block.type) || defs[0];
    const el = e.currentTarget as HTMLTextAreaElement;
    const text = block.text || "";

    // Em-dash on Alt/Cmd + "-"
    if ((e.altKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      const s = el.selectionStart ?? 0;
      const en = el.selectionEnd ?? 0;
      core.updBlock(block.id, text.substring(0, s) + "—" + text.substring(en));
      setTimeout(() => { try { el.selectionStart = el.selectionEnd = s + 1; } catch { /* noop */ } }, 0);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const cursor = el.selectionStart ?? text.length;
      const inMiddle = cursor > 0 && cursor < text.length;
      if (block.type === "line" && !inMiddle) {
        addAfter(block.id, "line");
        return;
      }
      if (inMiddle && !["scene", "act", "spacer"].includes(block.type)) {
        const { before, after } = splitBlockText(text, cursor);
        const nid = newId();
        const next = insertBlocksAfter(
          (core.blocksRef.current as unknown as EditorBlock[]).map((b) => (b.id === block.id ? { ...b, text: before } : b)),
          block.id,
          [{ id: nid, type: block.type, text: after }],
        );
        core.applyBlocks(next as never);
        setTimeout(() => core.setFoc(nid), 0);
      } else {
        addAfter(block.id, nextEnterType(def, defs));
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const nType = cycleBlockType(defs, block.type, ["scene", "line", "act"]);
      if (nType) chType(block.id, nType);
      return;
    }

    if (e.key === "Backspace" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const selStart = el.selectionStart ?? 0;
      const selEnd = el.selectionEnd ?? 0;
      if (selStart !== 0 || selEnd !== 0) return;
      const cur = core.blocksRef.current as unknown as EditorBlock[];
      const bi = cur.findIndex((b) => b.id === block.id);
      if (bi <= 0 || block.type === "act") return;

      // line: backspace at text start edits the speaker name field
      if (block.type === "line") {
        const nameText = (block as { name?: string }).name || "";
        e.preventDefault();
        if (nameText.length > 0) core.updBlockName(block.id, nameText.slice(0, -1));
        setTimeout(() => {
          const nameInput = findNameInput(el);
          if (!nameInput) return;
          try { nameInput.focus({ preventScroll: true }); } catch { nameInput.focus(); }
          const pos = Math.max(0, nameText.length - 1);
          try { nameInput.setSelectionRange(pos, pos); } catch { /* noop */ }
        }, 0);
        return;
      }

      const prev = cur[bi - 1];
      if (!prev || !prev.type || prev.type === "act") return;
      e.preventDefault();
      const isBlank = text.trim() === "";
      if (isBlank) {
        delBlock(block.id);
        setTimeout(() => {
          const prevEl = refOf(prev.id);
          if (!prevEl) return;
          try { prevEl.focus({ preventScroll: true }); } catch { prevEl.focus(); }
          const pos = (prevEl.value || "").length;
          try { prevEl.setSelectionRange(pos, pos); } catch { /* noop */ }
        }, 0);
        return;
      }
      if (prev.type !== block.type) {
        chType(block.id, prev.type);
        return;
      }
      const { joiner, caretPos } = computeMergeJoiner(prev.text, block.text);
      core.applyBlocks(mergeAdjacentBlocks(core.blocksRef.current as unknown as EditorBlock[], prev.id, block.id, joiner) as never);
      setTimeout(() => {
        const prevEl = refOf(prev.id);
        if (!prevEl) return;
        try { prevEl.focus({ preventScroll: true }); } catch { prevEl.focus(); }
        try { prevEl.setSelectionRange(caretPos, caretPos); } catch { /* noop */ }
        autoH(prevEl);
      }, 0);
    }
  };

  const renderSearchOverlay = () => null;

  // ---- scene navigator -----------------------------------------------------
  const sceneList = getScenes(blocks, "play") as Array<{
    id: EditorBlock["id"]; kind: string; text?: string; actNum?: number; subNum?: number; num?: number;
  }>;
  const jump = (id: EditorBlock["id"]) => {
    core.setFoc(id);
    setTimeout(() => {
      const el = refOf(id);
      el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      el?.focus?.();
    }, 0);
  };
  const renderNav = () => (
    <div style={{ width: "216px", flexShrink: 0, overflow: "auto", borderRight: `1px solid ${PLAY_ACCENT}22`, background: SURF, padding: "12px 8px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "1px", color: T3, padding: "4px 8px 8px" }}>СЦЕНЫ</div>
      {sceneList.length === 0 && <div style={{ color: T3, fontSize: "12px", padding: "8px" }}>Нет сцен</div>}
      {sceneList.map((s) => {
        if (s.kind === "act") {
          return (
            <div key={String(s.id)} onClick={() => jump(s.id)}
              style={{ cursor: "pointer", padding: "8px", marginTop: "8px", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", color: T1, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.text || "АКТ"}
            </div>
          );
        }
        const active = core.activeSceneId === s.id;
        return (
          <div key={String(s.id)} onClick={() => jump(s.id)}
            style={{ cursor: "pointer", padding: "6px 8px 6px 16px", borderRadius: "6px", fontSize: "12px", color: active ? PLAY_ACCENT : T2, background: active ? `${PLAY_ACCENT}18` : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ color: T3, marginRight: "6px" }}>{formatSceneLabel("play", s)}</span>{s.text || "Сцена"}
          </div>
        );
      })}
    </div>
  );

  const common = {
    blockRefs: core.blockRefs as never,
    docFont: "Times New Roman",
    autoH,
    updBlock: core.updBlock as never,
    setFoc: core.setFoc as never,
    setFocId: core.setFocId as never,
    onKey,
    renderSearchOverlay,
  };

  const renderBlock = (block: EditorBlock) => {
    if (block.type === "scene") return <PlayScene key={String(block.id)} block={block} blocks={blocks} {...common} />;
    if (block.type === "spacer")
      return (
        <PlaySpacer
          key={String(block.id)}
          block={block}
          focId={core.focId as never}
          accentColor={PLAY_ACCENT}
          setFoc={core.setFoc as never}
          onKey={onKey}
        />
      );
    if (block.type === "line")
      return <PlayLine key={String(block.id)} block={block} updBlockName={core.updBlockName as never} {...common} />;
    const actStyle: CSSProperties = { fontWeight: "bold", textAlign: "center", textTransform: "uppercase" };
    return (
      <textarea
        key={String(block.id)}
        ref={(el) => { core.blockRefs.current[String(block.id)] = el; }}
        value={block.text || ""}
        onChange={(e) => { core.updBlock(block.id, e.target.value); autoH(e.target); }}
        onFocus={() => core.setFoc(block.id)}
        onKeyDown={(e) => onKey(e, block)}
        rows={1}
        style={{
          display: "block", width: "100%", border: "none", outline: "none", resize: "none",
          background: "transparent", color: T1, fontFamily: "'Times New Roman',serif", fontSize: "16px",
          margin: "8px 0", padding: 0, ...(block.type === "act" ? actStyle : {}),
        }}
      />
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      {renderToolbar()}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {renderNav()}
        <div style={{ flex: 1, overflow: "auto", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "816px", maxWidth: "calc(100% - 48px)", margin: "0 auto 24px", background: SURF, boxShadow: "8px 8px 24px rgba(0,0,0,0.16)", borderRadius: "2px", padding: "56px 72px", minHeight: "1056px", boxSizing: "border-box" }}>
            <div style={{ fontSize: "11px", letterSpacing: "1px", color: PLAY_ACCENT, marginBottom: "24px", fontFamily: "'Courier New',monospace" }}>
              PLAYEDITOR · NEXT (увеличение 6 · ?next=1 · прод не затронут)
            </div>
            {blocks.map(renderBlock)}
          </div>
        </div>
      </div>
    </div>
  );
}
