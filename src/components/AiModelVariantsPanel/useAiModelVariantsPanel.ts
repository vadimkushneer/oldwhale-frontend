import { useCallback, useMemo } from "react";
import type { AiVariantAdmin } from "../../api/types";

export type AiModelVariantPatch = Partial<Pick<AiVariantAdmin, "slug" | "label" | "is_default">>;

export type AiModelVariantCreate = Pick<AiVariantAdmin, "slug" | "label">;

export type UseAiModelVariantsPanelArgs = {
  groupId: number;
  onCreateVariant: (groupId: number, body: AiModelVariantCreate) => Promise<void> | void;
  onReorderVariantIds: (groupId: number, ids: number[]) => Promise<void> | void;
};

export function reorderIdsMove(ids: readonly number[], from: number, to: number): number[] {
  if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) {
    return [...ids];
  }
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function useAiModelVariantsPanel({
  groupId,
  onCreateVariant,
  onReorderVariantIds,
}: UseAiModelVariantsPanelArgs) {
  const classNames = useMemo(
    () => ({
      rootClassName: "ai-model-variants-panel",
      groupClassName: "ai-model-variants-panel__group",
      groupLabelClassName: "ai-model-variants-panel__group-label",
      listClassName: "ai-model-variants-panel__list",
    }),
    [],
  );

  const createVariant = useCallback(
    (body: AiModelVariantCreate) => onCreateVariant(groupId, body),
    [groupId, onCreateVariant],
  );

  const reorderVariantIds = useCallback(
    (ids: number[]) => onReorderVariantIds(groupId, ids),
    [groupId, onReorderVariantIds],
  );

  return {
    ...classNames,
    createVariant,
    reorderVariantIds,
  };
}
