import { useMemo } from "react";
import { cx } from "../useEditorDocument";

export function useEditorDocumentNoteColorPicker() {
  return useMemo(
    () => ({
      rootClassName: "editor-document-note-color-picker",
      triggerClassName: "editor-document-note-color-picker__trigger",
      dotClassName: "editor-document-note-color-picker__dot",
      menuClassName: "editor-document-note-color-picker__menu",
      swatchClassName: (index: number) =>
        cx("editor-document-note-color-picker__swatch", `editor-document-note-color-picker__swatch--${index}`),
      closeClassName: "editor-document-note-color-picker__close",
    }),
    [],
  );
}
