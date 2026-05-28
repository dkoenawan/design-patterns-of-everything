# Design Patterns of Everything — Design System

> The codified rules that produced the Celestial Atlas. Drop this file into your repository (e.g. `docs/DESIGN_SYSTEM.md` or `CLAUDE.md`) and any agent — Claude Code, Cursor, Copilot Workspace — should be able to honour the system.

The atlas is not "stars on black." It is a **celestial chart** in the tradition of Bayer (1603), Flamsteed (1729), and Bode (1801): an ornate, layered, deeply typographic instrument that rewards close reading. Every choice below is calibrated to keep it on that side of the line.

---

## 1 · Voice & Concept

The atlas is presented as **a printed cartographic instrument**, not a website. Speak the part:

- ✓ "constellation," "chart," "plate," "cartouche," "catalogue," "magnitude," "edition iii"
- ✗ "section," "card," "tile," "feature," "tag," "modal"

Patterns are **stars**. Anti-patterns are **voids** or **dark marks**. Principles are **lodestars** (the brightest, with a four-point cross sparkle). Each of the four domains is a **constellation** with a Latinate name:

| Domain                  | Constellation        | Subtitle                    |
| ----------------------- | -------------------- | --------------------------- |
| Frontend                | **Frontalia**        | the Frontend Reach          |
| Backend                 | **Backendis Major**  | the Backend Expanse         |
| Data Pipeline           | **Pipea Vallis**     | the Data Confluence         |
| Infrastructure          | **Infrastructura**   | the Platform Frontier       |

When introducing a new pattern, write copy in the present tense, declarative, never breathless. Avoid marketing voice entirely. **Edit copy as if for a printed book — not a landing page.**

---

## 2 · Colour Tokens

The system has three themes. **Midnight** is canonical; the others are paper variants of the same chart.

### Midnight (canonical)
```css
--sky:          #0a0e1a;  /* flat — NO radial-gradient backgrounds */
--ink:          #e8dcb8;  /* primary text */
--ink-dim:      #a39570;  /* muted text, secondary labels */
--ink-faint:    #5a4f33;  /* hairlines, caption text */
--gold:         #d4b15e;  /* default star */
--gold-bright:  #f1d98a;  /* principle / highlight / hover */
--line:         rgba(212, 177, 94, 0.28);  /* same-domain connection */
--line-faint:   rgba(212, 177, 94, 0.10);  /* cross-domain, grid */
--anti:         #c46a55;  /* anti-pattern marks only */
--paper:        rgba(20, 25, 40, 0.78);   /* cartouche fill (blurred) */
--paper-border: rgba(212, 177, 94, 0.35);
```

> **Critical:** the sky is a **flat colour**, never a radial gradient. Atmosphere comes from the **paper grain + star field + milky band** layers in §2a — not from a blurred ellipse. If you find yourself writing `radial-gradient(ellipse ...)` for a page background, stop. That's the AI-slop sky.

### 2a · The Backdrop Layer Stack

Every page composes its sky from three stacked layers, in order, behind all content:

1. **Sky** — flat `var(--sky)` fill. No gradient.
2. **Paper grain** — SVG `<feTurbulence>` (`baseFrequency="0.85"`, `numOctaves="2"`), low opacity (0.05–0.08 on dark, 0.18 on parchment), `mix-blend-mode: screen` on dark themes or `multiply` on light. This gives the chart its printed texture.
3. **Milky band** — a single diagonal `<polygon>` filled with a `<linearGradient>` of `--gold` at very low opacity (≈0.08 peak), Gaussian-blurred (`stdDeviation="3"`). Runs corner-to-corner. Suggests the Milky Way crossing a printed star chart. Omit entirely on parchment.
4. **Star field** — 600–900 deterministic stars (seeded PRNG so the field is stable). Each star has a magnitude `m ∈ [0, 1]` skewed toward dim (`Math.pow(rand(), 2.4)`). Render as a `<circle>` with radius `0.15 + m * 1.6`. The brightest 7% (`m > 0.93`) get two short crossed sparkle lines; the brightest 2% (`m > 0.97` or `> 0.98`) get a longer cross + halo. **Never** render stars as identical radial blobs.

