import { useTranslation } from "react-i18next";
import type { UserRole } from "../../../api/types";
import { UsersAdminCreateFormField } from "./UsersAdminCreateFormField/UsersAdminCreateFormField";
import { useUsersAdminCreateForm } from "./useUsersAdminCreateForm";
import "./UsersAdminCreateForm.scss";

export function UsersAdminCreateForm() {
  const { t } = useTranslation();
  const c = useUsersAdminCreateForm();

  return (
    <form className={c.formClassName} onSubmit={c.onSubmit} noValidate>
      <UsersAdminCreateFormField label={t("admin.users.columns.login")}>
        <input
          className={c.inputClassName}
          value={c.login}
          onChange={(event) => c.setLogin(event.target.value)}
          aria-label={t("admin.users.create.loginAria")}
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label={t("admin.users.columns.email")}>
        <input
          className={c.inputClassName}
          value={c.email}
          onChange={(event) => c.setEmail(event.target.value)}
          type="email"
          aria-label={t("admin.users.create.emailAria")}
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label={t("admin.users.columns.password")}>
        <input
          className={c.inputClassName}
          value={c.password}
          onChange={(event) => c.setPassword(event.target.value)}
          type="password"
          aria-label={t("admin.users.create.passwordAria")}
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label={t("admin.users.columns.role")}>
        <select
          className={c.selectClassName}
          value={c.role}
          onChange={(event) => c.setRole(event.target.value as UserRole)}
          aria-label={t("admin.users.create.roleAria")}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label={t("admin.users.columns.credits")}>
        <input
          className={c.inputClassName}
          value={c.credits}
          onChange={(event) => c.setCredits(event.target.value)}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder={t("admin.common.defaultCredits")}
          aria-label={t("admin.users.create.creditsAria")}
        />
      </UsersAdminCreateFormField>

      <button type="submit" disabled={c.busy} className={c.submitClassName}>
        {c.busy ? "…" : t("admin.common.create")}
      </button>

      {c.error ? (
        <div className={c.errorClassName} role="alert">
          {c.error}
        </div>
      ) : null}
    </form>
  );
}
