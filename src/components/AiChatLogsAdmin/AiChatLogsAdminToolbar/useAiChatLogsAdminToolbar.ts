import { useMemo } from "react";

export function useAiChatLogsAdminToolbar() {
  return useMemo(
    () => ({
      rootClassName: "ai-chat-logs-admin-toolbar",
      titleClassName: "ai-chat-logs-admin-toolbar__title",
      navClassName: "ai-chat-logs-admin-toolbar__nav",
      linkMutedClassName:
        "ai-chat-logs-admin-toolbar__link ai-chat-logs-admin-toolbar__link--muted",
      linkAccentClassName:
        "ai-chat-logs-admin-toolbar__link ai-chat-logs-admin-toolbar__link--accent",
    }),
    [],
  );
}
