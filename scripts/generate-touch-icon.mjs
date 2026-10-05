// Renders public/apple-touch-icon.png — the 180×180 home-screen icon linked from
// src/layouts/BaseLayout.astro — from public/favicon.svg, so the two never drift.
//
// Run: node scripts/generate-touch-icon.mjs
//
// Re-run after editing public/favicon.svg and commit the resulting PNG.

import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8');
const out = resolve(root, 'public/apple-touch-icon.png');

const SIZE = 180;

const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  svg { display: block; width: ${SIZE}px; height: ${SIZE}px; }
</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.screenshot({ path: out, type: 'png' });
await browser.close();

console.log(`Wrote ${out}`);
