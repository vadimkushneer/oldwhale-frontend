import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EditorActionCloseGlyph } from "../../../EditorActionButtons/EditorActionButtons";
import { getTranslatedNoteColors } from "../editorDocumentNoteConstants";
import { useEditorDocumentNoteColorPicker } from "./useEditorDocumentNoteColorPicker";
import "./EditorDocumentNoteColorPicker.scss";

export type EditorDocumentNoteColorPickerProps = {
  applyNoteColor: (color: string) => boolean;
  saveNoteSelection: () => void;
  getTooltipAnchorProps: (label: string) => Record<string, any>;
};

export function EditorDocumentNoteColorPicker({
  applyNoteColor,
  saveNoteSelection,
  getTooltipAnchorProps,
}: EditorDocumentNoteColorPickerProps) {
  const { t, i18n } = useTranslation();
  const { colorMenuOpen, handleTriggerMouseDown, handleCloseMouseDown, getSwatchMouseDownHandler } =
    useEditorDocumentNoteColorPicker({
      applyNoteColor,
      saveNoteSelection,
    });

  const noteColors = useMemo(
    () => getTranslatedNoteColors(t),
    [t, i18n.language],
  );

  return (
    <div className="editor-document-note-color-picker">
      <button
        type="button"
        {...getTooltipAnchorProps(t("note.textColor"))}
        className="editor-document-note-color-picker__trigger"
        onMouseDown={handleTriggerMouseDown}
      >
        <span className="editor-document-note-color-picker__trigger-dot" />
      </button>

      {colorMenuOpen ? (
        <div className="editor-document-note-color-picker__menu">
          {noteColors.map((color) => (
            <button
              key={color.id}
              type="button"
              aria-label={color.label}
              className={`editor-document-note-color-picker__swatch editor-document-note-color-picker__swatch--${color.id}`}
              onMouseDown={getSwatchMouseDownHandler(color.value)}
            />
          ))}

          <button
            type="button"
            className="editor-document-note-color-picker__close"
            title={t("note.close")}
            onMouseDown={handleCloseMouseDown}
          >
            <EditorActionCloseGlyph />
          </button>
        </div>
      ) : null}
    </div>
  );
}