On the pannable Atlas, the star field lives inside the world `<svg>` so it pans with the chart. On detail pages it's fixed to the viewport.

### Domain tints (subtle washes only)
```css
--tint-frontend: #7aa3d4;  /* steel blue */
--tint-backend:  #d49a7a;  /* terracotta */
--tint-data:     #9ec48a;  /* moss */
--tint-infra:    #c8a4d4;  /* heather */
```

Use domain tints **only** as 4–14% opacity hatched fills (diagonal lines, `patternTransform="rotate(45deg + i*22deg)"`) inside the constellation ellipse, with a radial mask that fades to transparent at the edge. Single-character glyphs (●) in legends use the tint at full opacity. **Never** fill a region with a flat or radial-blob tint colour — always hatch.

### Rules
- **Never** introduce a new colour without adding it to this list first.
- **Never** use pure black (`#000`) or pure white (`#fff`). Use `--sky` and `--ink`.
- **Never** use saturated reds, greens, or blues except as the tints above.
- Gradients are reserved for the sky background. **Do not** use gradient fills on text, buttons, or cards.

---

## 3 · Typography

Two families. That is the budget.

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

| Use                       | Family                  | Style              | Notes |
| ------------------------- | ----------------------- | ------------------ | ----- |
| All display & body text   | Cormorant Garamond      | **italic 400**     | This is the voice. Default everything to italic. |
| Emphasis inside body      | Cormorant Garamond      | italic 600         | Use sparingly. |
| Coordinates, magnitudes, table cells | JetBrains Mono | regular 400  | Anywhere a fixed-width fact appears (RA/Dec, complexity ◆, %). |

### Type scale
```
Hero domain name      96px  italic 400  line-height 0.95
Page title            72px  italic 400
Section heading       48px  italic 400
Subsection            38px  italic 400  line-height 1.05
Pattern name          42px  italic 400
Body, large           22px  italic 400  line-height 1.45
Body                  17px  italic 400  line-height 1.55
Caption               13px  italic 400  letter-spacing 0.5
Eyebrow (UPPERCASE)   10px  italic 400  letter-spacing 3px
Mono coordinate        11px  regular     letter-spacing 1.5
```

### Rules
- **Default to italic.** Roman (upright) is the exception, reserved for monospace blocks.
- Use `text-wrap: pretty` on every body paragraph.
- Eyebrow labels are **italic, uppercase, ultra-tracked** (letter-spacing 3px), with `✦` glyphs on either side. Example: `✦  a celestial atlas of  ✦`
- Never use `font-weight: bold` on body — use italic emphasis instead.
- Roman small caps are acceptable for monospace coordinate strings.

---

## 4 · Cartouches (the only container)

There is **one container primitive** in the system. We call it a **cartouche**. It is a translucent blurred panel with a hairline border.

```css
.cartouche {
  background: var(--paper);
  border: 0.5px solid var(--paper-border);
  backdrop-filter: blur(8px) saturate(110%);
  padding: 18px 26px;
  /* No border-radius. No drop shadow except the chrome blur. */
}
```

### Rules
- **No `border-radius`.** Cartouches are rectangular. The atlas is printed.
- **No solid colour cards.** Every panel must be the translucent paper over sky.
- **Hairline borders only.** `0.5px solid var(--paper-border)`. Never thicker.
- **No shadow** beyond what blur provides. No `box-shadow: 0 4px 20px rgba(0,0,0,0.5)` etc.
- Eyebrow label inside a cartouche is preceded by `✦` and uppercase tracked italic.

---

## 5 · Glyphs

