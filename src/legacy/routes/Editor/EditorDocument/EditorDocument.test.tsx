import { createRef } from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BLOCK_DEFS } from "../../../domain/blocks";
import { BG, SH_IN, SH_SM, SURF, T1, T2, T3 } from "../../../ui/tokens";
import { EditorDocument } from "./EditorDocument";

function makeHeaderItems() {
  return [{ key: "title", label: "Заголовок", text: "Demo title", align: "left", font: "Times New Roman", size: 14 }];
}

function makeBaseProps(overrides: Record<string, any> = {}) {
  const scrollRef = createRef<HTMLDivElement>();
  const noteEditorRef = createRef<HTMLDivElement>();
  const nextUid = (() => {
    let value = 1000;
    return () => {
      value += 1;
      return `uid-${value}`;
    };
  })();

  const base = {
    mode: "film",
    zoom: 100,
    sheetOn: true,
    docFont: "Times New Roman",
    spellOn: false,
    projectId: "proj-1",
    scrollRef,
    onScroll: vi.fn(),
    theme: {
      BG,
      SURF,
      T1,
      T2,
      T3,
      mc: "#7c6af7",
      SH_SM,
      SH_IN,
    },
    note: {
      noteEditorRef,
      noteTextRef: { current: "" },
      noteSelRangeRef: { current: null },
      setNoteText: vi.fn(),
      markDirty: vi.fn(),
      scheduleNoteHistorySnapshot: vi.fn(),
      noteColorOpen: false,
      setNoteColorOpen: vi.fn(),
      noteAlignOpen: false,
      setNoteAlignOpen: vi.fn(),
      noteAlign: "left",
      setNoteAlign: vi.fn(),
      noteFontSize: 14,
      setNoteFontSize: vi.fn(),
    },
    headers: {
      playHeader: makeHeaderItems(),
      setPlayHeader: vi.fn(),
      playHeaderFoc: null,
      setPlayHeaderFoc: vi.fn(),
      mediaHeader: makeHeaderItems(),
      setMediaHeader: vi.fn(),
      mediaHeaderFoc: null,
      setMediaHeaderFoc: vi.fn(),
      contentHeader: makeHeaderItems(),
      setContentHeader: vi.fn(),
      contentHeaderFoc: null,
      setContentHeaderFoc: vi.fn(),
      contentLogo: null,
      setContentLogo: vi.fn(),
    },
    blocksState: {
      blocks: [
        { id: "scene-1", type: "scene", text: "INT. ROOM. DAY." },
        { id: "action-1", type: "action", text: "A short action line." },
      ],
      setBlocks: vi.fn(),
      defs: BLOCK_DEFS.film,
      scenes: [{ id: "scene-1", kind: "scene", num: 1, text: "INT. ROOM. DAY.", index: 0 }],
      selectedScenes: new Set<string>(),
      setSelectedScenes: vi.fn(),
      focId: null,
      setFocId: vi.fn(),
      blockRefs: { current: {} },
      sceneRefs: { current: {} },
      filmEditStateRef: { current: null },
      typeMenu: null,
      setTypeMenu: vi.fn(),
    },
    actions: {
      getTooltipAnchorProps: () => ({}),
      renderSearchOverlay: () => null,
      renderMarkerOverlay: () => null,
      handleMarkerContextMenu: vi.fn(),
      onKey: vi.fn(),
      autoH: vi.fn(),
      updBlock: vi.fn(),
      updBlockName: vi.fn(),
      chType: vi.fn(),
      addAfter: vi.fn(),
      dupScene: vi.fn(),
      delScene: vi.fn(),
      delBlock: vi.fn(),
      toggleActSelect: vi.fn(),
      changeFilmBlockTypeFromActiveLine: vi.fn().mockReturnValue(false),
      sceneNum: vi.fn().mockReturnValue(1),
      uid: nextUid,
    },
  };

  return {
    ...base,
    ...overrides,
    theme: { ...base.theme, ...(overrides.theme || {}) },
    note: { ...base.note, ...(overrides.note || {}) },
    headers: { ...base.headers, ...(overrides.headers || {}) },
    blocksState: { ...base.blocksState, ...(overrides.blocksState || {}) },
    actions: { ...base.actions, ...(overrides.actions || {}) },
  };
}

