import { useMemo, type CSSProperties } from "react";
import i18n from "../../../../i18n";

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
    () => {
      const t = i18n.t.bind(i18n);
      return [
        { label: t("marker.copy"), command: "copy" as const },
        { label: t("marker.cut"), command: "cut" as const },
        { label: t("marker.paste"), command: "paste" as const },
      ];
    },
    [i18n.language],
  );

  return { cssVars, clipboardActions };
}
