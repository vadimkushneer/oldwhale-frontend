import { useMemo } from "react";

export type AiMessageListItem = {
  key: number;
  align: "user" | "assistant";
  bubbleModifier: "user" | "ai" | "neutral";
  borderLeftColor: string | undefined;
  text: string;
};

export type AiMessageListMessage = {
  role: string;
  text: string;
  model?: string;
};

export function useAiMessageList({
  messages,
  getProviderColor,
}: {
  messages: readonly AiMessageListMessage[];
  getProviderColor: (modelId?: string) => string;
}): { rows: AiMessageListItem[] } {
  const rows = useMemo(
    () =>
      messages.map((m, i) => {
        const isUser = m.role === "user";
        const isAi = m.role === "ai";
        return {
          key: i,
          align: isUser ? ("user" as const) : ("assistant" as const),
          bubbleModifier: isUser ? ("user" as const) : isAi ? ("ai" as const) : ("neutral" as const),
          borderLeftColor: isAi ? getProviderColor(m.model) : undefined,
          text: m.text,
        };
      }),
    [messages, getProviderColor],
  );
  return { rows };
}
