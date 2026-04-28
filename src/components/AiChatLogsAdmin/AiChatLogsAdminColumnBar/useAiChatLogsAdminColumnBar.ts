import { useMemo } from "react";

export function useAiChatLogsAdminColumnBar() {
  return useMemo(
    () => ({
      rootClassName: "ai-chat-logs-admin-column-bar",
      legendClassName: "ai-chat-logs-admin-column-bar__legend",
      itemsClassName: "ai-chat-logs-admin-column-bar__items",
      itemClassName: "ai-chat-logs-admin-column-bar__item",
      itemVisibleClassName: "ai-chat-logs-admin-column-bar__item--visible",
      itemHiddenClassName: "ai-chat-logs-admin-column-bar__item--hidden",
      inputClassName: "ai-chat-logs-admin-column-bar__input",
      eyeWrapClassName: "ai-chat-logs-admin-column-bar__eye",
      textClassName: "ai-chat-logs-admin-column-bar__text",
    }),
    [],
  );
}
