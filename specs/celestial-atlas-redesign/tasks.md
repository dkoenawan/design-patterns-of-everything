---
issue: 6
branch: feat/celestial-atlas-redesign
status: in-progress
test_command: npm test
last_skill_commit: 72793a4fe1962befd9535f3544acaa4a5b8bd4ce
retry_counts:
schedule: "0 */6 * * *"
budget:
  max_tasks_per_run: 3
  max_wall_clock_minutes: 90
  stop_on_first_failure: true
---

- [x] Create src/styles/atlas.css with all Midnight theme tokens, .cartouche primitive, link styles, and .page-wrapper
- [x] Update src/styles/global.css: replace brand/ imports with atlas.css, remove all Inter font imports (depends on: 1)
- [x] Update src/layouts/BaseLayout.astro: add Google Fonts link tag for Cormorant Garamond + JetBrains Mono, add color-scheme meta dark (depends on: 1)
- [x] Create src/components/AtlasBackdrop.tsx: fixed sky div + SVG paper grain filter + Milky Way diagonal band + 800 deterministic seeded stars with magnitude-varied radii and sparkle crosses for brightest (depends on: 3)
- [x] Replace Starfield.tsx usage in all 5 pages with AtlasBackdrop client:load; delete src/components/Starfield.tsx and StarfieldCanvas.css (depends on: 4)
- [x] Create src/lib/atlas-data.ts: port all domain entries (4 domains with Latinate names, world coords, tints) and all pattern entries (x/y/mag/type/complexity/note) and connection edges from prototype zip (depends on: 5)
- [x] Create src/components/AtlasMap.tsx: full-bleed pannable/zoomable SVG map with RA/Dec grid, ecliptic, domain hatched ellipses, pattern stars (5-layer anatomy), connection lines, 4 floating cartouches (title, search placeholder, legend, zoom), side drawer 420px (depends on: 6)
- [x] Rewrite src/pages/index.astro: full-bleed AtlasBackdrop + AtlasMap client:load, remove all old landing sections (Hero, About, Domains, Approach, Contact) (depends on: 7)
- [x] Create src/components/Cartouche.astro, src/components/DomainMiniMap.tsx, and src/components/PatternCatalogue.tsx (depends on: 6)
- [x] Create src/components/ComponentTreeViz.tsx: animated props-flow component tree (Page → organisms → molecules → atoms), particles cycling through 5 branches every 2.4s via requestAnimationFrame (depends on: 9)
- [x] Rewrite src/pages/frontend.astro: Frontalia domain page using Cartouche, DomainMiniMap, ComponentTreeViz, PatternCatalogue — two-column hero, featured viz cartouche, pattern catalogue, footer row (depends on: 9, 10)
- [x] Create src/components/MedallionViz.tsx: animated Bronze→Silver→Gold mote flow, 28 particles, lane spread tightens, colour shifts, ~10% rejection with red × fade-out, quality bars, requestAnimationFrame (depends on: 9)
- [ ] Rewrite src/pages/backend.astro: Backendis Major domain page from Frontalia template, terracotta tint, static placeholder for featured viz (depends on: 9)
- [ ] Rewrite src/pages/data.astro: Pipea Vallis domain page from Frontalia template, moss tint, MedallionViz as featured viz (depends on: 9, 12)
- [ ] Rewrite src/pages/infra.astro: Infrastructura domain page from Frontalia template, heather tint, static placeholder for featured viz (depends on: 9)
- [ ] Delete src/components/DomainCard.astro and src/components/Hero.astro; delete brand/ directory; audit all files and remove glass-surface, hover-lift, border-radius, box-shadow, radial-gradient, Inter font remnants (depends on: 8, 11, 13, 14, 15)
- [ ] Add href values to all 13 pattern entries in src/lib/atlas-data.ts pointing to /patterns/{domain}/{slug} routes (depends on: 6)
- [ ] Create src/pages/patterns/[...slug].astro: MDX detail page route using import.meta.glob, Celestial Atlas layout with AtlasBackdrop, breadcrumb, pattern metadata cartouche, MDX body, footer row (depends on: 3, 17)
- [ ] Update src/components/PatternCatalogue.tsx and AtlasMap.tsx side drawer to render href as "Open detail chart →" link when pattern.href is present (depends on: 9, 17, 18)
