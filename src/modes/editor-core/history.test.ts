import { describe, expect, it } from "vitest";
import { ensureHistory, pushSnapshot, redoSnapshot, undoSnapshot } from "./history";

describe("ensureHistory", () => {
  it("initializes an empty history from a snapshot", () => {
    expect(ensureHistory(undefined, "A")).toEqual({ snapshots: ["A"], index: 0 });
    expect(ensureHistory({ snapshots: [] }, "A")).toEqual({ snapshots: ["A"], index: 0 });
  });
  it("clamps a stale/missing index to the last snapshot", () => {
    expect(ensureHistory({ snapshots: ["A", "B"], index: 99 }, "x").index).toBe(1);
    expect(ensureHistory({ snapshots: ["A", "B"] }, "x").index).toBe(1);
  });
  it("leaves a valid index untouched", () => {
    expect(ensureHistory({ snapshots: ["A", "B"], index: 0 }, "x").index).toBe(0);
  });
});

describe("pushSnapshot", () => {
  it("appends and advances the index", () => {
    expect(pushSnapshot({ snapshots: ["A"], index: 0 }, "B", 100)).toEqual({
      snapshots: ["A", "B"],
      index: 1,
    });
  });
  it("no-ops when the snapshot equals the current one", () => {
    expect(pushSnapshot({ snapshots: ["A", "B"], index: 1 }, "B", 100)).toEqual({
      snapshots: ["A", "B"],
      index: 1,
    });
  });
  it("drops the redo tail when pushing after an undo", () => {
    // at index 0 of [A,B,C], push D -> [A,D]
    expect(pushSnapshot({ snapshots: ["A", "B", "C"], index: 0 }, "D", 100)).toEqual({
      snapshots: ["A", "D"],
      index: 1,
    });
  });
  it("caps the stack at the limit, dropping the oldest", () => {
    const out = pushSnapshot({ snapshots: ["A", "B", "C"], index: 2 }, "D", 3);
    expect(out).toEqual({ snapshots: ["B", "C", "D"], index: 2 });
  });
});

describe("undoSnapshot / redoSnapshot", () => {
  it("undo steps back and returns the previous value", () => {
    expect(undoSnapshot({ snapshots: ["A", "B"], index: 1 })).toEqual({
      state: { snapshots: ["A", "B"], index: 0 },
      value: "A",
    });
  });
  it("undo returns null at the start", () => {
    expect(undoSnapshot({ snapshots: ["A"], index: 0 })).toBeNull();
  });
  it("redo steps forward and returns the next value", () => {
    expect(redoSnapshot({ snapshots: ["A", "B"], index: 0 })).toEqual({
      state: { snapshots: ["A", "B"], index: 1 },
      value: "B",
    });
  });
  it("redo returns null at the end", () => {
    expect(redoSnapshot({ snapshots: ["A", "B"], index: 1 })).toBeNull();
  });
});
