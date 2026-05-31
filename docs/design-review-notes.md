# Design Review Notes

Session-by-session notes on visual issues caught during review and how they were resolved.

---

## Session: Backdrop rebuilt from invented design back to canonical spec (2026-05-31)

### 7. AtlasBackdrop drifted into "AI-slop sky" — rebuilt from canonical source

**What went wrong**: Across several iterations, `AtlasBackdrop.tsx` was tuned by eye toward a `target.png` reference and grew an edge-on galaxy streak, a round nebula blob, and a bottom star cluster — all built from `radialGradient` ellipses. The canonical design system (`atlas-backdrop.jsx` + `DESIGN_SYSTEM.md §2a` inside `claude-design/artefacts_v01/design system of everything.zip`) **explicitly forbids exactly this**:

> "the sky is a flat colour, never a radial gradient... If you find yourself writing `radial-gradient(ellipse ...)` for a page background, stop. That's the AI-slop sky."

The root mistake: the backdrop looked "underwhelming" because the star field was too sparse (~110 stars), and the fix was to **add more stars**, not to add nebula gradients. The canonical spec calls for a dense 600–900 star field whose density variation reads as nebulosity on its own.

**Fix**: Replaced the entire component with a faithful port of the canonical `atlas-backdrop.jsx`:
- Layer 1: flat `var(--sky)` fill, no gradient
- Layer 2: paper grain — `feTurbulence baseFrequency="0.85" numOctaves="2"`, opacity 0.05, `mix-blend-mode: screen`
- Layer 3: single diagonal gold (`--gold`) milky-band `<polygon>`, ≈0.08 peak opacity, `feGaussianBlur stdDeviation="3"`
- Layer 4: 700 deterministic stars, magnitude `Math.pow(rand(), 2.4)`, radius `0.15 + m*1.6`; brightest 7% get sparkle crosses, brightest 2% get a longer cross + halo
- Kept a `tone` prop (`midnight` | `sepia`) matching the canonical source

**Key lesson**: When a canonical design source exists (here, the zip in `claude-design/`), read it FIRST and port it — do not reverse-engineer the look from a screenshot. Atmosphere on this chart comes from star-field *density*, paper grain, and a faint gold band — never from radial-gradient blobs. "It looks empty" → add stars, not nebulae.

---

## Session: Pattern stars lost against the dense backdrop (2026-05-31)

### 8. AtlasMap pattern stars no longer read as foreground

