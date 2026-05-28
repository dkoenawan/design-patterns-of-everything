# Celestial Atlas Redesign — Feature Spec

**Feature**: Full visual redesign from stellar-cartography-v1 to the Celestial Atlas design system  
**Type**: Extends existing — all 5 pages rebuilt, shared component system introduced  
**Complexity**: Deep — pannable SVG map, animated React visualisations, shared component system  
**Design authority**: `DESIGN_SYSTEM.md` (in `claude-design/artefacts_v01/design system of everything.zip`)  
**Prototype source**: same zip — `atlas.jsx`, `frontend.jsx`, `data.jsx`, `atlas-backdrop.jsx`, `atlas-data.js`

---

## 1 · Context

The site currently uses a "stellar cartography v1" aesthetic with glassmorphism cards, Inter body font, and radial-gradient backgrounds. These are explicitly forbidden by the new design system. The target is a **Celestial Atlas** — a printed cartographic instrument aesthetic. Patterns are stars. Domains are constellations. The entry point is a pannable/zoomable SVG map.

**What's wrong with the current UI:**
- `glass-surface` cards with `border-radius` and `box-shadow` lifts — forbidden
- Inter body font — must be Cormorant Garamond italic everywhere
- Radial-gradient backgrounds — forbidden; sky is flat `#0a0e1a`
- Domain pages are 4 copies of the same inline-styled template — no shared components
- No nav bar, no footer (Atlas has neither; domain pages have a minimal footer row only)
- No pannable Atlas map (the flagship feature is missing entirely)
- Pattern cards show "detail page coming soon" — no real content

---

## 2 · Design System (authoritative — §15 checklist applies to every PR)

### 2.1 Colour tokens — Midnight theme (canonical)

```css
--sky:          #0a0e1a;   /* flat — NO radial-gradient backgrounds */
--ink:          #e8dcb8;   /* primary text */
--ink-dim:      #a39570;   /* muted text, secondary labels */
--ink-faint:    #5a4f33;   /* hairlines, caption text */
--gold:         #d4b15e;   /* default star */
--gold-bright:  #f1d98a;   /* principle / highlight / hover */
--line:         rgba(212, 177, 94, 0.28);   /* same-domain connection */
--line-faint:   rgba(212, 177, 94, 0.10);   /* cross-domain, grid */
--anti:         #c46a55;   /* anti-pattern marks only */
--paper:        rgba(20, 25, 40, 0.78);     /* cartouche fill (blurred) */
--paper-border: rgba(212, 177, 94, 0.35);

/* Domain tints — hatched fills ONLY, never solid or radial */
--tint-frontend: #7aa3d4;  /* steel blue */
--tint-backend:  #d49a7a;  /* terracotta */
--tint-data:     #9ec48a;  /* moss */
--tint-infra:    #c8a4d4;  /* heather */

/* Medallion stage colours */
--bronze:     #c08850;
--silver:     #b8c4cf;
--gold-medal: #e8c870;
```

### 2.2 Typography

Two families. That is the budget.

```
Google Fonts: Cormorant Garamond (ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700)
              JetBrains Mono (wght@400;500)

Also available via @fontsource (already installed):
  @fontsource/cormorant-garamond/400.css  (use italic variant)
  @fontsource/jetbrains-mono/400.css
```

| Use | Family | Style |
|-----|--------|-------|
| All display & body text | Cormorant Garamond | **italic 400** — default everything |
| Emphasis | Cormorant Garamond | italic 600 — use sparingly |
| Coordinates, magnitudes, table cells, catalogue numbers | JetBrains Mono | regular 400 |

**Type scale:**
```
Hero domain name   96px  italic 400  line-height 0.95  clamp(48px, 6.5vw, 96px)
Page title         72px  italic 400
Section heading    48px  italic 400
Subsection         38px  italic 400  line-height 1.05
Pattern name       42px  italic 400
Body large         22px  italic 400  line-height 1.45
Body               17px  italic 400  line-height 1.55
Caption            13px  italic 400  letter-spacing 0.5
Eyebrow            10px  italic 400  letter-spacing 3px  UPPERCASE
Mono coordinate    11px  regular     letter-spacing 1.5
```

