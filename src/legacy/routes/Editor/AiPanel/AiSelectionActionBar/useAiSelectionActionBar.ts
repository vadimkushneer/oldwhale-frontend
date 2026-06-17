import { useMemo } from "react";
import i18n from "../../../../../i18n";

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

  const selectedLabel = useMemo(
    () => i18n.t("ai.selectedCount", { count: selectedCount }),
    [selectedCount, i18n.language],
  );

  return {
    ...classNames,
    visible: selectedCount > 0,
    selectedLabel,
  };
}
