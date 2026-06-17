import { useTranslation } from "react-i18next";
import type { User } from "../../../api/types";
import type { UsersAdminPatchBody } from "../useUsersAdmin";
import { UsersAdminUserRow } from "./UsersAdminUserRow/UsersAdminUserRow";
import { useUsersAdminTable } from "./useUsersAdminTable";
import "./UsersAdminTable.scss";

export type UsersAdminTableProps = {
  users: User[];
  isLoading: boolean;
  selfId: number;
  patchBusy: boolean;
  onPatchUser: (id: number, body: UsersAdminPatchBody) => Promise<void> | void;
  deleteBusy: boolean;
  onDeleteUser: (id: number) => Promise<void> | void;
};

export function UsersAdminTable({
  users,
  isLoading,
  selfId,
  patchBusy,
  onPatchUser,
  deleteBusy,
  onDeleteUser,
}: UsersAdminTableProps) {
  const { t } = useTranslation();
  const c = useUsersAdminTable();

  return (
    <div className={c.shellClassName}>
      {isLoading ? (
        <div className={c.loadingClassName}>{t("admin.common.loading")}</div>
      ) : (
        <table className={c.tableClassName}>
          <thead>
            <tr className={c.headRowClassName}>
              {c.columns.map((column) => (
                <th key={column.key} className={c.headCellClassName}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UsersAdminUserRow
                key={user.id}
                user={user}
                selfId={selfId}
                patchBusy={patchBusy}
                onPatchUser={onPatchUser}
                deleteBusy={deleteBusy}
                onDeleteUser={onDeleteUser}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
