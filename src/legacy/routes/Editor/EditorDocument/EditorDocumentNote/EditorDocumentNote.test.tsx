import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNote } from "./EditorDocumentNote";

function makeProps(overrides: Record<string, any> = {}) {
  return {
    projectId: "project-1",
    spellOn: true,
    noteEditorRef: createRef<HTMLDivElement>(),
    noteTextRef: { current: "" },
    noteSelRangeRef: { current: null },
    setNoteText: vi.fn(),
    markDirty: vi.fn(),
    scheduleNoteHistorySnapshot: vi.fn(),
    getTooltipAnchorProps: (label: string) => ({ "data-tooltip": label }),
    ...overrides,
  };
}

describe("EditorDocumentNote", () => {
  beforeEach(() => {
    Object.defineProperty(document, "execCommand", { configurable: true, value: vi.fn().mockReturnValue(true) });
    Object.defineProperty(document, "queryCommandValue", { configurable: true, value: vi.fn().mockReturnValue("p") });

    const range = document.createRange();
    vi.spyOn(window, "getSelection").mockReturnValue({
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: vi.fn(() => range),
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
    } as unknown as Selection);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("syncs contentEditable input with parent-owned note persistence", () => {
    const props = makeProps();
    const { container } = render(<EditorDocumentNote {...props} />);
    const editor = container.querySelector(".ow-note-editor") as HTMLDivElement;

    editor.innerHTML = "<p>Draft</p>";
    fireEvent.input(editor);

    expect(props.noteTextRef.current).toBe("<p>Draft</p>");
    expect(props.setNoteText).toHaveBeenCalledWith("<p>Draft</p>");
    expect(props.markDirty).toHaveBeenCalled();
    expect(props.scheduleNoteHistorySnapshot).toHaveBeenCalledWith("<p>Draft</p>");
  });

  it("runs toolbar commands against the editable note", () => {
    const props = makeProps();
    const { container } = render(<EditorDocumentNote {...props} />);
    const editor = container.querySelector(".ow-note-editor") as HTMLDivElement;
    editor.innerHTML = "Draft text";

    fireEvent.mouseDown(screen.getByTitle("Жирный"));

    expect(document.execCommand).toHaveBeenCalledWith("bold", false);
    expect(props.setNoteText).toHaveBeenCalledWith("Draft text");
    expect(props.scheduleNoteHistorySnapshot).toHaveBeenCalledWith("Draft text");
  });

  it("pastes plain text in the desktop editor", () => {
    const props = makeProps();
    const { container } = render(<EditorDocumentNote {...props} />);
    const editor = container.querySelector(".ow-note-editor") as HTMLDivElement;

    fireEvent.paste(editor, {
      clipboardData: {
        getData: vi.fn().mockReturnValue("plain text"),
      },
    });

    expect(document.execCommand).toHaveBeenCalledWith("insertText", false, "plain text");
  });

  it("keeps the mobile line-break behavior on Enter", () => {
    const props = makeProps({ editorVariant: "mobile" });
    const { container } = render(<EditorDocumentNote {...props} />);
    const editor = container.querySelector(".ow-note-editor") as HTMLDivElement;

    fireEvent.keyDown(editor, { key: "Enter" });

    expect(document.execCommand).toHaveBeenCalledWith("insertLineBreak");
  });
});
