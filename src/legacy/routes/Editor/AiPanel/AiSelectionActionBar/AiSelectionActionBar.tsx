import { useTranslation } from "react-i18next";
import { useAiSelectionActionBar } from "./useAiSelectionActionBar";
import "./AiSelectionActionBar.scss";

export function AiSelectionActionBar({
  selectedCount,
  onDeleteSelected,
  onCancel,
}: {
  selectedCount: number;
  onDeleteSelected: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const c = useAiSelectionActionBar({ selectedCount });

  if (!c.visible) return null;

  return (
    <div className={c.rootClassName} role="toolbar" aria-label={t("ai.selectionToolbar")}>
      <span className={c.countClassName}>{c.selectedLabel}</span>
      <button type="button" className={c.deleteButtonClassName} onClick={onDeleteSelected}>
        {t("ai.delete")}
      </button>
      <button type="button" className={c.cancelButtonClassName} onClick={onCancel}>
        {t("ai.cancel")}
      </button>
    </div>
  );
}
