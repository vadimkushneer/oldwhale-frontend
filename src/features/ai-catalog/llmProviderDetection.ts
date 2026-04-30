import type { AiModelProvider } from "../../api/types";

export type LLMProviderDetectionConfidence = "high" | "medium" | "low";

export interface LLMProviderDetectionResult {
  provider: string;
  confidence: LLMProviderDetectionConfidence;
  reason: string;
}

interface LLMProviderPrefixRule {
  prefix: string;
  provider: string;
  confidence: LLMProviderDetectionConfidence;
  reason: string;
}

const UNKNOWN_PROVIDER = "unknown";

const LLM_PROVIDER_PREFIX_RULES: LLMProviderPrefixRule[] = [
  {
    prefix: "sk-ant-",
    provider: "anthropic",
    confidence: "high",
    reason: "The key starts with Anthropic's provider-specific sk-ant- prefix.",
  },
  {
    prefix: "sk-proj-",
    provider: "openai",
    confidence: "high",
    reason: "The key starts with OpenAI's project key prefix sk-proj-.",
  },
  {
    prefix: "sk-",
    provider: UNKNOWN_PROVIDER,
    confidence: "low",
    reason: "The generic sk- prefix is used by OpenAI-compatible and proxy providers, so it is not distinctive enough.",
  },
];

const PROVIDER_MATCHERS: Record<string, string[]> = {
  anthropic: ["anthropic", "claude"],
  openai: ["openai", "gpt"],
};

export function detectLLMProvider(apiKey: string): LLMProviderDetectionResult {
  const key = apiKey.trim();

  if (!key) {
    return {
      provider: UNKNOWN_PROVIDER,
      confidence: "low",
      reason: "The API key is empty.",
    };
  }

  const rule = LLM_PROVIDER_PREFIX_RULES.find((x) => key.startsWith(x.prefix));
  if (rule) {
    return {
      provider: rule.provider,
      confidence: rule.confidence,
      reason: rule.reason,
    };
  }

  return {
    provider: UNKNOWN_PROVIDER,
    confidence: "low",
    reason: "The API key prefix does not match a known provider-specific signature.",
  };
}

export function findDetectedLLMModelProvider(
  providers: readonly AiModelProvider[],
  detection: LLMProviderDetectionResult,
): AiModelProvider | null {
  if (detection.provider === UNKNOWN_PROVIDER || detection.confidence === "low") return null;

  const matchers = PROVIDER_MATCHERS[detection.provider] ?? [detection.provider];
  return providers.find((provider) => providerMatches(provider, matchers)) ?? null;
}

function providerMatches(provider: AiModelProvider, matchers: readonly string[]): boolean {
  const searchableParts = [provider.id, provider.label, provider.modelsUrl, hostnameFromUrl(provider.modelsUrl)]
    .filter(Boolean)
    .map((x) => x.toLowerCase());

  return matchers.some((matcher) => searchableParts.some((part) => part.includes(matcher)));
}

function hostnameFromUrl(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return "";
  }
}
