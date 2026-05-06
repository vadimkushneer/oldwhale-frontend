import { useMemo } from "react";

export function useUsersAdminOfflineBanner() {
  return useMemo(
    () => ({
      className: "users-admin-offline-banner",
    }),
    [],
  );
}
