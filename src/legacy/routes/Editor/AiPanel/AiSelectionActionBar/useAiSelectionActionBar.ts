import { useMemo } from "react";

export function useAiSelectionActionBar({ selectedCount }: { selectedCount: number }) {
  const classNames = useMemo(
    () => ({
      rootClassName: "ai-selection-action-bar",
      countClassName: "ai-selection-action-bar__count",
      deleteButtonClassName:
        "ai-selection-action-bar__button ai-selection-action-bar__button--delete",
      cancelButtonClassName:
        "ai-selection-action-bar__button ai-selection-action-bar__button--cancel",
    }),
    [],
  );

  return {
    ...classNames,
    visible: selectedCount > 0,
    selectedLabel: `Выбрано: ${selectedCount}`,
  };
}
