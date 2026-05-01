import type { Ref } from "react";
import { useId, useState } from "react";
import {
  AiModelVariantPicker,
  type AiModelVariantPickerVariant as PickerVariant,
} from "../AiModelVariantPicker/AiModelVariantPicker";
import { useAiModelSelector, type AiModelSelectorRowModel } from "./useAiModelSelector";
import "./AiModelSelector.scss";

export type { AiModelSelectorRowModel };
export type AiModelVariantPickerVariant = PickerVariant;

export function AiModelSelector({
  models,
  activeModelId,
  activeVariantId,
  menuOpen,
  rootRef,
  onSelectProvider,
  onSelectVariant,
  variantsByProvider,
  getVariantLabel,
}: {
  models: readonly AiModelSelectorRowModel[];
  activeModelId: string;
  activeVariantId: string | undefined;
  menuOpen: boolean;
  rootRef: Ref<HTMLDivElement>;
  onSelectProvider: (id: string) => void;
  onSelectVariant: (providerId: string, variantId: string) => void;
  variantsByProvider: Record<string, readonly AiModelVariantPickerVariant[]>;
  getVariantLabel: (providerId: string, variantId?: string) => string | undefined;
}) {
  const { rows } = useAiModelSelector({ models, activeModelId, menuOpen });
  const [listExpanded, setListExpanded] = useState(true);
  const listRegionId = useId();

  return (
    <div
      ref={rootRef}
      className={`ai-model-selector${listExpanded ? "" : " ai-model-selector--list-collapsed"}`}
    >
      <button
        type="button"
        className="ai-model-selector__heading-toggle"
        aria-label="Список ИИ-моделей: показать или скрыть"
        aria-expanded={listExpanded}
        aria-controls={listRegionId}
        onClick={() => setListExpanded((v) => !v)}
        disabled={!rows.length}
      >
        <span className="ai-model-selector__heading">ИИ МОДЕЛИ{!rows.length && " — Нет доступных ИИ-моделей"}</span>
        {rows.length && <span
          className={`ai-model-selector__section-chevron ${listExpanded ? "ai-model-selector__section-chevron--open" : ""}`}
          aria-hidden
        >
          ▾
        </span>}
      </button>
      <div id={listRegionId} className="ai-model-selector__list" hidden={!listExpanded}>
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
              {expanded ? (
                <AiModelVariantPicker
                  providerId={m.id}
                  variants={variantsByProvider[m.id] ?? []}
                  activeModelId={activeModelId}
                  activeVariantId={activeVariantId}
                  onSelectVariant={onSelectVariant}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
