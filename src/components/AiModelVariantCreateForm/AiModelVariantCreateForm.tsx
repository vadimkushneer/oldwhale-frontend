import {
  useAiModelVariantCreateForm,
  type UseAiModelVariantCreateFormArgs,
} from "./useAiModelVariantCreateForm";
import "./AiModelVariantCreateForm.scss";

export type AiModelVariantCreateFormProps = UseAiModelVariantCreateFormArgs;

export function AiModelVariantCreateForm(props: AiModelVariantCreateFormProps) {
  const c = useAiModelVariantCreateForm(props);

  return (
    <form onSubmit={c.onSubmit} className={c.rootClassName}>
      <input
        className={c.inputSlugClassName}
        placeholder="slug варианта"
        value={c.slug}
        onChange={(event) => c.setSlug(event.target.value)}
        aria-label="Slug нового варианта"
      />
      <input
        className={c.inputProviderModelIdClassName}
        placeholder="provider model id"
        value={c.providerModelId}
        onChange={(event) => c.setProviderModelId(event.target.value)}
        aria-label="ID модели у провайдера (новый вариант)"
      />
      <input
        className={c.inputLabelClassName}
        placeholder="label"
        value={c.label}
        onChange={(event) => c.setLabel(event.target.value)}
        aria-label="Label нового варианта"
      />
      <button type="submit" disabled={c.busy} className={c.buttonClassName}>
        + ВАРИАНТ
      </button>
      {c.error ? <div className={c.errorClassName}>{c.error}</div> : null}
    </form>
  );
}
