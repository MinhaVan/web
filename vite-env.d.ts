/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // adicione outras variáveis se tiver
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
