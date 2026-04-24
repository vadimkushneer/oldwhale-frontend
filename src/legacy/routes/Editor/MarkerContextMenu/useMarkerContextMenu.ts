import { useMemo, type CSSProperties } from "react";

export type MarkerContextMenuState = {
  x: number;
  y: number;
  blockId: string;
  sliceStart: number;
  start: number;
  end: number;
};

export function useMarkerContextMenu({
  menu,
  accent,
}: {
  menu: MarkerContextMenuState | null;
  accent: string;
}) {
  const cssVars = useMemo(() => {
    if (!menu) return undefined;
    const left = Math.min(menu.x, (typeof window !== "undefined" ? window.innerWidth : 9999) - 210);
    const top = Math.min(menu.y, (typeof window !== "undefined" ? window.innerHeight : 9999) - 180);
    return {
      "--mcm-left": `${left}px`,
      "--mcm-top": `${top}px`,
      "--mcm-accent-44": `${accent}44`,
    } as CSSProperties;
  }, [accent, menu]);

  const clipboardActions = useMemo(
    () =>
      [
        { label: "Копировать" as const, command: "copy" as const },
        { label: "Вырезать" as const, command: "cut" as const },
        { label: "Вставить" as const, command: "paste" as const },
      ] as const,
    [],
  );

  return { cssVars, clipboardActions };
}