**What went wrong**: After the backdrop was rebuilt to the canonical dense 700-star field (#7), the actual pattern stars on `AtlasMap` blended into the backdrop — both were `--gold`, similar sizes, no separation.

**Fix** (in `AtlasMap.tsx` `StarGroup` + `starColor`/`starRadius`):
- Pattern-star cores now use `--gold-bright` (`#f1d98a`), brighter than the backdrop's flat `--gold` field
- Bumped radius `1.2 + mag*2.8` → `2.0 + mag*2.8`
- Added a **sky-halo layer 0**: a flat `--sky` (`#0a0e1a`) disc at `r*3.2`, ~40% opacity, that softly dims the busy backdrop immediately behind each star so it reads as foreground (55% when selected)
- Brightened the two glow layers and made glow/halo opacities react to `selected`

**Key lesson**: A dense backdrop and foreground markers of the same colour/size will merge. Separate foreground from a busy background with (a) a brighter tint, (b) larger size, and (c) a local "negative space" disc in the background colour that quiets the area right around the marker. The canonical `atlas.jsx` keeps its backdrop *inside the world svg* so it pans, but our backdrop is fixed — so the sky-halo is our equivalent device for foreground separation.

---

## Session: BASE_URL missing in React components (2026-05-31)

### 6. PatternCatalogue + AtlasMap — all internal links 404 on GitHub Pages

**What went wrong**: `PatternCatalogue.tsx` and `AtlasMap.tsx` used `pattern.href` and `domain.href` values directly (e.g. `/patterns/frontend/component-composition`, `/frontend`). On GitHub Pages the site is deployed under `/design-patterns-of-everything/`, so these bare paths resolve to the root domain and 404.

**Fix**: Added `const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')` at the top of each component and prepended it to every internal href: `` `${BASE}${pattern.href}` ``, `` `${BASE}${d.href}` ``.

**Key lesson**: React island components in Astro do NOT automatically inherit `BASE_URL` the way `.astro` files do via `import.meta.env`. Any `.tsx` component that constructs internal links must explicitly read `import.meta.env.BASE_URL` itself. Always check this when adding links in a React island.

---

## Session: Celestial Atlas Redesign (2026-05-31)

### 1. AtlasBackdrop — sky too busy

**What went wrong**: `AtlasBackdrop.tsx` rendered 800 randomly-seeded stars with a strong diagonal Milky Way gradient band (up to 22% opacity) and a radial vignette (65% opacity at edges). The result read as uniform visual noise and overwhelmed the domain constellation stars rendered by `AtlasMap.tsx`.

**Design system violations**: The design system (`docs/DESIGN_SYSTEM.md`) explicitly forbids radial-gradient backgrounds and vignettes. The backdrop was violating both rules.

**Fix**: Reduced star count to 50 ambient stars, removed the vignette entirely, replaced the Milky Way band with 3 faint elliptical galaxy smudges (≤7% centre opacity). The backdrop now reads as deep space, letting AtlasMap's constellation stars dominate.

**Key lesson**: The backdrop should be subordinate to the map layer. Background stars exist only to fill negative space — they must never compete with content stars.

---

### 2. AtlasMap — SVG canvas overlapping the nav bar

**What went wrong**: `AtlasMap.tsx` rendered its main SVG with `position: fixed; inset: 0` (z-index 10), which covered the full viewport including the 52px nav bar. The nav was visible (rendered in flow before the map) but the map canvas intercepted pointer events in that zone, and floating cartouches positioned at `top: 24` sat underneath the nav.

**Fix**: Changed the SVG to `top: 52; height: calc(100vh - 52px)`. Shifted top-pinned floating cartouches from `top: 24` to `top: 76` (52px nav + 24px margin). Shifted the side drawer from `top: 0` to `top: 52`.

**Key lesson**: Any full-bleed fixed canvas must account for the nav height. Use a named constant (e.g. `NAV_HEIGHT = 52`) if this offset appears in multiple places.

---

### 3. AtlasMap — pattern stars had domain tint colours

**What went wrong**: `starColor()` returned the domain tint (`#7aa3d4`, `#d49a7a`, `#9ec48a`, `#c8a4d4`) for regular pattern stars. The mixed palette of blue, terracotta, green, and purple looked garish against the dark sky.

**Fix**: Regular pattern stars now use `--gold` (`#d4b15e`) universally. Principle stars keep `--gold-bright` (`#f1d98a`), anti-pattern stars keep `--anti` (`#c46a55`). Domain tints are reserved for constellation ellipse outlines and sidebar labels only.

**Key lesson**: Stars on a dark sky should be warm gold. Tint colours belong to UI chrome (labels, borders), not to the stars themselves.

---

### 4. AtlasMap — pattern stars too large at default zoom

**What went wrong**: `starRadius(mag)` returned `2.5 + mag * 6.0`, producing radii of ~8–12 world units. The outer glow halo used `r * 3.5`, making each star's visual footprint ~28–42 world units wide. At the default scale of 0.55 this rendered as bloated blobs rather than crisp star points.

**Fix**: Reduced the radius formula to `1.2 + mag * 2.8` and tightened glow multipliers from `r * 3.5 / r * 2.0` to `r * 2.2 / r * 1.5`. Stars are now pinpoint at default zoom and scale up naturally on zoom-in.

**Key lesson**: Star radii in world-space coordinates are amplified by glow layers. Budget the total visual footprint (`r * outer_glow_multiplier * scale`) against screen pixels, not just the core radius.

---

### 5. Domain pages — Latin constellation names

**What went wrong**: Domain pages and `atlas-data.ts` used invented Latin names: Frontalia, Backendis Major, Pipea Vallis, Infrastructura. These sounded like gaming lore and undermined the professional portfolio framing.

**Fix**: Replaced with plain professional names: Frontend, Backend, Data Pipeline, Infrastructure. The star-map aesthetic is carried by the visual design, not by pseudo-Latin naming.

**Key lesson**: Celestial metaphor should live in the visuals, not the copy. All user-facing text must be unambiguously professional.
