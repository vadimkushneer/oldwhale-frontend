import { describe, expect, it } from "vitest";
import {
  collectSearchOccurrences,
  computeSearchMatches,
  getSearchNeedleVariants,
  normalizeSearchNeedle,
} from "./search";

describe("normalizeSearchNeedle", () => {
  it("collapses whitespace, trims, lower-cases", () => {
    expect(normalizeSearchNeedle("  Hello   World ")).toBe("hello world");
    expect(normalizeSearchNeedle(null)).toBe("");
  });
});

describe("getSearchNeedleVariants", () => {
  it("adds a hash-stripped variant for #tag queries", () => {
    expect(getSearchNeedleVariants("#tag")).toEqual(["#tag", "tag"]);
    expect(getSearchNeedleVariants("plain")).toEqual(["plain"]);
    expect(getSearchNeedleVariants("  ")).toEqual([]);
  });
});

describe("collectSearchOccurrences", () => {
  it("finds all non-overlapping occurrences", () => {
    expect(collectSearchOccurrences("ababab", "ab")).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
      { start: 4, end: 6 },
    ]);
  });

  it("is case-insensitive and returns empty for no match / empty needle", () => {
    expect(collectSearchOccurrences("Hello", "hello")).toEqual([{ start: 0, end: 5 }]);
    expect(collectSearchOccurrences("Hello", "zzz")).toEqual([]);
    expect(collectSearchOccurrences("Hello", "  ")).toEqual([]);
  });
});

describe("computeSearchMatches", () => {
  it("returns [] for an empty needle", () => {
    expect(computeSearchMatches("  ", { mode: "film", blocks: [{ id: 1, text: "x" }] })).toEqual([]);
  });

  it("note mode: matches against notePlainText with note scope", () => {
    const m = computeSearchMatches("кофе", { mode: "note", notePlainText: "люблю кофе и кофе" });
    expect(m).toHaveLength(2);
    expect(m.every((x) => x.scope === "note")).toBe(true);
    expect(m[0]).toMatchObject({ scope: "note", start: 6 });
  });

  it("block mode: matches across blocks with block scope + blockId", () => {
    const m = computeSearchMatches("инт", {
      mode: "film",
      blocks: [
        { id: 7, text: "ИНТ. ДОМ" },
        { id: 8, text: "нет совпадения" },
      ],
    });
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ scope: "block", blockId: 7, start: 0, end: 3 });
  });

  it("includes header matches with header scope/key/index", () => {
    const m = computeSearchMatches("весна", {
      mode: "play",
      blocks: [],
      headerItems: [{ key: "title", text: "Весна" }],
      headerScope: "play",
    });
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({
      scope: "header",
      headerScope: "play",
      headerKey: "title",
      headerIndex: 0,
    });
  });

  it("does not search headers/blocks in note mode", () => {
    const m = computeSearchMatches("x", {
      mode: "note",
      notePlainText: "",
      blocks: [{ id: 1, text: "x" }],
      headerItems: [{ key: "t", text: "x" }],
    });
    expect(m).toEqual([]);
  });
});
