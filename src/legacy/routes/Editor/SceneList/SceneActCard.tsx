import type { SceneItem } from "./useSceneList";
import { SceneCheckbox } from "./SceneCheckbox";

export type SceneActCardProps = {
  scene: SceneItem;
  mode: string;
  isActive: boolean;
  actTitle: string;
  numLabel: string | null;
  actAllSelected: boolean;
  actSceneCount: number;
  interactionAllowed: () => boolean;
  onToggleActSelect: (actNum: number) => void;
};

export function SceneActCard({
  scene,
  mode,
  isActive,
  actTitle,
  numLabel,
  actAllSelected,
  actSceneCount,
  interactionAllowed,
  onToggleActSelect,
}: SceneActCardProps) {
  const actNum = scene.actNum ?? 0;

  return (
    <div className="scene-act-card">
      <SceneCheckbox
        variant="act"
        filled={actAllSelected}
        actHasScenes={actSceneCount > 0}
        onClick={(e) => {
          if (!interactionAllowed()) return;
          e.stopPropagation();
          onToggleActSelect(actNum);
        }}
      />
      {mode !== "film" && numLabel !== null ? (
        <span className={`scene-act-card__num ${isActive ? "scene-act-card__num--active" : ""}`}>
          {numLabel}
        </span>
      ) : null}
      <span className="scene-act-card__title">{actTitle}</span>
    </div>
  );
}
