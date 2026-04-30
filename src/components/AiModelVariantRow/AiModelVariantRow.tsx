import type { AiVariantAdmin } from "../../api/types";
import { useAiModelVariantRow, type UseAiModelVariantRowArgs } from "./useAiModelVariantRow";
import "./AiModelVariantRow.scss";

export type AiModelVariantRowProps = UseAiModelVariantRowArgs & {
  variant: AiVariantAdmin;
};

export function AiModelVariantRow(props: AiModelVariantRowProps) {
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
        aria-label={`Сделать ${variant.slug} вариантом по умолчанию`}
      />
      <input
        key={`${variant.id}-slug`}
        defaultValue={variant.slug}
        className={c.inputSlugClassName}
        onBlur={c.onSlugBlur}
        aria-label="Slug варианта"
      />
      <input
        key={`${variant.id}-label`}
        defaultValue={variant.label}
        className={c.inputLabelClassName}
        onBlur={c.onLabelBlur}
        aria-label="Label варианта"
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
        aria-label={`Удалить вариант ${variant.slug}`}
      >
        ×
      </button>
    </div>
  );
}
