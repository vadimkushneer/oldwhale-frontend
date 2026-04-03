import { createRouter, createWebHistory } from "@ionic/vue-router";
import { useAuthStore } from "@/stores/auth";

export const VALID_MODES = ["note", "film", "play", "short", "media"] as const;
export type EditorMode = (typeof VALID_MODES)[number];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "onboard", component: () => import("@/views/OnboardingView.vue") },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue") },
    { path: "/editor", redirect: "/editor/film" },
    {
      path: "/editor/:mode",
      name: "editor",
      component: () => import("@/views/EditorView.vue"),
      beforeEnter: (to) => {
        if (!VALID_MODES.includes(to.params.mode as EditorMode)) {
          return "/editor/film";
        }
      },
    },
    { path: "/admin", name: "admin", component: () => import("@/views/AdminView.vue") },
  ],
});

const AUTH_FREE_MODES: readonly string[] = ["note"];

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.name === "editor") {
    const mode = to.params.mode as string;
    if (!AUTH_FREE_MODES.includes(mode) && !auth.loggedIn) {
      return { name: "login", query: { mode, redirect: to.fullPath } };
    }
  }

  if (to.name === "admin") {
    if (!auth.loggedIn || !auth.isAdmin) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }

  if (auth.loggedIn && to.name === "login") {
    return { name: "editor", params: { mode: "film" } };
  }
});

export default router;
