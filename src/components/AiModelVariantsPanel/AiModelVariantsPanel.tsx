import { useTranslation } from "react-i18next";
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
  group: Pick<AiGroupAdmin, "uid" | "label" | "slug">;
  variants: AiVariantAdmin[];
  busy: boolean;
  dragVariantId: string | null;
  onDragVariantIdChange: (uid: string | null) => void;
  onCreateVariant: (groupUid: string, body: AiModelVariantCreate) => Promise<void> | void;
  onPatchVariant: (uid: string, body: AiModelVariantPatch) => Promise<void> | void;
  onDeleteVariant: (uid: string) => Promise<void> | void;
  onReorderVariantIds: (groupUid: string, uids: string[]) => Promise<void> | void;
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
  const { t } = useTranslation();
  const c = useAiModelVariantsPanel({
    groupUid: group.uid,
    onCreateVariant,
    onReorderVariantIds,
  });
  const orderedVariantIds = variants.map((variant) => variant.uid);

  return (
    <div className={c.rootClassName}>
      <div className={c.groupClassName}>
        {t("admin.aiModels.groupPrefix")}{" "}
        <span className={c.groupLabelClassName}>{group.label}</span> ({group.slug})
      </div>
      <div className={`${c.listClassName} ow-app-scrollbar`}>
        {variants.map((variant) => (
          <AiModelVariantRow
            key={variant.uid}
            groupId={group.uid}
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
