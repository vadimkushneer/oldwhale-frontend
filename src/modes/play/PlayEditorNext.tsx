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
import { autoH } from "../../legacy/util/doc";
import { BG, SURF, T1 } from "../../legacy/ui/tokens";

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
 * Increment 3: loads/saves the real play project via projectStore (same LS keys
 * as production). Debounced autosave + flush-on-unmount.
 *
 * Still NOT parity: toolbar, scene navigator, import/export, title page,
 * paginated document frame.
 */
const PLAY_ACCENT = "#a78bfa";
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
    <div style={{ width: "100%", height: "100%", overflow: "auto", background: BG, padding: "40px 0" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", background: SURF, borderRadius: "8px", padding: "48px 64px", minHeight: "60vh" }}>
        <div style={{ fontSize: "11px", letterSpacing: "1px", color: PLAY_ACCENT, marginBottom: "24px", fontFamily: "'Courier New',monospace" }}>
          PLAYEDITOR · NEXT (увеличение 3 · ?next=1 · прод не затронут)
        </div>
        {blocks.map(renderBlock)}
      </div>
    </div>
  );
}
