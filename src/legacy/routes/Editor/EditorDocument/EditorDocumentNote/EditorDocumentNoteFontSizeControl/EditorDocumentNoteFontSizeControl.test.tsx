import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteFontSizeControl } from "./EditorDocumentNoteFontSizeControl";

describe("EditorDocumentNoteFontSizeControl", () => {
  it("increments and decrements the selected font size", () => {
    const applyFontSize = vi.fn().mockReturnValue(true);

    render(
      <EditorDocumentNoteFontSizeControl
        applyFontSize={applyFontSize}
        saveNoteSelection={vi.fn()}
        restoreNoteSelection={vi.fn()}
      />,
    );

    fireEvent.mouseDown(screen.getByText("+"));
    expect(applyFontSize).toHaveBeenCalledWith(15);

    fireEvent.mouseDown(screen.getByText("−"));
    expect(applyFontSize).toHaveBeenCalledWith(14);
  });

  it("saves and restores selection around manual font size input", () => {
    const applyFontSize = vi.fn().mockReturnValue(true);
    const saveNoteSelection = vi.fn();
    const restoreNoteSelection = vi.fn().mockReturnValue(true);

    render(
      <EditorDocumentNoteFontSizeControl
        applyFontSize={applyFontSize}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
      />,
    );

    const input = screen.getByDisplayValue("14");
    fireEvent.mouseDown(input);
    fireEvent.change(input, { target: { value: "18" } });
    fireEvent.blur(input);

    expect(saveNoteSelection).toHaveBeenCalled();
    expect(restoreNoteSelection).toHaveBeenCalled();
    expect(applyFontSize).toHaveBeenCalledWith(18);
  });

  it("applies a valid size on Enter and blurs the input", () => {
    const applyFontSize = vi.fn().mockReturnValue(true);

    render(
      <EditorDocumentNoteFontSizeControl
        applyFontSize={applyFontSize}
        saveNoteSelection={vi.fn()}
        restoreNoteSelection={vi.fn()}
      />,
    );

    const input = screen.getByDisplayValue("14");
    fireEvent.change(input, { target: { value: "20" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(applyFontSize).toHaveBeenCalledWith(20);
  });
});
