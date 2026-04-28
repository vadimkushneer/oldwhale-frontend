import { useMemo } from "react";

export function useAiChatLogsAdminTable() {
  return useMemo(
    () => ({
      scrollClassName: "ai-chat-logs-admin-table-scroll",
      loadingClassName: "ai-chat-logs-admin-table__loading",
      tableClassName: "ai-chat-logs-admin-table__grid",
      headRowClassName: "ai-chat-logs-admin-table__head-row",
      thClassName: "ai-chat-logs-admin-table__th",
      thNowrapClassName: "ai-chat-logs-admin-table__th--nowrap",
      bodyRowClassName: "ai-chat-logs-admin-table__row",
      tdClassName: "ai-chat-logs-admin-table__td",
      tdNowrapClassName: "ai-chat-logs-admin-table__td--nowrap",
      tdSecondaryClassName: "ai-chat-logs-admin-table__td--secondary",
      tdMutedClassName: "ai-chat-logs-admin-table__td--muted",
      tdEmailClassName: "ai-chat-logs-admin-table__email",
      tdMessageClassName: "ai-chat-logs-admin-table__td--message",
      tdModelClassName: "ai-chat-logs-admin-table__td--model",
      tdIdsClassName: "ai-chat-logs-admin-table__td--ids",
      tdIpClassName: "ai-chat-logs-admin-table__td--ip",
      tdNoteClassName: "ai-chat-logs-admin-table__td--note",
    }),
    [],
  );
}
