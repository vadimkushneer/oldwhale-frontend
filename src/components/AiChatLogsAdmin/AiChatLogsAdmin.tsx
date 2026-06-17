import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";
import { AiChatLogsAdminBlockingScreen } from "./AiChatLogsAdminBlockingScreen/AiChatLogsAdminBlockingScreen";
import { AiChatLogsAdminColumnBar } from "./AiChatLogsAdminColumnBar/AiChatLogsAdminColumnBar";
import { AiChatLogsAdminFilters } from "./AiChatLogsAdminFilters/AiChatLogsAdminFilters";
import { AiChatLogsAdminOfflineBanner } from "./AiChatLogsAdminOfflineBanner/AiChatLogsAdminOfflineBanner";
import { AiChatLogsAdminPagination } from "./AiChatLogsAdminPagination/AiChatLogsAdminPagination";
import { AiChatLogsAdminTable } from "./AiChatLogsAdminTable/AiChatLogsAdminTable";
import { AiChatLogsAdminToolbar } from "./AiChatLogsAdminToolbar/AiChatLogsAdminToolbar";
import { useAiChatLogsAdmin } from "./useAiChatLogsAdmin";
import "./AiChatLogsAdmin.scss";

const LOGIN_REDIRECT_STATE = { from: { pathname: "/admin/ai-chat-logs", search: "" } };

export function AiChatLogsAdmin() {
  const { t } = useTranslation();
  const vm = useAiChatLogsAdmin();

  if (vm.phase === "redirect-login") {
    return <Navigate to="/login" replace state={LOGIN_REDIRECT_STATE} />;
  }

  if (vm.phase === "session-restore") {
    return <AiChatLogsAdminBlockingScreen variant="session-restore" />;
  }

  if (vm.phase === "forbidden") {
    return (
      <AiChatLogsAdminBlockingScreen variant="forbidden">
        <Link className="ai-chat-logs-admin__editor-link" to="/editor">
          {t("admin.common.editorShort")}
        </Link>
      </AiChatLogsAdminBlockingScreen>
    );
  }

  return (
    <div className="ai-chat-logs-admin">
      <div className="ai-chat-logs-admin__inner">
        {!vm.online ? <AiChatLogsAdminOfflineBanner /> : null}

        <AiChatLogsAdminToolbar />

        <AiChatLogsAdminFilters
          draft={vm.draft}
          setDraft={vm.setDraft}
          onApply={vm.onApply}
          onReset={vm.onReset}
          onRefetch={vm.refetch}
        />

        <div className="ai-chat-logs-admin__stats">
          {t("admin.common.total", { count: vm.total })}
          {vm.isFetching ? t("admin.common.loadingSuffix") : ""}
        </div>

        {vm.errMsg ? <div className="ai-chat-logs-admin__error">{vm.errMsg}</div> : null}

        <AiChatLogsAdminColumnBar
          columnVisibility={vm.columnVisibility}
          onToggleColumn={vm.onToggleColumn}
        />

        <div className="ai-chat-logs-admin__table-region">
          <AiChatLogsAdminTable
            rows={vm.rows}
            columnVisibility={vm.columnVisibility}
            isLoading={vm.isLoading}
          />
        </div>

        <AiChatLogsAdminPagination
          page={vm.page}
          setPage={vm.setPage}
          total={vm.total}
          totalPages={vm.totalPages}
        />
      </div>
    </div>
  );
}
