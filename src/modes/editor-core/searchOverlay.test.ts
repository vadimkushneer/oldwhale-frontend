import { describe, expect, it } from "vitest";
import { buildSearchOverlayHtml, computeOverlayRanges } from "./searchOverlay";
import type { SearchMatch } from "./search";

const blockMatches: SearchMatch[] = [
  { key: "block_1_0_0", scope: "block", blockId: 1, start: 0, end: 3 },
  { key: "block_1_6_0", scope: "block", blockId: 1, start: 6, end: 9 },
  { key: "block_2_0_0", scope: "block", blockId: 2, start: 0, end: 3 },
];

describe("computeOverlayRanges", () => {
  it("keeps only matches for the configured block and marks the active one", () => {
    const ranges = computeOverlayRanges(blockMatches, { scope: "block", blockId: 1, text: "abcdefghi" }, "block_1_6_0");
    expect(ranges).toEqual([
      { start: 0, end: 3, active: false },
      { start: 6, end: 9, active: true },
    ]);
  });

  it("offsets by sliceStart and clamps to the slice text (paginated film)", () => {
    // a match at abs 6..9, slice starts at 6 -> local 0..3
    const ranges = computeOverlayRanges(
      [{ key: "k", scope: "block", blockId: 1, start: 6, end: 9 }],
      { scope: "block", blockId: 1, text: "xyz", sliceStart: 6 },
      null,
    );
    expect(ranges).toEqual([{ start: 0, end: 3, active: false }]);
  });

  it("filters header matches by scope + key", () => {
    const m: SearchMatch[] = [
      { key: "h", scope: "header", headerScope: "play", headerKey: "title", headerIndex: 0, start: 0, end: 2 },
    ];
    expect(computeOverlayRanges(m, { scope: "header", headerScope: "play", headerKey: "title", text: "Весна" }, null)).toHaveLength(1);
    expect(computeOverlayRanges(m, { scope: "header", headerScope: "play", headerKey: "genre", text: "Весна" }, null)).toHaveLength(0);
  });

  it("returns [] when there is no text", () => {
    expect(computeOverlayRanges(blockMatches, { scope: "block", blockId: 1, text: "" }, null)).toEqual([]);
  });
});

describe("buildSearchOverlayHtml", () => {
  it("wraps hit ranges in <mark> and escapes the rest", () => {
    const html = buildSearchOverlayHtml("a<b>c", [{ start: 1, end: 4, active: false }]);
    expect(html).toContain("<mark");
    expect(html).toContain("&lt;b&gt;");
    expect(html.startsWith("a")).toBe(true);
  });

  it("uses a stronger background for the active hit", () => {
    const active = buildSearchOverlayHtml("abc", [{ start: 0, end: 3, active: true }]);
    const inactive = buildSearchOverlayHtml("abc", [{ start: 0, end: 3, active: false }]);
    expect(active).toContain("0.44");
    expect(inactive).toContain("0.24");
  });

  it("returns empty string with no ranges", () => {
    expect(buildSearchOverlayHtml("abc", [])).toBe("");
  });
});
