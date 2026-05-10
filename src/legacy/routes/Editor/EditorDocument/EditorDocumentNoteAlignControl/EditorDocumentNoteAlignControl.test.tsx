import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteAlignControl } from "./EditorDocumentNoteAlignControl";

describe("EditorDocumentNoteAlignControl", () => {
  it("runs alignment command and syncs note state", () => {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });

    const editor = document.createElement("div");
    editor.innerHTML = "<p>x</p>";
    const noteEditorRef = createRef<HTMLDivElement>();
    (noteEditorRef as React.MutableRefObject<HTMLDivElement | null>).current = editor;

    const noteTextRef = { current: "" };
    const setNoteText = vi.fn();
    const markDirty = vi.fn();
    const scheduleNoteHistorySnapshot = vi.fn();
    const saveNoteSelection = vi.fn();
    const restoreNoteSelection = vi.fn(() => true);
    const setAlignOpen = vi.fn();
    const setAlign = vi.fn();

    render(
      <EditorDocumentNoteAlignControl
        noteEditorRef={noteEditorRef}
        noteTextRef={noteTextRef}
        setNoteText={setNoteText}
        markDirty={markDirty}
        scheduleNoteHistorySnapshot={scheduleNoteHistorySnapshot}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
        alignOpen
        setAlignOpen={setAlignOpen}
        align="left"
        setAlign={setAlign}
      />,
    );

    fireEvent.mouseDown(screen.getByText("По центру"));

    expect(restoreNoteSelection).toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("justifyCenter", false);
    expect(setNoteText).toHaveBeenCalledWith("<p>x</p>");
    expect(noteTextRef.current).toBe("<p>x</p>");
    expect(markDirty).toHaveBeenCalled();
    expect(scheduleNoteHistorySnapshot).toHaveBeenCalledWith("<p>x</p>");
    expect(saveNoteSelection).toHaveBeenCalled();
    expect(setAlign).toHaveBeenCalledWith("center");
    expect(setAlignOpen).toHaveBeenCalledWith(false);
  });
});
