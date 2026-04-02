import { onMounted, onUnmounted, ref } from "vue";

export function useWindowWidth() {
  const w = ref(typeof window !== "undefined" ? window.innerWidth : 1200);
  function handler() {
    w.value = window.innerWidth;
  }
  onMounted(() => window.addEventListener("resize", handler));
  onUnmounted(() => window.removeEventListener("resize", handler));
  return w;
}
