// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL differs for staging vs production (canonical URLs, sitemap).
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  build: { inlineStylesheets: 'always' }, // no render-blocking CSS request (G29: Lighthouse budget)
  vite: { plugins: [tailwindcss()] },
});
