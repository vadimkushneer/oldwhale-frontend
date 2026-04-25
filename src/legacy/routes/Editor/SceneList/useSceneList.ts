import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BG, SH_IN, SURF, T1, T2, T3 } from "../../../ui/tokens";

export type SceneItem = {
  id: string;
  kind: "scene" | "act";
  num: string | number | null;
  text: string;
  index?: number;
  actNum?: number;
  subNum?: number;
  cast?: string;
};

export type SceneCardMeta = {
  color?: string;
};

export type DesktopSceneCardMeta = {
  cardMeta?: SceneCardMeta;
  castText: string;
  previewText: string;
  previewLines: number;
};

export type SceneListProps = {
  scenes: readonly SceneItem[];
  accent: string;
  mode: string;
  activeSceneId: string | null;
  selectedScenes: ReadonlySet<string>;
  getSceneCardMetaById: (id: string) => SceneCardMeta;
  getDesktopSceneCardMeta: (scene: SceneItem) => DesktopSceneCardMeta;
  onGoToScene: (id: string) => void;
  onSetActiveSceneId: (id: string) => void;
  onToggleSceneSelect: (id: string) => void;
  onToggleActSelect: (actNum: number) => void;
  onDupScene: (id: string) => void;
  onDelScene: (id: string) => void;
  onMoveScene: (fromId: string, toId: string) => void;
};

const DRAG_THRESHOLD_PX = 5;
const DRAG_END_CLICK_GUARD_MS = 300;

/** CSS px; matches common `md` breakpoint (tablet/desktop from 768px). */
export const SCENE_LIST_MOBILE_MEDIA = "(max-width: 767px)";
const LONG_TAP_MS = 800;
const AUTO_HIDE_ACTIONS_MS = 800;
const LONG_PRESS_MOVE_CANCEL_PX = 10;

