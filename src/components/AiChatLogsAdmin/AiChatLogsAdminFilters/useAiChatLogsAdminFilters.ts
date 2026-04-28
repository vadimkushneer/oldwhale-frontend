import { useMemo } from "react";

export function useAiChatLogsAdminFilters() {
  return useMemo(
    () => ({
      formClassName: "ai-chat-logs-admin-filters",
      fieldClassName: "ai-chat-logs-admin-filters__field",
      labelClassName: "ai-chat-logs-admin-filters__label",
      inputClassName: "ai-chat-logs-admin-filters__input",
      actionsClassName: "ai-chat-logs-admin-filters__actions",
      primaryBtnClassName:
        "ai-chat-logs-admin-filters__btn ai-chat-logs-admin-filters__btn--primary",
      neutralBtnClassName:
        "ai-chat-logs-admin-filters__btn ai-chat-logs-admin-filters__btn--neutral",
      refreshBtnClassName:
        "ai-chat-logs-admin-filters__btn ai-chat-logs-admin-filters__btn--refresh",
    }),
    [],
  );
}
