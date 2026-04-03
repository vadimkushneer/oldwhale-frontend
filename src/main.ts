import { createApp } from "vue";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";

import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";

import "./styles/tailwind.css";

const pinia = createPinia();

const app = createApp(App).use(IonicVue).use(pinia).use(router);

router.isReady().then(() => {
  const auth = useAuthStore();
  void auth.hydrate();
  app.mount("#app");
});
