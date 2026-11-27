/// <reference types="astro/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_HUB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
