import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  getTranslatedNoteAlignOptions,
  type EditorDocumentNoteAlignOption,
  type EditorDocumentNoteAlignment,
} from "../editorDocumentNoteConstants";
import { useEditorDocumentNoteAlignControl } from "./useEditorDocumentNoteAlignControl";
import "./EditorDocumentNoteAlignControl.scss";

export type EditorDocumentNoteAlignControlProps = {
  applyAlignment: (option: EditorDocumentNoteAlignOption) => boolean;
};

function renderAlignIcon(align: EditorDocumentNoteAlignment) {
  if (align === "center") {
    return (
      <svg
        className="editor-document-note-align-control__icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }

  if (align === "right") {
    return (
      <svg
        className="editor-document-note-align-control__icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </svg>
    );
  }

  return (
    <svg
      className="editor-document-note-align-control__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

export function EditorDocumentNoteAlignControl({ applyAlignment }: EditorDocumentNoteAlignControlProps) {
  const { t, i18n } = useTranslation();
  const {
    alignMenuOpen,
    noteAlign,
    triggerClassName,
    handleTriggerMouseDown,
    getOptionClassName,
    getOptionMouseDownHandler,
  } = useEditorDocumentNoteAlignControl({ applyAlignment });

  const alignOptions = useMemo(
    () => getTranslatedNoteAlignOptions(t),
    [t, i18n.language],
  );

  return (
    <div className="editor-document-note-align-control">
      <button
        type="button"
        title={t("note.alignment")}
        className={triggerClassName}
        onMouseDown={handleTriggerMouseDown}
      >
        {renderAlignIcon(noteAlign)}
      </button>

      {alignMenuOpen ? (
        <div className="editor-document-note-align-control__menu">
          {alignOptions.map((option) => (
            <button
              key={option.align}
              type="button"
              className={getOptionClassName(option)}
              onMouseDown={getOptionMouseDownHandler(option)}
            >
              {renderAlignIcon(option.align)}
              <span className="editor-document-note-align-control__label">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
