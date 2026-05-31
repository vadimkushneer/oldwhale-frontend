import { beforeEach, describe, expect, it } from "vitest";
import { loadLastProjectForMode, readProjectSnapshot, saveProjectForMode } from "./projectStore";

// Minimal localStorage shim so the test runs regardless of env.
class MemStore {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
beforeEach(() => { (globalThis as { localStorage?: unknown }).localStorage = new MemStore() as unknown as Storage; });

const B = (type: string, text = "") => ({ id: type + Math.random(), type, text });

describe("projectStore", () => {
  it("round-trips a saved project via loadLastProjectForMode", () => {
    const blocks = [B("act", "АКТ I"), B("scene", "1"), B("line", "Привет")];
    saveProjectForMode("p1", "Моя пьеса", blocks as never, "play", { playHeader: [] as never });
    const loaded = loadLastProjectForMode("play");
    expect(loaded?.id).toBe("p1");
    expect(loaded?.name).toBe("Моя пьеса");
    expect(loaded?.mode).toBe("play");
    expect(loaded?.blocks).toHaveLength(3);
  });

  it("counts only scene blocks in blocksCount", () => {
    saveProjectForMode("p2", "x", [B("scene"), B("line"), B("scene")] as never, "play");
    expect(readProjectSnapshot("p2")?.blocksCount).toBe(2);
  });

  it("returns null for a mode with no projects", () => {
    expect(loadLastProjectForMode("play")).toBeNull();
  });

  it("does not return a project of a different mode as the active one", () => {
    saveProjectForMode("f1", "Film", [B("scene")] as never, "film");
    // active is now the film project; asking for play should fall through to index (none)
    expect(loadLastProjectForMode("play")).toBeNull();
    expect(loadLastProjectForMode("film")?.id).toBe("f1");
  });

  it("prefers the most recently saved project of a mode", () => {
    saveProjectForMode("a", "first", [B("scene")] as never, "play");
    saveProjectForMode("b", "second", [B("scene")] as never, "play");
    expect(loadLastProjectForMode("play")?.id).toBe("b");
  });

  it("heals an old/minimal project doc (missing newer fields) without crashing", () => {
    // Simulate a project saved by an older app version: only the essentials.
    const oldDoc = { id: "old1", name: "Старый", mode: "film", updatedAt: 1, blocksCount: 1,
      blocks: [{ id: "s1", type: "scene", text: "ИНТ. ДОМ" }] };
    localStorage.setItem("ow_proj_old1", JSON.stringify(oldDoc));
    localStorage.setItem("ow_index", JSON.stringify([{ id: "old1", name: "Старый", mode: "film", updatedAt: 1 }]));
    localStorage.setItem("ow_active_project", "old1");
    const loaded = loadLastProjectForMode("film") as any;
    expect(loaded).toBeTruthy();
    expect(loaded.blocks.map((b: any) => b.text).join("")).toContain("ИНТ. ДОМ");
    // newer, absent fields must not blow up — they read as undefined/empty
    expect(() => readProjectSnapshot("old1")).not.toThrow();
  });

});
