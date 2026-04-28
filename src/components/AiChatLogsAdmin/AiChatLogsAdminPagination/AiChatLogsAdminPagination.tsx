import type { Dispatch, SetStateAction } from "react";
import { AI_CHAT_LOG_LIMIT } from "../aiChatLogsAdminQuery";
import { useAiChatLogsAdminPagination } from "./useAiChatLogsAdminPagination";
import "./AiChatLogsAdminPagination.scss";

export type AiChatLogsAdminPaginationProps = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  total: number;
  totalPages: number;
};

export function AiChatLogsAdminPagination({
  page,
  setPage,
  total,
  totalPages,
}: AiChatLogsAdminPaginationProps) {
  const { rootClassName, prevClassName, nextClassName } = useAiChatLogsAdminPagination({
    prevDisabled: page <= 0,
    nextDisabled: page + 1 >= totalPages,
  });

  if (total <= AI_CHAT_LOG_LIMIT) {
    return null;
  }

  return (
    <div className={rootClassName}>
      <button
        className={prevClassName}
        type="button"
        disabled={page <= 0}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
      >
        НАЗАД
      </button>
      <span className="ai-chat-logs-admin-pagination__status">
        Стр. {page + 1} / {totalPages}
      </span>
      <button
        className={nextClassName}
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        ДАЛЕЕ
      </button>
    </div>
  );
}
