// Renders public/og-default.png — the 1200×630 social share plate referenced by
// the og:image / twitter:image tags in src/layouts/BaseLayout.astro.
//
// Run: node scripts/generate-og-image.mjs
//
// The plate is drawn from the Midnight tokens in src/styles/atlas.css and the
// backdrop rules in docs/DESIGN_SYSTEM.md §2a (flat sky, seeded star field,
// one cartouche). Re-run after changing either and commit the resulting PNG.

import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/og-default.png');

const WIDTH = 1200;
const HEIGHT = 630;

// Fonts are inlined so the render does not depend on network access.
function fontData(pkg, file) {
  const path = resolve(root, 'node_modules/@fontsource', pkg, 'files', file);
  return `data:font/woff2;base64,${readFileSync(path).toString('base64')}`;
}

const cormorantItalic = fontData('cormorant-garamond', 'cormorant-garamond-latin-400-italic.woff2');
const jetbrainsMono = fontData('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2');

// Seeded PRNG (mulberry32) — the field is identical on every run.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starField() {
  const rand = mulberry32(1603);
  const parts = [];
  for (let i = 0; i < 700; i++) {
    const x = (rand() * WIDTH).toFixed(1);
    const y = (rand() * HEIGHT).toFixed(1);
    const m = Math.pow(rand(), 2.4);
    const r = (0.15 + m * 1.6).toFixed(2);
    const fill = m > 0.93 ? '#f1d98a' : '#d4b15e';
    const opacity = (0.25 + m * 0.75).toFixed(2);
    parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`);
    if (m > 0.93) {
      const len = m > 0.97 ? 9 : 5;
      parts.push(
        `<path d="M${x} ${y - len}V${+y + len}M${x - len} ${y}H${+x + len}" stroke="#f1d98a" stroke-width="0.5" opacity="0.7"/>`
      );
    }
  }
  return parts.join('');
}

const domains = [
  { name: 'Frontalia', tint: '#7aa3d4' },
  { name: 'Backendis Major', tint: '#d49a7a' },
  { name: 'Pipea Vallis', tint: '#9ec48a' },
  { name: 'Infrastructura', tint: '#c8a4d4' },
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @font-face {
    font-family: 'Cormorant Garamond';
    font-style: italic;
    font-weight: 400;
    src: url(${cormorantItalic}) format('woff2');
  }
  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 400;
    src: url(${jetbrainsMono}) format('woff2');
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0a0e1a;
    color: #e8dcb8;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }
  svg.sky { position: absolute; inset: 0; }
  .frame {
    position: absolute;
    inset: 28px;
    border: 0.5px solid rgba(212, 177, 94, 0.35);
  }
  .plate {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cartouche {
    width: 880px;
    background: rgba(20, 25, 40, 0.78);
    border: 0.5px solid rgba(212, 177, 94, 0.35);
    padding: 52px 64px 48px;
    text-align: center;
  }
  .eyebrow {
    font-size: 17px;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #a39570;
  }
  h1 {
    font-size: 84px;
    font-weight: 400;
    line-height: 1.05;
    margin-top: 22px;
  }
  .rule {
    width: 120px;
    height: 0;
    border-top: 0.5px solid #d4b15e;
    margin: 30px auto 26px;
  }
  .sub {
    font-size: 28px;
    line-height: 1.4;
    color: #e8dcb8;
  }
  .domains {
    display: flex;
    justify-content: center;
    gap: 34px;
    margin-top: 30px;
    font-size: 21px;
    color: #a39570;
  }
  .domains i { font-style: normal; margin-right: 9px; font-size: 13px; vertical-align: 2px; }
  .coord {
    position: absolute;
    bottom: 44px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-style: normal;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #5a4f33;
  }
</style>
</head>
<body>
  <svg class="sky" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${starField()}</svg>
  <div class="frame"></div>
  <div class="plate">
    <div class="cartouche">
      <p class="eyebrow">Celestial Atlas</p>
      <h1>Design Patterns of Everything</h1>
      <div class="rule"></div>
      <p class="sub">A solution architect's chart of patterns, principles and case studies</p>
      <p class="domains">
        ${domains.map((d) => `<span><i style="color:${d.tint}">●</i>${d.name}</span>`).join('')}
      </p>
    </div>
  </div>
  <p class="coord">Four constellations · Sixteen patterns · Four case studies</p>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, type: 'png' });
await browser.close();

console.log(`Wrote ${out}`);
