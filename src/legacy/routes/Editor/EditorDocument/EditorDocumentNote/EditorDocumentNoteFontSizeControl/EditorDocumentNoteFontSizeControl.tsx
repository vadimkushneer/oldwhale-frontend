import { useEditorDocumentNoteFontSizeControl } from "./useEditorDocumentNoteFontSizeControl";
import "./EditorDocumentNoteFontSizeControl.scss";

export type EditorDocumentNoteFontSizeControlProps = {
  applyFontSize: (fontSize: number) => boolean;
  saveNoteSelection: () => void;
  restoreNoteSelection: () => boolean;
};

export function EditorDocumentNoteFontSizeControl({
  applyFontSize,
  saveNoteSelection,
  restoreNoteSelection,
}: EditorDocumentNoteFontSizeControlProps) {
  const {
    noteFontSize,
    handleDecreaseMouseDown,
    handleIncreaseMouseDown,
    handleInputMouseDown,
    handleInputBlur,
    handleInputKeyDown,
  } = useEditorDocumentNoteFontSizeControl({
    applyFontSize,
    saveNoteSelection,
    restoreNoteSelection,
  });

  return (
    <div className="editor-document-note-font-size-control">
      <button
        type="button"
        className="editor-document-note-toolbar__button editor-document-note-font-size-control__button"
        onMouseDown={handleDecreaseMouseDown}
      >
        −
      </button>

      <input
        key={noteFontSize}
        type="text"
        defaultValue={noteFontSize}
        className="editor-document-note-font-size-control__input"
        onMouseDown={handleInputMouseDown}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
      />

      <button
        type="button"
        className="editor-document-note-toolbar__button editor-document-note-font-size-control__button"
        onMouseDown={handleIncreaseMouseDown}
      >
        +
      </button>
    </div>
  );
}
