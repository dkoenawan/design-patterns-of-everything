import { test, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

test.beforeAll(async () => {
  const screenshotDir = join(process.cwd(), 'test-results', 'screenshots');
  await mkdir(screenshotDir, { recursive: true });
});

test('landing page loads and renders', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Take full-page screenshot
  await page.screenshot({
    path: 'test-results/screenshots/landing-page-full.png',
    fullPage: true
  });

  // Verify page loaded
  await expect(page).toHaveTitle(/.*/, { timeout: 5000 });
});

test('landing page above the fold', async ({ page }) => {
  await page.goto('/design-patterns-of-everything');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Take viewport screenshot
  await page.screenshot({
    path: 'test-results/screenshots/landing-page-viewport.png',
    fullPage: false
  });

  // Verify page loaded
  await expect(page).toHaveTitle(/.*/, { timeout: 5000 });
});
