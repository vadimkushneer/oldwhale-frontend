import { useTranslation } from "react-i18next";
import { useUsersAdminOfflineBanner } from "./useUsersAdminOfflineBanner";
import "./UsersAdminOfflineBanner.scss";

export function UsersAdminOfflineBanner() {
  const { t } = useTranslation();
  const { className } = useUsersAdminOfflineBanner();

  return (
    <div className={className} role="alert">
      {t("admin.common.offlineAdminOps")}
    </div>
  );
}
