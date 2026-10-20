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

// Every card in the patterns catalog must open a real pattern page — the cards
// previously linked to /{domain}/{slug}, which does not exist.
test('patterns catalog cards link to pattern pages', async ({ page, request }) => {
  await page.goto(`${BASE}/patterns-catalog`);
  const cards = page.locator('a.pattern-card');
  await expect(cards).toHaveCount(16);

  for (const href of await cards.evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
    expect(href).toMatch(new RegExp(`^${BASE}/patterns/.+/$`));
    expect((await request.get(href)).status(), href).toBe(200);
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

// A project site lives under /design-patterns-of-everything/, where browsers do
// not probe for /favicon.ico — the icons must be linked and actually served.
test('favicon and touch icon are linked and served', async ({ page, request }) => {
  await page.goto(`${BASE}/about`);

  const icons = [
    { selector: 'link[rel="icon"]', type: 'image/svg+xml' },
    { selector: 'link[rel="apple-touch-icon"]', type: 'image/png' },
  ];
  for (const { selector, type } of icons) {
    const href = await page.locator(selector).getAttribute('href');
    expect(href).toBeTruthy();
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(type);
  }
});

// Pattern pages describe themselves to search engines as a TechArticle with a
// breadcrumb trail; the article URL must match the page's canonical URL.
test('pattern pages emit TechArticle and BreadcrumbList structured data', async ({ request }) => {
  for (const slug of patternPages) {
    const html = await (await request.get(`${BASE}/patterns/${slug}/`)).text();
    const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
    expect(script, slug).toBeTruthy();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];

    const graph = JSON.parse(script![1])['@graph'];
    const article = graph.find((node: any) => node['@type'] === 'TechArticle');
    const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
    expect(article.url, slug).toBe(canonical);
    expect(article.headline, slug).toBeTruthy();
    expect(article.description, slug).toBeTruthy();
    expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2, 3]);
    expect(breadcrumb.itemListElement[2].item, slug).toBe(canonical);
    expect(html, slug).toContain('<meta property="og:type" content="article">');
  }
});

// Case studies describe themselves as an Article with the visible
// Atlas › Domain › Study breadcrumb; the article URL must match the canonical.
test('case study pages emit Article and BreadcrumbList structured data', async ({ request }) => {
  const studies = [
    'backend-api-redesign',
    'data-pipeline-migration',
    'infra-platform-migration',
    'frontend-micro-frontend-migration',
  ];
  for (const slug of studies) {
    const html = await (await request.get(`${BASE}/case-studies/${slug}/`)).text();
    const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
    expect(script, slug).toBeTruthy();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

    const graph = JSON.parse(script![1])['@graph'];
    const article = graph.find((node: any) => node['@type'] === 'Article');
    const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
    expect(article.url, slug).toBe(canonical);
    expect(article.headline, slug).toBeTruthy();
    expect(article.description, slug).toBe(description);
    expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2, 3]);
    expect(breadcrumb.itemListElement[2].item, slug).toBe(canonical);
    expect(html, slug).toContain('<meta property="og:type" content="article">');
  }
});

// Domain overview pages describe themselves as a CollectionPage listing the
// domain's patterns, with the visible Atlas › Domain breadcrumb.
test('domain pages emit CollectionPage and BreadcrumbList structured data', async ({ request }) => {
  for (const domain of ['frontend', 'backend', 'data', 'infra']) {
    const html = await (await request.get(`${BASE}/${domain}/`)).text();
    const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
    expect(script, domain).toBeTruthy();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

    const graph = JSON.parse(script![1])['@graph'];
    const collection = graph.find((node: any) => node['@type'] === 'CollectionPage');
    const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
    expect(collection.url, domain).toBe(canonical);
    expect(collection.description, domain).toBe(description);
    const items = collection.mainEntity.itemListElement;
    expect(items.length, domain).toBeGreaterThan(0);
    expect(collection.mainEntity.numberOfItems, domain).toBe(items.length);
    for (const item of items) {
      expect(item.url, domain).toMatch(new RegExp(`${BASE}/patterns/.+/$`));
    }
    expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2]);
    expect(breadcrumb.itemListElement[1].item, domain).toBe(canonical);
  }
});

