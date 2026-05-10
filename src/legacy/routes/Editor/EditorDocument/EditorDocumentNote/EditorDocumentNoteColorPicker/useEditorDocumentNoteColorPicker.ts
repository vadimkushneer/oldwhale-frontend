import { useCallback, useState, type MouseEvent } from "react";

export type EditorDocumentNoteColorPickerHookProps = {
  applyNoteColor: (color: string) => boolean;
  saveNoteSelection: () => void;
};

export function useEditorDocumentNoteColorPicker({
  applyNoteColor,
  saveNoteSelection,
}: EditorDocumentNoteColorPickerHookProps) {
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const handleTriggerMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      saveNoteSelection();
      setColorMenuOpen((value) => !value);
    },
    [saveNoteSelection],
  );

  const handleCloseMouseDown = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setColorMenuOpen(false);
  }, []);

  const getSwatchMouseDownHandler = useCallback(
    (color: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (applyNoteColor(color)) {
        setColorMenuOpen(false);
      }
    },
    [applyNoteColor],
  );

  return {
    colorMenuOpen,
    handleTriggerMouseDown,
    handleCloseMouseDown,
    getSwatchMouseDownHandler,
  };
}
