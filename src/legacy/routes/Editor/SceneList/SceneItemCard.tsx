import type { PointerEventHandler } from "react";
import type { DesktopSceneCardMeta, SceneItem } from "./useSceneList";
import { SceneCheckbox } from "./SceneCheckbox";

export type SceneItemCardPointerHandlers = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
};

export type SceneItemCardProps = {
  scene: SceneItem;
  meta: DesktopSceneCardMeta;
  isActive: boolean;
  isSelected: boolean;
  interactionAllowed: () => boolean;
  onToggleSceneSelect: (id: string) => void;
  onDup: (id: string) => void;
  onDel: (id: string) => void;
  /** When true, root gets `scene-item-card--actions-open` for mobile action visibility. */
  mobileActionsOpen: boolean;
  /** Long-press / pointer handlers on the scene card root (mobile viewport only). */
  sceneRootPointerHandlers: SceneItemCardPointerHandlers;
};

export function SceneItemCard({
  scene,
  meta,
  isActive,
  isSelected,
  interactionAllowed,
  onToggleSceneSelect,
  onDup,
  onDel,
  mobileActionsOpen,
  sceneRootPointerHandlers,
}: SceneItemCardProps) {
  const previewMod =
    meta.previewLines === 2 ? "scene-item-card__preview--lines-2" : "scene-item-card__preview--lines-1";

  const rootClass = ["scene-item-card", mobileActionsOpen ? "scene-item-card--actions-open" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      onPointerDown={sceneRootPointerHandlers.onPointerDown}
      onPointerMove={sceneRootPointerHandlers.onPointerMove}
      onPointerUp={sceneRootPointerHandlers.onPointerUp}
      onPointerCancel={sceneRootPointerHandlers.onPointerCancel}
    >
      <SceneCheckbox
        variant="scene"
        filled={isSelected}
        actHasScenes={false}
        onClick={(e) => {
          if (!interactionAllowed()) return;
          e.stopPropagation();
          onToggleSceneSelect(scene.id);
        }}
      />

      <div className="scene-item-card__main">
        <div className="scene-item-card__headline">
          <span className={`scene-item-card__num ${isActive ? "scene-item-card__num--active" : ""}`}>
            {scene.num}.
          </span>
          <span className={`scene-item-card__title ${isActive ? "scene-item-card__title--active" : ""}`}>
            {scene.text || "—"}
          </span>
        </div>

        {meta.castText ? <div className="scene-item-card__cast">{meta.castText}</div> : null}

        {meta.previewText ? (
          <div
            className={`scene-item-card__preview ${previewMod} ${
              isActive ? "scene-item-card__preview--scene-active" : ""
            } ${meta.castText ? "scene-item-card__preview--after-cast" : ""}`}
          >
            {meta.previewText}
          </div>
        ) : null}
      </div>

      <div className="scene-item-card__actions">
        <button
          type="button"
          className="scene-item-card__btn scene-item-card__btn--dup"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDup(scene.id);
          }}
          aria-label="Дублировать сцену"
        >
          ⧉
        </button>
        <button
          type="button"
          className="scene-item-card__btn scene-item-card__btn--del"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDel(scene.id);
          }}
          aria-label="Удалить сцену"
        >
          <svg
            className="scene-item-card__del-icon"
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            aria-hidden
          >
            <line x1="1" y1="1" x2="7" y2="7" />
            <line x1="7" y1="1" x2="1" y2="7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
