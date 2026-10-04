// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// SITE_URL differs for staging vs production (canonical URLs, sitemap).
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  // Only pages meant for search: no enrol form, thank-you or 404 pages (those are noindex too).
  integrations: [sitemap({ filter: (page) => !/\/(enroll|thank-you)\//.test(page) && !page.endsWith('/404/') })],
  build: { inlineStylesheets: 'always' }, // no render-blocking CSS request (G29: Lighthouse budget)
  vite: { plugins: [tailwindcss()] },
});
