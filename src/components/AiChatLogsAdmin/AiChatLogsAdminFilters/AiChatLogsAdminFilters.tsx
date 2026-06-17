import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAiChatLogFilterFields } from "../aiChatLogsAdminQuery";
import { useAiChatLogsAdminFilters } from "./useAiChatLogsAdminFilters";
import "./AiChatLogsAdminFilters.scss";

export type AiChatLogsAdminFiltersProps = {
  draft: Record<string, string>;
  setDraft: Dispatch<SetStateAction<Record<string, string>>>;
  onApply: (e: FormEvent) => void;
  onReset: () => void;
  onRefetch: () => void;
};

export function AiChatLogsAdminFilters({
  draft,
  setDraft,
  onApply,
  onReset,
  onRefetch,
}: AiChatLogsAdminFiltersProps) {
  const { t, i18n } = useTranslation();
  const filterFields = useMemo(() => getAiChatLogFilterFields(), [i18n.language]);
  const {
    formClassName,
    fieldClassName,
    labelClassName,
    inputClassName,
    actionsClassName,
    primaryBtnClassName,
    neutralBtnClassName,
    refreshBtnClassName,
  } = useAiChatLogsAdminFilters();

  return (
    <form className={formClassName} onSubmit={onApply}>
      {filterFields.map(({ key, label, placeholder }) => (
        <div key={key} className={fieldClassName}>
          <div className={labelClassName}>{label}</div>
          <input
            className={inputClassName}
            value={draft[key] ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                [key]: e.target.value,
              }))
            }
            placeholder={placeholder}
          />
        </div>
      ))}
      <div className={actionsClassName}>
        <button className={primaryBtnClassName} type="submit">
          {t("admin.common.apply")}
        </button>
        <button className={neutralBtnClassName} type="button" onClick={onReset}>
          {t("admin.common.reset")}
        </button>
        <button className={refreshBtnClassName} type="button" onClick={() => void onRefetch()}>
          {t("admin.common.refresh")}
        </button>
      </div>
    </form>
  );
}
