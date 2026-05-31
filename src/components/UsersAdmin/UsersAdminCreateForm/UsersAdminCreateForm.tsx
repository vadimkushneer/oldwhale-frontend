import type { UserRole } from "../../../api/types";
import { UsersAdminCreateFormField } from "./UsersAdminCreateFormField/UsersAdminCreateFormField";
import { useUsersAdminCreateForm } from "./useUsersAdminCreateForm";
import "./UsersAdminCreateForm.scss";

export function UsersAdminCreateForm() {
  const c = useUsersAdminCreateForm();

  return (
    <form className={c.formClassName} onSubmit={c.onSubmit} noValidate>
      <UsersAdminCreateFormField label="ЛОГИН">
        <input
          className={c.inputClassName}
          value={c.login}
          onChange={(event) => c.setLogin(event.target.value)}
          aria-label="Логин нового пользователя"
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label="EMAIL">
        <input
          className={c.inputClassName}
          value={c.email}
          onChange={(event) => c.setEmail(event.target.value)}
          type="email"
          aria-label="Email нового пользователя"
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label="ПАРОЛЬ">
        <input
          className={c.inputClassName}
          value={c.password}
          onChange={(event) => c.setPassword(event.target.value)}
          type="password"
          aria-label="Пароль нового пользователя"
        />
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label="РОЛЬ">
        <select
          className={c.selectClassName}
          value={c.role}
          onChange={(event) => c.setRole(event.target.value as UserRole)}
          aria-label="Роль нового пользователя"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </UsersAdminCreateFormField>

      <UsersAdminCreateFormField label="КРИЛЬ">
        <input
          className={c.inputClassName}
          value={c.credits}
          onChange={(event) => c.setCredits(event.target.value)}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder="по умолч."
          aria-label="Начальный баланс (Krill) нового пользователя"
        />
      </UsersAdminCreateFormField>

      <button type="submit" disabled={c.busy} className={c.submitClassName}>
        {c.busy ? "…" : "СОЗДАТЬ"}
      </button>

      {c.error ? (
        <div className={c.errorClassName} role="alert">
          {c.error}
        </div>
      ) : null}
    </form>
  );
}
