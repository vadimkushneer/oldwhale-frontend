import { describe, it, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { EditorDocumentNote } from "./EditorDocumentNote";

describe("EditorDocumentNote", () => {
  it("renders note editor and syncs input", () => {
    const setNoteText = vi.fn();
    const markDirty = vi.fn();
    const scheduleNoteHistorySnapshot = vi.fn();

    render(
      <EditorDocumentNote
        projectId="p1"
        spellOn={false}
        noteTextRef={{ current: "" }}
        noteSelRangeRef={{ current: null }}
        setNoteText={setNoteText}
        markDirty={markDirty}
        scheduleNoteHistorySnapshot={scheduleNoteHistorySnapshot}
        noteColorOpen={false}
        setNoteColorOpen={vi.fn()}
        noteAlignOpen={false}
        setNoteAlignOpen={vi.fn()}
        noteAlign="left"
        setNoteAlign={vi.fn()}
        noteFontSize={14}
        setNoteFontSize={vi.fn()}
        getTooltipAnchorProps={() => ({})}
      />,
    );

    const surface = document.querySelector(".ow-note-editor") as HTMLDivElement;
    expect(surface).toBeTruthy();

    surface.innerHTML = "<p>hi</p>";
    fireEvent.input(surface);

    expect(setNoteText).toHaveBeenCalledWith("<p>hi</p>");
    expect(markDirty).toHaveBeenCalled();
    expect(scheduleNoteHistorySnapshot).toHaveBeenCalledWith("<p>hi</p>");
  });

  it("pastes plain text only", () => {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });

    render(
      <EditorDocumentNote
        projectId="p1"
        spellOn={false}
        noteTextRef={{ current: "" }}
        noteSelRangeRef={{ current: null }}
        setNoteText={vi.fn()}
        markDirty={vi.fn()}
        scheduleNoteHistorySnapshot={vi.fn()}
        noteColorOpen={false}
        setNoteColorOpen={vi.fn()}
        noteAlignOpen={false}
        setNoteAlignOpen={vi.fn()}
        noteAlign="left"
        setNoteAlign={vi.fn()}
        noteFontSize={14}
        setNoteFontSize={vi.fn()}
        getTooltipAnchorProps={() => ({})}
      />,
    );

    const surface = document.querySelector(".ow-note-editor") as HTMLDivElement;
    fireEvent.paste(surface, {
      clipboardData: { getData: () => "plain" },
    });

    expect(execCommand).toHaveBeenCalledWith("insertText", false, "plain");
  });
});
