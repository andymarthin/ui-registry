/// <reference types="astro/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_HUB_URL?: string;
  readonly PUBLIC_REPO_URL?: string;
  readonly UI_HUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
