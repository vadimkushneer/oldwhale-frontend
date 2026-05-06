import type { ReactNode } from "react";
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
  const { rootClassName, titleClassName, descriptionClassName } =
    useUsersAdminBlockingScreen(variant);

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
      <div className={descriptionClassName}>
        Эта страница доступна только администраторам.
      </div>
      {children}
    </div>
  );
}
