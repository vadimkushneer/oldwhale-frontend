import { ReactNode, useEffect } from "react";
import { IonContent, IonPage, isPlatform } from "@ionic/react";

/**
 * Wraps a route element in Ionic's page primitives so the surrounding
 * `IonApp` can manage status bar, safe-area insets, and lifecycle on
 * Capacitor WebViews.
 *
 * The legacy editor expects edge-to-edge layout and manages its own
 * scrolling/overflow inside the page. We therefore disable
 * `IonContent`'s built-in scrolling (`scrollY={false}`) and strip its
 * default 16px padding (`ion-no-padding`). Visible padding/scroll inside
 * each route stays the responsibility of that route's existing markup.
 */
export interface IonicRouteShellProps {
  children: ReactNode;
}

export function IonicRouteShell({ children }: IonicRouteShellProps) {
  useEffect(() => {
    /**
     * Capacitor's StatusBar plugin is dynamically imported only when the
     * app is actually running inside a native shell. Doing this at module
     * scope would break the web bundle (the plugin throws when invoked in
     * a regular browser).
     */
    if (!isPlatform("capacitor")) return;
    let cancelled = false;
    void import("@capacitor/status-bar")
      .then(({ StatusBar, Style }) => {
        if (cancelled) return;
        return StatusBar.setStyle({ style: Style.Dark });
      })
      .catch(() => {
        /* status bar plugin missing or unsupported — ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} className="ion-no-padding">
        {children}
      </IonContent>
    </IonPage>
  );
}
