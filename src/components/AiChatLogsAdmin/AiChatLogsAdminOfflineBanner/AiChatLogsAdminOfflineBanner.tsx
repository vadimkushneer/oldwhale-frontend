import { useTranslation } from "react-i18next";
import { useAiChatLogsAdminOfflineBanner } from "./useAiChatLogsAdminOfflineBanner";
import "./AiChatLogsAdminOfflineBanner.scss";

export function AiChatLogsAdminOfflineBanner() {
  const { t } = useTranslation();
  const { className } = useAiChatLogsAdminOfflineBanner();

  return (
    <div className={className}>
      {t("admin.common.offlineDataStale")}
    </div>
  );
}
