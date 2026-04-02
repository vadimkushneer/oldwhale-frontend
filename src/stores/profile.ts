import { defineStore } from "pinia";
import { ref } from "vue";

export type ProfileChoice = {
  id: string;
  label: string;
  mode: string;
  color: string;
};

export const useProfileStore = defineStore("profile", () => {
  const profile = ref<ProfileChoice | null>(null);

  function setProfile(p: ProfileChoice) {
    profile.value = p;
    try {
      localStorage.setItem("ow_profile", JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem("ow_profile");
      if (raw) profile.value = JSON.parse(raw);
    } catch {
      profile.value = null;
    }
  }

  function clear() {
    profile.value = null;
    try {
      localStorage.removeItem("ow_profile");
    } catch {
      /* ignore */
    }
  }

  return { profile, setProfile, loadFromStorage, clear };
});
