import type { MouseEventHandler, ReactNode } from "react";
import { useEditorTopBar, type EditorTopBarProps, type EditorTopBarStatItem } from "./useEditorTopBar";
import "./EditorTopBar.scss";

export type { EditorTopBarProps, EditorTopBarStats } from "./useEditorTopBar";

function ModeBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="editor-top-bar__mode" aria-label={`Режим: ${label}`}>
      <span className="editor-top-bar__mode-icon" aria-hidden>
        {icon}
      </span>
      <span className="editor-top-bar__mode-label">{label}</span>
    </div>
  );
}

function StatsGroup({ items }: { items: readonly EditorTopBarStatItem[] }) {
  return (
    <div className="editor-top-bar__stats" aria-label="Статистика документа">
      {items.map((item) => (
        <span key={item.label} className="editor-top-bar__stat">
          <span className="editor-top-bar__stat-label">{item.label}</span>
          <span className="editor-top-bar__stat-value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function SaveStatus({
  className,
  dotClassName,
  label,
}: {
  className: string;
  dotClassName: string;
  label: string;
}) {
  return (
    <div className={className} aria-live="polite">
      <span className={dotClassName} aria-hidden />
      <span className="editor-top-bar__save-label">{label}</span>
    </div>
  );
}

function SheetToggle({
  className,
  title,
  active,
  onMouseDown,
  onClick,
}: {
  className: string;
  title: string;
  active: boolean;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={className}
      onMouseDown={onMouseDown}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      ЛИСТ
    </button>
  );
}

function UndoIcon() {
  return (
    <svg
      className="editor-top-bar__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 7v6h6" />
      <path d="M3 13C5 7 11 4 17 6s9 8 7 14" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      className="editor-top-bar__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 7v6h-6" />
      <path d="M21 13C19 7 13 4 7 6S-2 14 0 20" />
    </svg>
  );
}

function HistoryControls({
  onMouseDown,
  onUndo,
  onRedo,
}: {
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="editor-top-bar__history-controls" role="group" aria-label="История документа">
      <button
        type="button"
        className="editor-top-bar__icon-button editor-top-bar__icon-button--undo"
        onMouseDown={onMouseDown}
        onClick={onUndo}
        aria-label="Отменить"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        className="editor-top-bar__icon-button editor-top-bar__icon-button--redo"
        onMouseDown={onMouseDown}
        onClick={onRedo}
        aria-label="Повторить"
      >
        <RedoIcon />
      </button>
    </div>
  );
}

function ZoomControls({
  zoom,
  onMouseDown,
  onZoomOut,
  onZoomIn,
}: {
  zoom: number;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onZoomOut: () => void;
  onZoomIn: () => void;
}) {
  return (
    <div className="editor-top-bar__zoom-controls" role="group" aria-label="Масштаб документа">
      <button
        type="button"
        className="editor-top-bar__zoom-button editor-top-bar__zoom-button--decrease"
        onMouseDown={onMouseDown}
        onClick={onZoomOut}
        aria-label="Уменьшить масштаб"
      >
        −
      </button>
      <span className="editor-top-bar__zoom-value">{zoom}%</span>
      <button
        type="button"
        className="editor-top-bar__zoom-button editor-top-bar__zoom-button--increase"
        onMouseDown={onMouseDown}
        onClick={onZoomIn}
        aria-label="Увеличить масштаб"
      >
        +
      </button>
    </div>
  );
}

function AiToggle({
  className,
  label,
  title,
  open,
  onClick,
}: {
  className: string;
  label: string;
  title: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      title={title}
      aria-pressed={open}
    >
      {label}
    </button>
  );
}

export function EditorTopBar(props: EditorTopBarProps) {
  const {
    rootClassName,
    modeIcon,
    modeLabel,
    statsItems,
    saveStatusClassName,
    saveDotClassName,
    sheetToggleClassName,
    aiToggleClassName,
    saveLabel,
    sheetTitle,
    aiTitle,
    aiLabel,
    preventMouseDown,
  } = useEditorTopBar(props);

  return (
    <div className={rootClassName} role="toolbar" aria-label="Верхняя панель редактора">
      <ModeBadge icon={modeIcon} label={modeLabel} />
      <div className="editor-top-bar__spacer" />
      <StatsGroup items={statsItems} />
      <div className="editor-top-bar__actions">
        <SaveStatus className={saveStatusClassName} dotClassName={saveDotClassName} label={saveLabel} />
        <SheetToggle
          className={sheetToggleClassName}
          title={sheetTitle}
          active={props.sheetOn}
          onMouseDown={preventMouseDown}
          onClick={props.onToggleSheet}
        />
        <HistoryControls onMouseDown={preventMouseDown} onUndo={props.onUndo} onRedo={props.onRedo} />
        <ZoomControls
          zoom={props.zoom}
          onMouseDown={preventMouseDown}
          onZoomOut={props.onZoomOut}
          onZoomIn={props.onZoomIn}
        />
        <AiToggle
          className={aiToggleClassName}
          label={aiLabel}
          title={aiTitle}
          open={props.aiOpen}
          onClick={props.onToggleAi}
        />
      </div>
    </div>
  );
}
