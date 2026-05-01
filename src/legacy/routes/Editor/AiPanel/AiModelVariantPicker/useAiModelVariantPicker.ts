import { useMemo } from "react";

export type AiModelVariantPickerVariant = {
  id: string;
  label: string;
};

export type UseAiModelVariantPickerArgs = {
  providerId: string;
  variants: readonly AiModelVariantPickerVariant[];
  activeModelId: string;
  activeVariantId: string | undefined;
  compact?: boolean;
  onSelectVariant: (providerId: string, variantId: string) => void;
};

export function useAiModelVariantPicker({
  providerId,
  variants,
  activeModelId,
  activeVariantId,
  compact = false,
  onSelectVariant,
}: UseAiModelVariantPickerArgs) {
  const rootClassName = useMemo(
    () => `ai-model-variant-picker${compact ? " ai-model-variant-picker--compact" : ""}`,
    [compact],
  );

  const options = useMemo(
    () =>
      variants.map((variant) => {
        const active = activeModelId === providerId && activeVariantId === variant.id;
        return {
          id: variant.id,
          label: variant.label,
          active,
          optionClassName: `ai-model-variant-picker__option${
            active ? " ai-model-variant-picker__option--active" : ""
          }`,
          labelClassName: "ai-model-variant-picker__label",
          statusClassName: "ai-model-variant-picker__status",
          statusLabel: active ? "ВЫБРАНО" : "",
          onSelect: () => onSelectVariant(providerId, variant.id),
        };
      }),
    [activeModelId, activeVariantId, onSelectVariant, providerId, variants],
  );

  return {
    rootClassName,
    options,
  };
}
