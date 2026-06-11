import { useUsersAdminDeployBranches } from "./useUsersAdminDeployBranches";
import "./UsersAdminDeployBranches.scss";

function formatUpdatedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("ru-RU");
}

export function UsersAdminDeployBranches() {
  const vm = useUsersAdminDeployBranches();
  const updatedLabel = formatUpdatedAt(vm.updatedAt);

  return (
    <section className={vm.rootClassName} aria-labelledby="users-admin-deploy-branches-title">
      <h2 id="users-admin-deploy-branches-title" className={vm.titleClassName}>
        АВТОДЕПЛОЙ · ВЕТКИ ХОСТИНГА
      </h2>

      {!vm.online ? (
        <p className={vm.offlineClassName}>
          Нет сети — список веток и сохранение недоступны.
        </p>
      ) : null}

      <div className={vm.gridClassName}>
        <label className={vm.fieldClassName}>
          <span className={vm.labelClassName}>OLDWHALE-BACKEND</span>
          <select
            className={vm.selectClassName}
            value={vm.backendBranch}
            onChange={(event) => vm.setBackendBranch(event.target.value)}
            disabled={!vm.online || vm.isLoading || vm.backendBranches.length === 0}
            aria-label="Ветка oldwhale-backend для автодеплоя"
          >
            {(vm.backendBranches.length > 0 ? vm.backendBranches : [vm.backendBranch]).map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <span className={vm.hintClassName}>
            Пуши в эту ветку запускают сборку и выкладку API на хостинге.
          </span>
        </label>

        <label className={vm.fieldClassName}>
          <span className={vm.labelClassName}>OLDWHALE-FRONTEND</span>
          <select
            className={vm.selectClassName}
            value={vm.frontendBranch}
            onChange={(event) => vm.setFrontendBranch(event.target.value)}
            disabled={!vm.online || vm.isLoading || vm.frontendBranches.length === 0}
            aria-label="Ветка oldwhale-frontend для автодеплоя"
          >
            {(vm.frontendBranches.length > 0 ? vm.frontendBranches : [vm.frontendBranch]).map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <span className={vm.hintClassName}>
            Пуши в эту ветку запускают сборку и выкладку фронтенда на хостинге.
          </span>
        </label>
      </div>

      <div className={vm.actionsClassName}>
        <button
          type="button"
          className={vm.submitClassName}
          onClick={() => void vm.onSave()}
          disabled={!vm.online || vm.isLoading || !vm.isDirty || vm.saveBusy}
        >
          {vm.saveBusy ? "СОХРАНЕНИЕ…" : "СОХРАНИТЬ ВЕТКИ"}
        </button>
        {updatedLabel ? (
          <span className={vm.metaClassName}>Обновлено: {updatedLabel}</span>
        ) : null}
      </div>

      {vm.saveError ? <p className={vm.errorClassName}>{vm.saveError}</p> : null}
    </section>
  );
}
