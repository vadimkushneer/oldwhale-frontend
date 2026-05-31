import type { ComponentType } from "react";

/**
 * EditorShellProps — what the editor shell hands to every per-mode editor.
 *
 * Mirrors the props EditorPage already builds for EditorScreen, MINUS `routeMode`:
 * each per-mode shell fixes its own mode, so the route component is the single
 * source of "which mode this is". As mode-specific rendering/logic migrates out
 * of the god component into FilmEditor/PlayEditor/… these props stay the stable
 * boundary between the route layer and the editor.
 */
export interface EditorProfile {
  mode?: string;
  id?: string;
  label?: string;
  color?: string;
  desc?: string;
  num?: string;
}

export interface EditorShellProps {
  profile: EditorProfile;
  isGuest: boolean;
  onLogout: () => void;
  onGoHome: () => void;
  onLogin: () => void;
  onModeRouteChange: (nextMode: string) => void;
  routeAiVariantGuid: string | undefined;
  onAiVariantRouteStateChange: (aiVariantGuid: string) => void;
  showAdminLink: boolean;
}

export type EditorShellComponent = ComponentType<EditorShellProps>;
