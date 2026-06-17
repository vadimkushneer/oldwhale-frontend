import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type UsersAdminTableColumnKey =
  | "id"
  | "login"
  | "email"
  | "role"
  | "disabled"
  | "credits"
  | "created_at"
  | "actions";

export type UsersAdminTableColumn = {
  key: UsersAdminTableColumnKey;
  label: string;
};

export function useUsersAdminTable() {
  const { t, i18n } = useTranslation();

  const columns = useMemo<UsersAdminTableColumn[]>(
    () => [
      { key: "id", label: "ID" },
      { key: "login", label: t("admin.users.columns.login") },
      { key: "email", label: t("admin.users.columns.email") },
      { key: "role", label: t("admin.users.columns.role") },
      { key: "disabled", label: t("admin.users.columns.disabled") },
      { key: "credits", label: t("admin.users.columns.credits") },
      { key: "created_at", label: t("admin.users.columns.created") },
      { key: "actions", label: "" },
    ],
    [i18n.language, t],
  );

  return useMemo(
    () => ({
      columns,
      shellClassName: "users-admin-table",
      tableClassName: "users-admin-table__grid",
      headRowClassName: "users-admin-table__head-row",
      headCellClassName: "users-admin-table__head-cell",
      loadingClassName: "users-admin-table__loading",
      emptyClassName: "users-admin-table__empty",
    }),
    [columns],
  );
}
