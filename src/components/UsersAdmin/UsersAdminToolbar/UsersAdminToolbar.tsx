import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useUsersAdminToolbar } from "./useUsersAdminToolbar";
import "./UsersAdminToolbar.scss";

export function UsersAdminToolbar() {
  const { t } = useTranslation();
  const {
    rootClassName,
    titleClassName,
    navClassName,
    linkMutedClassName,
    linkAccentClassName,
  } = useUsersAdminToolbar();

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>{t("admin.users.title")}</div>
      <div className={navClassName}>
        <Link className={linkMutedClassName} to="/admin/ai-chat-logs">
          {t("admin.common.aiChatLogs")}
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
