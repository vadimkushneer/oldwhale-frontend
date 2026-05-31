import { describe, expect, it } from "vitest";
import {
  EDITOR_MODES,
  EDITOR_MODE_IDS,
  getEditorMode,
  isFrozenMode,
  listEditorModes,
} from "./registry";

describe("editor mode registry", () => {
  it("exposes exactly the five editor modes", () => {
    expect([...EDITOR_MODE_IDS].sort()).toEqual(
      ["film", "media", "note", "play", "short"].sort(),
    );
  });

  it("resolves every id to a descriptor whose id matches its key", () => {
    for (const id of EDITOR_MODE_IDS) {
      const mode = getEditorMode(id);
      expect(mode).not.toBeNull();
      expect(mode?.id).toBe(id);
      expect(typeof mode?.label).toBe("string");
    }
  });

  it("returns null for unknown ids (route validation relies on this)", () => {
    expect(getEditorMode("unknown")).toBeNull();
    expect(getEditorMode("")).toBeNull();
    expect(getEditorMode(undefined)).toBeNull();
  });

  it("marks film as frozen and the work-in-progress modes as not frozen", () => {
    expect(isFrozenMode("film")).toBe(true);
    expect(EDITOR_MODES.film.frozen).toBe(true);
    for (const id of ["play", "short", "media", "note"] as const) {
      expect(isFrozenMode(id)).toBe(false);
    }
  });

  it("provides a non-empty block palette for the structured modes", () => {
    for (const id of ["film", "play", "short", "media"] as const) {
      expect(EDITOR_MODES[id].blockDefs.length).toBeGreaterThan(0);
    }
  });

  it("returns a fresh starter document each call (no shared references)", () => {
    const a = EDITOR_MODES.film.initialBlocks();
    const b = EDITOR_MODES.film.initialBlocks();
    expect(a).not.toBe(b);
    if (a.length > 0) {
      expect(a[0]).not.toBe(b[0]);
      a[0].text = "mutated locally";
      expect(b[0].text).not.toBe("mutated locally");
    }
  });

  it("lists modes in stable tab order", () => {
    expect(listEditorModes().map((m) => m.id)).toEqual([...EDITOR_MODE_IDS]);
  });
});
