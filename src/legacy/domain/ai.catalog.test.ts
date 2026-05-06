import { afterEach, describe, expect, it } from "vitest";
import {
  AI_DEFAULT_MODEL_VARIANTS,
  AI_MODEL_VARIANTS,
  AIM,
  getAiVariants,
  getAiVariantGuid,
  getAiGroupUid,
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
        uid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        slug: "alpha",
        label: "Alpha",
        role: "R",
        color: "#112233",
        free: true,
        variants: [
          {
            uid: "11111111-1111-4111-8111-111111111111",
            slug: "alpha-one",
            label: "One",
            is_default: false,
          },
          {
            uid: "22222222-2222-4222-8222-222222222222",
            slug: "alpha-two",
            label: "Two",
            is_default: true,
          },
        ],
      },
    ]);
    expect(AIM.map((x) => x.id)).toEqual(["alpha"]);
    expect(getAiGroupUid("alpha")).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(getAiVariants("alpha").map((v: { id: string }) => v.id)).toEqual([
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ]);
    expect(AI_DEFAULT_MODEL_VARIANTS.alpha).toBe("22222222-2222-4222-8222-222222222222");
    expect(normalizeAiModelVariant("alpha", "alpha-one")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(getDefaultAiVariant("alpha")).toBe("22222222-2222-4222-8222-222222222222");
    expect(getAiVariantGuid("alpha", "alpha-one")).toBe("11111111-1111-4111-8111-111111111111");
  });
});
