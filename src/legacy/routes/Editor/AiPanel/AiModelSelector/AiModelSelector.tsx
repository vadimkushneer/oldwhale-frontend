import type { CSSProperties, ReactNode, Ref } from "react";
import { BG, SH_IN, T1, T2, T3 } from "../../../../ui/tokens";
import { useAiModelSelector, type AiModelSelectorRowModel } from "./useAiModelSelector";
import "./AiModelSelector.scss";

const cssVars = {
  "--ams-bg": BG,
  "--ams-sh-in": SH_IN,
  "--ams-t1": T1,
  "--ams-t2": T2,
  "--ams-t3": T3,
  "--ams-t3-22": `${T3}22`,
} as CSSProperties;

export type { AiModelSelectorRowModel };

export function AiModelSelector({
  models,
  activeModelId,
  activeVariantId,
  menuOpen,
  rootRef,
  onSelectProvider,
  renderVariantPicker,
  getVariantLabel,
}: {
  models: readonly AiModelSelectorRowModel[];
  activeModelId: string;
  activeVariantId: string | undefined;
  menuOpen: boolean;
  rootRef: Ref<HTMLDivElement>;
  onSelectProvider: (id: string) => void;
  renderVariantPicker: (providerId: string) => ReactNode;
  getVariantLabel: (providerId: string, variantId?: string) => string | undefined;
}) {
  const { rows } = useAiModelSelector({ models, activeModelId, menuOpen });

  return (
    <div ref={rootRef} className="ai-model-selector" style={cssVars}>
      <div className="ai-model-selector__heading">ИИ МОДЕЛИ</div>
      {rows.map(({ model: m, expanded, active }) => {
        const variantLabel = active ? getVariantLabel(m.id, activeVariantId) : undefined;
        return (
          <div key={m.id} className="ai-model-selector__list-item">
            <button
              type="button"
              data-provider={m.id}
              className={`ai-model-selector__row ${active ? "ai-model-selector__row--active" : ""}`}
              onClick={() => onSelectProvider(m.id)}
            >
              <div className="ai-model-selector__row-inner">
                <div className="ai-model-selector__left">
                  <div className="ai-model-selector__dot" aria-hidden />
                  <span className="ai-model-selector__label">{m.label}</span>
                  <span className="ai-model-selector__role">{m.role}</span>
                </div>
                <div className="ai-model-selector__right">
                  {active && variantLabel ? (
                    <span className="ai-model-selector__variant-label">{variantLabel}</span>
                  ) : null}
                  {m.free && !expanded ? (
                    <span className="ai-model-selector__free-badge">FREE</span>
                  ) : null}
                  <span
                    className={`ai-model-selector__chevron ${expanded ? "ai-model-selector__chevron--open" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </div>
              </div>
            </button>
            {expanded ? renderVariantPicker(m.id) : null}
          </div>
        );
      })}
    </div>
  );
}
