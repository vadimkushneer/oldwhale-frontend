import { useMemo } from "react";
import { cx } from "../useEditorDocument";

export function useEditorDocumentNoteFontSizeControl() {
  return useMemo(
    () => ({
      rootClassName: "editor-document-note-font-size-control",
      buttonClassName: "editor-document-note-toolbar__button",
      inputClassName: "editor-document-note-font-size-control__input",
    }),
    [],
  );
}
