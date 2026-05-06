import { Link } from "react-router-dom";
import { useUsersAdminToolbar } from "./useUsersAdminToolbar";
import "./UsersAdminToolbar.scss";

export function UsersAdminToolbar() {
  const {
    rootClassName,
    titleClassName,
    navClassName,
    linkMutedClassName,
    linkAccentClassName,
  } = useUsersAdminToolbar();

  return (
    <div className={rootClassName}>
      <div className={titleClassName}>АДМИН · ПОЛЬЗОВАТЕЛИ</div>
      <div className={navClassName}>
        <Link className={linkMutedClassName} to="/admin/ai-chat-logs">
          ЖУРНАЛ ИИ‑ЧАТА →
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
