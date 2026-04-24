import type { CSSProperties, ReactNode, Ref } from "react";
import { AiMessageList, type AiMessageListMessage } from "./AiMessageList";
import { AiModelSelector, type AiModelSelectorRowModel } from "./AiModelSelector";
import { useAiPanel } from "./useAiPanel";
import "./AiPanel.scss";

function AiPanelChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className="ai-panel-chevron"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M7.5 2.5 4 6l3.5 3.5" />
      ) : (
        <path d="M4.5 2.5 8 6 4.5 9.5" />
      )}
    </svg>
  );
}

export type { AiMessageListMessage, AiModelSelectorRowModel };

export function AiPanel({
  width,
  sidebarWidth,
  onWidthChange,
  onCollapse,
  composerHeight,
  onComposerHeightChange,
  models,
  activeModelId,
  activeVariantId,
  modelMenuOpen,
  modelMenuRootRef,
  onSelectProvider,
  renderVariantPicker,
  getVariantLabel,
  messages,
  loading,
  messagesEndRef,
  getProviderColor,
  composer,
  creditsLabel,
  previewOverlay,
  tooltip,
  accent,
}: {
  width: number;
  sidebarWidth: number;
  onWidthChange: (w: number) => void;
  onCollapse: () => void;
  composerHeight: number;
  onComposerHeightChange: (h: number) => void;
  models: readonly AiModelSelectorRowModel[];
  activeModelId: string;
  activeVariantId: string | undefined;
  modelMenuOpen: boolean;
  modelMenuRootRef: Ref<HTMLDivElement>;
  onSelectProvider: (id: string) => void;
  renderVariantPicker: (providerId: string) => ReactNode;
  getVariantLabel: (providerId: string, variantId?: string) => string | undefined;
  messages: readonly AiMessageListMessage[];
  loading: boolean;
  messagesEndRef: Ref<HTMLDivElement>;
  getProviderColor: (modelId?: string) => string;
  composer: ReactNode;
  creditsLabel: string;
  previewOverlay?: ReactNode;
  tooltip?: ReactNode;
  accent: string;
}) {
  const { cssVars, onHorizontalResizeMouseDown, onComposerGripMouseDown } = useAiPanel({
    width,
    sidebarWidth,
    onWidthChange,
    composerHeight,
    onComposerHeightChange,
    accent,
  });

  return (
    <div className="ai-panel" style={cssVars as CSSProperties}>
      <div
        className="ai-panel__resizer"
        onMouseDown={onHorizontalResizeMouseDown}
        role="separator"
        aria-orientation="vertical"
      />
      <div className="ai-panel__sidebar">
        <button
          type="button"
          className="ai-panel__collapse-tab"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCollapse}
          title="Свернуть ИИ-панель"
        >
          <AiPanelChevron dir="right" />
        </button>

        <AiModelSelector
          models={models}
          activeModelId={activeModelId}
          activeVariantId={activeVariantId}
          menuOpen={modelMenuOpen}
          rootRef={modelMenuRootRef}
          onSelectProvider={onSelectProvider}
          renderVariantPicker={renderVariantPicker}
          getVariantLabel={getVariantLabel}
        />

        <AiMessageList
          messages={messages}
          loading={loading}
          endRef={messagesEndRef}
          getProviderColor={getProviderColor}
        />

        <div className="ai-panel__composer-wrap">
          <div
            className="ai-panel__composer-grip"
            onMouseDown={onComposerGripMouseDown}
            title="Тянуть вверх/вниз"
          >
            <div className="ai-panel__composer-grip-handle" />
          </div>
          {composer}
          <div className="ai-panel__credits">{creditsLabel}</div>
        </div>

        {previewOverlay ?? null}
        {tooltip ?? null}
      </div>
    </div>
  );
}
