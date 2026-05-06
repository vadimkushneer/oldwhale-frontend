import { useMemo } from "react";

export function useUsersAdminToolbar() {
  return useMemo(
    () => ({
      rootClassName: "users-admin-toolbar",
      titleClassName: "users-admin-toolbar__title",
      navClassName: "users-admin-toolbar__nav",
      linkMutedClassName:
        "users-admin-toolbar__link users-admin-toolbar__link--muted",
      linkAccentClassName:
        "users-admin-toolbar__link users-admin-toolbar__link--accent",
    }),
    [],
  );
}
