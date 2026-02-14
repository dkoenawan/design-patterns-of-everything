// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://su-sentinel.github.io',
  base: '/design-patterns-of-everything',
  integrations: [react(), mdx()]
});