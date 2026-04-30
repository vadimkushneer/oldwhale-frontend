import { describe, expect, it } from "vitest";
import type { AiModelProvider } from "../../api/types";
import { detectLLMProvider, findDetectedLLMModelProvider } from "./llmProviderDetection";

const providers: AiModelProvider[] = [
  {
    id: "openai",
    label: "OpenAI",
    modelsUrl: "https://api.openai.com/v1/models",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    modelsUrl: "https://api.anthropic.com/v1/models",
  },
];

describe("detectLLMProvider", () => {
  it("detects Anthropic keys from the provider-specific prefix", () => {
    expect(detectLLMProvider("sk-ant-api03-example")).toEqual({
      provider: "anthropic",
      confidence: "high",
      reason: "The key starts with Anthropic's provider-specific sk-ant- prefix.",
    });
  });

  it("detects OpenAI project keys from the provider-specific prefix", () => {
    expect(detectLLMProvider("sk-proj-example")).toEqual({
      provider: "openai",
      confidence: "high",
      reason: "The key starts with OpenAI's project key prefix sk-proj-.",
    });
  });

  it("does not assign generic sk- keys to OpenAI", () => {
    expect(detectLLMProvider("sk-example")).toEqual({
      provider: "unknown",
      confidence: "low",
      reason: "The generic sk- prefix is used by OpenAI-compatible and proxy providers, so it is not distinctive enough.",
    });
  });

  it("returns unknown for random strings", () => {
    expect(detectLLMProvider("not-a-real-key")).toEqual({
      provider: "unknown",
      confidence: "low",
      reason: "The API key prefix does not match a known provider-specific signature.",
    });
  });

  it("keeps proxy-style keys unknown", () => {
    expect(detectLLMProvider("proxy_sk-ant-example")).toMatchObject({
      provider: "unknown",
      confidence: "low",
    });
  });
});

describe("findDetectedLLMModelProvider", () => {
  it("finds the matching provider for a distinctive key signature", () => {
    const detection = detectLLMProvider("sk-ant-api03-example");

    expect(findDetectedLLMModelProvider(providers, detection)?.id).toBe("anthropic");
  });

  it("does not select a provider for ambiguous signatures", () => {
    const detection = detectLLMProvider("sk-example");

    expect(findDetectedLLMModelProvider(providers, detection)).toBeNull();
  });
});
