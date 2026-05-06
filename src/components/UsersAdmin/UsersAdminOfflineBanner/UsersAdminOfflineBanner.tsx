import { useUsersAdminOfflineBanner } from "./useUsersAdminOfflineBanner";
import "./UsersAdminOfflineBanner.scss";

export function UsersAdminOfflineBanner() {
  const { className } = useUsersAdminOfflineBanner();

  return (
    <div className={className} role="alert">
      НЕТ ПОДКЛЮЧЕНИЯ — АДМИН-ОПЕРАЦИИ НЕДОСТУПНЫ
    </div>
  );
}
