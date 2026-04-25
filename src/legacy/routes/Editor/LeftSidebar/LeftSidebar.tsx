import type { KeyboardEventHandler } from "react";
import { Whale } from "../../../ui/Whale";
import { SceneList } from "../SceneList";
import { useLeftSidebar, type LeftSidebarAddAction, type LeftSidebarModeTab, type LeftSidebarProps, type LeftSidebarQuickAction, type LeftSidebarQuickActionIconName } from "./useLeftSidebar";
import "./LeftSidebar.scss";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function LeftSidebarChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className="left-sidebar__chevron"
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
      {dir === "left" ? <path d="M7.5 2.5 4 6l3.5 3.5" /> : <path d="M4.5 2.5 8 6 4.5 9.5" />}
    </svg>
  );
}

function MenuIcon() {
  return (
    <span className="left-sidebar__menu-icon" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span key={index} className="left-sidebar__menu-line" />
      ))}
    </span>
  );
}

function QuickActionIcon({ name }: { name: LeftSidebarQuickActionIconName }) {
  switch (name) {
    case "projects":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </svg>
      );
    case "new-project":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "scene-cards":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="5" width="6" height="6" rx="1.2" />
          <rect x="14" y="5" width="6" height="6" rx="1.2" />
          <rect x="4" y="13" width="6" height="6" rx="1.2" />
          <rect x="14" y="13" width="6" height="6" rx="1.2" />
        </svg>
      );
    case "search":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "marker":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 21h4.5L19 9.5a2.12 2.12 0 0 0-3-3L4.5 18 3 21z" />
          <path d="M16 6l2 2" />
        </svg>
      );
    case "warning":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 4 20 18H4z" />
          <path d="M12 9v4" />
          <circle cx="12" cy="16" r=".8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "waves":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12c2.2-4 5.8-4 8 0s5.8 4 8 0" />
          <path d="M4 16c2.2-4 5.8-4 8 0s5.8 4 8 0" />
          <path d="M4 8c2.2-4 5.8-4 8 0s5.8 4 8 0" />
        </svg>
      );
    case "sparkle":
      return (
        <svg className="left-sidebar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 14.6 9.4 21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6z" />
        </svg>
      );
  }
}

function SidebarBrand({ onToggleMenu }: Pick<LeftSidebarProps, "onToggleMenu">) {
  return (
    <div className="left-sidebar__brand">
      <div className="left-sidebar__brand-logo">
        <Whale size={22} />
      </div>
      <div className="left-sidebar__brand-copy">
        <div className="left-sidebar__brand-title">OLD WHALE</div>
        <div className="left-sidebar__brand-subtitle">РЕДАКТОР</div>
      </div>
      <button
        type="button"
        className="left-sidebar__menu-button"
        onClick={onToggleMenu}
        aria-label="Открыть меню проекта"
        title="Открыть меню проекта"
      >
        <MenuIcon />
      </button>
    </div>
  );
}

function ModeTabs({ tabs }: { tabs: readonly LeftSidebarModeTab[] }) {
  return (
    <div className="left-sidebar__mode-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cx("left-sidebar__mode-tab", tab.active && "left-sidebar__mode-tab--active")}
          title={tab.label}
          aria-label={tab.label}
          onClick={tab.onClick}
        >
          <span className="left-sidebar__mode-tab-icon" aria-hidden>
            {tab.icon}
          </span>
        </button>
      ))}
    </div>
  );
}

