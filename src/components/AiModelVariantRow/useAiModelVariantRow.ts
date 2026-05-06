import type { DragEvent, FocusEvent } from "react";
import { useCallback, useMemo } from "react";
import type { AiVariantAdmin } from "../../api/types";
import { reorderIdsMove, type AiModelVariantPatch } from "../AiModelVariantsPanel/useAiModelVariantsPanel";

export type UseAiModelVariantRowArgs = {
  groupId: string;
  variant: AiVariantAdmin;
  busy: boolean;
  orderedVariantIds: readonly string[];
  dragVariantId: string | null;
  onDragVariantIdChange: (uid: string | null) => void;
  onReorderVariantIds: (uids: string[]) => Promise<void> | void;
  onPatchVariant: (uid: string, body: AiModelVariantPatch) => Promise<void> | void;
  onDeleteVariant: (uid: string) => Promise<void> | void;
  confirmDelete?: (variant: AiVariantAdmin) => boolean;
};

function confirmDeleteVariant(variant: AiVariantAdmin): boolean {
  return window.confirm(`Удалить вариант ${variant.slug}?`);
}

export function useAiModelVariantRow({
  groupId,
  variant,
  busy,
  orderedVariantIds,
  dragVariantId,
  onDragVariantIdChange,
  onReorderVariantIds,
  onPatchVariant,
  onDeleteVariant,
  confirmDelete = confirmDeleteVariant,
}: UseAiModelVariantRowArgs) {
  const classNames = useMemo(
    () => ({
      rootClassName: "ai-model-variant-row",
      defaultRadioClassName: "ai-model-variant-row__default-radio",
      inputSlugClassName: "ai-model-variant-row__input ai-model-variant-row__input--slug",
      inputProviderModelIdClassName:
        "ai-model-variant-row__input ai-model-variant-row__input--provider-model-id",
      inputLabelClassName: "ai-model-variant-row__input ai-model-variant-row__input--label",
      defaultButtonClassName:
        "ai-model-variant-row__button ai-model-variant-row__button--default",
      deleteButtonClassName:
        "ai-model-variant-row__button ai-model-variant-row__button--delete",
    }),
    [],
  );

  const onDragStart = useCallback(() => {
    if (busy) return;
    onDragVariantIdChange(variant.uid);
  }, [busy, onDragVariantIdChange, variant.uid]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(() => {
    if (dragVariantId == null || dragVariantId === variant.uid) return;
    const from = orderedVariantIds.indexOf(dragVariantId);
    const to = orderedVariantIds.indexOf(variant.uid);
    if (from < 0 || to < 0) return;

    onReorderVariantIds(reorderIdsMove(orderedVariantIds, from, to));
    onDragVariantIdChange(null);
  }, [
    dragVariantId,
    onDragVariantIdChange,
    onReorderVariantIds,
    orderedVariantIds,
    variant.uid,
  ]);

  const onSetDefault = useCallback(() => {
    onPatchVariant(variant.uid, { is_default: true });
  }, [onPatchVariant, variant.uid]);

  const onProviderModelIdBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const next = event.target.value.trim();
      if (next && next !== variant.provider_model_id) {
        onPatchVariant(variant.uid, { provider_model_id: next });
      }
    },
    [onPatchVariant, variant.uid, variant.provider_model_id],
  );

  const onSlugBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextSlug = event.target.value.trim();
      if (nextSlug && nextSlug !== variant.slug) {
        onPatchVariant(variant.uid, { slug: nextSlug });
      }
    },
    [onPatchVariant, variant.uid, variant.slug],
  );

  const onLabelBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextLabel = event.target.value;
      if (nextLabel !== variant.label) {
        onPatchVariant(variant.uid, { label: nextLabel });
      }
    },
    [onPatchVariant, variant.uid, variant.label],
  );

  const onDelete = useCallback(() => {
    if (!confirmDelete(variant)) return;
    onDeleteVariant(variant.uid);
  }, [confirmDelete, onDeleteVariant, variant]);

  return {
    ...classNames,
    defaultRadioName: `def-${groupId}`,
    draggable: !busy,
    onDragStart,
    onDragOver,
    onDrop,
    onSetDefault,
    onSlugBlur,
    onProviderModelIdBlur,
    onLabelBlur,
    onDelete,
  };
}
