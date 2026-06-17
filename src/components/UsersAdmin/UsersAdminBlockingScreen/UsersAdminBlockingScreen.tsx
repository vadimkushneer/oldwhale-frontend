import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  useUsersAdminBlockingScreen,
  type UsersAdminBlockingVariant,
} from "./useUsersAdminBlockingScreen";
import "./UsersAdminBlockingScreen.scss";

export type UsersAdminBlockingScreenProps = {
  variant: UsersAdminBlockingVariant;
  children?: ReactNode;
};

export function UsersAdminBlockingScreen({
  variant,
  children,
}: UsersAdminBlockingScreenProps) {
  const { t } = useTranslation();
  const { rootClassName, titleClassName, descriptionClassName } =
    useUsersAdminBlockingScreen(variant);

  if (variant === "session-restore") {
    return (
      <div className={rootClassName}>
        <div className={titleClassName}>{t("admin.common.sessionRestore")}</div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>{t("admin.common.insufficientRights")}</div>
      <div className={descriptionClassName}>
        {t("admin.common.adminsOnly")}
      </div>
      {children}
    </div>
  );
}
