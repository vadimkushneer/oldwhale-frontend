import { describe, expect, it } from "vitest";
import { formatSceneLabel, getSceneBlockRange, moveSceneRange, sceneBoundaryTypes } from "./scenes";
import type { EditorBlock } from "./blocks";

// film: scene 1 owns its action; scene 2 owns its action.
const film: EditorBlock[] = [
  { id: 1, type: "scene", text: "S1" },
  { id: 2, type: "action", text: "a1" },
  { id: 3, type: "scene", text: "S2" },
  { id: 4, type: "action", text: "a2" },
];

describe("sceneBoundaryTypes", () => {
  it("film/play boundaries are just scene/act", () => {
    expect(sceneBoundaryTypes("film")).toEqual(["scene", "act"]);
    expect(sceneBoundaryTypes("play")).toEqual(["scene", "act"]);
  });
  it("other modes treat content types as boundaries too", () => {
    expect(sceneBoundaryTypes("media")).toContain("action");
    expect(sceneBoundaryTypes("short")).toContain("hook");
  });
});

describe("getSceneBlockRange", () => {
  it("spans from the scene to just before the next boundary", () => {
    expect(getSceneBlockRange(film, 1, "film")).toEqual({ start: 0, end: 2 });
    expect(getSceneBlockRange(film, 3, "film")).toEqual({ start: 2, end: 4 });
  });
  it("returns null for an unknown id", () => {
    expect(getSceneBlockRange(film, 99, "film")).toBeNull();
  });
});

describe("moveSceneRange", () => {
  it("moves a scene (with its content) before the target", () => {
    const out = moveSceneRange(film, 3, 1, { mode: "film", insertAfter: false })!;
    expect(out.map((b) => b.id)).toEqual([3, 4, 1, 2]);
  });

  it("moves a scene after the target when insertAfter is set", () => {
    const out = moveSceneRange(film, 1, 3, { mode: "film", insertAfter: true })!;
    expect(out.map((b) => b.id)).toEqual([3, 1, 2, 4]);
  });

  it("does not mutate the input array", () => {
    moveSceneRange(film, 3, 1, { mode: "film", insertAfter: false });
    expect(film.map((b) => b.id)).toEqual([1, 2, 3, 4]);
  });

  it("returns null for same id, unknown source, or target inside the moved range", () => {
    expect(moveSceneRange(film, 1, 1, { mode: "film", insertAfter: false })).toBeNull();
    expect(moveSceneRange(film, 99, 1, { mode: "film", insertAfter: false })).toBeNull();
    // target id 2 is inside scene 1's range when moving scene 1
    expect(moveSceneRange(film, 1, 2, { mode: "film", insertAfter: false })).toBeNull();
  });
});

describe("formatSceneLabel", () => {
  it("renders act.sub for structured modes with an act number", () => {
    expect(formatSceneLabel("play", { actNum: 2, subNum: 3, num: 7 })).toBe("2.3");
    expect(formatSceneLabel("short", { actNum: 1, subNum: 1, num: 4 })).toBe("1.1");
    expect(formatSceneLabel("media", { actNum: 5, subNum: 2, num: 9 })).toBe("5.2");
  });
  it("falls back to num. when no act number", () => {
    expect(formatSceneLabel("play", { num: 7 })).toBe("7.");
    expect(formatSceneLabel("short", { actNum: 0, num: 3 })).toBe("3.");
  });
  it("always uses num. for film (not a structured mode)", () => {
    expect(formatSceneLabel("film", { actNum: 2, subNum: 3, num: 7 })).toBe("7.");
  });
});