**Critical rules:**
- Default to italic. Roman is the exception (monospace blocks only).
- `text-wrap: pretty` on every body paragraph.
- Eyebrow labels: `✦  label  ✦` with `letter-spacing: 3px`.
- Never `font-weight: bold` on body.

### 2.3 Cartouche — the only container primitive

```css
.cartouche {
  background: var(--paper);
  border: 0.5px solid var(--paper-border);
  backdrop-filter: blur(8px) saturate(110%);
  padding: 18px 26px;
  /* NO border-radius. NO box-shadow. NO drop-shadow. */
}
```

Rules:
- `border-radius: 0` always. Cartouches are rectangular. The atlas is printed.
- No solid-colour cards. Every panel is translucent paper over sky.
- Hairline borders only. Never thicker than 0.5px.

### 2.4 Backdrop layer stack (every page)

```
1. Sky              flat #0a0e1a div, position:fixed, z-index:-1, inset:0
2. Paper grain      SVG feTurbulence baseFrequency="0.85" numOctaves="2",
                    opacity 0.06, mix-blend-mode: screen
3. Milky Way band   single diagonal <polygon>, linearGradient gold @ 0.022 peak opacity,
                    Gaussian blur stdDeviation="6". Critically subtle.
4. Star field       800 deterministic seeded stars.
                    mag = Math.pow(seededRand(), 2.4)
                    radius = 0.2 + mag * 1.6
                    Brightest 7% (mag > 0.93): small sparkle cross lines
                    Brightest 2% (mag > 0.97): longer cross + halo
                    Never identical radial blobs.
```

On the Atlas: star field lives inside the world `<svg>` so it pans with the chart.  
On detail pages: star field is fixed to the viewport.

### 2.5 Glyph set (exhaustive — never invent new ones, never use emoji)

| Glyph | Meaning | Where |
|-------|---------|-------|
| `✦` | Principle / decorative pip | Eyebrow brackets, lodestars, separators |
| `●` | Pattern (filled star) | Legends, lists |
| `◌` | Anti-pattern (dashed star) | Legends only |
| `✗` | Smell / rejected / anti | Inline lists |
| `◆` | Filled complexity diamond | Complexity meter |
| `◇` | Empty complexity diamond | Complexity meter |
| `→` | Cross-reference / "see also" | Adjacent stars lists |
| `←` | Return to atlas | Breadcrumbs |
| `·` | Inline separator | Between metadata fields |
| `—` | Subtitle dashes | `— the Frontend Reach —` |

### 2.6 Domain constellation names

| Domain | Constellation | Subtitle | Chart | Tint |
|--------|--------------|---------|-------|------|
| Frontend | Frontalia | the Frontend Reach | Chart i | `--tint-frontend` |
| Backend | Backendis Major | the Backend Expanse | Chart ii | `--tint-backend` |
| Data Pipeline | Pipea Vallis | the Data Confluence | Chart iii | `--tint-data` |
| Infrastructure | Infrastructura | the Platform Frontier | Chart iv | `--tint-infra` |

### 2.7 Spacing (4px base)

```
4   hairline gap between siblings
8   tight stack
14  cartouche internal column
18  cartouche internal row
24  between paragraphs
32  small section gap
48  major column gap
72  hero → body
96  page bottom
```

Page wrapper: `padding: 48px clamp(28px, 5vw, 64px) 96px`  
Cartouche: `padding: 18px 26px`  
Never uniform 16/24/32.

### 2.8 Motion

- **Hover**: 150ms colour shift to `--gold-bright`. No transform. No scale. No shadow.
- **Drawer open**: 350ms, ease-out, translate 40px → 0 + fade.
- **Mote animations**: linear, perpetual `requestAnimationFrame`.
- **No parallax. No scroll-triggered reveals. No spring physics.**

### 2.9 Anti-patterns to refuse (§13)

