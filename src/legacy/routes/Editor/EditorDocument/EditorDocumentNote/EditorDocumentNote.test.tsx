import { describe, it, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { EditorDocumentNote } from "./EditorDocumentNote";
import { computeTextChanges } from "./useEditorDocumentNote";

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

describe("computeTextChanges (paste review granularity)", () => {
  const textVariant1 = `
  Здесь будет основная писанина, весь текст. Суну сюда небольшой рассказ, как будто я ео сам написал, например.
Доминика Петрова, фиктивная жена Хауса, прибывает к нему из ниоткуда. У неё проблемы. Её могут лишить возможности получить грин-карту, так как миграционная служба подозревает, что та вышла замуж лишь ради неё. Они с Хаусом должны разыграть перед служащими управления счастливую семейную пару. Но поначалу придётся получше узнать друг друга.
В больнице, тем временем, по случайному совпадению находится один из известных экспертов по браку, переженивший немало пар. Он поступил после обморока на церемонии и испытывает проблемы со зрением. Его печерь тоже не в порядке, к тому же в организме низкий уровень тестостерона. Но заболевание делает из него лучшего специалиста в своей области.
`.trim();

  const textVariant2 = `
  Тут будет главная писанина, весь текст. Помещу сюда небольшой рассказ, как будто я его сам написал, например.
Доминика Петрова, фиктивная жена Хауса, прибывает к нему из ниоткуда. У неё проблемы. Её могут лишить возможности получить грин-карту, так как миграционная служба подозревает, что та вышла замуж лишь ради неё. Они с Хаусом должны разыграть перед служащими управления счастливую семейную пару. Но сначала придётся получше узнать друг друга.
В больнице, тем временем, по случайному совпадению находится один из известных экспертов по браку, переженивший немало пар. Он поступил после обморока на церемонии и испытывает проблемы со зрением. Его печерь тоже не в порядке, к тому же в организме низкий уровень тестостерона. Но болезнь делает из него лучшего специалиста в своей области.
`.trim();

  it("produces many granular changes instead of one huge replacement", () => {
    const { changes } = computeTextChanges(textVariant1, textVariant2);
    // We expect at least 8-10 word/phrase level changes for these two similar paragraphs
    expect(changes.length).toBeGreaterThan(8);
    // Sanity: there should be both additions and removals
    const hasAdd = changes.some((c) => c.added.length > 0);
    const hasRemove = changes.some((c) => c.removed.length > 0);
    expect(hasAdd).toBe(true);
    expect(hasRemove).toBe(true);
  });
});
