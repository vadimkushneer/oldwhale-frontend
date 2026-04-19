/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_PWA_DISABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
