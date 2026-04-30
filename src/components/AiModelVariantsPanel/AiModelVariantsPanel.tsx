import type { AiGroupAdmin, AiVariantAdmin } from "../../api/types";
import { AiModelVariantCreateForm } from "../AiModelVariantCreateForm/AiModelVariantCreateForm";
import { AiModelVariantRow } from "../AiModelVariantRow/AiModelVariantRow";
import {
  useAiModelVariantsPanel,
  type AiModelVariantCreate,
  type AiModelVariantPatch,
} from "./useAiModelVariantsPanel";
import "./AiModelVariantsPanel.scss";

export type AiModelVariantsPanelProps = {
  group: Pick<AiGroupAdmin, "id" | "label" | "slug">;
  variants: AiVariantAdmin[];
  busy: boolean;
  dragVariantId: number | null;
  onDragVariantIdChange: (id: number | null) => void;
  onCreateVariant: (groupId: number, body: AiModelVariantCreate) => Promise<void> | void;
  onPatchVariant: (id: number, body: AiModelVariantPatch) => Promise<void> | void;
  onDeleteVariant: (id: number) => Promise<void> | void;
  onReorderVariantIds: (groupId: number, ids: number[]) => Promise<void> | void;
  confirmDelete?: (variant: AiVariantAdmin) => boolean;
};

export function AiModelVariantsPanel({
  group,
  variants,
  busy,
  dragVariantId,
  onDragVariantIdChange,
  onCreateVariant,
  onPatchVariant,
  onDeleteVariant,
  onReorderVariantIds,
  confirmDelete,
}: AiModelVariantsPanelProps) {
  const c = useAiModelVariantsPanel({
    groupId: group.id,
    onCreateVariant,
    onReorderVariantIds,
  });
  const orderedVariantIds = variants.map((variant) => variant.id);

  return (
    <div className={c.rootClassName}>
      <div className={c.groupClassName}>
        Группа: <span className={c.groupLabelClassName}>{group.label}</span> ({group.slug})
      </div>
      <div className={`${c.listClassName} ow-app-scrollbar`}>
        {variants.map((variant) => (
          <AiModelVariantRow
            key={variant.id}
            groupId={group.id}
            variant={variant}
            busy={busy}
            orderedVariantIds={orderedVariantIds}
            dragVariantId={dragVariantId}
            onDragVariantIdChange={onDragVariantIdChange}
            onReorderVariantIds={c.reorderVariantIds}
            onPatchVariant={onPatchVariant}
            onDeleteVariant={onDeleteVariant}
            confirmDelete={confirmDelete}
          />
        ))}
      </div>
      <AiModelVariantCreateForm busy={busy} onCreateVariant={c.createVariant} />
    </div>
  );
}
