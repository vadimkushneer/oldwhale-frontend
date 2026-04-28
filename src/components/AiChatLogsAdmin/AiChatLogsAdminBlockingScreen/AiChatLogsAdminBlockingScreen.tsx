import type { ReactNode } from "react";
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
  const { rootClassName, titleClassName } = useAiChatLogsAdminBlockingScreen(variant);

  if (variant === "session-restore") {
    return (
      <div className={rootClassName}>
        <div className={titleClassName}>ВОССТАНОВЛЕНИЕ СЕССИИ…</div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>НЕДОСТАТОЧНО ПРАВ</div>
      {children}
    </div>
  );
}
