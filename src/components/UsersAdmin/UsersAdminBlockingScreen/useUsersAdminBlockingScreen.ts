import { useMemo } from "react";

export type UsersAdminBlockingVariant = "session-restore" | "forbidden";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function useUsersAdminBlockingScreen(variant: UsersAdminBlockingVariant) {
  return useMemo(() => {
    const rootClassName = cx(
      "users-admin-blocking-screen",
      variant === "session-restore" && "users-admin-blocking-screen--session",
      variant === "forbidden" && "users-admin-blocking-screen--forbidden",
    );
    return {
      rootClassName,
      titleClassName: "users-admin-blocking-screen__title",
      descriptionClassName: "users-admin-blocking-screen__description",
    };
  }, [variant]);
}
