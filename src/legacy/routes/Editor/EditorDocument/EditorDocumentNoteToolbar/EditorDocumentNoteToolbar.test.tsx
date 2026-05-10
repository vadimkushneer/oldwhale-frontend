import type { ComponentProps } from "react";
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteToolbar } from "./EditorDocumentNoteToolbar";

function renderToolbar(overrides: Partial<ComponentProps<typeof EditorDocumentNoteToolbar>> = {}) {
  const noteEditorRef = createRef<HTMLDivElement>();
  const defaults = {
    getTooltipAnchorProps: () => ({}),
    execNoteCommand: vi.fn(),
    saveNoteSelection: vi.fn(),
    applyNoteColor: vi.fn(),
    noteColorOpen: false,
    setNoteColorOpen: vi.fn(),
    noteEditorRef,
    noteTextRef: { current: "" },
    setNoteText: vi.fn(),
    markDirty: vi.fn(),
    scheduleNoteHistorySnapshot: vi.fn(),
    restoreNoteSelection: vi.fn(() => true),
    noteAlignOpen: false,
    setNoteAlignOpen: vi.fn(),
    noteAlign: "left" as const,
    setNoteAlign: vi.fn(),
    noteFontSize: 14,
    setNoteFontSize: vi.fn(),
    noteSelRangeRef: { current: null },
    applyFontSize: vi.fn(),
  };
  render(<EditorDocumentNoteToolbar {...defaults} {...overrides} />);
  return { ...defaults, noteEditorRef };
}

describe("EditorDocumentNoteToolbar", () => {
  it("renders formatting controls", () => {
    renderToolbar();
    expect(screen.getByTitle("Жирный")).toBeInTheDocument();
    expect(screen.getByTitle("Список")).toBeInTheDocument();
  });

  it("invokes execNoteCommand on bold", () => {
    const execNoteCommand = vi.fn();
    renderToolbar({ execNoteCommand });
    fireEvent.mouseDown(screen.getByTitle("Жирный"));
    expect(execNoteCommand).toHaveBeenCalledWith(
      expect.objectContaining({ cmd: "bold" }),
    );
  });
});
