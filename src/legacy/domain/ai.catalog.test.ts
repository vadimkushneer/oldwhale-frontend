import { afterEach, describe, expect, it } from "vitest";
import {
  AI_DEFAULT_MODEL_VARIANTS,
  AI_MODEL_VARIANTS,
  AIM,
  getAiVariants,
  getDefaultAiVariant,
  normalizeAiModelVariant,
  setAiCatalog,
} from "./ai";

describe("setAiCatalog", () => {
  afterEach(() => {
    setAiCatalog([]);
  });

  it("updates AIM, variants, and defaults from server-shaped payload", () => {
    setAiCatalog([
      {
        id: 1,
        slug: "alpha",
        label: "Alpha",
        role: "R",
        color: "#112233",
        free: true,
        variants: [
          { id: 10, slug: "alpha-one", label: "One", is_default: false },
          { id: 11, slug: "alpha-two", label: "Two", is_default: true },
        ],
      },
    ]);
    expect(AIM.map((x) => x.id)).toEqual(["alpha"]);
    expect(getAiVariants("alpha").map((v: { id: string }) => v.id)).toEqual(["alpha-one", "alpha-two"]);
    expect(AI_DEFAULT_MODEL_VARIANTS.alpha).toBe("alpha-two");
    expect(normalizeAiModelVariant("alpha", "alpha-one")).toBe("alpha-one");
    expect(getDefaultAiVariant("alpha")).toBe("alpha-two");
  });
});
