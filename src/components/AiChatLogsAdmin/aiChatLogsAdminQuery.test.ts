import { describe, expect, it } from "vitest";
import {
  AI_CHAT_LOG_LIMIT,
  buildAiChatLogListParams,
  clipText,
  defaultColumnVisibility,
  isVisible,
  toRFC3339,
} from "./aiChatLogsAdminQuery";

describe("toRFC3339", () => {
  it("returns undefined for empty input", () => {
    expect(toRFC3339("")).toBeUndefined();
    expect(toRFC3339("   ")).toBeUndefined();
  });

  it("parses datetime-local style input to ISO string", () => {
    const out = toRFC3339("2026-04-28T12:00");
    expect(out).toBeDefined();
    expect(out).toMatch(/2026-04-28/);
  });

  it("returns trimmed free-form string when not parsed as local datetime", () => {
    expect(toRFC3339("  custom-range-token  ")).toBe("custom-range-token");
  });
});

describe("clipText", () => {
  it("does not truncate short strings", () => {
    expect(clipText("abc", 10)).toBe("abc");
  });

  it("truncates with ellipsis", () => {
    expect(clipText("abcdefghij", 5)).toBe("abcde…");
  });
});

describe("buildAiChatLogListParams", () => {
  it("sets limit and offset from page", () => {
    expect(buildAiChatLogListParams({}, 0)).toMatchObject({
      limit: AI_CHAT_LOG_LIMIT,
      offset: 0,
    });
    expect(buildAiChatLogListParams({}, 2)).toMatchObject({
      offset: 2 * AI_CHAT_LOG_LIMIT,
    });
  });

  it("parses numeric id and user_id", () => {
    expect(buildAiChatLogListParams({ id: "42", user_id: "7" }, 0)).toMatchObject({
      id: 42,
      user_id: 7,
    });
  });

  it("ignores invalid numeric fields", () => {
    const p = buildAiChatLogListParams({ id: "x", user_id: "" }, 0);
    expect(p.id).toBeUndefined();
    expect(p.user_id).toBeUndefined();
  });

  it("sets editor_mode only for allowed values", () => {
    expect(buildAiChatLogListParams({ editor_mode: "note" }, 0).editor_mode).toBe("note");
    expect(buildAiChatLogListParams({ editor_mode: "NOTE" }, 0).editor_mode).toBe("note");
    expect(buildAiChatLogListParams({ editor_mode: "invalid" }, 0).editor_mode).toBeUndefined();
  });

  it("passes string filters through", () => {
    expect(
      buildAiChatLogListParams(
        {
          group_slug: " g ",
          message_contains: "hi",
          login_contains: "a",
        },
        0,
      ),
    ).toMatchObject({
      group_slug: "g",
      message_contains: "hi",
      login_contains: "a",
    });
  });
});

describe("defaultColumnVisibility / isVisible", () => {
  it("defaults all columns on", () => {
    const d = defaultColumnVisibility();
    expect(isVisible(d, "id")).toBe(true);
    expect(isVisible(d, "reply")).toBe(true);
  });

  it("treats explicit false as hidden", () => {
    const cols = { ...defaultColumnVisibility(), id: false };
    expect(isVisible(cols, "id")).toBe(false);
  });
});
