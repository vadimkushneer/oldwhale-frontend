import { EditorActionCloseGlyph } from "../../../EditorActionButtons/EditorActionButtons";
import { NOTE_COLORS } from "../editorDocumentNoteConstants";
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
  const { colorMenuOpen, handleTriggerMouseDown, handleCloseMouseDown, getSwatchMouseDownHandler } =
    useEditorDocumentNoteColorPicker({
      applyNoteColor,
      saveNoteSelection,
    });

  return (
    <div className="editor-document-note-color-picker">
      <button
        type="button"
        {...getTooltipAnchorProps("Цвет текста")}
        className="editor-document-note-color-picker__trigger"
        onMouseDown={handleTriggerMouseDown}
      >
        <span className="editor-document-note-color-picker__trigger-dot" />
      </button>

      {colorMenuOpen ? (
        <div className="editor-document-note-color-picker__menu">
          {NOTE_COLORS.map((color) => (
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
            title="Закрыть"
            onMouseDown={handleCloseMouseDown}
          >
            <EditorActionCloseGlyph />
          </button>
        </div>
      ) : null}
    </div>
  );
}
