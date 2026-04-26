import { useCallback, useMemo, useRef, type MouseEvent as ReactMouseEvent } from "react";

export type EditorActionButtonsVariant = "scene-card" | "gutter";

export type EditorActionButtonsProps = {
  variant: EditorActionButtonsVariant;
  duplicateLabel: string;
  deleteLabel: string;
  onDuplicate: () => void;
  onDelete: () => void;
};

export type EditorActionButtonKind = "duplicate" | "delete";

type EditorActionButtonConfig = {
  kind: EditorActionButtonKind;
  label: string;
  text: string | null;
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function useEditorActionButtons({
  variant,
  duplicateLabel,
  deleteLabel,
  onDuplicate,
  onDelete,
}: EditorActionButtonsProps) {
  const suppressClickKindRef = useRef<EditorActionButtonKind | null>(null);

  const invokeAction = useCallback(
    (kind: EditorActionButtonKind) => {
      if (kind === "duplicate") {
        onDuplicate();
        return;
      }
      onDelete();
    },
    [onDelete, onDuplicate],
  );

  const rootClassName = useMemo(
    () => cx("editor-action-buttons", `editor-action-buttons--${variant}`),
    [variant],
  );

  const buttonConfigs = useMemo<EditorActionButtonConfig[]>(
    () => [
      { kind: "duplicate", label: duplicateLabel, text: "⧉" },
      { kind: "delete", label: deleteLabel, text: null },
    ],
    [deleteLabel, duplicateLabel],
  );

  const getButtonClassName = useCallback(
    (kind: EditorActionButtonKind) =>
      cx("editor-action-buttons__button", `editor-action-buttons__button--${kind}`),
    [],
  );

  const getMouseDownHandler = useCallback(
    (kind: EditorActionButtonKind) => (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (variant === "scene-card") {
        event.stopPropagation();
        event.preventDefault();
        return;
      }

      event.preventDefault();
      suppressClickKindRef.current = kind;
      invokeAction(kind);
    },
    [invokeAction, variant],
  );

  const getClickHandler = useCallback(
    (kind: EditorActionButtonKind) => (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (variant === "scene-card") {
        event.stopPropagation();
        invokeAction(kind);
        return;
      }

      if (suppressClickKindRef.current === kind) {
        suppressClickKindRef.current = null;
        event.preventDefault();
        return;
      }

      invokeAction(kind);
    },
    [invokeAction, variant],
  );

  return {
    rootClassName,
    buttonConfigs,
    getButtonClassName,
    getMouseDownHandler,
    getClickHandler,
  };
}
