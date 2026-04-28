import { useMemo } from "react";
import { aiMessageTypeFromRole, type ChatMessageType } from "../../../../domain/aiMessageTypes";

export type AiMessageListMessage = {
  id: string;
  role: string;
  text: string;
  model?: string;
  modelVariant?: string;
};

export type AiMessageListRow = {
  id: string;
  type: ChatMessageType;
  text: string;
  accentColor?: string;
};

export function useAiMessageList({
  messages,
  getProviderColor,
}: {
  messages: readonly AiMessageListMessage[];
  getProviderColor: (modelId?: string) => string;
}): { rows: AiMessageListRow[] } {
  const rows = useMemo(
    () =>
      messages.map((m) => {
        const type = aiMessageTypeFromRole(m.role);
        const isAi = m.role === "ai";
        return {
          id: m.id,
          type,
          text: m.text,
          accentColor: isAi ? getProviderColor(m.model) : undefined,
        };
      }),
    [messages, getProviderColor],
  );
  return { rows };
}
