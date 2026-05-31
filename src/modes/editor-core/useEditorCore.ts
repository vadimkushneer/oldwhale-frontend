import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { ensureHistory, pushSnapshot, undoSnapshot, redoSnapshot } from "./history";
import { normalizeFilmBlockText } from "../../legacy/domain/screenplayFormat";

/**
 * useEditorCore — the shared editor state hook that per-mode editor pages and the
 * editor-core components (BlockTextarea, PlayBlocks, FilmSceneBlock) consume.
 *
 * Grown incrementally out of the EditorScreen god component, one self-contained
 * slice at a time so each move stays verifiable.
 *  - Stage 1: dependency-free primitives — block ref map, focused id, spellcheck.
 *  - Stage 2: focus cluster — toolbar/active-scene state, smart setFoc, getActiveBlockId.
 *  - Stage 3: per-mode undo/redo history over the pure `history.ts`.
 *  - Stage 4 (this): the document itself — `blocks`/`setBlocks`, the `blocksRef`
 *    mirror + its sync effect, and the mutators `markDirty` / `applyBlocks` /
 *    `updBlock` / `updBlockName`, with the race-safe pattern (compute next from
 *    `blocksRef.current`, set ref synchronously, then push the real snapshot).
 *    Autosave still lives in the shell and is reached via `scheduleAutosaveRef`
 *    (the shell assigns `.current` once it is defined, avoiding TDZ).
 *
 * Consumed via same-name destructuring in EditorScreen, so existing readers/
 * setters/callers are unchanged.
 */
const BLOCK_HISTORY_LIMIT = 100;

export interface BlockLike {
  id: unknown;
  type?: string;
  [k: string]: unknown;
}

export interface UseEditorCoreArgs {
  mode: string;
  modeRef: MutableRefObject<string>;
  setSaved: Dispatch<SetStateAction<boolean>>;
  getInitialBlocks: () => BlockLike[];
  scheduleAutosaveRef: MutableRefObject<() => void>;
}

export interface EditorCore {
  blocks: BlockLike[];
  setBlocks: Dispatch<SetStateAction<BlockLike[]>>;
  blocksRef: MutableRefObject<BlockLike[]>;
  blockRefs: MutableRefObject<Record<string, HTMLElement | null>>;
  lastFocId: MutableRefObject<unknown>;
  focId: unknown;
  setFocId: Dispatch<SetStateAction<unknown>>;
  spellOn: boolean;
  setSpellOn: Dispatch<SetStateAction<boolean>>;
  toolbarBlockId: unknown;
  setToolbarBlockId: Dispatch<SetStateAction<unknown>>;
  activeSceneId: unknown;
  setActiveSceneId: Dispatch<SetStateAction<unknown>>;
  setFoc: (id: unknown) => void;
  getActiveBlockId: () => unknown;
  ensureModeHistory: (m: string, blks: unknown) => void;
  resetModeHistories: (initialMode: string, initialBlocks: unknown) => void;
  pushHistory: (blks: unknown) => void;
  undo: () => void;
  redo: () => void;
  markDirty: (newBlocks?: unknown) => void;
  applyBlocks: (next: BlockLike[]) => void;
  updBlock: (id: unknown, text: string) => void;
  updBlockName: (id: unknown, name: string) => void;
}

