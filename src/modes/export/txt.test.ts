import { describe, expect, it } from "vitest";
import { buildModeTxt } from "./txt";
import type { TxtExportContext } from "./shared/txt";

const filmCtx: TxtExportContext = {
  projectName: "Проект",
  titlePage: { title: "Кофейня", genre: "Драма", author: "А. Автор", year: "2026" },
  blocks: [
    { type: "scene", text: "инт. кофейня. день." },
    { type: "action", text: "Марина печатает." },
    { type: "char", text: "марина" },
    { type: "dialogue", text: "Почему всё начинается с кофейни?" },
    { type: "trans", text: "переход:" },
  ],
};

const playCtx: TxtExportContext = {
  projectName: "Пьеса",
  playHeader: [
    { type: "title", text: "ВЕСНОЙ" },
    { type: "spacer" },
    { type: "author", text: "Б. Автор" },
  ],
  blocks: [
    { type: "act", text: "" },
    { type: "scene", text: "" },
    { type: "cast", text: "ВЕРНЕР, БАРБАРА" },
    { type: "stage", text: "Кухня. Молчание." },
    { type: "line", name: "вернер", text: "Этой весной." },
  ],
};

const shortCtx: TxtExportContext = {
  projectName: "Ролик",
  contentHeader: [{ type: "title", text: "ВИДЕО-ПЛАН" }],
  blocks: [
    { type: "hook", text: "Зацепка" },
    { type: "body", text: "Тело" },
    { type: "cta", text: "Подпишись" },
  ],
};

const mediaCtx: TxtExportContext = {
  projectName: "Эфир",
  mediaHeader: [{ type: "title", text: "ТОЧКА ЗРЕНИЯ" }],
  blocks: [
    { type: "segment", text: "открытие" },
    { type: "anchor", text: "Добрый вечер." },
    { type: "sync", text: "Реплика гостя." },
    { type: "vtr", text: "Архив 45 сек." },
  ],
};

describe("TXT export builders (carved from the editor)", () => {
  it("returns null for note and unknown modes (shell handles note inline)", () => {
    expect(buildModeTxt("note", { blocks: [] })).toBeNull();
    expect(buildModeTxt("whatever", { blocks: [] })).toBeNull();
  });

  it("film: centred upper-case title, upper-case scene, indented dialogue", () => {
    const res = buildModeTxt("film", filmCtx)!;
    expect(res.filename).toBe("Кофейня.txt");
    const lines = res.text.split("\n");
    expect(lines).toContain("ИНТ. КОФЕЙНЯ. ДЕНЬ.");
    // character cue is centred + upper-cased
    expect(lines.some((l) => l.trim() === "МАРИНА" && l.startsWith(" "))).toBe(true);
    // dialogue is indented by 20
    expect(lines.some((l) => l.startsWith(" ".repeat(20)) && l.includes("кофейни"))).toBe(true);
    // transition is right-pushed and upper-cased
    expect(lines.some((l) => l.startsWith(" ".repeat(42)) && l.includes("ПЕРЕХОД:"))).toBe(true);
    expect(res.text).toMatchSnapshot();
  });

  it("play: title from playHeader, act title centred, speaker prefix on line", () => {
    const res = buildModeTxt("play", playCtx)!;
    const lines = res.text.split("\n");
    expect(lines).toContain("ВЕСНОЙ");
    expect(lines).toContain("Б. Автор");
    // auto act title (empty text) becomes a centred "АКТ ..." heading
    expect(lines.some((l) => l.trim().startsWith("АКТ") && l.startsWith(" "))).toBe(true);
    expect(lines.some((l) => l.includes("ВЕРНЕР.") && l.includes("Этой весной."))).toBe(true);
    expect(res.text).toMatchSnapshot();
  });

  it("short: hook/body/cta markers", () => {
    const res = buildModeTxt("short", shortCtx)!;
    expect(res.filename).toBe("Ролик.txt");
    expect(res.text).toContain("▶ Зацепка");
    expect(res.text).toContain("  Тело");
    expect(res.text).toContain("→ Подпишись");
    expect(res.text).toMatchSnapshot();
  });

  it("media: segment upper-case, sync/vtr markers", () => {
    const res = buildModeTxt("media", mediaCtx)!;
    expect(res.filename).toBe("Эфир.txt");
    expect(res.text).toContain("ОТКРЫТИЕ");
    expect(res.text).toContain("  | Реплика гостя.");
    expect(res.text).toContain("[ВТР] Архив 45 сек.");
    expect(res.text).toMatchSnapshot();
  });

  it("falls back to default file names when project is unnamed", () => {
    expect(buildModeTxt("film", { blocks: [] })!.filename).toBe("screenplay.txt");
    expect(buildModeTxt("short", { blocks: [] })!.filename).toBe("content.txt");
    expect(buildModeTxt("media", { blocks: [] })!.filename).toBe("media.txt");
  });
});
