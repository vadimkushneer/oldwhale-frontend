import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        {t("admin.common.prev")}
      </button>
      <span className="ai-chat-logs-admin-pagination__status">
        {t("admin.common.pageStatus", { page: page + 1, totalPages })}
      </span>
      <button
        className={nextClassName}
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        {t("admin.common.next")}
      </button>
    </div>
  );
}