// The case-studies index describes itself as a CollectionPage listing every
// study; each list item must match that study's own Article URL.
test('case-studies index emits CollectionPage and BreadcrumbList structured data', async ({ request }) => {
  const html = await (await request.get(`${BASE}/case-studies/`)).text();
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  expect(script).toBeTruthy();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

  const graph = JSON.parse(script![1])['@graph'];
  const collection = graph.find((node: any) => node['@type'] === 'CollectionPage');
  const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
  expect(collection.url).toBe(canonical);
  expect(collection.description).toBe(description);
  const items = collection.mainEntity.itemListElement;
  expect(items).toHaveLength(4);
  expect(collection.mainEntity.numberOfItems).toBe(items.length);
  for (const item of items) {
    const study = await (await request.get(new URL(item.url).pathname)).text();
    const studyGraph = JSON.parse(study.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)![1])['@graph'];
    const article = studyGraph.find((node: any) => node['@type'] === 'Article');
    expect(item.url).toBe(article.url);
    expect(item.name).toBe(article.headline);
  }
  expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2]);
  expect(breadcrumb.itemListElement[1].item).toBe(canonical);
  expect(html).toContain('<meta property="og:type" content="website">');
});

// The anti-pattern catalog describes itself as a CollectionPage listing every
// hazard entry; each list item must point at an entry anchor on the page.
test('anti-patterns page emits CollectionPage and BreadcrumbList structured data', async ({ page, request }) => {
  const html = await (await request.get(`${BASE}/anti-patterns/`)).text();
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  expect(script).toBeTruthy();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

  const graph = JSON.parse(script![1])['@graph'];
  const collection = graph.find((node: any) => node['@type'] === 'CollectionPage');
  const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
  expect(collection.url).toBe(canonical);
  expect(collection.description).toBe(description);
  const items = collection.mainEntity.itemListElement;
  await page.goto(`${BASE}/anti-patterns/`);
  await expect(page.locator('article.entry')).toHaveCount(items.length);
  expect(collection.mainEntity.numberOfItems).toBe(items.length);
  for (const item of items) {
    const url = new URL(item.url);
    expect(`${url.origin}${url.pathname}`).toBe(canonical);
    const entry = page.locator(`article${url.hash}`);
    await expect(entry.locator('h2')).toHaveText(new RegExp(`✗\\s*${item.name}\\s*$`));
    await expect(entry).toContainText(item.description);
  }
  expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2]);
  expect(breadcrumb.itemListElement[1].item).toBe(canonical);
  expect(html).toContain('<meta property="og:type" content="website">');
});

// The patterns catalog describes itself as a CollectionPage listing every
// pattern; each list item must match that pattern page's own TechArticle URL.
test('patterns catalog emits CollectionPage and BreadcrumbList structured data', async ({ request }) => {
  const html = await (await request.get(`${BASE}/patterns-catalog/`)).text();
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  expect(script).toBeTruthy();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

  const graph = JSON.parse(script![1])['@graph'];
  const collection = graph.find((node: any) => node['@type'] === 'CollectionPage');
  const breadcrumb = graph.find((node: any) => node['@type'] === 'BreadcrumbList');
  expect(collection.url).toBe(canonical);
  expect(collection.description).toBe(description);
  const items = collection.mainEntity.itemListElement;
  expect(items).toHaveLength(patternPages.length);
  expect(collection.mainEntity.numberOfItems).toBe(items.length);
  for (const item of items) {
    const res = await request.get(new URL(item.url).pathname);
    expect(res.status(), item.url).toBe(200);
    const patternGraph = JSON.parse((await res.text()).match(/<script type="application\/ld\+json">([^<]*)<\/script>/)![1])['@graph'];
    const article = patternGraph.find((node: any) => node['@type'] === 'TechArticle');
    expect(item.url).toBe(article.url);
    expect(item.name, item.url).toBeTruthy();
    expect(item.description, item.url).toBeTruthy();
  }
  expect(breadcrumb.itemListElement.map((item: any) => item.position)).toEqual([1, 2]);
  expect(breadcrumb.itemListElement[1].item).toBe(canonical);
  expect(html).toContain('<meta property="og:type" content="website">');
});

