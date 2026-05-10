import { useCallback, useState, type MouseEvent } from "react";
import { cx } from "../../useEditorDocument";
import type { EditorDocumentNoteAlignOption, EditorDocumentNoteAlignment } from "../editorDocumentNoteConstants";

export type EditorDocumentNoteAlignControlHookProps = {
  applyAlignment: (option: EditorDocumentNoteAlignOption) => boolean;
};

export function useEditorDocumentNoteAlignControl({ applyAlignment }: EditorDocumentNoteAlignControlHookProps) {
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [noteAlign, setNoteAlign] = useState<EditorDocumentNoteAlignment>("left");

  const handleTriggerMouseDown = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAlignMenuOpen((value) => !value);
  }, []);

  const getOptionMouseDownHandler = useCallback(
    (option: EditorDocumentNoteAlignOption) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (applyAlignment(option)) {
        setNoteAlign(option.align);
        setAlignMenuOpen(false);
      }
    },
    [applyAlignment],
  );

  const triggerClassName = cx(
    "editor-document-note-toolbar__button",
    alignMenuOpen && "editor-document-note-toolbar__button--active",
  );

  const getOptionClassName = useCallback(
    (option: EditorDocumentNoteAlignOption) =>
      cx(
        "editor-document-note-align-control__item",
        noteAlign === option.align && "editor-document-note-align-control__item--active",
      ),
    [noteAlign],
  );

  return {
    alignMenuOpen,
    noteAlign,
    triggerClassName,
    handleTriggerMouseDown,
    getOptionClassName,
    getOptionMouseDownHandler,
  };
}
