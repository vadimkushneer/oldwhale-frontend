import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import i18n from "../../i18n";
import type { AiModelVariantCreate } from "../AiModelVariantsPanel/useAiModelVariantsPanel";

export type UseAiModelVariantCreateFormArgs = {
  busy: boolean;
  onCreateVariant: (body: AiModelVariantCreate) => Promise<void> | void;
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    return String((error as { data?: { error?: string } }).data?.error || error);
  }
  return String(error);
}

export function useAiModelVariantCreateForm({
  busy,
  onCreateVariant,
}: UseAiModelVariantCreateFormArgs) {
  const [slug, setSlug] = useState("");
  const [providerModelId, setProviderModelId] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const classNames = useMemo(
    () => ({
      rootClassName: "ai-model-variant-create-form",
      inputSlugClassName:
        "ai-model-variant-create-form__input ai-model-variant-create-form__input--slug",
      inputProviderModelIdClassName:
        "ai-model-variant-create-form__input ai-model-variant-create-form__input--provider-model-id",
      inputLabelClassName:
        "ai-model-variant-create-form__input ai-model-variant-create-form__input--label",
      buttonClassName:
        "ai-model-variant-create-form__button ai-model-variant-create-form__button--primary",
      errorClassName: "ai-model-variant-create-form__error",
    }),
    [],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      if (slug.trim().length < 2) {
        setError(i18n.t("admin.aiModels.variant.slugMinLength"));
        return;
      }
      if (!providerModelId.trim()) {
        setError(i18n.t("admin.aiModels.variant.providerModelIdRequired"));
        return;
      }

      try {
        await onCreateVariant({
          slug: slug.trim(),
          provider_model_id: providerModelId.trim(),
          label,
        });
        setSlug("");
        setProviderModelId("");
        setLabel("");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    },
    [label, onCreateVariant, providerModelId, slug],
  );

  return {
    ...classNames,
    slug,
    providerModelId,
    label,
    error,
    busy,
    setSlug,
    setProviderModelId,
    setLabel,
    onSubmit,
  };
}
