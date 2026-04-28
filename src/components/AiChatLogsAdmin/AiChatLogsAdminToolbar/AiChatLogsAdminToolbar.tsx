import { Link } from "react-router-dom";
import { useAiChatLogsAdminToolbar } from "./useAiChatLogsAdminToolbar";
import "./AiChatLogsAdminToolbar.scss";

export function AiChatLogsAdminToolbar() {
  const { rootClassName, titleClassName, navClassName, linkMutedClassName, linkAccentClassName } =
    useAiChatLogsAdminToolbar();

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>АДМИН · ЖУРНАЛ ИИ‑ЧАТА</div>
      <div className={navClassName}>
        <Link className={linkMutedClassName} to="/admin">
          ← ПОЛЬЗОВАТЕЛИ
        </Link>
        <Link className={linkMutedClassName} to="/admin/ai-models">
          ИИ · МОДЕЛИ →
        </Link>
        <Link className={linkAccentClassName} to="/editor">
          РЕДАКТОР →
        </Link>
      </div>
    </div>
  );
}
