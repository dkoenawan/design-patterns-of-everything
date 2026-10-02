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
  { path: `${BASE}/case-studies/infra-platform-migration`,title: /.+/,                heading: /infrastructure|platform|migration/i },
  { path: `${BASE}/case-studies/frontend-micro-frontend-migration`, title: /.+/,      heading: /micro.?frontend|migration/i },
  { path: `${BASE}/case-studies/`,                       title: /case stud/i,         heading: /case stud/i },
  { path: `${BASE}/patterns-catalog`,                    title: /catalog/i,           heading: /patterns catalog/i },
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

// Every pattern detail page renders its MDX body and hydrates the Sandpack
// playground island. Waits on `load` rather than `networkidle` because the
// Sandpack preview iframe keeps fetching from the remote bundler.
const patternPages = [
  'frontend/component-composition',
  'frontend/state-management-patterns',
  'frontend/micro-frontend-architecture',
  'frontend/composition-over-inheritance',
  'backend/hexagonal-architecture',
  'backend/dependency-injection',
  'backend/strategy-pattern',
  'backend/cqrs',
  'backend/single-responsibility',
  'data/medallion-architecture',
  'data/schema-driven-validation',
  'data/pure-functions',
  'data/batch-vs-streaming',
  'infra/docker-port-mapping',
  'infra/multi-database-orchestration',
  'infra/infrastructure-as-code',
];

for (const slug of patternPages) {
  test(`pattern page renders with playground: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(`${BASE}/patterns/${slug}`);
    await page.waitForLoadState('load');

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1.pattern-title')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.pattern-body h2').first()).toBeVisible();

    // The client:only Sandpack island mounts and shows its label
    await expect(page.getByText(/^Live example ·/)).toBeVisible({ timeout: 10000 });

    expect(errors).toHaveLength(0);
  });
}

// The sitemap must list every page covered above, each exactly once, in the
// same trailing-slash form the pages declare as their canonical URL.
test('sitemap lists every page under its canonical URL', async ({ page, request }) => {
  await page.goto(`${BASE}/backend`);

  const sitemapHref = await page.locator('link[rel="sitemap"]').getAttribute('href');
  expect(sitemapHref).toBe(`${BASE}/sitemap.xml`);

  const response = await request.get(sitemapHref!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');

  const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const listed = locs.map((loc) => new URL(loc).pathname);

  const expected = [
    ...pages.map(({ path }) => path.replace(/\/?$/, '/')),
    ...patternPages.map((slug) => `${BASE}/patterns/${slug}/`),
  ];
  expect([...listed].sort()).toEqual([...expected].sort());

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(locs).toContain(canonical);
});

// The social share image named by og:image / twitter:image must actually be
// served — a missing file leaves every shared link without a preview.
test('share image referenced by og:image is served', async ({ page, request }) => {
  await page.goto(`${BASE}/backend`);

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
  expect(ogImage).toBeTruthy();
  expect(twitterImage).toBe(ogImage);

  // The tag carries the production origin; fetch the same path from this server
  const response = await request.get(new URL(ogImage!).pathname);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');

  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
});