// The about page describes itself as a ProfilePage about the Person shown in
// the identity cartouche, carrying the certifications listed on the page.
test('about page emits ProfilePage and Person structured data', async ({ request }) => {
  const html = await (await request.get(`${BASE}/about/`)).text();
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  expect(script).toBeTruthy();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

  const profile = JSON.parse(script![1]);
  expect(profile['@type']).toBe('ProfilePage');
  expect(profile.url).toBe(canonical);
  expect(profile.description).toBe(description);
  expect(profile.mainEntity['@type']).toBe('Person');
  expect(profile.mainEntity.name).toBe('Daniel Koenawan');
  expect(profile.mainEntity.hasCredential.length).toBeGreaterThan(0);
  expect(html).toContain('<meta property="og:type" content="profile">');
});

// The home page describes the site itself as a WebSite authored by the same
// Person the about page describes, so the two entities link by @id.
test('home page emits WebSite structured data linked to the about Person', async ({ request }) => {
  const html = await (await request.get(`${BASE}/`)).text();
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  expect(script).toBeTruthy();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)![1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)![1];

  const site = JSON.parse(script![1]);
  expect(site['@type']).toBe('WebSite');
  expect(site.url).toBe(canonical);
  expect(site.description).toBe(description);
  expect(site.about).toHaveLength(4);

  const about = await (await request.get(`${BASE}/about/`)).text();
  const person = JSON.parse(about.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)![1]).mainEntity;
  expect(site.author['@id']).toBe(person['@id']);
  expect(site.author.name).toBe(person.name);
  expect(html).toContain('<meta property="og:type" content="website">');
});

// The breadcrumb and footer links on each pattern page must open real pages.
test('pattern page navigation links resolve', async ({ page, request }) => {
  for (const slug of patternPages) {
    await page.goto(`${BASE}/patterns/${slug}/`, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('.breadcrumb a, .footer-row a').evaluateAll(
      (links) => links.map((a) => a.getAttribute('href')!),
    );
    expect(hrefs, slug).toHaveLength(3);
    for (const href of hrefs) {
      expect(href, slug).toMatch(new RegExp(`^${BASE}/`));
      expect((await request.get(href)).status(), `${slug}: ${href}`).toBe(200);
    }
  }
});

// Pattern pages link back to every case study whose "Patterns applied"
// sidebar lists them, so the two directions of the cross-link cannot drift.
test('pattern pages link back to the case studies that apply them', async ({ request }) => {
  const studies = [
    'backend-api-redesign',
    'data-pipeline-migration',
    'infra-platform-migration',
    'frontend-micro-frontend-migration',
  ];
  const appliedBy = new Map<string, { href: string; headline: string }[]>();
  for (const slug of studies) {
    const href = `${BASE}/case-studies/${slug}/`;
    const html = await (await request.get(href)).text();
    const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)![1];
    const headline = JSON.parse(script)['@graph'].find((node: any) => node['@type'] === 'Article').headline;
    for (const [, link] of html.matchAll(/<a href="([^"]+)" class="pattern-link"/g)) {
      if (link.startsWith(`${BASE}/anti-patterns`)) continue;
      const id = link.split('#')[1];
      expect(id, `${slug}: ${link}`).toBeTruthy();
      appliedBy.set(id, [...(appliedBy.get(id) ?? []), { href, headline }]);
    }
  }

  for (const slug of patternPages) {
    const html = await (await request.get(`${BASE}/patterns/${slug}/`)).text();
    const links = [...html.matchAll(/<a href="([^"]+)" class="applied-link"[^>]*>([^<]+)<\/a>/g)]
      .map(([, href, headline]) => ({ href, headline }));
    const expected = appliedBy.get(slug.split('/')[1]) ?? [];
    expect(links, slug).toEqual(expected);
    expect(html.includes('Applied in case studies'), slug).toBe(expected.length > 0);
  }
});

// Related-pattern links in the MDX bodies are written as source paths
// (`./cqrs.mdx`) and must be rewritten to the generated pattern pages.
test('pattern body cross-links resolve to pattern pages', async ({ request }) => {
  for (const slug of patternPages) {
    const html = await (await request.get(`${BASE}/patterns/${slug}/`)).text();
    const body = html.match(/<article class="pattern-body"[^>]*>([\s\S]*?)<\/article>/)![1];
    const hrefs = [...body.matchAll(/<a href="([^"]+)"/g)].map(([, href]) => href);
    expect(hrefs.filter((href) => href.endsWith('.mdx')), slug).toEqual([]);
    for (const href of hrefs.filter((href) => href.startsWith(`${BASE}/patterns/`))) {
      expect((await request.get(href)).status(), `${slug}: ${href}`).toBe(200);
    }
  }
});
