# Solution Architect Portfolio — Brand Identity Guidelines

## Brand Essence

This is the portfolio of a solution architect who operates at a level most people only read about. The brand exists to communicate one uncomfortable truth: some people see patterns others simply cannot see. Not loudly, not aggressively — but with the quiet certainty of someone who has looked at thousands of systems and knows exactly what will break, what will scale, and what will last. The visitor should feel the way you feel when you look up at the Milky Way for the first time as an adult and realize you're standing on a rock hurtling through an incomprehensibly vast structure — humbled, awed, and somehow more alive.

**Core emotional arc**: Awe-struck → Quiet reverence → Inspired confidence

**Archetype**: The Sage — authoritative without arrogance, wisdom earned through depth of experience

**Art direction**: Stellar cartography — the night sky as both metaphor and medium

**Mode**: Dark-only. The night sky has no light mode.

---

## Color System

The palette is drawn from long-exposure Milky Way photography — not saturated NASA false-color, but what a skilled astrophotographer captures with patience and precision. Real stellar colors: the deep indigo between star clusters, the warm amber glow of dense stellar cores, the cold silver-white of starlight.

### Primary Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Primary | Cosmic Indigo | #1a1b3a | hsl(238 37% 16%) | Primary actions, navigation, key interactive elements |
| Secondary | Stellar Amber | #c4922a | hsl(38 63% 47%) | Highlights, accents, active states — star cluster warmth |
| Accent | Nebula White | #e8eaf6 | hsl(234 47% 93%) | Headlines at scale, luminous interactive moments — starlight |

### Neutral Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Background | Void Black | #0a0b1a | hsl(237 44% 7%) | Base page background — the deepest sky |
| Surface | Deep Space | #12132b | hsl(238 41% 12%) | Cards, panels, elevated surfaces |
| Surface Raised | Star Cluster | #1e2040 | hsl(237 35% 18%) | Hover states, nested surfaces, interactive backgrounds |
| Border | Horizon Line | #2a2d52 | hsl(236 32% 24%) | Subtle dividers, card borders — hairline precision |
| Border Bright | Stellar Edge | #3d4278 | hsl(236 32% 35%) | Active borders, focused states, emphasis edges |
| Text Primary | Starlight | #e8eaf6 | hsl(234 47% 93%) | Primary readable text |
| Text Secondary | Pale Nebula | #a0a8d4 | hsl(231 36% 73%) | Secondary information, metadata, supporting content |
| Text Muted | Distant Star | #5a6090 | hsl(232 22% 46%) | Placeholder text, disabled states, subtle labels |

### Domain Accent Colors

| Domain | Name | Hex | HSL | Usage |
|--------|------|-----|-----|-------|
| Frontend | Aurora Teal | #2dd4bf | hsl(174 60% 51%) | Frontend domain — the glow of UI |
| Backend | Pulsar Amber | #f59e0b | hsl(38 92% 50%) | Backend domain — dense stellar core energy |
| Data Pipeline | Nebula Violet | #a78bfa | hsl(258 89% 76%) | Data pipeline — the color of gas clouds |
| Infrastructure | Supergiant Blue | #60a5fa | hsl(213 93% 68%) | Infrastructure — cold blue supergiant precision |

### Semantic Colors

| Role | Hex | HSL | Usage |
|------|-----|-----|-------|
| Success | #4ade80 | hsl(142 70% 58%) | Positive states — a green star |
| Warning | #fbbf24 | hsl(43 96% 56%) | Caution — solar flare |
| Error | #f87171 | hsl(0 90% 71%) | Error states — red giant |
| Info | #60a5fa | hsl(213 93% 68%) | Informational — blue supergiant |

---

## Typography

### Font Families

- **Heading**: Cormorant Garamond — A high-contrast serif with the elegance of historical astronomical texts. The dramatic thick-thin stroke contrast creates genuine visual authority. At display sizes it commands the page like a name inscribed in the sky. Weights 300–500 (the lightness creates drama against the dark background).
- **Body**: Inter — At this brand's information density (architecture patterns, technical depth), legibility IS a design statement. The exquisitely neutral body creates productive tension with the dramatic serif heading — grandeur meeting clarity.
- **Mono**: JetBrains Mono — For code. This is an architecture portfolio; code appears throughout. It should look like it was written by someone with opinions about their tooling.

### Type Scale

Scale ratio: Perfect Fourth (1.333×)

