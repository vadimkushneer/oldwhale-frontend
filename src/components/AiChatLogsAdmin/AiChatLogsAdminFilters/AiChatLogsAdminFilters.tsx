import type { Dispatch, FormEvent, SetStateAction } from "react";
import { AI_CHAT_LOG_FILTER_FIELDS } from "../aiChatLogsAdminQuery";
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
      {AI_CHAT_LOG_FILTER_FIELDS.map(({ key, label, placeholder }) => (
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
          ПРИМЕНИТЬ
        </button>
        <button className={neutralBtnClassName} type="button" onClick={onReset}>
          СБРОС
        </button>
        <button className={refreshBtnClassName} type="button" onClick={() => void onRefetch()}>
          ОБНОВИТЬ
        </button>
      </div>
    </form>
  );
}
