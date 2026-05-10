import { useCallback, type MouseEvent } from "react";
import { cx } from "../../useEditorDocument";
import type { EditorDocumentNoteCommandItem } from "../editorDocumentNoteConstants";

export type EditorDocumentNoteToolbarHookProps = {
  execNoteCommand: (item: EditorDocumentNoteCommandItem) => boolean;
  getTooltipAnchorProps: (label: string) => Record<string, any>;
};

export function useEditorDocumentNoteToolbar({
  execNoteCommand,
  getTooltipAnchorProps,
}: EditorDocumentNoteToolbarHookProps) {
  const getCommandClassName = useCallback(
    (item: EditorDocumentNoteCommandItem) =>
      cx(
        "editor-document-note-toolbar__button",
        item.compact && "editor-document-note-toolbar__button--compact",
        item.styleMod && `editor-document-note-toolbar__button--${item.styleMod}`,
      ),
    [],
  );

  const getCommandMouseDownHandler = useCallback(
    (item: EditorDocumentNoteCommandItem) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      execNoteCommand(item);
    },
    [execNoteCommand],
  );

  const getCommandTitle = useCallback((item: EditorDocumentNoteCommandItem) => (item.tooltip ? undefined : item.title), []);

  const getCommandTooltipProps = useCallback(
    (item: EditorDocumentNoteCommandItem) => (item.tooltip ? getTooltipAnchorProps(item.tooltip) : {}),
    [getTooltipAnchorProps],
  );

  return {
    getCommandClassName,
    getCommandMouseDownHandler,
    getCommandTitle,
    getCommandTooltipProps,
  };
}
