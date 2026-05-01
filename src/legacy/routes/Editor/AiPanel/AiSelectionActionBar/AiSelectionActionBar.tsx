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
  const c = useAiSelectionActionBar({ selectedCount });

  if (!c.visible) return null;

  return (
    <div className={c.rootClassName} role="toolbar" aria-label="Действия с выбранными сообщениями">
      <span className={c.countClassName}>{c.selectedLabel}</span>
      <button type="button" className={c.deleteButtonClassName} onClick={onDeleteSelected}>
        Удалить
      </button>
      <button type="button" className={c.cancelButtonClassName} onClick={onCancel}>
        Отмена
      </button>
    </div>
  );
}
