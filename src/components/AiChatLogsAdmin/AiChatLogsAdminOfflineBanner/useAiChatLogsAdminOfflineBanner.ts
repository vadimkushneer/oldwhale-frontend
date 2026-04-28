import { useMemo } from "react";

export function useAiChatLogsAdminOfflineBanner() {
  return useMemo(
    () => ({
      className: "ai-chat-logs-admin-offline-banner",
    }),
    [],
  );
}
