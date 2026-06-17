import { useTranslation } from "react-i18next";
import {
  useAiModelVariantCreateForm,
  type UseAiModelVariantCreateFormArgs,
} from "./useAiModelVariantCreateForm";
import "./AiModelVariantCreateForm.scss";

export type AiModelVariantCreateFormProps = UseAiModelVariantCreateFormArgs;

export function AiModelVariantCreateForm(props: AiModelVariantCreateFormProps) {
  const { t } = useTranslation();
  const c = useAiModelVariantCreateForm(props);

  return (
    <form onSubmit={c.onSubmit} className={c.rootClassName}>
      <input
        className={c.inputSlugClassName}
        placeholder={t("admin.aiModels.variant.slugPlaceholder")}
        value={c.slug}
        onChange={(event) => c.setSlug(event.target.value)}
        aria-label={t("admin.aiModels.variant.slugAria")}
      />
      <input
        className={c.inputProviderModelIdClassName}
        placeholder={t("admin.aiModels.variant.providerModelIdPlaceholder")}
        value={c.providerModelId}
        onChange={(event) => c.setProviderModelId(event.target.value)}
        aria-label={t("admin.aiModels.variant.providerModelIdAria")}
      />
      <input
        className={c.inputLabelClassName}
        placeholder={t("admin.aiModels.variant.labelPlaceholder")}
        value={c.label}
        onChange={(event) => c.setLabel(event.target.value)}
        aria-label={t("admin.aiModels.variant.labelAria")}
      />
      <button type="submit" disabled={c.busy} className={c.buttonClassName}>
        {t("admin.aiModels.variant.add")}
      </button>
      {c.error ? <div className={c.errorClassName}>{c.error}</div> : null}
    </form>
  );
}