❌ Gradient text on titles  
❌ Radial-gradient page backgrounds  
❌ Glassmorphism cards with rounded corners  
❌ Emoji anywhere in UI  
❌ Lucide / Heroicon line icons  
❌ `box-shadow` card-lift effects  
❌ `border-radius` on cartouches  
❌ Inter / Roboto / system-ui as display type  
❌ `hover:scale-105` transforms  
❌ "Get Started →" marketing buttons  
❌ Three-column "Features" grids  
❌ Marketing voice ("Discover," "Unlock," "Empower," "Seamlessly")  

---

## 3 · Data Model

No database. Pattern data lives in `src/lib/atlas-data.ts` — single source of truth.

```ts
// src/lib/atlas-data.ts

export type PatternType = 'pattern' | 'principle' | 'anti';
export type DomainId = 'frontend' | 'backend' | 'data' | 'infra';

export interface Domain {
  id: DomainId;
  name: string;          // Latinate: "Frontalia"
  subtitle: string;      // "the Frontend Reach"
  english: string;       // "Frontend Architecture"
  blurb: string;
  cx: number;            // world coordinate centre x
  cy: number;            // world coordinate centre y
  rx: number;            // ellipse x-radius (360)
  ry: number;            // ellipse y-radius (280)
  tint: string;          // hex colour for hatched fill
  href: string;          // relative URL to domain detail page
}

export interface Pattern {
  id: string;            // kebab-case, unique across all domains
  domain: DomainId;
  name: string;
  x: number;             // world coordinate (-1100..1100)
  y: number;             // world coordinate (-700..700)
  mag: number;           // 0.4 (dim) .. 1.6 (brightest)
  type: PatternType;
  complexity: 1 | 2 | 3 | 4 | 5;
  note: string;          // one sentence, declarative, printed-book voice
  href?: string;         // link to MDX detail page once wired
}

export interface Connection {
  from: string;          // pattern id
  to: string;            // pattern id
  cross?: boolean;       // true = cross-domain (dashed line)
}
```

**Population**: Port all entries from `atlas-data.js` in the prototype zip. All 13 existing MDX patterns must have a corresponding entry. Add new patterns by:
1. Creating an MDX file in `docs/patterns/{domain}/`
2. Adding a record to `src/lib/atlas-data.ts` with `(x, y)` inside the domain ellipse and 1–3 connections

**Domain world coordinates (from prototype):**
- Frontalia: `cx: -780, cy: -420, rx: 360, ry: 280`
- Backendis Major: `cx: 780, cy: -420, rx: 360, ry: 280`
- Pipea Vallis: `cx: 780, cy: 420, rx: 360, ry: 280`
- Infrastructura: `cx: -780, cy: 420, rx: 360, ry: 280`

---

## 4 · Components

### 4.1 `src/components/AtlasBackdrop.tsx` — shared backdrop