function clearTimeoutRef(ref: { current: number | null }) {
  if (ref.current != null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

export function useSceneList({
  scenes,
  accent,
  mode,
  activeSceneId,
  selectedScenes,
  getSceneCardMetaById,
  getDesktopSceneCardMeta,
  onGoToScene,
  onSetActiveSceneId,
  onToggleSceneSelect,
  onToggleActSelect,
  onMoveScene,
}: SceneListProps) {
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  const [dragSceneId, setDragSceneIdState] = useState<string | null>(null);
  const [dragOverId, setDragOverIdState] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragCardH, setDragCardH] = useState(60);

  const dragSceneIdRef = useRef<string | null>(null);
  const dragOverIdRef = useRef<string | null>(null);
  const dragJustEndedRef = useRef(false);
  const dragStartYRef = useRef(0);

  const setDragSceneId = useCallback((v: string | null) => {
    dragSceneIdRef.current = v;
    setDragSceneIdState(v);
  }, []);

  const setDragOverId = useCallback((v: string | null) => {
    dragOverIdRef.current = v;
    setDragOverIdState(v);
  }, []);

  const sceneCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(SCENE_LIST_MOBILE_MEDIA).matches : false,
  );
  const [mobileActionsSceneId, setMobileActionsSceneId] = useState<string | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const autoHideActionsTimerRef = useRef<number | null>(null);
  const longPressPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextShellClickSceneIdRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(SCENE_LIST_MOBILE_MEDIA);
    const onChange = () => setIsMobileViewport(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const clearMobileSceneActions = useCallback(() => {
    clearTimeoutRef(longPressTimerRef);
    clearTimeoutRef(autoHideActionsTimerRef);
    longPressPointerStartRef.current = null;
    setMobileActionsSceneId(null);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      clearMobileSceneActions();
      suppressNextShellClickSceneIdRef.current = null;
    }
  }, [isMobileViewport, clearMobileSceneActions]);

  useEffect(() => {
    if (!mobileActionsSceneId || !isMobileViewport) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const shell = sceneCardRefs.current[mobileActionsSceneId];
      const row = shell?.closest(".scene-list__item");
      if (row?.contains(e.target as Node)) return;
      clearTimeoutRef(longPressTimerRef);
      clearTimeoutRef(autoHideActionsTimerRef);
      longPressPointerStartRef.current = null;
      setMobileActionsSceneId(null);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [mobileActionsSceneId, isMobileViewport]);

  useEffect(() => {
    return () => {
      clearTimeoutRef(longPressTimerRef);
      clearTimeoutRef(autoHideActionsTimerRef);
    };
  }, []);

  const scheduleAutoHideActions = useCallback((sceneId: string) => {
    clearTimeoutRef(autoHideActionsTimerRef);
    autoHideActionsTimerRef.current = window.setTimeout(() => {
      autoHideActionsTimerRef.current = null;
      setMobileActionsSceneId((cur) => (cur === sceneId ? null : cur));
    }, AUTO_HIDE_ACTIONS_MS);
  }, []);

  const getSceneItemCardPointerHandlers = useCallback(
    (sceneId: string) => {
      const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isMobileViewport) return;
        // Touch / incomplete test events may omit `button`; treat as primary (not `!== 0`).
        if (e.button > 0) return;
        const t = e.target;
        if (t instanceof Element && t.closest(".scene-item-card__actions")) return;
        clearTimeoutRef(longPressTimerRef);
        longPressPointerStartRef.current = { x: e.clientX, y: e.clientY };

        longPressTimerRef.current = window.setTimeout(() => {
          longPressTimerRef.current = null;
          longPressPointerStartRef.current = null;
          suppressNextShellClickSceneIdRef.current = sceneId;
          setMobileActionsSceneId(sceneId);
          scheduleAutoHideActions(sceneId);
        }, LONG_TAP_MS);
      };

      const cancelPendingLongPress = () => {
        clearTimeoutRef(longPressTimerRef);
        longPressPointerStartRef.current = null;
      };

      const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isMobileViewport || !longPressTimerRef.current) return;
        const start = longPressPointerStartRef.current;
        if (!start) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > LONG_PRESS_MOVE_CANCEL_PX) {
          cancelPendingLongPress();
        }
      };

      const onPointerUpOrCancel = () => {
        cancelPendingLongPress();
      };

      return {
        onPointerDown,
        onPointerMove,
        onPointerUp: onPointerUpOrCancel,
        onPointerCancel: onPointerUpOrCancel,
      };
    },
    [isMobileViewport, scheduleAutoHideActions],
  );

  const cssVars = useMemo(
    () =>
      ({
        "--sl-accent": accent,
        "--sl-accent-11": `${accent}11`,
        "--sl-accent-22": `${accent}22`,
        "--sl-accent-33": `${accent}33`,
        "--sl-bg": BG,
        "--sl-surf": SURF,
        "--sl-sh-in": SH_IN,
        "--sl-t1": T1,
        "--sl-t2": T2,
        "--sl-t3": T3,
        "--sl-t3-14": `${T3}14`,
        "--sl-t3-55": `${T3}55`,
      }) as CSSProperties,
    [accent],
  );

  const interactionAllowed = useCallback(() => {
    return !dragSceneIdRef.current && !dragJustEndedRef.current;
  }, []);

  /** Left border + per-row accent (titles, act label) via CSS variables only. */
  const getCardShellCssVars = useCallback(
    (s: SceneItem): CSSProperties => {
      const meta = getSceneCardMetaById(s.id);
      const rowAccent = meta.color || accent;
      const borderColor = selectedScenes.has(s.id)
        ? rowAccent
        : activeSceneId === s.id
          ? rowAccent
          : meta.color || "transparent";
      return {
        "--sl-card-border": borderColor,
        "--sl-row-accent": rowAccent,
      } as CSSProperties;
    },
    [accent, activeSceneId, getSceneCardMetaById, selectedScenes],
  );

  const getClickHandler = useCallback(
    (s: SceneItem) => () => {
      if (suppressNextShellClickSceneIdRef.current === s.id) {
        suppressNextShellClickSceneIdRef.current = null;
        return;
      }
      if (!interactionAllowed()) return;
      if (selectedScenes.size > 0) {
        if (s.kind === "act" && typeof s.actNum === "number") onToggleActSelect(s.actNum);
        else onToggleSceneSelect(s.id);
        return;
      }
      if (mode === "film" && s.kind === "act") {
        onSetActiveSceneId(s.id);
        return;
      }
      onGoToScene(s.id);
    },
    [
      interactionAllowed,
      mode,
      onGoToScene,
      onSetActiveSceneId,
      onToggleActSelect,
      onToggleSceneSelect,
      selectedScenes,
    ],
  );

  const getMouseDownHandler = useCallback(
    (s: SceneItem) => (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      dragStartYRef.current = e.clientY;
      let dragging = false;
      const card = sceneCardRefs.current[s.id];
      const onMove = (ev: MouseEvent) => {
        if (!dragging) {
          if (Math.abs(ev.clientY - dragStartYRef.current) < DRAG_THRESHOLD_PX) return;
          dragging = true;
          setDragCardH(card?.offsetHeight ?? 60);
          setDragPos({ x: ev.clientX, y: ev.clientY });
          setDragSceneId(s.id);
        }
        if (!dragSceneIdRef.current) return;
        setDragPos({ x: ev.clientX, y: ev.clientY });
        let foundId: string | null = null;
        for (const sc of scenesRef.current) {
          if (sc.kind === "act") continue;
          const el = sceneCardRefs.current[sc.id];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (ev.clientY >= r.top && ev.clientY <= r.bottom) {
            foundId = sc.id;
            break;
          }
        }
        if (foundId && foundId !== dragSceneIdRef.current) setDragOverId(foundId);
        else if (!foundId) setDragOverId(null);
      };
      const onUp = () => {
        if (
          dragSceneIdRef.current &&
          dragOverIdRef.current &&
          dragSceneIdRef.current !== dragOverIdRef.current
        ) {
          onMoveScene(dragSceneIdRef.current, dragOverIdRef.current);
          dragJustEndedRef.current = true;
          window.setTimeout(() => {
            dragJustEndedRef.current = false;
          }, DRAG_END_CLICK_GUARD_MS);
        }
        setDragSceneId(null);
        setDragOverId(null);
        setDragPos(null);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [onMoveScene, setDragOverId, setDragSceneId],
  );

  const ghostCssVars = useMemo((): CSSProperties | null => {
    if (!dragSceneId || !dragPos) return null;
    return {
      "--sl-ghost-x": `${dragPos.x - 90}px`,
      "--sl-ghost-y": `${dragPos.y - dragCardH / 2}px`,
      "--sl-ghost-h": `${Math.max(dragCardH, 36)}px`,
    } as CSSProperties;
  }, [dragCardH, dragPos, dragSceneId]);

  return {
    cssVars,
    dragSceneId,
    dragOverId,
    dragPos,
    dragCardH,
    ghostCssVars,
    sceneCardRefs,
    getMouseDownHandler,
    getClickHandler,
    getCardShellCssVars,
    interactionAllowed,
    isMobileViewport,
    mobileActionsSceneId,
    clearMobileSceneActions,
    getSceneItemCardPointerHandlers,
  };
}
