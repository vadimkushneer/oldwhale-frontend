import type { DragEvent, FocusEvent } from "react";
import { useCallback, useMemo } from "react";
import type { AiVariantAdmin } from "../../api/types";
import { reorderIdsMove, type AiModelVariantPatch } from "../AiModelVariantsPanel/useAiModelVariantsPanel";

export type UseAiModelVariantRowArgs = {
  groupId: number;
  variant: AiVariantAdmin;
  busy: boolean;
  orderedVariantIds: readonly number[];
  dragVariantId: number | null;
  onDragVariantIdChange: (id: number | null) => void;
  onReorderVariantIds: (ids: number[]) => Promise<void> | void;
  onPatchVariant: (id: number, body: AiModelVariantPatch) => Promise<void> | void;
  onDeleteVariant: (id: number) => Promise<void> | void;
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
    onDragVariantIdChange(variant.id);
  }, [busy, onDragVariantIdChange, variant.id]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(() => {
    if (dragVariantId == null || dragVariantId === variant.id) return;
    const from = orderedVariantIds.indexOf(dragVariantId);
    const to = orderedVariantIds.indexOf(variant.id);
    if (from < 0 || to < 0) return;

    onReorderVariantIds(reorderIdsMove(orderedVariantIds, from, to));
    onDragVariantIdChange(null);
  }, [
    dragVariantId,
    onDragVariantIdChange,
    onReorderVariantIds,
    orderedVariantIds,
    variant.id,
  ]);

  const onSetDefault = useCallback(() => {
    onPatchVariant(variant.id, { is_default: true });
  }, [onPatchVariant, variant.id]);

  const onSlugBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextSlug = event.target.value.trim();
      if (nextSlug && nextSlug !== variant.slug) {
        onPatchVariant(variant.id, { slug: nextSlug });
      }
    },
    [onPatchVariant, variant.id, variant.slug],
  );

  const onLabelBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const nextLabel = event.target.value;
      if (nextLabel !== variant.label) {
        onPatchVariant(variant.id, { label: nextLabel });
      }
    },
    [onPatchVariant, variant.id, variant.label],
  );

  const onDelete = useCallback(() => {
    if (!confirmDelete(variant)) return;
    onDeleteVariant(variant.id);
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
    onLabelBlur,
    onDelete,
  };
}
