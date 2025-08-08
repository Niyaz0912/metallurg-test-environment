/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ✅ Только кастомные переменные с префиксом VITE_
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

