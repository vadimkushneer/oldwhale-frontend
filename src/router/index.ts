import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "onboard", component: () => import("@/views/OnboardingView.vue") },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue") },
    { path: "/editor", name: "editor", component: () => import("@/views/EditorView.vue") },
    { path: "/admin", name: "admin", component: () => import("@/views/AdminView.vue") },
  ],
});

router.beforeEach((to) => {
  if (to.name === "admin") {
    const auth = useAuthStore();
    if (!auth.loggedIn || !auth.isAdmin) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }
});

export default router;
