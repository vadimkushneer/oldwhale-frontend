import { describe, expect, it } from "vitest";
import { buildProjectData, readProjectDoc } from "./serialize";
import type { ProjectFields } from "./serialize";
import { isFilmDoc, isNoteDoc, isPlayDoc } from "./ProjectDoc";
import type { ProjectMeta } from "./ProjectDoc";

const meta: ProjectMeta = {
  id: "proj_1",
  name: "Test",
  mode: "film",
  updatedAt: 123,
  blocksCount: 1,
};

const fields: ProjectFields = {
  blocks: [{ type: "scene", text: "ИНТ." }],
  playHeader: [{ type: "title", text: "H" }],
  mediaHeader: [],
  contentHeader: [],
  contentLogo: "logo",
  docFont: "Courier",
  sceneAlign: "left",
  noteText: "note",
  sceneCardMeta: { a: 1 },
  markerHighlights: ["x"],
  layout: { leftW: 200, aiOpen: true },
  titlePage: { title: "T" },
};

describe("buildProjectData (on-disk schema)", () => {
  it("emits exactly the historical key set", () => {
    const data = buildProjectData(meta, fields);
    expect(Object.keys(data).sort()).toEqual(
      [
        "id",
        "name",
        "mode",
        "updatedAt",
        "blocksCount",
        "blocks",
        "playHeader",
        "mediaHeader",
        "contentHeader",
        "contentLogo",
        "docFont",
        "sceneAlign",
        "noteText",
        "sceneCardMeta",
        "markerHighlights",
        "layout",
        "titlePage",
      ].sort(),
    );
  });

  it("preserves meta and field values verbatim", () => {
    const data = buildProjectData(meta, fields);
    expect(data.id).toBe("proj_1");
    expect(data.titlePage).toEqual({ title: "T" });
    expect(data.layout).toEqual({ leftW: 200, aiOpen: true });
    expect(data.blocks).toBe(fields.blocks);
  });

  it("matches a hand-written literal for the same inputs (drop-in equivalence)", () => {
    const data = buildProjectData(meta, fields);
    const literal = {
      ...meta,
      blocks: fields.blocks,
      playHeader: fields.playHeader,
      mediaHeader: fields.mediaHeader,
      contentHeader: fields.contentHeader,
      contentLogo: fields.contentLogo,
      docFont: fields.docFont,
      sceneAlign: fields.sceneAlign,
      noteText: fields.noteText,
      sceneCardMeta: fields.sceneCardMeta,
      markerHighlights: fields.markerHighlights,
      layout: fields.layout,
      titlePage: fields.titlePage,
    };
    expect(JSON.stringify(data)).toBe(JSON.stringify(literal));
  });
});

describe("readProjectDoc (flat blob -> per-mode typed doc)", () => {
  it("narrows a film blob to FilmDoc with a titlePage and no foreign fields", () => {
    const doc = readProjectDoc(buildProjectData(meta, fields));
    expect(isFilmDoc(doc)).toBe(true);
    if (isFilmDoc(doc)) {
      expect(doc.titlePage).toEqual({ title: "T" });
      // @ts-expect-error — playHeader is not part of FilmDoc
      expect(doc.playHeader).toBeUndefined();
    }
  });

  it("narrows a play blob to PlayDoc with playHeader", () => {
    const doc = readProjectDoc({ id: "p", name: "n", mode: "play", playHeader: [{ type: "t" }], blocks: [] });
    expect(isPlayDoc(doc)).toBe(true);
    if (isPlayDoc(doc)) expect(doc.playHeader).toHaveLength(1);
  });

  it("narrows a note blob to NoteDoc with noteText", () => {
    const doc = readProjectDoc({ mode: "note", noteText: "hello", blocks: [] });
    expect(isNoteDoc(doc)).toBe(true);
    if (isNoteDoc(doc)) expect(doc.noteText).toBe("hello");
  });

  it("defaults missing fields and unknown mode (legacy/back-compat)", () => {
    const doc = readProjectDoc({});
    expect(doc.mode).toBe("film");
    expect(doc.blocks).toEqual([]);
    if (isFilmDoc(doc)) expect(doc.titlePage).toEqual({});

    const weird = readProjectDoc({ mode: "totally-unknown", blocks: "not-array" });
    expect(weird.mode).toBe("film");
    expect(weird.blocks).toEqual([]);
  });

  it("round-trips core fields through build -> read", () => {
    const doc = readProjectDoc(buildProjectData(meta, fields));
    expect(doc.id).toBe("proj_1");
    expect(doc.name).toBe("Test");
    expect(doc.blocks).toHaveLength(1);
    expect(doc.docFont).toBe("Courier");
    expect(doc.layout).toEqual({ leftW: 200, aiOpen: true });
  });
});
