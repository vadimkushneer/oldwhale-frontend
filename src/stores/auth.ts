import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { api, getToken, setToken, type User } from "@/api/client";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAdmin = computed(() => user.value?.role === "admin");
  const loggedIn = computed(() => !!user.value);

  async function hydrate() {
    if (!getToken()) return;
    loading.value = true;
    error.value = null;
    try {
      user.value = await api.me();
    } catch {
      setToken(null);
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function login(login: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const r = await api.login(login, password);
      setToken(r.token);
      user.value = r.user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Ошибка";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function register(login: string, email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const r = await api.register(login, email, password);
      setToken(r.token);
      user.value = r.user;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Ошибка";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    setToken(null);
    user.value = null;
  }

  function clearError() {
    error.value = null;
  }

  function setError(msg: string) {
    error.value = msg;
  }

  return {
    user,
    loading,
    error,
    isAdmin,
    loggedIn,
    hydrate,
    login,
    register,
    logout,
    clearError,
    setError,
  };
});
