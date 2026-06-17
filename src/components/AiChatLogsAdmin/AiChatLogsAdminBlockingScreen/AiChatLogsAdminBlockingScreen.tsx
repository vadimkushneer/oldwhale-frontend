import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAiChatLogsAdminBlockingScreen } from "./useAiChatLogsAdminBlockingScreen";
import "./AiChatLogsAdminBlockingScreen.scss";

export type AiChatLogsAdminBlockingScreenProps = {
  variant: "session-restore" | "forbidden";
  children?: ReactNode;
};

export function AiChatLogsAdminBlockingScreen({
  variant,
  children,
}: AiChatLogsAdminBlockingScreenProps) {
  const { t } = useTranslation();
  const { rootClassName, titleClassName } = useAiChatLogsAdminBlockingScreen(variant);

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
      {children}
    </div>
  );
}
