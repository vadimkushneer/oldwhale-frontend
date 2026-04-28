import { describe, expect, it } from "vitest";
import { aiMessageTypeFromRole, ensureAiMessageId, newAiMessageId } from "./aiMessageTypes";

describe("aiMessageTypeFromRole", () => {
  it("maps roles to sys | ai | user", () => {
    expect(aiMessageTypeFromRole("user")).toBe("user");
    expect(aiMessageTypeFromRole("ai")).toBe("ai");
    expect(aiMessageTypeFromRole("sys")).toBe("sys");
    expect(aiMessageTypeFromRole("anything")).toBe("sys");
  });
});

describe("ensureAiMessageId", () => {
  it("keeps non-empty id", () => {
    expect(ensureAiMessageId({ id: "keep", text: "x", role: "user" }).id).toBe("keep");
  });

  it("fills missing id", () => {
    const m = ensureAiMessageId({ text: "x", role: "user" });
    expect(m.id.length).toBeGreaterThan(4);
  });
});

describe("newAiMessageId", () => {
  it("returns distinct strings", () => {
    const a = newAiMessageId();
    const b = newAiMessageId();
    expect(a).not.toBe(b);
  });
});
