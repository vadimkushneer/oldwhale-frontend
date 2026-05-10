import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteColorPicker } from "./EditorDocumentNoteColorPicker";

describe("EditorDocumentNoteColorPicker", () => {
  it("toggles the menu and applies a color", () => {
    const saveNoteSelection = vi.fn();
    const applyNoteColor = vi.fn();
    const onToggleOpen = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <EditorDocumentNoteColorPicker
        isOpen={false}
        onToggleOpen={onToggleOpen}
        onClose={onClose}
        getTooltipAnchorProps={() => ({})}
        saveNoteSelection={saveNoteSelection}
        applyNoteColor={applyNoteColor}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("button", { name: /цвет текста/i }));
    expect(saveNoteSelection).toHaveBeenCalled();
    expect(onToggleOpen).toHaveBeenCalled();

    rerender(
      <EditorDocumentNoteColorPicker
        isOpen
        onToggleOpen={onToggleOpen}
        onClose={onClose}
        getTooltipAnchorProps={() => ({})}
        saveNoteSelection={saveNoteSelection}
        applyNoteColor={applyNoteColor}
      />,
    );

    const swatches = document.querySelectorAll(".editor-document-note-color-picker__swatch");
    expect(swatches.length).toBe(8);
    fireEvent.mouseDown(swatches[1] as HTMLElement);
    expect(applyNoteColor).toHaveBeenCalledWith("#f472b6");
  });

  it("closes from the close control", () => {
    const onClose = vi.fn();
    render(
      <EditorDocumentNoteColorPicker
        isOpen
        onToggleOpen={vi.fn()}
        onClose={onClose}
        getTooltipAnchorProps={() => ({})}
        saveNoteSelection={vi.fn()}
        applyNoteColor={vi.fn()}
      />,
    );

    fireEvent.mouseDown(screen.getByTitle("Закрыть"));
    expect(onClose).toHaveBeenCalled();
  });
});
