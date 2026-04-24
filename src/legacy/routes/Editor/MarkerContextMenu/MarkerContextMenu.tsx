import type { CSSProperties } from "react";
import { useMarkerContextMenu, type MarkerContextMenuState } from "./useMarkerContextMenu";
import "./MarkerContextMenu.scss";

export type { MarkerContextMenuState };

export function MarkerContextMenu({
  menu,
  colors,
  accent,
  onApplyColor,
  onDismiss,
}: {
  menu: MarkerContextMenuState | null;
  colors: readonly (string | null)[];
  accent: string;
  onApplyColor: (color: string | null) => void;
  onDismiss: () => void;
}) {
  const { cssVars, clipboardActions } = useMarkerContextMenu({ menu, accent });

  if (!menu || !cssVars) return null;

  const runClipboard = (command: "copy" | "cut" | "paste") => {
    document.execCommand(command);
    onDismiss();
  };

  return (
    <div className="marker-context-menu">
      <div
        className="marker-context-menu__card"
        style={cssVars as CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="marker-context-menu__title">ЦВЕТ МАРКЕРА</div>
        <div className="marker-context-menu__swatches">
          {colors.map((col, i) => (
            <button
              key={i}
              type="button"
              className={`marker-context-menu__swatch marker-context-menu__swatch--idx-${i}`}
              onClick={() => onApplyColor(col)}
              title={col === null ? "Стереть" : col}
            >
              {col === null ? (
                <svg
                  className="marker-context-menu__swatch-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
        <div className="marker-context-menu__clipboard-row">
          {clipboardActions.map(({ label, command }) => (
            <button
              key={label}
              type="button"
              className="marker-context-menu__clipboard-btn"
              onClick={() => runClipboard(command)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="marker-context-menu__close" onClick={onDismiss} aria-label="Закрыть">
          ×
        </button>
      </div>
      <div className="marker-context-menu__backdrop" onMouseDown={onDismiss} />
    </div>
  );
}
