import { describe, expect, it } from "vitest";
import {
  findLatestEntryForMode,
  removeProjectEntry,
  upsertProjectEntry,
  type ProjectIndexEntry,
} from "./projectIndex";

const idx: ProjectIndexEntry[] = [
  { id: "a", mode: "film", updatedAt: 3 },
  { id: "b", mode: "play", updatedAt: 2 },
  { id: "c", updatedAt: 1 }, // legacy: no mode
];

describe("upsertProjectEntry", () => {
  it("moves an existing entry to the front (de-duplicated)", () => {
    const out = upsertProjectEntry(idx, { id: "b", mode: "play", updatedAt: 9 });
    expect(out.map((e) => e.id)).toEqual(["b", "a", "c"]);
    expect(out[0].updatedAt).toBe(9);
  });
  it("prepends a brand-new entry", () => {
    const out = upsertProjectEntry(idx, { id: "z", mode: "film", updatedAt: 9 });
    expect(out.map((e) => e.id)).toEqual(["z", "a", "b", "c"]);
  });
  it("does not mutate the input", () => {
    upsertProjectEntry(idx, { id: "a", mode: "film" });
    expect(idx.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });
});

describe("removeProjectEntry", () => {
  it("drops the matching id and leaves the rest", () => {
    expect(removeProjectEntry(idx, "b").map((e) => e.id)).toEqual(["a", "c"]);
  });
  it("is a no-op for an unknown id", () => {
    expect(removeProjectEntry(idx, "nope").map((e) => e.id)).toEqual(["a", "b", "c"]);
  });
});

describe("findLatestEntryForMode", () => {
  it("returns the first entry matching the mode", () => {
    expect(findLatestEntryForMode(idx, "play")?.id).toBe("b");
  });
  it("treats a missing mode as film", () => {
    const legacy: ProjectIndexEntry[] = [{ id: "c" }];
    expect(findLatestEntryForMode(legacy, "film")?.id).toBe("c");
  });
  it("returns null when no entry matches", () => {
    expect(findLatestEntryForMode(idx, "media")).toBeNull();
  });
});
