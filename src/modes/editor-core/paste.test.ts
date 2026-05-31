import { describe, expect, it } from "vitest";
import {
  buildFilmPasteReplacement,
  buildLinePasteReplacement,
  detectFilmType,
} from "./paste";
import type { EditorBlock } from "./blocks";

// deterministic id generator for tests
function idGen() {
  let n = 100;
  return () => ++n;
}

describe("detectFilmType", () => {
  it("classifies screenplay lines", () => {
    expect(detectFilmType("ИНТ. КУХНЯ - ДЕНЬ")).toBe("scene");
    expect(detectFilmType("12. EXT. STREET")).toBe("scene");
    expect(detectFilmType("(шёпотом)")).toBe("paren");
    expect(detectFilmType("CUT TO:")).toBe("trans");
    expect(detectFilmType("АННА")).toBe("char");
    expect(detectFilmType("Она входит в комнату.")).toBe("action");
    expect(detectFilmType("   ")).toBe("spacer");
  });
});

describe("buildLinePasteReplacement (play/short/media)", () => {
  const block: EditorBlock = { id: 1, type: "line", text: "" };

  it("splits lines into base-type blocks, blank lines become spacers", () => {
    const r = buildLinePasteReplacement({
      block,
      lines: ["one", "", "two"],
      before: "",
      after: "",
      mode: "play",
      makeId: idGen(),
    });
    expect(r.replacement.map((b) => [b.type, b.text])).toEqual([
      ["line", "one"],
      ["spacer", ""],
      ["line", "two"],
    ]);
    expect(r.lastText).toBe("two");
  });

  it("keeps before/after text on the first/last blocks", () => {
    const r = buildLinePasteReplacement({
      block: { id: 1, type: "line", text: "XY" },
      lines: ["a", "b"],
      before: "X",
      after: "Y",
      mode: "play",
      makeId: idGen(),
    });
    expect(r.replacement[0].text).toBe("Xa");
    expect(r.replacement[r.replacement.length - 1].text).toBe("bY");
  });

  it("derives base type from mode when pasting into a spacer", () => {
    const r = buildLinePasteReplacement({
      block: { id: 1, type: "spacer", text: "" },
      lines: ["x", "y"],
      before: "",
      after: "",
      mode: "short",
      makeId: idGen(),
    });
    expect(r.replacement[0].type).toBe("action");
  });
});

describe("buildFilmPasteReplacement", () => {
  it("classifies each line and upper-cases scene/char", () => {
    const r = buildFilmPasteReplacement({
      block: { id: 1, type: "action", text: "" },
      lines: ["инт. кухня - день", "АННА", "она садится."],
      before: "",
      after: "",
      makeId: idGen(),
    });
    expect(r.replacement.map((b) => b.type)).toEqual(["scene", "char", "action"]);
    expect(r.replacement[0].text).toBe("ИНТ. КУХНЯ - ДЕНЬ");
    expect(r.replacement[1].text).toBe("АННА");
    expect(r.replacement[2].text).toBe("она садится.");
  });

  it("keeps the current block type when pasting after existing text", () => {
    const r = buildFilmPasteReplacement({
      block: { id: 1, type: "action", text: "Привет" },
      lines: ["мир", "ещё"],
      before: "Привет",
      after: "",
      makeId: idGen(),
    });
    expect(r.replacement[0].type).toBe("action");
    expect(r.replacement[0].text).toBe("Приветмир");
  });
});
