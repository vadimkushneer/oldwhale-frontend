import { useTranslation } from "react-i18next";
import type { AiVariantAdmin } from "../../api/types";
import { useAiModelVariantRow, type UseAiModelVariantRowArgs } from "./useAiModelVariantRow";
import "./AiModelVariantRow.scss";

export type AiModelVariantRowProps = UseAiModelVariantRowArgs & {
  variant: AiVariantAdmin;
};

export function AiModelVariantRow(props: AiModelVariantRowProps) {
  const { t } = useTranslation();
  const { variant, busy } = props;
  const c = useAiModelVariantRow(props);

  return (
    <div
      className={c.rootClassName}
      draggable={c.draggable}
      onDragStart={c.onDragStart}
      onDragOver={c.onDragOver}
      onDrop={c.onDrop}
    >
      <input
        type="radio"
        name={c.defaultRadioName}
        className={c.defaultRadioClassName}
        checked={variant.is_default}
        onChange={c.onSetDefault}
        disabled={busy}
        aria-label={t("admin.aiModels.variant.defaultAria", { slug: variant.slug })}
      />
      <input
        key={`${variant.uid}-slug`}
        defaultValue={variant.slug}
        className={c.inputSlugClassName}
        onBlur={c.onSlugBlur}
        aria-label={t("admin.aiModels.variant.slugEditAria")}
      />
      <input
        key={`${variant.uid}-provider-model-id`}
        defaultValue={variant.provider_model_id}
        className={c.inputProviderModelIdClassName}
        onBlur={c.onProviderModelIdBlur}
        aria-label={t("admin.aiModels.variant.providerModelIdEditAria")}
      />
      <input
        key={`${variant.uid}-label`}
        defaultValue={variant.label}
        className={c.inputLabelClassName}
        onBlur={c.onLabelBlur}
        aria-label={t("admin.aiModels.variant.labelEditAria")}
      />
      <button
        type="button"
        disabled={busy}
        onClick={c.onSetDefault}
        className={c.defaultButtonClassName}
      >
        DEF
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={c.onDelete}
        className={c.deleteButtonClassName}
        aria-label={t("admin.aiModels.variant.deleteAria", { slug: variant.slug })}
      >
        ×
      </button>
    </div>
  );
}
