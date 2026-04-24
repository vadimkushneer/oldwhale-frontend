import { useCallback, useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { ACCENT, BG, SH_IN, SH_SM, SURF, T1, T2, T3 } from "../../../ui/tokens";

const AI_W_MIN = 200;
const AI_W_MAX = 590;
const COMPOSER_H_MIN = 56;

export function useAiPanel({
  width,
  sidebarWidth,
  onWidthChange,
  composerHeight,
  onComposerHeightChange,
  accent,
}: {
  width: number;
  sidebarWidth: number;
  onWidthChange: (w: number) => void;
  composerHeight: number;
  onComposerHeightChange: (h: number) => void;
  accent: string;
}) {
  const cssVars = useMemo(
    () =>
      ({
        "--ap-sidebar-w": `${sidebarWidth}px`,
        "--ap-w": `${width}px`,
        "--ap-mc": accent,
        "--ap-mc-22": `${accent}22`,
        "--ap-accent-55": `${ACCENT}55`,
        "--ap-bg": BG,
        "--ap-surf": SURF,
        "--ap-surf-fc": `${SURF}FC`,
        "--ap-bg-f5": `${BG}F5`,
        "--ap-t1": T1,
        "--ap-t2": T2,
        "--ap-t3": T3,
        "--ap-t3-22": `${T3}22`,
        "--ap-t3-66": `${T3}66`,
        "--ap-sh-in": SH_IN,
        "--ap-sh-sm": SH_SM,
      }) as CSSProperties,
    [accent, sidebarWidth, width],
  );

  const onHorizontalResizeMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = width;
      const onMove = (ev: Event) => {
        if (!(ev instanceof globalThis.MouseEvent)) return;
        onWidthChange(Math.max(AI_W_MIN, Math.min(AI_W_MAX, startW - (ev.clientX - startX))));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onWidthChange, width],
  );

  const onComposerGripMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startY = e.clientY;
      const startH = composerHeight;
      const maxH = Math.floor(
        (window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight) * 0.5,
      );
      const onMove = (ev: Event) => {
        if (!(ev instanceof globalThis.MouseEvent)) return;
        onComposerHeightChange(Math.max(COMPOSER_H_MIN, Math.min(maxH, startH - (ev.clientY - startY))));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [composerHeight, onComposerHeightChange],
  );

  return {
    cssVars,
    onHorizontalResizeMouseDown,
    onComposerGripMouseDown,
  };
}