The system has a small, fixed icon set. **Never invent new ones.** Never use emoji. Never use Font Awesome / Heroicons / lucide.

| Glyph | Meaning                       | Where |
| ----- | ----------------------------- | ----- |
| `✦`   | Principle / decorative pip    | Eyebrow brackets, lodestars, separators |
| `●`   | Pattern (filled star)         | Legends, lists |
| `◌`   | Anti-pattern (dashed star)    | Legends only |
| `✗`   | Smell / rejected / anti       | Inline lists |
| `◆`   | Filled complexity diamond     | Complexity meter |
| `◇`   | Empty complexity diamond      | Complexity meter |
| `→`   | Cross-reference / "see also"  | Adjacent stars lists |
| `←`   | Return to atlas               | Breadcrumbs |
| `·`   | Inline separator              | Between metadata fields |
| `—`   | Subtitle dashes               | `— the Frontend Reach —` |

Compass roses, ecliptic curves, grid hairlines are drawn as SVG primitives — never imported as icons.

---

## 6 · Spacing

The system uses a 4px base. Common values:

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

**Padding is asymmetric and editorial:** `padding: 18px 26px` for cartouches, `padding: 48px 64px 96px` for page wrappers. Never use uniform 16/24/32.

---

## 7 · Layout

- The atlas (the pannable map) is **full-bleed**. No header. No footer. Chrome floats as cartouches at the four corners.
- Detail pages use a **centered editorial column** with `max-width: 1180px` and asymmetric padding.
- Pattern entries use a **two-column grid**: 180px metadata rail + flexible main column, separated by 40px.
- **No card grids.** Patterns are listed vertically, separated only by hairline `border-top`.

---

## 8 · Stars (the central component)

Every pattern renders as a star. A star is **not** a circle with an emoji; it is a layered SVG group:

```js
// magnitude → radius
function starRadius(p) { return 1.6 + p.mag * 2.2; }

// Layers, drawn bottom to top:
// 1. Outer glow:   r * 3.5,  opacity 0.10
// 2. Inner glow:   r * 2.0,  opacity 0.18
// 3. Core:         r,        full colour
// 4. (Principle only) horizontal + vertical sparkle lines, length r * 2.5
// 5. (Anti only)   dashed circle outline, r + 3, stroke-dasharray "1 2"
// 6. (Selected)    outer ring r + 6, stroke gold-bright
```

Label is to the **right** of the star, italic, fontSize 13. Show only when zoom > 0.7. Show complexity dots (`◆◆◆◇◇`) only when zoom > 1.1.

Connection lines between same-domain stars are solid `--line`. Cross-domain connections are dashed `--line-faint` (stroke-dasharray "3 4").

---

## 9 · Visualizations

When a pattern needs a diagram (Medallion, component tree, event flow), follow these rules:

- Always SVG. Never raster.
- **Background is transparent** — let the sky show through.
- Use the same colour tokens. Domain tints are allowed as accents.
- Animate using `requestAnimationFrame` for continuous motion, or `<animateMotion>` for one-shots.
- Always include a **Fig. N · italic caption** below the visualization.
- Label axes in italic with the same tracking as the rest of the atlas.

Example pattern: in the Medallion viz, motes (records) drift from left to right through Bronze → Silver → Gold lanes, with colour transitions at each boundary, some motes dropped as `×` at validation. Spread is wide at Bronze, tight at Gold. Quality bars beneath show completeness/conformance climbing.

---

## 10 · Motion

Motion is **slow, restrained, perpetual**. Never bouncy. Never spring-y.

- **Easing:** linear for continuous motion (stars, motes); `cubic-bezier(0.25, 0.1, 0.25, 1)` (CSS ease) for UI transitions.
- **Hover transitions:** 150ms colour shift only. No transform, no scale.
- **Drawer open:** 350ms, ease-out, translate 40px → 0 + fade.
- **Star twinkle:** very subtle; opacity 0.3 → 0.8 over 3-4 seconds. Only background stars, never pattern stars.
- **No parallax**, **no scroll-triggered slides-in**, **no reveal-on-scroll animations** on detail pages.

