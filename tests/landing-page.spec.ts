import { test, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

test.beforeAll(async () => {
  const screenshotDir = join(process.cwd(), 'test-results', 'screenshots');
  await mkdir(screenshotDir, { recursive: true });
});

test('landing page loads and renders', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'test-results/screenshots/landing-page-full.png',
    fullPage: true,
  });

  await expect(page).toHaveTitle(/.*/, { timeout: 5000 });
});

test('landing page above the fold', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'test-results/screenshots/landing-page-viewport.png',
    fullPage: false,
  });

  await expect(page).toHaveTitle(/.*/, { timeout: 5000 });
});

// ── Horizontal scroll layout tests ────────────────────────────────────────────

test('sky-track has 10 sky-panel children', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  const panelCount = await page.locator('.sky-panel').count();
  expect(panelCount).toBe(10);
});

test('scroll track is wider than viewport', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  const scrollWidth = await page.evaluate(() => {
    const track = document.querySelector('.sky-track') as HTMLElement;
    return track ? track.scrollWidth : 0;
  });
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(scrollWidth).toBeGreaterThan(viewportWidth);
});

test('domain name visible after programmatic scroll to panel 2', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  // Scroll to panel 2 (Frontend domain — index 1)
  await page.evaluate(() => {
    const track = document.querySelector('.sky-track') as HTMLElement;
    if (track) track.scrollLeft = window.innerWidth;
  });

  await page.waitForTimeout(200);

  // The domain label for Frontend should be in the DOM
  const label = page.locator('.constellation-panel__label').first();
  await expect(label).toBeVisible();
});

test('panel indicator renders correct number of dots', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  const dotCount = await page.locator('.indicator-dot').count();
  expect(dotCount).toBe(10);
});

test('first indicator dot is active on load', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');
  await page.waitForLoadState('networkidle');

  const activeDots = await page.locator('.indicator-dot.active').count();
  expect(activeDots).toBe(1);

  // The active dot should be the first one
  const firstDot = page.locator('.indicator-dot').first();
  await expect(firstDot).toHaveClass(/active/);
});
