import { useMemo } from "react";
import { cx } from "../useEditorDocument";

export function useEditorDocumentNoteAlignControl() {
  return useMemo(
    () => ({
      rootClassName: "editor-document-note-align-control",
      toggleClassName: (active: boolean) =>
        cx(
          "editor-document-note-toolbar__button",
          active && "editor-document-note-toolbar__button--active",
        ),
      menuClassName: "editor-document-note-align-control__menu",
      itemClassName: (active: boolean) =>
        cx(
          "editor-document-note-align-control__item",
          active && "editor-document-note-align-control__item--active",
        ),
      iconLabelClassName: "editor-document-note-align-control__label",
    }),
    [],
  );
}
