import { describe, expect, it } from "vitest";
import { buildLoginRedirectState, buildLoginTarget } from "./loginRedirect";

describe("loginRedirect", () => {
  it("builds a return target with path, search, and hash", () => {
    expect(
      buildLoginTarget({
        pathname: "/editor/film",
        search: "?draft=1",
        hash: "#scene-2",
      }),
    ).toBe("/editor/film?draft=1#scene-2");
  });

  it("falls back when a redirect target is not app-relative", () => {
    expect(buildLoginTarget({ pathname: "https://example.com" })).toBe("/editor");
    expect(buildLoginTarget({ pathname: "//example.com" })).toBe("/editor");
  });

  it("captures the current route as login redirect state", () => {
    expect(
      buildLoginRedirectState({
        pathname: "/admin/ai-models",
        search: "?page=2",
        hash: "#variants",
      }),
    ).toEqual({
      from: {
        pathname: "/admin/ai-models",
        search: "?page=2",
        hash: "#variants",
      },
    });
  });
});
