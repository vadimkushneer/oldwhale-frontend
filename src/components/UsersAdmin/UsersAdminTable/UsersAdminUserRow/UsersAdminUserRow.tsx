import { useTranslation } from "react-i18next";
import type { UserRole } from "../../../../api/types";
import {
  useUsersAdminUserRow,
  type UseUsersAdminUserRowArgs,
} from "./useUsersAdminUserRow";
import "./UsersAdminUserRow.scss";

export type UsersAdminUserRowProps = UseUsersAdminUserRowArgs;

export function UsersAdminUserRow(props: UsersAdminUserRowProps) {
  const { t } = useTranslation();
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
          aria-label={t("admin.users.row.roleAria", { login: user.login })}
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
          aria-label={t("admin.users.row.disableAria", { login: user.login })}
        />
      </td>
      <td className={c.cellClassName}>
        <input
          className={c.creditsInputClassName}
          type="number"
          min={0}
          step={1}
          value={c.credits}
          disabled={c.isSelf || patchBusy}
          onChange={(event) => c.setCredits(Math.max(0, Math.trunc(Number(event.target.value) || 0)))}
          aria-label={t("admin.users.row.creditsAria", { login: user.login })}
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
          {t("admin.common.save")}
        </button>
        <button
          type="button"
          disabled={c.deleteDisabled}
          onClick={() => void c.onDelete()}
          className={c.deleteButtonClassName}
          aria-label={t("admin.users.row.deleteAria", { login: user.login })}
        >
          {t("admin.common.delete")}
        </button>
        {c.saveError ? (
          <span className={c.saveErrorClassName} role="alert" title={c.saveError}>
            {c.saveError}
          </span>
        ) : null}
      </td>
    </tr>
  );
}
