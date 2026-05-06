import { useCallback, useMemo } from "react";
import type { AiVariantAdmin } from "../../api/types";

export type AiModelVariantPatch = Partial<Pick<AiVariantAdmin, "slug" | "label" | "is_default">>;

export type AiModelVariantCreate = Pick<AiVariantAdmin, "slug" | "label">;

export type UseAiModelVariantsPanelArgs = {
  groupUid: string;
  onCreateVariant: (groupUid: string, body: AiModelVariantCreate) => Promise<void> | void;
  onReorderVariantIds: (groupUid: string, uids: string[]) => Promise<void> | void;
};

export function reorderIdsMove<T>(ids: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) {
    return [...ids];
  }
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function useAiModelVariantsPanel({
  groupUid,
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
    (body: AiModelVariantCreate) => onCreateVariant(groupUid, body),
    [groupUid, onCreateVariant],
  );

  const reorderVariantIds = useCallback(
    (uids: string[]) => onReorderVariantIds(groupUid, uids),
    [groupUid, onReorderVariantIds],
  );

  return {
    ...classNames,
    createVariant,
    reorderVariantIds,
  };
}
