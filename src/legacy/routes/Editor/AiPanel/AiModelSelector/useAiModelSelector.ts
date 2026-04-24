import { useMemo } from "react";

export type AiModelSelectorRowModel = {
  id: string;
  label: string;
  role: string;
  free?: boolean;
};

export type AiModelSelectorRow = {
  model: AiModelSelectorRowModel;
  expanded: boolean;
  active: boolean;
};

export function useAiModelSelector({
  models,
  activeModelId,
  menuOpen,
}: {
  models: readonly AiModelSelectorRowModel[];
  activeModelId: string;
  menuOpen: boolean;
}): { rows: AiModelSelectorRow[] } {
  const rows = useMemo(
    () =>
      models.map((model) => ({
        model,
        expanded: activeModelId === model.id && menuOpen,
        active: activeModelId === model.id,
      })),
    [models, activeModelId, menuOpen],
  );
  return { rows };
}
