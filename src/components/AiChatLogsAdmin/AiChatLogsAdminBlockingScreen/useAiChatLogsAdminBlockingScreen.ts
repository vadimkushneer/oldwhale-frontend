import { useMemo } from "react";

export type AiChatLogsAdminBlockingVariant = "session-restore" | "forbidden";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function useAiChatLogsAdminBlockingScreen(variant: AiChatLogsAdminBlockingVariant) {
  return useMemo(() => {
    const rootClassName = cx(
      "ai-chat-logs-admin-blocking-screen",
      variant === "session-restore" && "ai-chat-logs-admin-blocking-screen--session",
      variant === "forbidden" && "ai-chat-logs-admin-blocking-screen--forbidden",
    );
    return {
      rootClassName,
      titleClassName: "ai-chat-logs-admin-blocking-screen__title",
    };
  }, [variant]);
}