Props: `fixed?: boolean` (default true for detail pages; false for Atlas where it's embedded in the SVG world)

Implementation — port from `atlas-backdrop.jsx`:
```
div.sky-layer    position:fixed (or absolute), inset:0, z-index:-1, background:#0a0e1a
svg.backdrop     position:fixed, inset:0, pointer-events:none, z-index:0
  <filter id="grain"> feTurbulence baseFrequency="0.85" numOctaves="2" </filter>
  <rect filter="url(#grain)" opacity="0.06" mix-blend-mode="screen" fill="white" />
  <defs>
    <linearGradient id="milky-way"> gold stops at 0%/50%/100%, opacity 0/0.022/0 </linearGradient>
    <filter id="milky-blur"> feGaussianBlur stdDeviation="6" </filter>
  </defs>
  <polygon [diagonal coords] fill="url(#milky-way)" filter="url(#milky-blur)" />
  [800 deterministic star circles, seeded PRNG, magnitude-varied radii]
  [sparkle crosses for top 7% / top 2%]
```

Seeded PRNG (from prototype):
```ts
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
```

### 4.2 `src/components/AtlasMap.tsx` — pannable/zoomable map

Full port of `atlas.jsx`. Key implementation notes:

**Pan/zoom state** (must be ref, not React state, for 60fps):
```ts
const transform = useRef({ x: 0, y: 0, scale: 1 });
const worldRef = useRef<SVGGElement>(null);
// Apply directly: worldRef.current.setAttribute('transform', `translate(${x},${y}) scale(${s})`)
```

**Zoom**: `scale = clamp(0.25, 3, scale * (1 + delta * -0.001))`, centred on cursor world coords.

**Label visibility**:
- Pattern name labels: visible when `scale > 0.7`
- Complexity dots: visible when `scale > 1.1`
- Large constellation names: fade out when `scale > 1.1`

**Floating cartouches** (position:absolute over the canvas):
- Top-left: title `✦ a celestial atlas of ✦` eyebrow + "Design Patterns of Everything" + edition tag
- Top-right: *(search cartouche — deferred, render empty cartouche placeholder)*
- Bottom-left: compass rose + legend (● Pattern · ✦ Principle · ◌ Anti-pattern · ◆ Complexity)
- Bottom-right: constellation list (4 domain names, clickable) + zoom `+` `−` `◯` buttons

**Side drawer**: 420px wide, right edge, 350ms ease-out translate+fade. Opens on star click. Contains: pattern name (42px italic), type label, complexity diamonds, note, "Open detail chart →" link if `href` present, adjacent stars list.

**Domain ellipses**: hatched fill via `<pattern id="hatch-{domain}">` with diagonal lines at varying rotation angles, radial mask `<radialGradient>` fading to transparent at edge.

**Star anatomy** (per §8 of DESIGN_SYSTEM.md):
```
1. Outer glow:  r * 3.5, opacity 0.10
2. Inner glow:  r * 2.0, opacity 0.18
3. Core:        r,       full colour
4. [Principle] horizontal + vertical sparkle lines, length r * 2.5
5. [Anti]      dashed circle outline, r+3, stroke-dasharray "1 2"
6. [Selected]  outer ring r+6, stroke gold-bright
```

### 4.3 `src/components/DomainMiniMap.tsx`

Small (fit inside 420px cartouche on right side of domain hero). Shows only the stars for the current domain. Not pannable — static SVG centred on the domain ellipse. Stars rendered per §8 but at a smaller scale. `✦ Plate i ✦` label in corner.

Props: `domain: DomainId`

### 4.4 `src/components/PatternCatalogue.tsx`

Vertical list, no card grid. Each entry:
```
[metadata rail 180px] | [main column flex]

Metadata rail:
  type label:   ● Pattern  /  ✦ Principle  /  ✗ Anti-pattern
  complexity:   ◆◆◆◇◇  (JetBrains Mono)
  catalogue #:  FE.001  (JetBrains Mono)

Main column:
  Pattern name  42px italic
  Summary       22px italic
  "Unfold the chart ↓" toggle button  (or "Open detail chart →" if href present)

Expanded state (2×2 grid):
  Intent | When to reach for it
  Smells before it | Adjacent stars (→ linked names)

Separator: border-top: 0.5px solid var(--paper-border)  ONLY. No cards. No backgrounds.
```

Props:
```ts
interface Props {
  domain: DomainId;
  patterns: Pattern[];
}
```

### 4.5 `src/components/ComponentTreeViz.tsx`

Port of the Frontalia featured viz from `frontend.jsx`. Animated component tree:
- Hierarchy: `<Page>` → 3 organisms → 2–3 molecules each → atoms
- Particles animate down one branch per cycle, rotating through 5 predetermined branches every ~2.4s
- `requestAnimationFrame` loop, linear easing
- Nodes: small circles, ink colour
- Particles: small gold circles travelling along the branch path
- Background: transparent (sky shows through)
- Caption: `Fig. 1 · Component tree — props flowing from Page to leaf atoms.`

### 4.6 `src/components/MedallionViz.tsx`

Port of the Pipea Vallis featured viz from `data.jsx`. Key implementation:

```
Stages: Source → Bronze → Silver → Gold → Consumers
Lane spread:  Bronze 1.0  →  Silver 0.6  →  Gold 0.3  →  Consumers 0.15
Colour shift: inkDim → #c08850 → #b8c4cf → #e8c870

~28 mote particles, each with { phase, lane, speed: 0.18..0.24, dropAt }
position.x = (phase + tick * speed) % 1.1
~10% dropped at Bronze→Silver (schema validation): red × fade-out
~9%  dropped at Silver→Gold (modelling):           red × fade-out

Per-stage: italic label (22px, stage colour) + subtitle (raw·immutable, etc.) + circle marker
Quality bars below rail: completeness / conformance % per stage
  Bronze: 55% / 70%   Silver: 80% / 92%   Gold: 95% / 99%
Transition labels above arrows: italic verb (ingest / validate / model / serve) + mono caption

Caption: Fig. 1 · The Medallion stratification — record motes ascending from raw arrival to served gold.
```

### 4.7 `Cartouche.astro` — the container primitive

```astro
---
interface Props {
  label?: string;   // eyebrow label (e.g., "✦ Plate i ✦")
  class?: string;
}
const { label, class: className } = Astro.props;
---
<div class:list={['cartouche', className]}>
  {label && <span class="cartouche-eyebrow">{label}</span>}
  <slot />
</div>

<style>
  .cartouche {
    background: var(--paper);
    border: 0.5px solid var(--paper-border);
    backdrop-filter: blur(8px) saturate(110%);
    padding: 18px 26px;
  }
  .cartouche-eyebrow {
    display: block;
    font-size: 10px;
    font-style: italic;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--ink-dim);
    margin-bottom: 14px;
  }
</style>
```

---

## 5 · Pages

### 5.1 Atlas — `src/pages/index.astro`

```
BaseLayout (title only, no nav/footer)
  AtlasBackdrop client:load (embedded in SVG world)
  AtlasMap client:load (full-bleed, position:fixed, inset:0)
```

No scrollable content. The entire viewport is the map. Chrome floats as cartouches inside the React component.

### 5.2 Domain detail pages (all 4 follow this template)

```
BaseLayout (title, description)
  AtlasBackdrop client:load (fixed to viewport)

  main.domain-page
    [breadcrumb row]
      ← Return to atlas | Chart {i} — {subtitle}

    [hero grid: 1fr + 420px, gap 48px]
      left:
        eyebrow:    ✦ The Constellation of ✦
        h1:         {Domain name}  (96px italic, clamp(48px, 6.5vw, 96px))
        subtitle:   — {the Domain Reach} —
        paragraph
        stats row:  Stars charted · Principles · Anti-patterns · Magnitude range

      right:
        Cartouche label="✦ Plate {i} ✦"
          DomainMiniMap client:load domain={domain}

    [featured viz cartouche — full width]
      Cartouche
        ComponentTreeViz | MedallionViz | (placeholder for backend/infra)

    [catalogue section]
      h2: Catalogue of stars  +  entry count
      PatternCatalogue client:load domain={domain} patterns={domainPatterns}

    [footer row]
      edition tag left  |  ← Return to atlas right
```

### 5.3 `src/layouts/BaseLayout.astro` (updated)

Adds:
- Google Fonts link (Cormorant Garamond + JetBrains Mono)
- `<meta name="color-scheme" content="dark">`
- Import `src/styles/atlas.css` (replaces current global.css imports chain)
- No nav. No site-wide footer. Domain pages include their own footer row.

---

## 6 · CSS Architecture

### `src/styles/atlas.css` — replaces brand/ imports

```css
/* ── Tokens ─────────────────────────────────────── */
:root {
  /* Colour — Midnight theme */
  --sky: #0a0e1a;
  --ink: #e8dcb8;
  --ink-dim: #a39570;
  --ink-faint: #5a4f33;
  --gold: #d4b15e;
  --gold-bright: #f1d98a;
  --line: rgba(212, 177, 94, 0.28);
  --line-faint: rgba(212, 177, 94, 0.10);
  --anti: #c46a55;
  --paper: rgba(20, 25, 40, 0.78);
  --paper-border: rgba(212, 177, 94, 0.35);
  --tint-frontend: #7aa3d4;
  --tint-backend: #d49a7a;
  --tint-data: #9ec48a;
  --tint-infra: #c8a4d4;
  --bronze: #c08850;
  --silver: #b8c4cf;
  --gold-medal: #e8c870;

  /* Typography */
  --font-display: 'Cormorant Garamond', 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}

/* ── Reset ───────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: var(--sky);
  color: var(--ink);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 17px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* ── Type scale ──────────────────────────────────── */
/* Applied via utility classes or direct element styles in components */
/* Never use font-weight: bold. Use italic 600 for emphasis. */

/* ── Cartouche primitive ─────────────────────────── */
.cartouche {
  background: var(--paper);
  border: 0.5px solid var(--paper-border);
  backdrop-filter: blur(8px) saturate(110%);
  padding: 18px 26px;
  /* NO border-radius. NO box-shadow. */
}

/* ── Links ───────────────────────────────────────── */
a { color: var(--gold); text-decoration: none; transition: color 150ms; }
a:hover { color: var(--gold-bright); }

/* ── Page wrapper ────────────────────────────────── */
.page-wrapper {
  max-width: 1180px;
  margin: 0 auto;
  padding: 48px clamp(28px, 5vw, 64px) 96px;
  position: relative;
  z-index: 1;
}
```

---

## 7 · Implementation Order

### PR 1 — Design System Foundation
**~45 min. No visual features added — typography and token replacement only.**

1. Create `src/styles/atlas.css` with all tokens, reset, `.cartouche`, link styles, `.page-wrapper`
2. Update `src/styles/global.css`: replace `@import '../../brand/...'` with `@import './atlas.css'`; remove all Inter imports; remove all `border-radius` variables; keep `@fontsource` imports but switch to italic variant for Cormorant
3. Update `src/layouts/BaseLayout.astro`: add Google Fonts `<link>`, add `<meta name="color-scheme" content="dark">`, remove any existing `<link>` for old fonts
4. Add `@fontsource/cormorant-garamond/400-italic.css` import (check available variants in node_modules)
5. Self-check §15: no Inter remaining, no `border-radius` in new file, all colours from token list
6. `npm run build` — must pass

**Files**: `src/styles/atlas.css` (new), `src/styles/global.css`, `src/layouts/BaseLayout.astro`

---

### PR 2 — AtlasBackdrop Component
**~45 min. Replaces Starfield.tsx with accurate backdrop.**

1. Create `src/components/AtlasBackdrop.tsx` — port from `atlas-backdrop.jsx`:
   - Sky div: `position:fixed; inset:0; z-index:-2; background:var(--sky)`
   - SVG overlay: `position:fixed; inset:0; pointer-events:none; z-index:-1`
   - Paper grain filter: `feTurbulence baseFrequency="0.85" numOctaves="2"`, opacity 0.06, mix-blend-mode screen
   - Milky Way: diagonal polygon, linearGradient gold stops, gaussian blur stdDeviation=6, opacity peak ~0.022
   - 800 deterministic stars: seeded PRNG (`seed=42`), `mag = Math.pow(rand(), 2.4)`, `r = 0.2 + mag * 1.6`, circle fill `var(--gold)`
   - Sparkle crosses: top 7% (`mag > 0.93`) get 2 short crossed lines; top 2% (`mag > 0.97`) get longer cross + low-opacity circle halo
2. Replace `<Starfield client:load />` in `index.astro` and all 4 domain pages with `<AtlasBackdrop client:load />`
3. Delete `src/components/Starfield.tsx` and `src/components/StarfieldCanvas.css`
4. Self-check: no radial-gradient, stars are varied in size (not identical), milky way is near-invisible (0.022 opacity)

**Files**: `src/components/AtlasBackdrop.tsx` (new), delete `Starfield.tsx` + `StarfieldCanvas.css`, update 5 pages

---

### PR 3 — Atlas Pannable Map
**~90 min. The flagship feature.**

1. Create `src/lib/atlas-data.ts` — port all data from `atlas-data.js` in the zip:
   - 4 `Domain` entries with world coordinates and Latinate names
   - All pattern entries with x/y/mag/type/complexity/note
   - All `Connection` entries
   - Add `href` = empty string for now (wired in PR 7)
   - Ensure all 13 existing MDX patterns have entries
2. Create `src/components/AtlasMap.tsx` — port from `atlas.jsx`:
   - Full-bleed React component (`width:100vw; height:100vh; position:fixed; inset:0; overflow:hidden`)
   - Pan/zoom via `useRef` transform (never React state) — `worldRef.current.setAttribute('transform', ...)`
   - RA/Dec grid: hairline lines every 100 world units, italic coordinate labels
   - Ecliptic: dashed wavy path across equator
   - Domain hatched ellipses: `<pattern>` diagonal hatch at domain-specific rotation, `<radialGradient>` radial mask
   - Pattern stars per §8 anatomy (5-layer groups)
   - Connection lines: solid `var(--line)` same-domain, dashed `var(--line-faint)` cross-domain
   - 4 floating cartouches (title, search placeholder, legend, zoom controls)
   - Side drawer: 420px, right edge, 350ms ease-out translate+fade on `selected` state change
   - Label visibility thresholds: scale > 0.7 for names, scale > 1.1 for complexity dots
3. Rewrite `src/pages/index.astro`:
   - Remove all current sections (Hero, About, Domains, Approach, Contact)
   - Body: `<AtlasBackdrop />` + `<AtlasMap client:load />`
   - BaseLayout title = "Design Patterns of Everything · Celestial Atlas"

**Files**: `src/lib/atlas-data.ts` (new), `src/components/AtlasMap.tsx` (new), `src/pages/index.astro` (rewrite)

---

### PR 4 — Frontalia Domain Page (canonical template)
**~75 min. Frontend page + 3 new shared components.**

1. Create `src/components/Cartouche.astro` (§4.7 above)
2. Create `src/components/DomainMiniMap.tsx` (§4.3 above):
   - Reads from `atlas-data.ts`, filters to current domain
   - Static SVG at 400×300 viewBox centred on domain `cx,cy`
   - Stars rendered per §8 (scaled down), connections shown, domain ellipse outline
   - `✦ Plate i ✦` eyebrow in corner
3. Create `src/components/PatternCatalogue.tsx` (§4.4 above):
   - Vertical list, hairline separators only
   - 2-column metadata rail + main
   - Toggle expand state per entry (React `useState`)
   - Catalogue numbers: `FE.001`, `FE.002`, etc.
4. Create `src/components/ComponentTreeViz.tsx` (§4.5 above):
   - Port from `frontend.jsx`
   - 320×220px SVG in cartouche, transparent background
   - `requestAnimationFrame` particle loop
5. Rewrite `src/pages/frontend.astro`:
   - Remove all inline `<style>` blocks
   - Use `Cartouche.astro`, `DomainMiniMap`, `PatternCatalogue`, `ComponentTreeViz`
   - Follow the domain page template exactly (§5.2 above)
   - Patterns sourced from `atlas-data.ts` filtered by `domain === 'frontend'`

**Files**: `Cartouche.astro` (new), `DomainMiniMap.tsx` (new), `PatternCatalogue.tsx` (new), `ComponentTreeViz.tsx` (new), `src/pages/frontend.astro` (rewrite)

---

### PR 5 — Remaining 3 Domain Pages
**~90 min.**

1. Create `src/components/MedallionViz.tsx` (§4.6 above) — port from `data.jsx`
2. Rewrite `src/pages/backend.astro` — copy Frontalia template, swap:
   - Domain = `backend`, name = "Backendis Major", subtitle = "the Backend Expanse"
   - Chart ii, `--tint-backend`, eyebrow = `Chart ii — the Backend Expanse`
   - Featured viz: static cartouche with architecture text (no animated viz for backend in prototype — use placeholder "◈ Clean Architecture Diagram — detailed visualisation coming" in italic)
   - Catalogue: backend patterns from `atlas-data.ts`
3. Rewrite `src/pages/data.astro` — copy Frontalia template, swap:
   - Domain = `data`, name = "Pipea Vallis", subtitle = "the Data Confluence"
   - Chart iii, `--tint-data`
   - Featured viz: `<MedallionViz client:load />`
4. Rewrite `src/pages/infra.astro` — copy Frontalia template, swap:
   - Domain = `infra`, name = "Infrastructura", subtitle = "the Platform Frontier"
   - Chart iv, `--tint-infra`
   - Featured viz: static placeholder (same as backend)

**Files**: `MedallionViz.tsx` (new), `src/pages/backend.astro`, `src/pages/data.astro`, `src/pages/infra.astro` (rewrites)

---

### PR 6 — Legacy Cleanup
**~30 min. Remove all v1 remnants.**

1. Delete `src/components/DomainCard.astro` (no longer used after PR 3)
2. Delete `src/components/Hero.astro` (no longer used after PR 3)
3. Delete `brand/` directory entirely (replaced by `src/styles/atlas.css`)
4. Audit all remaining files for forbidden patterns:
   - `glass-surface`, `hover-lift`, `hover-border-glow` class references → remove
   - Any `border-radius` not equal to 0 → remove
   - Any `box-shadow` → remove
   - Any `radial-gradient` → remove
   - Any Inter font references → remove
   - Any `transform: scale` on hover → remove
5. Run §15 quick-reject checklist on full diff

**Files**: deletes + CSS cleanup across all files

---

### PR 7 — Content Wiring
**~60 min. Wire MDX pattern files to Atlas entries and domain catalogues.**

1. Add `href` values to all 13 pattern entries in `atlas-data.ts`:
   - Format: `${base}/patterns/{domain}/{slug}` where slug matches the MDX filename
2. Create `src/pages/patterns/[...slug].astro`:
   ```astro
   ---
   const { slug } = Astro.params;
   const files = await Astro.glob('../../docs/patterns/**/*.mdx');
   const file = files.find(f => f.file.includes(slug));
   // Render with minimal Celestial Atlas layout
   ---
   ```
   - Layout: `BaseLayout` + `AtlasBackdrop` + centered editorial column
   - Breadcrumb: `← {Domain name}` / pattern name
   - Content: MDX rendered body
   - Pattern metadata cartouche: name, complexity diamonds, type label, note
   - Footer: edition tag + `← Return to atlas`
3. Update `PatternCatalogue.tsx`: when `pattern.href` is present, "Unfold the chart ↓" becomes "Open detail chart →" as a link
4. Update `AtlasMap.tsx` side drawer: show "Open detail chart →" link when `pattern.href` is set
5. Cross-domain patterns (SRP, Composition) must appear in both relevant domain catalogues — update `PatternCatalogue` to accept a `patterns` array that may include cross-domain entries

**Files**: `src/lib/atlas-data.ts` (href additions), `src/pages/patterns/[...slug].astro` (new), `src/components/PatternCatalogue.tsx`, `src/components/AtlasMap.tsx`

---

## 8 · Open Questions

1. **Pattern detail page layout depth** — MDX files were written against the old design system. PR 7 uses a minimal wrapper. A full Celestial Atlas treatment for detail pages (featured viz, adjacent stars, cross-references rendered as star links) is deferred to a future PR 8.

2. **Backend and Infra featured visualisations** — the prototype doesn't include animated vizs for these two domains. PR 5 uses static text placeholders. Confirm before PR 5 executes whether custom visualisations are wanted.

3. **Search in Atlas** — deferred. PR 3 renders the top-right cartouche as an empty placeholder. Search functionality is a future PR.

4. **Touch support** — the Atlas is mouse-driven in the prototype. Touch events (pinch-zoom, touch-drag) are not specified. PR 3 should either add touch support or add a `<!-- touch: deferred -->` note so it's not silently missing.

5. **`[...slug].astro` routing with Astro 5** — Astro 5 deprecated `Astro.glob`. PR 7 should use `import.meta.glob` instead. The agent should verify the correct API during implementation.

---

## 9 · §15 Quick-Reject Checklist (applied before every PR merges)

- [ ] Every container has `border-radius: 0`
- [ ] Every heading is Cormorant Garamond, italic, 400
- [ ] All colours are from the token list in `src/styles/atlas.css`
- [ ] All icons are from the glyph set (`✦ ● ◌ ✗ ◆ ◇ → ←`)
- [ ] Every new pattern in `atlas-data.ts` has x/y inside its domain ellipse and 1–3 connections
- [ ] Copy reads like a printed atlas, not a SaaS landing page

---

*Edition iii · drawn from production · scale variable*
