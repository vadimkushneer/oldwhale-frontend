import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteColorPicker } from "./EditorDocumentNoteColorPicker";

describe("EditorDocumentNoteColorPicker", () => {
  it("opens the color menu, preserves selection, applies a color, and closes", () => {
    const applyNoteColor = vi.fn().mockReturnValue(true);
    const saveNoteSelection = vi.fn();

    render(
      <EditorDocumentNoteColorPicker
        applyNoteColor={applyNoteColor}
        saveNoteSelection={saveNoteSelection}
        getTooltipAnchorProps={(label) => ({ "data-tooltip": label })}
      />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.mouseDown(trigger);

    expect(saveNoteSelection).toHaveBeenCalled();
    expect(screen.getByLabelText("Розовый")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-tooltip", "Цвет текста");

    fireEvent.mouseDown(screen.getByLabelText("Розовый"));

    expect(applyNoteColor).toHaveBeenCalledWith("#f472b6");
    expect(screen.queryByLabelText("Розовый")).not.toBeInTheDocument();
  });

  it("keeps the menu open when color application is not possible", () => {
    render(
      <EditorDocumentNoteColorPicker
        applyNoteColor={vi.fn().mockReturnValue(false)}
        saveNoteSelection={vi.fn()}
        getTooltipAnchorProps={() => ({})}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("button"));
    fireEvent.mouseDown(screen.getByLabelText("Синий"));

    expect(screen.getByLabelText("Синий")).toBeInTheDocument();
  });
});
