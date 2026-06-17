import { useTranslation } from "react-i18next";
import { useUsersAdminDeployBranches } from "./useUsersAdminDeployBranches";
import "./UsersAdminDeployBranches.scss";

function formatUpdatedAt(value: string | null, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const dateLocale = locale === "en" ? "en-US" : locale === "kz" ? "kk-KZ" : "ru-RU";
  return date.toLocaleString(dateLocale);
}

export function UsersAdminDeployBranches() {
  const { t, i18n } = useTranslation();
  const vm = useUsersAdminDeployBranches();
  const updatedLabel = formatUpdatedAt(vm.updatedAt, i18n.language);

  return (
    <section className={vm.rootClassName} aria-labelledby="users-admin-deploy-branches-title">
      <h2 id="users-admin-deploy-branches-title" className={vm.titleClassName}>
        {t("admin.deployBranches.title")}
      </h2>

      {!vm.online ? (
        <p className={vm.offlineClassName}>
          {t("admin.deployBranches.offline")}
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
            aria-label={t("admin.deployBranches.backendAria")}
          >
            {(vm.backendBranches.length > 0 ? vm.backendBranches : [vm.backendBranch]).map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <span className={vm.hintClassName}>
            {t("admin.deployBranches.backendHint")}
          </span>
        </label>

        <label className={vm.fieldClassName}>
          <span className={vm.labelClassName}>OLDWHALE-FRONTEND</span>
          <select
            className={vm.selectClassName}
            value={vm.frontendBranch}
            onChange={(event) => vm.setFrontendBranch(event.target.value)}
            disabled={!vm.online || vm.isLoading || vm.frontendBranches.length === 0}
            aria-label={t("admin.deployBranches.frontendAria")}
          >
            {(vm.frontendBranches.length > 0 ? vm.frontendBranches : [vm.frontendBranch]).map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <span className={vm.hintClassName}>
            {t("admin.deployBranches.frontendHint")}
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
          {vm.saveBusy ? t("admin.common.saving") : t("admin.deployBranches.saveBranches")}
        </button>
        {updatedLabel ? (
          <span className={vm.metaClassName}>{t("admin.common.updatedAt", { date: updatedLabel })}</span>
        ) : null}
      </div>

      {vm.saveError ? <p className={vm.errorClassName}>{vm.saveError}</p> : null}
    </section>
  );
}
