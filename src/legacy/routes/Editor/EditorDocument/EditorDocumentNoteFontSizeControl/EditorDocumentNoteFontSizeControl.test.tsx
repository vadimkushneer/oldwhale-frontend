import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteFontSizeControl } from "./EditorDocumentNoteFontSizeControl";

describe("EditorDocumentNoteFontSizeControl", () => {
  it("increments font size on plus", () => {
    const setNoteFontSize = vi.fn();
    const applyFontSize = vi.fn();
    const noteSelRangeRef = { current: null };

    render(
      <EditorDocumentNoteFontSizeControl
        noteFontSize={14}
        setNoteFontSize={setNoteFontSize}
        noteSelRangeRef={noteSelRangeRef}
        saveNoteSelection={vi.fn()}
        applyFontSize={applyFontSize}
      />,
    );

    fireEvent.mouseDown(screen.getByLabelText("Увеличить размер шрифта"));
    expect(setNoteFontSize).toHaveBeenCalledWith(15);
    expect(applyFontSize).toHaveBeenCalledWith(15);
  });

  it("applies font size from input on Enter", () => {
    const setNoteFontSize = vi.fn();
    const applyFontSize = vi.fn();
    const noteSelRangeRef = { current: null };

    const selection = {
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
    };
    vi.spyOn(window, "getSelection").mockReturnValue(selection as unknown as Selection);

    render(
      <EditorDocumentNoteFontSizeControl
        noteFontSize={14}
        setNoteFontSize={setNoteFontSize}
        noteSelRangeRef={noteSelRangeRef}
        saveNoteSelection={vi.fn()}
        applyFontSize={applyFontSize}
      />,
    );

    const input = screen.getByLabelText("Размер шрифта");
    fireEvent.change(input, { target: { value: "18" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(setNoteFontSize).toHaveBeenCalledWith(18);
    expect(applyFontSize).toHaveBeenCalledWith(18);
  });
});
