import { useMemo } from "react";
import { cx } from "../useEditorDocument";

export function useEditorDocumentNoteToolbar() {
  return useMemo(
    () => ({
      rootClassName: "editor-document-note-toolbar",
      separatorClassName: "editor-document-note-toolbar__separator",
      buttonClassName: (options: { compact?: boolean; styleMod?: string }) =>
        cx(
          "editor-document-note-toolbar__button",
          options.compact && "editor-document-note-toolbar__button--compact",
          options.styleMod && `editor-document-note-toolbar__button--${options.styleMod}`,
        ),
    }),
    [],
  );
}