function StatsSummary({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="left-sidebar__stats">
      {items.map((item) => (
        <div key={item.label} className="left-sidebar__stat">
          <div className="left-sidebar__stat-label">{item.label}</div>
          <div className="left-sidebar__stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function QuickActionButton({
  action,
  getTooltipAnchorProps,
}: {
  action: LeftSidebarQuickAction;
  getTooltipAnchorProps: LeftSidebarProps["getTooltipAnchorProps"];
}) {
  return (
    <button
      type="button"
      {...getTooltipAnchorProps(action.tooltipLabel)}
      className={cx("left-sidebar__quick-action", action.active && "left-sidebar__quick-action--active")}
      aria-label={action.ariaLabel}
      onClick={action.onClick}
    >
      <QuickActionIcon name={action.iconName} />
    </button>
  );
}

function QuickActions({
  rows,
  getTooltipAnchorProps,
}: {
  rows: readonly LeftSidebarQuickAction[][];
  getTooltipAnchorProps: LeftSidebarProps["getTooltipAnchorProps"];
}) {
  return (
    <div className="left-sidebar__quick-actions">
      {rows.map((row, index) => (
        <div key={index} className="left-sidebar__quick-actions-grid">
          {row.map((action) => (
            <QuickActionButton key={action.id} action={action} getTooltipAnchorProps={getTooltipAnchorProps} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SearchPanel({
  query,
  matchesCount,
  inputRef,
  onChange,
  onClose,
  onKeyDown,
}: {
  query: string;
  matchesCount: number;
  inputRef: LeftSidebarProps["searchInputRef"];
  onChange: (value: string) => void;
  onClose: () => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <div
      className="left-sidebar__search-panel"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="left-sidebar__search-row">
        <QuickActionIcon name="search" />
        <input
          ref={inputRef}
          autoFocus
          className="left-sidebar__search-input"
          value={query}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onFocus={(event) => event.stopPropagation()}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Поиск / #тег"
          spellCheck={false}
        />
        <button
          type="button"
          className="left-sidebar__search-close"
          title="Свернуть поиск"
          aria-label="Свернуть поиск"
          onClick={onClose}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M1 1l8 8" />
            <path d="M9 1L1 9" />
          </svg>
        </button>
      </div>
      <div className="left-sidebar__search-meta">
        <div
          className={cx(
            "left-sidebar__search-count",
            matchesCount > 0 && "left-sidebar__search-count--matched",
          )}
        >
          {matchesCount > 0 ? `НАЙДЕНО: ${matchesCount}` : "НАЙДЕНО: 0"}
        </div>
        <div className="left-sidebar__search-caption">ПОДСВЕТКА В АКТИВНОМ РЕДАКТОРЕ</div>
      </div>
    </div>
  );
}

function SelectionBar({
  copyToast,
  copyLabel,
  selectionVisible,
  onCopy,
  onDelete,
}: {
  copyToast: boolean;
  copyLabel: string;
  selectionVisible: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cx(
        "left-sidebar__selection-bar",
        selectionVisible && "left-sidebar__selection-bar--visible",
      )}
    >
      {copyToast ? <div className="left-sidebar__copy-toast">✓ СКОПИРОВАНО</div> : null}
      <button
        type="button"
        className={cx(
          "left-sidebar__selection-copy",
          selectionVisible && "left-sidebar__selection-copy--active",
          copyToast && "left-sidebar__selection-copy--copied",
        )}
        onClick={onCopy}
      >
        {copyLabel}
      </button>
      <button
        type="button"
        className="left-sidebar__selection-delete"
        onClick={onDelete}
        aria-label="Удалить выбранные сцены"
        title="Удалить выбранные сцены"
      >
        🗑
      </button>
    </div>
  );
}

function AddControls({ actions }: { actions: readonly LeftSidebarAddAction[] }) {
  return (
    <div
      className={cx(
        "left-sidebar__add-actions",
        actions.length > 1 && "left-sidebar__add-actions--split",
      )}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="left-sidebar__add-button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function CreditsPanel({
  credits,
  creditsLow,
  creditsValue,
  onLogout,
}: Pick<LeftSidebarProps, "credits" | "onLogout"> & { creditsLow: boolean; creditsValue: number }) {
  return (
    <div className="left-sidebar__credits">
      <div className="left-sidebar__credits-header">
        <span className="left-sidebar__credits-title">КРЕДИТЫ</span>
        <span className={cx("left-sidebar__credits-value", creditsLow && "left-sidebar__credits-value--low")}>
          {credits}
        </span>
      </div>
      <progress
        className={cx("left-sidebar__credits-meter", creditsLow && "left-sidebar__credits-meter--low")}
        max={500}
        value={creditsValue}
        aria-label="Кредиты"
      />
      <div className="left-sidebar__credits-actions">
        <button type="button" className="left-sidebar__credits-button left-sidebar__credits-button--primary">
          ПОПОЛНИТЬ
        </button>
        <button
          type="button"
          className="left-sidebar__credits-button left-sidebar__credits-button--logout"
          onClick={onLogout}
          title="Выйти"
          aria-label="Выйти"
        >
          ⏻
        </button>
      </div>
    </div>
  );
}

export function LeftSidebar(props: LeftSidebarProps) {
  const {
    accentTone,
    rootStyle,
    modeTabs,
    statsItems,
    quickActionRows,
    deleteSelectedScenes,
    handleSearchKeyDown,
    sceneCount,
    selectionVisible,
    copyLabel,
    addActions,
    creditsValue,
    creditsLow,
  } = useLeftSidebar(props);

  const {
    editorSearchOpen,
    editorSearchQuery,
    editorSearchMatchesCount,
    searchInputRef,
    copyToast,
    getTooltipAnchorProps,
    scenes,
    accent,
    mode,
    activeSceneId,
    selectedScenes,
    getSceneCardMetaById,
    getDesktopSceneCardMeta,
    onCollapse,
    onToggleMenu,
    onCloseEditorSearch,
    onEditorSearchQueryChange,
    onCopySelectedScenes,
    onGoToScene,
    onSetActiveSceneId,
    onToggleSceneSelect,
    onToggleActSelect,
    onDupScene,
    onDeleteScene,
    onMoveScene,
    onLogout,
  } = props;

  return (
    <div
      className={cx(
        "ow-left-sidebar",
        "left-sidebar",
        `left-sidebar--accent-${accentTone}`,
      )}
      style={rootStyle}
    >
      <button
        type="button"
        className="left-sidebar__collapse-tab"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onCollapse}
        title="Свернуть левое меню"
        aria-label="Свернуть левое меню"
      >
        <LeftSidebarChevron dir="left" />
      </button>

      <SidebarBrand onToggleMenu={onToggleMenu} />
      <ModeTabs tabs={modeTabs} />
      <StatsSummary items={statsItems} />
      <QuickActions rows={quickActionRows} getTooltipAnchorProps={getTooltipAnchorProps} />

      {editorSearchOpen ? (
        <SearchPanel
          query={editorSearchQuery}
          matchesCount={editorSearchMatchesCount}
          inputRef={searchInputRef}
          onChange={onEditorSearchQueryChange}
          onClose={onCloseEditorSearch}
          onKeyDown={handleSearchKeyDown}
        />
      ) : null}

      <div className="left-sidebar__content">
        <SelectionBar
          copyToast={copyToast}
          copyLabel={copyLabel}
          selectionVisible={selectionVisible}
          onCopy={onCopySelectedScenes}
          onDelete={deleteSelectedScenes}
        />

        <div className="left-sidebar__scene-count">СЦЕНЫ — {sceneCount}</div>

        <SceneList
          scenes={scenes}
          accent={accent}
          mode={mode}
          activeSceneId={activeSceneId}
          selectedScenes={selectedScenes}
          getSceneCardMetaById={getSceneCardMetaById}
          getDesktopSceneCardMeta={getDesktopSceneCardMeta}
          onGoToScene={onGoToScene}
          onSetActiveSceneId={onSetActiveSceneId}
          onToggleSceneSelect={onToggleSceneSelect}
          onToggleActSelect={onToggleActSelect}
          onDupScene={onDupScene}
          onDelScene={onDeleteScene}
          onMoveScene={onMoveScene}
        />
      </div>

      <div className="left-sidebar__footer">
        <AddControls actions={addActions} />
        <CreditsPanel credits={props.credits} creditsLow={creditsLow} creditsValue={creditsValue} onLogout={onLogout} />
      </div>
    </div>
  );
}