| Level | Size (rem) | Weight | Line Height | Letter Spacing | Usage |
|-------|-----------|--------|-------------|----------------|-------|
| Display | 5.16rem | 300 | 1.1 | -0.03em | Hero name — monumental, inscribed in sky |
| H1 | 3.88rem | 400 | 1.15 | -0.02em | Page titles |
| H2 | 2.91rem | 400 | 1.2 | -0.02em | Section headings |
| H3 | 2.18rem | 500 | 1.25 | -0.01em | Subsection headings |
| H4 | 1.64rem | 500 | 1.3 | 0 | Card titles, pattern names |
| Body Large | 1.23rem | 400 | 1.7 | 0 | Lead paragraphs, pattern summaries |
| Body | 1rem | 400 | 1.6 | 0 | Default text |
| Body Small | 0.875rem | 400 | 1.5 | 0.01em | Captions, metadata |
| Caption | 0.75rem | 500 | 1.4 | 0.06em | Labels, badges — always uppercase |

---

## Spacing System

Base unit: 0.5rem. Scale ratio: 2×. Spacing is generous and contemplative — a curated exhibition, not a dashboard. The void between elements is part of the brand.

| Token | Value (rem) | Pixels | Usage |
|-------|------------|--------|-------|
| space-xs | 0.25rem | 4px | Icon gaps, tight inline spacing |
| space-sm | 0.5rem | 8px | Component internal padding |
| space-md | 1rem | 16px | Standard component padding |
| space-lg | 2rem | 32px | Section internal spacing |
| space-xl | 4rem | 64px | Between major content groups |
| space-2xl | 8rem | 128px | Between page sections |
| space-3xl | 16rem | 256px | Hero vertical breathing room |

---

## Component Tokens

| Token | Value | Reasoning |
|-------|-------|-----------|
| Border Radius (small) | 2px | Near-zero precision — a watchmaker doesn't round corners |
| Border Radius (medium) | 4px | Minimal softening for interactive elements only |
| Border Radius (large) | 6px | Maximum. Used only on modals/overlays |
| Border Radius (full) | 9999px | Pills — for tags and domain badges only |
| Shadow (subtle) | 0 1px 4px hsla(238 37% 5% / 0.7) | Surface lift — barely perceptible depth |
| Shadow (medium) | 0 4px 20px hsla(238 37% 5% / 0.85), 0 1px 4px hsla(238 37% 5% / 0.5) | Card elevation — cosmic depth |
| Shadow (elevated) | 0 8px 40px hsla(238 37% 5% / 0.9), 0 2px 8px hsla(238 44% 16% / 0.6), 0 0 0 1px hsla(236 32% 24% / 0.6) | Modal, overlay — full depth |
| Transition Speed (fast) | 120ms | Micro-interactions, hover state color |
| Transition Speed (normal) | 300ms | Standard transitions |
| Transition Speed (slow) | 500ms | Entrance animations — deliberate, weighted |
| Transition Easing | cubic-bezier(0.16, 1, 0.3, 1) | Decelerates like something settling in zero gravity |

---

## Voice & Tone

- **Brand voice**: Precise, authoritative, quietly confident. Never explains itself. Never hedges. Speaks with the certainty of someone who has already seen how this ends.
- **Headline style**: Declarative. "Systems at scale." not "I help teams build scalable systems." No exclamation marks. No empty superlatives.
- **Body copy style**: Dense but clear. Respects the reader's intelligence. Technical without being impenetrable. Active voice, concrete examples.
- **CTA style**: Direct. "View the pattern." not "Click here to learn more." The reader always knows what they'll get.
- **Words to use**: architecture, pattern, system, precision, scale, craft, clarity, depth, structure, proven, systematic
- **Words to avoid**: leverage, synergy, passionate about, journey, guru, ninja, rockstar, innovative solutions, cutting-edge, revolutionary

---

## Usage Notes

- **Dark-only**: No light mode. The brand lives in the dark. Permanent, intentional, non-negotiable.
- **Cormorant Garamond at scale**: The heading font is designed to be used large. At body size it loses its magic. Display and H1 are where it lives.
- **Stellar Amber is precious**: Use it sparingly — for the one thing on a page that needs to catch the eye. If everything is amber, nothing is.
- **Negative space as design**: Resist the urge to fill. The void between elements is part of the brand. A Swiss watchmaker's workshop is not cluttered.
- **Stars as data**: The aesthetic of the brand isn't decorative — it's metaphorical. Patterns connect like constellations. Complexity reveals itself like the Milky Way: overwhelming at first, then beautiful, then navigable.
