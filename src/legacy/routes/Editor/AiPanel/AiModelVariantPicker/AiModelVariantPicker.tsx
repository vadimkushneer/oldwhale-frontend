import {
  useAiModelVariantPicker,
  type AiModelVariantPickerVariant,
  type UseAiModelVariantPickerArgs,
} from "./useAiModelVariantPicker";
import "./AiModelVariantPicker.scss";

export type { AiModelVariantPickerVariant };

export type AiModelVariantPickerProps = UseAiModelVariantPickerArgs;

export function AiModelVariantPicker(props: AiModelVariantPickerProps) {
  const { providerId, variants } = props;
  const { rootClassName, options } = useAiModelVariantPicker(props);

  if (!variants.length) return null;

  return (
    <div className={rootClassName} data-provider={providerId}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.optionClassName}
          aria-pressed={option.active}
          onClick={option.onSelect}
        >
          <span className={option.labelClassName}>{option.label}</span>
          <span className={option.statusClassName}>{option.statusLabel}</span>
        </button>
      ))}
    </div>
  );
}