describe("EditorDocument", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the note surface in note mode", () => {
    const props = makeBaseProps({ mode: "note" });
    const { container } = render(<EditorDocument {...props} />);
    expect(container.querySelector(".ow-note-editor")).toBeTruthy();
    expect(screen.getByTitle("Жирный")).toBeInTheDocument();
  });

  it("renders film, play, short, and media document branches", () => {
    const variants = [
      {
        mode: "film",
        blocks: [
          { id: "scene-1", type: "scene", text: "INT. ROOM. DAY." },
          { id: "action-1", type: "action", text: "Action." },
        ],
        defs: BLOCK_DEFS.film,
        scenes: [{ id: "scene-1", kind: "scene", num: 1, text: "INT. ROOM. DAY.", index: 0 }],
      },
      {
        mode: "play",
        blocks: [
          { id: "act-1", type: "act", text: "АКТ ПЕРВЫЙ" },
          { id: "scene-1", type: "scene", text: "Сцена 1" },
          { id: "line-1", type: "line", name: "АЛИСА", text: "Привет." },
        ],
        defs: BLOCK_DEFS.play,
        scenes: [
          { id: "act-1", kind: "act", actNum: 1, num: 1, text: "АКТ ПЕРВЫЙ", index: 0 },
          { id: "scene-1", kind: "scene", actNum: 1, num: 1, text: "Сцена 1", index: 1 },
        ],
      },
      {
        mode: "short",
        blocks: [
          { id: "scene-1", type: "scene", text: "ЛОКАЦИЯ. ДЕНЬ." },
          { id: "hook-1", type: "hook", text: "Hook text" },
        ],
        defs: BLOCK_DEFS.short,
        scenes: [{ id: "scene-1", kind: "scene", num: 1, text: "ЛОКАЦИЯ. ДЕНЬ.", index: 0 }],
      },
      {
        mode: "media",
        blocks: [
          { id: "segment-1", type: "segment", text: "ОТКРЫТИЕ | 0:00" },
          { id: "anchor-1", type: "anchor", text: "Anchor text" },
        ],
        defs: BLOCK_DEFS.media,
        scenes: [{ id: "segment-1", kind: "scene", num: 1, text: "ОТКРЫТИЕ | 0:00", index: 0 }],
      },
    ];

    for (const variant of variants) {
      const props = makeBaseProps({
        mode: variant.mode,
        blocksState: {
          blocks: variant.blocks,
          defs: variant.defs,
          scenes: variant.scenes,
        },
      });

      const { container, unmount } = render(<EditorDocument {...props} />);
      expect(container.querySelector(".editor-document__page")).toBeTruthy();
      unmount();
    }
  });

  it("pans the scroll surface with the middle mouse button", () => {
    const props = makeBaseProps();
    const { container } = render(<EditorDocument {...props} />);
    const scrollEl = container.querySelector(".ow-editor-scroll") as HTMLDivElement;
    scrollEl.scrollLeft = 100;
    scrollEl.scrollTop = 120;

    fireEvent.mouseDown(scrollEl, { button: 1, clientX: 40, clientY: 50 });
    fireEvent(window, new MouseEvent("mousemove", { bubbles: true, clientX: 20, clientY: 30 }));
    expect(scrollEl.scrollLeft).toBe(120);
    expect(scrollEl.scrollTop).toBe(140);

    fireEvent(window, new MouseEvent("mouseup", { bubbles: true }));
    fireEvent(window, new MouseEvent("mousemove", { bubbles: true, clientX: 0, clientY: 0 }));
    expect(scrollEl.scrollLeft).toBe(120);
    expect(scrollEl.scrollTop).toBe(140);
  });

  it("runs note formatting commands and records note history", () => {
    const props = makeBaseProps({ mode: "note" });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });

    const selection = {
      rangeCount: 1,
      isCollapsed: false,
      getRangeAt: vi.fn(() => document.createRange()),
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
    };
    vi.spyOn(window, "getSelection").mockReturnValue(selection as unknown as Selection);

    render(<EditorDocument {...props} />);
    props.note.noteEditorRef.current!.innerHTML = "Draft text";

    fireEvent.mouseDown(screen.getByTitle("Жирный"));

    expect(execCommand).toHaveBeenCalledWith("bold", false, null);
    expect(props.note.setNoteText).toHaveBeenCalledWith("Draft text");
    expect(props.note.markDirty).toHaveBeenCalled();
    expect(props.note.scheduleNoteHistorySnapshot).toHaveBeenCalledWith("Draft text");
  });

  it("creates additional pages for tall film content", () => {
    const originalTextareaHeight = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "scrollHeight");
    const originalDivHeight = Object.getOwnPropertyDescriptor(HTMLDivElement.prototype, "scrollHeight");

    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        const value = "value" in this ? String((this as HTMLTextAreaElement).value || "") : "";
        return Math.max(40, Math.ceil(value.length / 18) * 28);
      },
    });

    Object.defineProperty(HTMLDivElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return 40;
      },
    });

    const props = makeBaseProps({
      blocksState: {
        blocks: [
          { id: "scene-1", type: "scene", text: "INT. ROOM. DAY." },
          { id: "action-1", type: "action", text: "Long action ".repeat(350) },
        ],
      },
    });

    const { container } = render(<EditorDocument {...props} />);
    expect(container.querySelectorAll(".editor-document__page").length).toBeGreaterThan(1);

    if (originalTextareaHeight) Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", originalTextareaHeight);
    if (originalDivHeight) Object.defineProperty(HTMLDivElement.prototype, "scrollHeight", originalDivHeight);
  });

  it("fires shared gutter actions for scene heads and regular blocks", () => {
    const setBlocks = vi.fn();
    const props = makeBaseProps({
      blocksState: {
        setBlocks,
      },
    });

    const { container } = render(<EditorDocument {...props} />);
    const duplicateButtons = container.querySelectorAll(
      ".editor-action-buttons--gutter .editor-action-buttons__button--duplicate",
    );
    const deleteButtons = container.querySelectorAll(
      ".editor-action-buttons--gutter .editor-action-buttons__button--delete",
    );

    fireEvent.mouseDown(duplicateButtons[0] as HTMLButtonElement);
    fireEvent.mouseDown(deleteButtons[0] as HTMLButtonElement);
    expect(props.actions.dupScene).toHaveBeenCalledWith("scene-1");
    expect(props.actions.delScene).toHaveBeenCalledWith("scene-1");

    fireEvent.mouseDown(duplicateButtons[1] as HTMLButtonElement);
    expect(setBlocks).toHaveBeenCalledTimes(1);
    expect(props.note.markDirty).toHaveBeenCalledTimes(1);
    const updater = setBlocks.mock.calls[0][0];
    const next = updater(props.blocksState.blocks);
    expect(next).toHaveLength(3);
    expect(next[2]).toMatchObject({ type: "action", text: "A short action line." });
    expect(next[2].id).not.toBe("action-1");

    fireEvent.mouseDown(deleteButtons[1] as HTMLButtonElement);
    expect(props.actions.delBlock).toHaveBeenCalledWith("action-1");
  });

  it("splits multiline film paste into multiple blocks", () => {
    const setBlocks = vi.fn();
    const props = makeBaseProps({
      blocksState: {
        blocks: [
          { id: "scene-1", type: "scene", text: "INT. ROOM. DAY." },
          { id: "action-1", type: "action", text: "Original action" },
        ],
        setBlocks,
      },
    });

    const { container } = render(<EditorDocument {...props} />);
    const textarea = container.querySelector('textarea[placeholder="Описание действия..."]') as HTMLTextAreaElement;
    textarea.selectionStart = 0;
    textarea.selectionEnd = textarea.value.length;

    fireEvent.paste(textarea, {
      clipboardData: {
        getData: () => "ИНТ. КОМНАТА. НОЧЬ.\nМАРИНА\nПривет",
      },
    });

    expect(setBlocks).toHaveBeenCalledTimes(1);
    expect(props.note.markDirty).toHaveBeenCalled();

    const updater = setBlocks.mock.calls[0][0];
    const next = updater(props.blocksState.blocks);
    expect(next).toHaveLength(4);
    expect(next[1]).toMatchObject({ type: "scene" });
    expect(next[2]).toMatchObject({ type: "char" });
    expect(next[3]).toMatchObject({ type: "action" });
  });
});
