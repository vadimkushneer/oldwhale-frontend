import type { MouseEventHandler } from "react";
import {
  useEditorActionButtons,
  type EditorActionButtonsProps,
  type EditorActionButtonKind,
} from "./useEditorActionButtons";
import "./EditorActionButtons.scss";

export type { EditorActionButtonsProps, EditorActionButtonsVariant } from "./useEditorActionButtons";

export function EditorActionCloseGlyph() {
  return (
    <svg
      className="editor-action-buttons__delete-icon"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
    >
      <line x1="1" y1="1" x2="7" y2="7" />
      <line x1="7" y1="1" x2="1" y2="7" />
    </svg>
  );
}

function ActionButton({
  kind,
  label,
  text,
  className,
  onMouseDown,
  onClick,
}: {
  kind: EditorActionButtonKind;
  label: string;
  text: string | null;
  className: string;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className={className}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-label={label}
    >
      {kind === "duplicate" ? text : <EditorActionCloseGlyph />}
    </button>
  );
}

export function EditorActionButtons(props: EditorActionButtonsProps) {
  const { rootClassName, buttonConfigs, getButtonClassName, getMouseDownHandler, getClickHandler } =
    useEditorActionButtons(props);

  return (
    <div className={rootClassName} role="group" aria-label="Действия элемента">
      {buttonConfigs.map((button) => (
        <ActionButton
          key={button.kind}
          kind={button.kind}
          label={button.label}
          text={button.text}
          className={getButtonClassName(button.kind)}
          onMouseDown={getMouseDownHandler(button.kind)}
          onClick={getClickHandler(button.kind)}
        />
      ))}
    </div>
  );
}
