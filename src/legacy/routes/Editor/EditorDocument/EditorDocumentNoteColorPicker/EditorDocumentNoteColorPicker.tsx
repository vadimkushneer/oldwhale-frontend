import { EditorActionCloseGlyph } from "../../EditorActionButtons/EditorActionButtons";
import { NOTE_COLORS } from "../editorDocumentNoteConstants";
import { useEditorDocumentNoteColorPicker } from "./useEditorDocumentNoteColorPicker";
import "./EditorDocumentNoteColorPicker.scss";

export type EditorDocumentNoteColorPickerProps = {
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  getTooltipAnchorProps: (label: string) => Record<string, unknown>;
  saveNoteSelection: () => void;
  applyNoteColor: (color: string) => void;
};

export function EditorDocumentNoteColorPicker({
  isOpen,
  onToggleOpen,
  onClose,
  getTooltipAnchorProps,
  saveNoteSelection,
  applyNoteColor,
}: EditorDocumentNoteColorPickerProps) {
  const c = useEditorDocumentNoteColorPicker();

  return (
    <div className={c.rootClassName}>
      <button
        type="button"
        aria-label="Цвет текста"
        {...getTooltipAnchorProps("Цвет текста")}
        className={c.triggerClassName}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          saveNoteSelection();
          onToggleOpen();
        }}
      >
        <span className={c.dotClassName} />
      </button>

      {isOpen ? (
        <div className={c.menuClassName}>
          {NOTE_COLORS.map((color, index) => (
            <button
              key={color}
              type="button"
              className={c.swatchClassName(index)}
              aria-label={`Цвет ${index + 1}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                applyNoteColor(color);
              }}
            />
          ))}

          <button
            type="button"
            className={c.closeClassName}
            title="Закрыть"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            <EditorActionCloseGlyph />
          </button>
        </div>
      ) : null}
    </div>
  );
}
