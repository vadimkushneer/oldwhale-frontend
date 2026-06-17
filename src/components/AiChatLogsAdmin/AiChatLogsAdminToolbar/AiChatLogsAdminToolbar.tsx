import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAiChatLogsAdminToolbar } from "./useAiChatLogsAdminToolbar";
import "./AiChatLogsAdminToolbar.scss";

export function AiChatLogsAdminToolbar() {
  const { t } = useTranslation();
  const { rootClassName, titleClassName, navClassName, linkMutedClassName, linkAccentClassName } =
    useAiChatLogsAdminToolbar();

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>{t("admin.aiChatLogs.title")}</div>
      <div className={navClassName}>
        <Link className={linkMutedClassName} to="/admin">
          {t("admin.common.users")}
        </Link>
        <Link className={linkMutedClassName} to="/admin/ai-models">
          {t("admin.common.aiModels")}
        </Link>
        <Link className={linkAccentClassName} to="/editor">
          {t("admin.common.editor")}
        </Link>
      </div>
    </div>
  );
}
