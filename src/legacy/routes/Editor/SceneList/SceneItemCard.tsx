import type { DesktopSceneCardMeta, SceneItem } from "./useSceneList";
import { EditorActionButtons } from "../EditorActionButtons/EditorActionButtons";
import { SceneCheckbox } from "./SceneCheckbox";

export type SceneItemCardProps = {
  scene: SceneItem;
  meta: DesktopSceneCardMeta;
  isActive: boolean;
  isSelected: boolean;
  interactionAllowed: () => boolean;
  onToggleSceneSelect: (id: string) => void;
  onDup: (id: string) => void;
  onDel: (id: string) => void;
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
}: SceneItemCardProps) {
  const previewMod =
    meta.previewLines === 2 ? "scene-item-card__preview--lines-2" : "scene-item-card__preview--lines-1";

  return (
    <div className="scene-item-card">
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
        <EditorActionButtons
          variant="scene-card"
          duplicateLabel="Дублировать сцену"
          deleteLabel="Удалить сцену"
          onDuplicate={() => onDup(scene.id)}
          onDelete={() => onDel(scene.id)}
        />
      </div>
    </div>
  );
}
