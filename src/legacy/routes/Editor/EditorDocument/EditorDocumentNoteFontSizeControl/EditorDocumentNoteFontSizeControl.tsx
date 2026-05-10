import type { MutableRefObject } from "react";
import { useEditorDocumentNoteFontSizeControl } from "./useEditorDocumentNoteFontSizeControl";
import "../EditorDocumentNoteToolbar/EditorDocumentNoteToolbar.scss";
import "./EditorDocumentNoteFontSizeControl.scss";

export type EditorDocumentNoteFontSizeControlProps = {
  noteFontSize: number;
  setNoteFontSize: (value: number) => void;
  noteSelRangeRef: MutableRefObject<Range | null>;
  saveNoteSelection: () => void;
  applyFontSize: (pt: number) => void;
};

export function EditorDocumentNoteFontSizeControl({
  noteFontSize,
  setNoteFontSize,
  noteSelRangeRef,
  saveNoteSelection,
  applyFontSize,
}: EditorDocumentNoteFontSizeControlProps) {
  const c = useEditorDocumentNoteFontSizeControl();

  return (
    <div className={c.rootClassName}>
      <button
        type="button"
        className={c.buttonClassName}
        aria-label="Уменьшить размер шрифта"
        onMouseDown={(e) => {
          e.preventDefault();
          const next = Math.max(4, noteFontSize - 1);
          setNoteFontSize(next);
          applyFontSize(next);
        }}
      >
        −
      </button>

      <input
        key={noteFontSize}
        type="text"
        defaultValue={noteFontSize}
        className={c.inputClassName}
        aria-label="Размер шрифта"
        onMouseDown={() => saveNoteSelection()}
        onBlur={(e) => {
          const value = parseInt(e.target.value, 10);
          if (Number.isNaN(value) || value < 4 || value > 96) return;
          const selection = window.getSelection();
          selection?.removeAllRanges();
          if (noteSelRangeRef.current) selection?.addRange(noteSelRangeRef.current);
          setNoteFontSize(value);
          applyFontSize(value);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          const value = parseInt(e.currentTarget.value, 10);
          if (!Number.isNaN(value) && value >= 4 && value <= 96) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            if (noteSelRangeRef.current) selection?.addRange(noteSelRangeRef.current);
            setNoteFontSize(value);
            applyFontSize(value);
          }
          e.currentTarget.blur();
        }}
      />

      <button
        type="button"
        className={c.buttonClassName}
        aria-label="Увеличить размер шрифта"
        onMouseDown={(e) => {
          e.preventDefault();
          const next = Math.min(96, noteFontSize + 1);
          setNoteFontSize(next);
          applyFontSize(next);
        }}
      >
        +
      </button>
    </div>
  );
}
