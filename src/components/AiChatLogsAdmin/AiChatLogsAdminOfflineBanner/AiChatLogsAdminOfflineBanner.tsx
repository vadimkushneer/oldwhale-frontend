import { useAiChatLogsAdminOfflineBanner } from "./useAiChatLogsAdminOfflineBanner";
import "./AiChatLogsAdminOfflineBanner.scss";

export function AiChatLogsAdminOfflineBanner() {
  const { className } = useAiChatLogsAdminOfflineBanner();

  return (
    <div className={className}>
      НЕТ ПОДКЛЮЧЕНИЯ — ДАННЫЕ МОГУТ БЫТЬ НЕАКТУАЛЬНЫ
    </div>
  );
}