---

## 11 · Interaction

The map supports:

- **Drag** (mousedown → mousemove) to pan.
- **Wheel** to zoom; zoom centres on the cursor.
- **Click on a star** opens a side drawer (420px wide) with full pattern detail.
- **Click on a constellation name** focuses to that domain at scale 0.85.
- **+ / − / ◯** buttons in the bottom-right zoom incrementally and recentre.

All clickable elements must respond to hover with a colour change to `--gold-bright`. **No background fills on hover.** No underlines. No box-shadow lifts.

---

## 12 · Adding a New Pattern

When adding a pattern to the atlas, every entry must have:

```ts
{
  id: string,           // kebab-case, unique
  domain: "frontend" | "backend" | "data" | "infra",
  name: string,         // Title Case, short
  x: number, y: number, // world coordinates (-1100..1100, -700..700)
  mag: number,          // 0.4 (dim) .. 1.6 (brightest); reflects importance
  type: "pattern" | "principle" | "anti",
  complexity: 1..5,
  note: string,         // one sentence. declarative. printed-book voice.
  href?: string,        // optional link to detail chart
}
```

Place it spatially **within its domain's ellipse** (rx 360, ry 280, centred on the domain's `cx, cy`). Add 1–3 `CONNECTIONS` edges to neighbouring stars. **Never add a pattern without connections** — orphan stars violate the constellation metaphor.

---

## 13 · Anti-patterns of the System

These are the AI-slop tropes the design exists to resist. Reject them in code review.

- ❌ **Gradient text** on titles
- ❌ **Radial-gradient page backgrounds** ("fuzzy circle skies") — see §2a; use the layered backdrop
- ❌ **Glassmorphism cards with rounded corners** floating over generic gradients
- ❌ **Emoji** anywhere in the UI (the glyphs in §5 are not emoji — they are typographic marks)
- ❌ **Lucide / Heroicon line icons** for "feature" sections
- ❌ **`box-shadow: 0 10px 40px rgba(0,0,0,0.3)`** lift cards
- ❌ **Inter / Roboto / system-ui** as display type
- ❌ **`hover:scale-105`** transforms
- ❌ **"Get Started →" buttons** with arrows
- ❌ **Three-column "Features" grids** with icon + heading + paragraph
- ❌ **Marketing voice:** "Discover," "Unlock," "Empower," "Seamlessly"

---

## 14 · File Conventions (for the agent)

```
/Atlas.html             — entry point; the pannable map
/Frontend.html          — Frontalia detail chart
/Backend.html           — Backendis Major detail chart        (mirror of Frontend)
/Data.html              — Pipea Vallis (with Medallion viz)
/Infra.html             — Infrastructura detail chart         (mirror of Frontend)

/atlas-data.js          — DOMAINS, PATTERNS, CONNECTIONS — single source of truth
/atlas.jsx              — the map React app
/{domain}.jsx           — per-domain detail pages
/tweaks-panel.jsx       — host shell for theme switcher (do not duplicate)
/DESIGN_SYSTEM.md       — this file
```

When adding a new domain page, **copy `frontend.jsx` and adapt**. Do not invent new layout primitives. The hero, the featured-viz block, and the catalogue cards are the three primitives that compose every domain page.

---

## 15 · Quick Reject Checklist

Before opening a PR, the agent should self-check:

1. Does every container have `border-radius: 0`?
2. Is every heading in `Cormorant Garamond, italic, 400`?
3. Are all colours from the tokens in §2?
4. Are all icons from the glyph set in §5?
5. Does every new pattern have an x/y inside its domain's ellipse and 1–3 connections?
6. Does the copy read like a printed atlas, not a SaaS landing?

If any answer is "no," fix it before review.

---

*Edition iii · drawn from production · scale variable*