export function useEditorCore({ mode, modeRef, setSaved, getInitialBlocks, scheduleAutosaveRef }: UseEditorCoreArgs): EditorCore {
  const [blocks, setBlocks] = useState<BlockLike[]>(getInitialBlocks);
  const blocksRef = useRef<BlockLike[]>(blocks);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  const blockRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastFocId = useRef<unknown>(null);
  const focIdRef = useRef<unknown>(null);
  const toolbarBlockIdRef = useRef<unknown>(null);
  const [focId, setFocId] = useState<unknown>(null);
  const [spellOn, setSpellOn] = useState(false);
  const [toolbarBlockId, setToolbarBlockId] = useState<unknown>(null); // отдельный state для тулбара
  const [activeSceneId, setActiveSceneId] = useState<unknown>(null);

  const historyByMode = useRef<Record<string, string[]>>({});
  const histIdxByMode = useRef<Record<string, number>>({});

  const setFoc = (id: unknown) => {
    setFocId(id);
    focIdRef.current = id;
    if (id) {
      lastFocId.current = id;
      toolbarBlockIdRef.current = id;
      setToolbarBlockId(id);
      // Обновляем активную сцену по фокусу
      const idx = blocks.findIndex((b) => b.id === id);
      for (let j = idx; j >= 0; j--) {
        if (blocks[j].type === "scene") {
          setActiveSceneId(blocks[j].id);
          break;
        }
      }
    }
  };

  // refs first so callers (e.g. a toolbar button) read the focused block
  // synchronously at click time, before the focus state re-render flushes.
  const getActiveBlockId = () =>
    toolbarBlockIdRef.current || focIdRef.current || toolbarBlockId || focId || lastFocId.current || null;

  const ensureModeHistory = (m: string, blks: unknown) => {
    const next = ensureHistory(
      { snapshots: historyByMode.current[m], index: histIdxByMode.current[m] },
      JSON.stringify(blks || []),
    );
    historyByMode.current[m] = next.snapshots;
    histIdxByMode.current[m] = next.index;
  };

  const resetModeHistories = (initialMode: string, initialBlocks: unknown) => {
    historyByMode.current = {};
    histIdxByMode.current = {};
    ensureModeHistory(initialMode, initialBlocks);
  };

  const pushHistory = (blks: unknown) => {
    const currentMode = modeRef.current || mode;
    const snapshot = JSON.stringify(blks || []);
    const state = ensureHistory(
      { snapshots: historyByMode.current[currentMode], index: histIdxByMode.current[currentMode] },
      snapshot,
    );
    const next = pushSnapshot(state, snapshot, BLOCK_HISTORY_LIMIT);
    historyByMode.current[currentMode] = next.snapshots;
    histIdxByMode.current[currentMode] = next.index;
  };

  const undo = () => {
    const currentMode = modeRef.current || mode;
    const res = undoSnapshot({
      snapshots: historyByMode.current[currentMode] || [],
      index: histIdxByMode.current[currentMode],
    });
    if (!res) return;
    histIdxByMode.current[currentMode] = res.state.index;
    setBlocks(JSON.parse(res.value));
    setSaved(false);
  };

  const redo = () => {
    const currentMode = modeRef.current || mode;
    const res = redoSnapshot({
      snapshots: historyByMode.current[currentMode] || [],
      index: histIdxByMode.current[currentMode],
    });
    if (!res) return;
    histIdxByMode.current[currentMode] = res.state.index;
    setBlocks(JSON.parse(res.value));
    setSaved(false);
  };

  const markDirty = (newBlocks?: unknown) => {
    const blks = (newBlocks as BlockLike[]) || blocksRef.current;
    scheduleAutosaveRef.current();
    pushHistory(blks);
  };

  const applyBlocks = (next: BlockLike[]) => {
    blocksRef.current = next;
    setBlocks(next);
    markDirty(next);
  };

  const updBlock = (id: unknown, text: string) => {
    const next = (blocksRef.current || []).map((b) => {
      if (b.id !== id) return b;
      const nextText = mode === "film" ? normalizeFilmBlockText((b.type ?? "") as string, text) : text;
      return { ...b, text: nextText };
    });
    blocksRef.current = next;
    setBlocks(next);
    markDirty(next);
  };

  const updBlockName = (id: unknown, name: string) => {
    const next = (blocksRef.current || []).map((b) => (b.id === id ? { ...b, name } : b));
    blocksRef.current = next;
    setBlocks(next);
    markDirty(next);
  };

  return {
    blocks,
    setBlocks,
    blocksRef,
    blockRefs,
    lastFocId,
    focId,
    setFocId,
    spellOn,
    setSpellOn,
    toolbarBlockId,
    setToolbarBlockId,
    activeSceneId,
    setActiveSceneId,
    setFoc,
    getActiveBlockId,
    ensureModeHistory,
    resetModeHistories,
    pushHistory,
    undo,
    redo,
    markDirty,
    applyBlocks,
    updBlock,
    updBlockName,
  };
}
