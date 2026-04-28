import { useMemo } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type UseAiChatLogsAdminPaginationArgs = {
  prevDisabled: boolean;
  nextDisabled: boolean;
};

export function useAiChatLogsAdminPagination({
  prevDisabled,
  nextDisabled,
}: UseAiChatLogsAdminPaginationArgs) {
  return useMemo(() => {
    const base = "ai-chat-logs-admin-pagination__btn";
    return {
      rootClassName: "ai-chat-logs-admin-pagination",
      prevClassName: cx(base, prevDisabled && "ai-chat-logs-admin-pagination__btn--disabled"),
      nextClassName: cx(base, nextDisabled && "ai-chat-logs-admin-pagination__btn--disabled"),
    };
  }, [prevDisabled, nextDisabled]);
}
