import type { APIRoute } from 'astro';
import { patterns } from '../lib/atlas-data';

// Keys only — the modules are never loaded. Static pages come from the files
// in this directory; pattern pages come from the same pattern list + MDX glob
// that drive getStaticPaths in patterns/[...slug].astro, so a new page or
// pattern appears in the sitemap without touching this file.
const pageFiles = Object.keys(import.meta.glob('./**/*.astro'));
const patternFiles = Object.keys(import.meta.glob('../../docs/patterns/**/*.mdx'));

const staticPaths = pageFiles
  .filter((file) => !file.includes('['))
  .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''));

const patternIds = new Set(
  patternFiles.map((file) => file.split('/').pop()!.replace(/\.mdx$/, ''))
);
const patternPaths = patterns
  .filter((p) => p.href && patternIds.has(p.id))
  .map((p) => p.href!.replace(/^\//, ''));

export const GET: APIRoute = ({ site }) => {
  const root = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);

  // Trailing slash matches the canonical URL each page declares in BaseLayout.
  const urls = [...staticPaths, ...patternPaths]
    .map((path) => new URL(path ? `${path}/` : '', root).href)
    .sort();

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
