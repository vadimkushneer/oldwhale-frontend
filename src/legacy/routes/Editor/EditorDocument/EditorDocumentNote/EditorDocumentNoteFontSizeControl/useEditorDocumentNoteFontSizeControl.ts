import { useCallback, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { NOTE_DEFAULT_FONT_SIZE, NOTE_MAX_FONT_SIZE, NOTE_MIN_FONT_SIZE } from "../editorDocumentNoteConstants";

export type EditorDocumentNoteFontSizeControlHookProps = {
  applyFontSize: (fontSize: number) => boolean;
  saveNoteSelection: () => void;
  restoreNoteSelection: () => boolean;
};

function parseAllowedFontSize(value: string) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < NOTE_MIN_FONT_SIZE || parsed > NOTE_MAX_FONT_SIZE) return null;
  return parsed;
}

export function useEditorDocumentNoteFontSizeControl({
  applyFontSize,
  saveNoteSelection,
  restoreNoteSelection,
}: EditorDocumentNoteFontSizeControlHookProps) {
  const [noteFontSize, setNoteFontSize] = useState(NOTE_DEFAULT_FONT_SIZE);

  const applyNextFontSize = useCallback(
    (fontSize: number) => {
      setNoteFontSize(fontSize);
      applyFontSize(fontSize);
    },
    [applyFontSize],
  );

  const handleDecreaseMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      applyNextFontSize(Math.max(NOTE_MIN_FONT_SIZE, noteFontSize - 1));
    },
    [applyNextFontSize, noteFontSize],
  );

  const handleIncreaseMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      applyNextFontSize(Math.min(NOTE_MAX_FONT_SIZE, noteFontSize + 1));
    },
    [applyNextFontSize, noteFontSize],
  );

  const handleInputMouseDown = useCallback(() => {
    saveNoteSelection();
  }, [saveNoteSelection]);

  const handleInputBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const value = parseAllowedFontSize(event.target.value);
      if (value === null) return;

      restoreNoteSelection();
      applyNextFontSize(value);
    },
    [applyNextFontSize, restoreNoteSelection],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;

      event.preventDefault();
      const value = parseAllowedFontSize(event.currentTarget.value);
      if (value !== null) {
        restoreNoteSelection();
        applyNextFontSize(value);
      }
      event.currentTarget.blur();
    },
    [applyNextFontSize, restoreNoteSelection],
  );

  return {
    noteFontSize,
    handleDecreaseMouseDown,
    handleIncreaseMouseDown,
    handleInputMouseDown,
    handleInputBlur,
    handleInputKeyDown,
  };
}
