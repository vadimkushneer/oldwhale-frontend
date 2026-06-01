import { describe, expect, it, vi } from "vitest";
import { createBlockKeyHandler, type BlockKeyDeps } from "./onKey";

const DEFS = [
  { type: "scene", next: "action" },
  { type: "action", next: "action", hotkey: "1" },
  { type: "char", next: "dialogue" },
  { type: "dialogue", next: "action" },
  { type: "line", next: "line" },
  { type: "act" },
  { type: "spacer" },
];

function makeDeps(over: Partial<BlockKeyDeps> = {}): BlockKeyDeps {
  return {
    defs: DEFS,
    blocks: [],
    blocksRef: { current: [] },
    blockRefs: { current: {} },
    mode: "play",
    uid: (() => { let n = 0; return () => "n" + (++n); })(),
    updBlock: vi.fn(),
    updBlockName: vi.fn(),
    applyBlocks: vi.fn(),
    setFoc: vi.fn(),
    addAfter: vi.fn(),
    chType: vi.fn(),
    delBlock: vi.fn(),
    autoH: vi.fn(),
    filmEditStateRef: { current: null },
    scrollRef: { current: null },
    restoreFilmTextareaFocus: vi.fn(),
    changeFilmBlockTypeFromActiveLine: vi.fn(() => false),
    ...over,
  };
}

const fakeEl = (selStart: number, selEnd = selStart, value = "") =>
  ({ selectionStart: selStart, selectionEnd: selEnd, value, dataset: {}, parentElement: null });
const ev = (key: string, over: Record<string, unknown> = {}) =>
  ({ key, preventDefault: vi.fn(), altKey: false, metaKey: false, ctrlKey: false, shiftKey: false, target: null, ...over });

describe("createBlockKeyHandler", () => {
  it("Alt+- inserts an em-dash at the caret", () => {
    const deps = makeDeps();
    const block = { id: 1, type: "action", text: "ab" };
    deps.blockRefs.current[1] = fakeEl(1, 1, "ab");
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("-", { altKey: true }), block);
    expect(deps.updBlock).toHaveBeenCalledWith(1, "a—b");
  });

  it("Enter at end of a line adds a new line block", () => {
    const deps = makeDeps();
    const block = { id: 2, type: "line", text: "hi" };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("Enter", { target: fakeEl(2, 2, "hi") }), block);
    expect(deps.addAfter).toHaveBeenCalledWith(2, "line");
  });

  it("Enter mid-text on a splittable block splits it", () => {
    const deps = makeDeps({ mode: "film", blocksRef: { current: [{ id: 3, type: "action", text: "abcd" }] } });
    const block = { id: 3, type: "action", text: "abcd" };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("Enter", { target: fakeEl(2, 2, "abcd") }), block);
    expect(deps.updBlock).toHaveBeenCalledWith(3, "ab");
    expect(deps.applyBlocks).toHaveBeenCalledTimes(1);
    expect(deps.setFoc).toHaveBeenCalledTimes(1);
  });

  it("Enter on scene/act/spacer creates the def's next type", () => {
    const deps = makeDeps();
    const block = { id: 4, type: "scene", text: "INT." };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("Enter", { target: fakeEl(4, 4, "INT.") }), block);
    expect(deps.addAfter).toHaveBeenCalledWith(4, "action");
  });

  it("Tab cycles block type (and prevents default)", () => {
    const deps = makeDeps();
    const block = { id: 5, type: "spacer", text: "" };
    const e = ev("Tab", { target: fakeEl(0, 0) });
    createBlockKeyHandler(deps)(e, block);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("Backspace at start of a blank film block deletes it", () => {
    const deps = makeDeps({
      mode: "film",
      blocksRef: { current: [{ id: 10, type: "action", text: "prev" }, { id: 11, type: "action", text: "" }] },
    });
    const block = { id: 11, type: "action", text: "" };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("Backspace", { target: fakeEl(0, 0, "") }), block);
    expect(deps.delBlock).toHaveBeenCalledWith(11);
  });

  it("Backspace at start of a play line trims the speaker name", () => {
    const deps = makeDeps({
      mode: "play",
      blocksRef: { current: [{ id: 20, type: "scene", text: "" }, { id: 21, type: "line", text: "x", name: "ANNA" }] },
    });
    const block = { id: 21, type: "line", text: "x", name: "ANNA" };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("Backspace", { target: fakeEl(0, 0, "x") }), block);
    expect(deps.updBlockName).toHaveBeenCalledWith(21, "ANN");
  });

  it("Cmd+digit changes block type by hotkey", () => {
    const deps = makeDeps({ mode: "play" });
    const block = { id: 30, type: "line", text: "hello" };
    const onKey = createBlockKeyHandler(deps);
    onKey(ev("1", { metaKey: true }), block);
    expect(deps.chType).toHaveBeenCalledWith(30, "action");
  });

  it("Backspace at start of an empty play name deletes the line", () => {
    const deps = makeDeps({
      mode: "play",
      blocksRef: { current: [{ id: 40, type: "scene", text: "s" }, { id: 41, type: "line", text: "", name: "" }] },
    });
    const block = { id: 41, type: "line", text: "", name: "" };
    createBlockKeyHandler(deps)(ev("Backspace", { target: fakeEl(0, 0, "") }), block, { fromName: true });
    expect(deps.delBlock).toHaveBeenCalledWith(41);
  });

  it("Backspace at start of a non-empty play name merges the line into the previous block", () => {
    const deps = makeDeps({
      mode: "play",
      blocksRef: { current: [{ id: 50, type: "line", text: "prev", name: "A" }, { id: 51, type: "line", text: "hi", name: "B" }] },
    });
    const block = { id: 51, type: "line", text: "hi", name: "B" };
    createBlockKeyHandler(deps)(ev("Backspace", { target: fakeEl(0, 0, "hi") }), block, { fromName: true });
    expect(deps.applyBlocks).toHaveBeenCalledTimes(1);
    expect(deps.delBlock).not.toHaveBeenCalled();
  });

});
