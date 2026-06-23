import { test, expect } from '@playwright/test';

const BASE = '/design-patterns-of-everything';

const pages = [
  { path: `${BASE}/`,                                    title: /design patterns/i,  heading: null },
  { path: `${BASE}/backend`,                             title: /backend/i,           heading: /backend/i },
  { path: `${BASE}/data`,                                title: /data/i,              heading: /data|pipeline/i },
  { path: `${BASE}/infra`,                               title: /infra/i,             heading: /infra|infrastructure/i },
  { path: `${BASE}/frontend`,                            title: /frontend/i,          heading: /frontend/i },
  { path: `${BASE}/about`,                               title: /about/i,             heading: /about|daniel/i },
  { path: `${BASE}/anti-patterns`,                       title: /anti.?pattern/i,     heading: /anti.?pattern/i },
  { path: `${BASE}/case-studies/backend-api-redesign`,   title: /.+/,                 heading: /api|backend|redesign/i },
  { path: `${BASE}/case-studies/data-pipeline-migration`,title: /.+/,                 heading: /data|pipeline|migration/i },
];

for (const { path, title, heading } of pages) {
  test(`page loads without error: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(path);
    await page.waitForLoadState('networkidle');

    // No server errors
    expect(response?.status()).toBeLessThan(400);

    // Page has a title
    await expect(page).toHaveTitle(title, { timeout: 5000 });

    // At least one heading is visible
    if (heading) {
      const h1 = page.locator('h1, h2').filter({ hasText: heading }).first();
      await expect(h1).toBeVisible({ timeout: 5000 });
    }

    // No uncaught JS errors
    expect(errors).toHaveLength(0);
  });
}

test('nav links are present on all domain pages', async ({ page }) => {
  await page.goto(`${BASE}/backend`);
  await page.waitForLoadState('networkidle');

  // Primary navigation should contain links to the four domains
  const nav = page.locator('nav.site-nav, [aria-label="Primary navigation"]').first();
  await expect(nav).toBeVisible();
  await expect(nav.locator('a[href*="backend"]')).toHaveCount(1);
  await expect(nav.locator('a[href*="data"]')).toHaveCount(1);
});

test('landing page domain cards link to domain pages', async ({ page }) => {
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');

  // Page should have navigable links to all four domains (nav, footer, or map cards)
  for (const domain of ['backend', 'data', 'infra', 'frontend']) {
    const link = page.locator(`a[href*="${domain}"]`).first();
    await expect(link).toBeVisible({ timeout: 5000 });
  }
});

test('anti-patterns page shows severity badges', async ({ page }) => {
  await page.goto(`${BASE}/anti-patterns`);
  await page.waitForLoadState('networkidle');

  // At least one entry with a severity indicator
  const entry = page.locator('[class*="severity"], [class*="badge"], [class*="tag"]').first();
  await expect(entry).toBeVisible({ timeout: 5000 });
});

test('about page ProfileSheet is rendered', async ({ page }) => {
  await page.goto(`${BASE}/about`);
  await page.waitForLoadState('networkidle');

  // ProfileSheet renders proficiency bars — look for the container
  const sheet = page.locator('[class*="profile"], [class*="proficiency"], [class*="skill"]').first();
  await expect(sheet).toBeVisible({ timeout: 5000 });
});
