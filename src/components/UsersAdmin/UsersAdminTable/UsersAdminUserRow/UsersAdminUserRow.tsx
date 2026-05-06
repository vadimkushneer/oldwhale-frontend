import type { UserRole } from "../../../../api/types";
import {
  useUsersAdminUserRow,
  type UseUsersAdminUserRowArgs,
} from "./useUsersAdminUserRow";
import "./UsersAdminUserRow.scss";

export type UsersAdminUserRowProps = UseUsersAdminUserRowArgs;

export function UsersAdminUserRow(props: UsersAdminUserRowProps) {
  const { user, patchBusy } = props;
  const c = useUsersAdminUserRow(props);

  return (
    <tr className={c.rowClassName}>
      <td className={c.cellMutedClassName}>{user.id}</td>
      <td className={c.cellClassName}>{user.login}</td>
      <td className={c.cellMutedClassName}>{user.email}</td>
      <td className={c.cellClassName}>
        <select
          className={c.roleSelectClassName}
          value={c.role}
          disabled={c.isSelf || patchBusy}
          onChange={(event) => c.setRole(event.target.value as UserRole)}
          aria-label={`Роль пользователя ${user.login}`}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className={c.cellClassName}>
        <input
          className={c.disabledCheckboxClassName}
          type="checkbox"
          checked={c.disabled}
          disabled={c.isSelf || patchBusy}
          onChange={(event) => c.setDisabled(event.target.checked)}
          aria-label={`Отключить пользователя ${user.login}`}
        />
      </td>
      <td className={c.cellMutedNowrapClassName}>{c.formattedCreatedAt}</td>
      <td className={c.cellActionsClassName}>
        <button
          type="button"
          disabled={c.saveDisabled}
          onClick={() => void c.onSave()}
          className={c.saveButtonClassName}
        >
          СОХРАНИТЬ
        </button>
        <button
          type="button"
          disabled={c.deleteDisabled}
          onClick={() => void c.onDelete()}
          className={c.deleteButtonClassName}
          aria-label={`Удалить пользователя ${user.login}`}
        >
          УДАЛИТЬ
        </button>
      </td>
    </tr>
  );
}
