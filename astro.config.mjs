import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.ASTRO_SITE || undefined;
const base = process.env.ASTRO_BASE || '/';

export default defineConfig({
  output: 'static',
  ...(site ? { site } : {}),
  base,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
