import { describe, expect, it } from "vitest";
import {
  canSplitInline,
  computeMergeJoiner,
  cycleBlockType,
  findPrecedingCharName,
  insertBlocksAfter,
  mergeAdjacentBlocks,
  nextEnterType,
  splitBlockText,
  type EditorBlock,
} from "./blocks";

describe("splitBlockText", () => {
  it("splits at the cursor and left-trims the moved part", () => {
    expect(splitBlockText("hello world", 5)).toEqual({ before: "hello", after: "world" });
    expect(splitBlockText("abc", 0)).toEqual({ before: "", after: "abc" });
    expect(splitBlockText(undefined, 3)).toEqual({ before: "", after: "" });
  });
});

describe("findPrecedingCharName", () => {
  const blocks: EditorBlock[] = [
    { id: 1, type: "scene", text: "ИНТ." },
    { id: 2, type: "char", text: "АННА" },
    { id: 3, type: "dialogue", text: "Привет" },
  ];
  it("returns the nearest character cue above a block", () => {
    expect(findPrecedingCharName(blocks, 3)).toBe("АННА");
  });
  it("stops at a scene/act boundary", () => {
    const b: EditorBlock[] = [
      { id: 1, type: "char", text: "СТАРОЕ" },
      { id: 2, type: "scene", text: "ИНТ." },
      { id: 3, type: "dialogue", text: "x" },
    ];
    expect(findPrecedingCharName(b, 3)).toBe("");
  });
});

describe("insertBlocksAfter", () => {
  const blocks: EditorBlock[] = [
    { id: 1, type: "action", text: "a" },
    { id: 2, type: "action", text: "b" },
  ];
  it("inserts after the anchor and is non-mutating", () => {
    const out = insertBlocksAfter(blocks, 1, [{ id: 9, type: "char", text: "X" }]);
    expect(out.map((b) => b.id)).toEqual([1, 9, 2]);
    expect(blocks).toHaveLength(2);
  });
  it("returns a copy unchanged for a missing anchor", () => {
    expect(insertBlocksAfter(blocks, 999, [{ id: 9, type: "x" }]).map((b) => b.id)).toEqual([1, 2]);
  });
});

describe("canSplitInline / nextEnterType / cycleBlockType", () => {
  it("canSplitInline blocks scene/act/spacer", () => {
    expect(canSplitInline("action")).toBe(true);
    expect(["scene", "act", "spacer"].every((t) => !canSplitInline(t))).toBe(true);
  });
  it("nextEnterType uses def.next, falling back to the first def", () => {
    const defs = [{ type: "scene" }, { type: "action" }];
    expect(nextEnterType({ type: "char", next: "dialogue" }, defs)).toBe("dialogue");
    expect(nextEnterType({ type: "x" }, defs)).toBe("scene");
  });
  it("cycleBlockType skips protected types and wraps", () => {
    const defs = [{ type: "scene" }, { type: "action" }, { type: "char" }];
    expect(cycleBlockType(defs, "action", ["scene"])).toBe("char");
    expect(cycleBlockType(defs, "char", ["scene"])).toBe("scene");
    expect(cycleBlockType(defs, "scene", ["scene"])).toBeNull();
    expect(cycleBlockType(defs, "unknown")).toBeNull();
  });
});

describe("computeMergeJoiner", () => {
  it("inserts a space only when both sides need it", () => {
    expect(computeMergeJoiner("foo", "bar")).toEqual({ joiner: " ", caretPos: 4 });
    expect(computeMergeJoiner("foo ", "bar")).toEqual({ joiner: "", caretPos: 4 });
    expect(computeMergeJoiner("foo", " bar")).toEqual({ joiner: "", caretPos: 3 });
    expect(computeMergeJoiner("", "bar")).toEqual({ joiner: "", caretPos: 0 });
  });
});

describe("mergeAdjacentBlocks", () => {
  const blocks: EditorBlock[] = [
    { id: 1, type: "action", text: "foo" },
    { id: 2, type: "action", text: "bar" },
    { id: 3, type: "action", text: "baz" },
  ];
  it("merges current onto previous with the joiner and drops current", () => {
    const out = mergeAdjacentBlocks(blocks, 1, 2, " ");
    expect(out.map((b) => b.id)).toEqual([1, 3]);
    expect(out[0].text).toBe("foo bar");
    expect(blocks).toHaveLength(3);
  });
  it("is a no-op when order is wrong or ids missing", () => {
    expect(mergeAdjacentBlocks(blocks, 2, 1, "").map((b) => b.id)).toEqual([1, 2, 3]);
    expect(mergeAdjacentBlocks(blocks, 1, 99, "").map((b) => b.id)).toEqual([1, 2, 3]);
  });
});
