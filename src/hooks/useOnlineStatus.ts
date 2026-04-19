import { useEffect, useState } from "react";

/**
 * Subscribes to the browser's online/offline events and returns the current
 * connectivity status. Defaults to `true` during SSR or when `navigator` is
 * not defined so the UI never flashes an offline state on the server.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
