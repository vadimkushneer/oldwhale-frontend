import { useMemo } from "react";

export const USERS_ADMIN_TABLE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "login", label: "ЛОГИН" },
  { key: "email", label: "EMAIL" },
  { key: "role", label: "РОЛЬ" },
  { key: "disabled", label: "ОТКЛ." },
  { key: "created_at", label: "СОЗДАН" },
  { key: "actions", label: "" },
] as const;

export type UsersAdminTableColumn = (typeof USERS_ADMIN_TABLE_COLUMNS)[number];

export function useUsersAdminTable() {
  return useMemo(
    () => ({
      shellClassName: "users-admin-table",
      tableClassName: "users-admin-table__grid",
      headRowClassName: "users-admin-table__head-row",
      headCellClassName: "users-admin-table__head-cell",
      loadingClassName: "users-admin-table__loading",
      emptyClassName: "users-admin-table__empty",
    }),
    [],
  );
}
