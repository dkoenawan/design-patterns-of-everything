# Solution Architect Portfolio — Brand Identity Guidelines

## Brand Essence

This portfolio treats software architecture the way a master cartographer treats the night sky — as a vast, interconnected system of knowledge that rewards careful study. Built by someone who has spent years mapping patterns across domains, it shares that map generously. The tension it holds: deep technical authority that never feels gatekeeping. It's a tome you want to study, not a credential you're intimidated by. Precision and wonder coexist — dense information presented as something beautiful. The medium is the message: the site itself demonstrates the architectural thinking it teaches.

## Color System

### Primary Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Primary | Celestial Ink | #1E2A4A | hsl(224 43% 20%) | Primary actions, navigation, key UI elements, headings |
| Secondary | Star Gold | #C4973B | hsl(40 54% 50%) | Secondary actions, highlights, star markers, active states |
| Accent | Copper Flare | #B87333 | hsl(27 56% 46%) | CTAs, interactive highlights, important callouts |

### Domain Accent Colors

| Domain | Name | Hex | HSL | Usage |
|--------|------|-----|-----|-------|
| Frontend | Grid Teal | #2A8F8F | hsl(180 54% 36%) | Frontend domain cards, skill tree nodes, section accents |
| Backend | Deep Amber | #B8860B | hsl(43 89% 38%) | Backend domain cards, skill tree nodes, section accents |
| Data Pipeline | Sage Flow | #5E8C61 | hsl(123 20% 46%) | Data pipeline domain cards, skill tree nodes, section accents |
| Infrastructure | Steel Blue | #4682B4 | hsl(207 44% 49%) | Infrastructure domain cards, skill tree nodes, section accents |

### Neutral Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Background | Parchment | #F5F0E8 | hsl(40 38% 93%) | Page backgrounds |
| Surface | Vellum | #EDE7DB | hsl(38 32% 89%) | Cards, elevated surfaces, pattern cards |
| Border | Faded Rule | #D4CBBA | hsl(36 24% 78%) | Dividers, input borders, card edges |
| Text Primary | Deep Charcoal | #1C1A17 | hsl(36 10% 10%) | Headings, primary content |
| Text Secondary | Warm Slate | #4A453D | hsl(36 10% 27%) | Supporting text, labels, metadata |
| Text Muted | Aged Stone | #8A8279 | hsl(36 7% 51%) | Placeholders, disabled states, captions |

### Semantic Colors

| Role | Hex | HSL | Usage |
|------|-----|-----|-------|
| Success | #3D8B37 | hsl(116 43% 38%) | Successful operations, completed skills, unlocked nodes |
| Warning | #C4873B | hsl(33 54% 50%) | Caution states, approaching limits, draft content |
| Error | #B54334 | hsl(7 55% 46%) | Errors, critical anti-pattern severity |
| Info | #4A7FB5 | hsl(213 42% 50%) | Informational tooltips, help text, notes |

## Typography

### Type Scale

Scale ratio: 1.333 (perfect fourth) — dramatic enough for clear hierarchy across domain pages, pattern cards, and nested content levels.

| Level | Size (rem) | Weight | Line Height | Letter Spacing | Usage |
|-------|-----------|--------|-------------|----------------|-------|
| Display | 3.157 | 700 | 1.1 | -0.03em | Hero sections, landing page headline |
| H1 | 2.369 | 700 | 1.15 | -0.02em | Page titles, domain headings |
| H2 | 1.777 | 600 | 1.2 | -0.01em | Section headings |
| H3 | 1.333 | 600 | 1.25 | 0 | Subsection headings, pattern card titles |
| H4 | 1.125 | 600 | 1.3 | 0 | Card subtitles, sidebar headings |
| Body Large | 1.125 | 400 | 1.7 | 0 | Lead paragraphs, pattern descriptions |
| Body | 1 | 400 | 1.6 | 0 | Default text, case study prose |
| Body Small | 0.875 | 400 | 1.5 | 0.01em | Captions, metadata, complexity tags |
| Caption | 0.75 | 500 | 1.4 | 0.02em | Labels, fine print, certification dates |

### Font Families

- **Heading**: Crimson Pro — a scholarly serif with genuine weight and character. Its sharp terminals and moderate contrast convey authority and craftsmanship without feeling dated. The slight old-style flavor connects to the sourcebook aesthetic while reading as unmistakably professional. Weights 600-700.
- **Body**: Source Sans 3 — a humanist sans-serif with warmth that Inter lacks. Its slightly wider letterforms and open counters make it effortless to read at length, which matters for a site built around teaching. The warmth bridges the gap between the serif headings and technical content. Weights 400-600.
- **Mono**: JetBrains Mono — purpose-built for code. Excellent distinction between similar characters (0/O, 1/l/I), generous spacing, and a professional feel that matches the precision of the brand. Weight 400-500.

## Spacing System

Base unit: 0.5rem. Scale: 2x. Generous spacing reflects the watchmaker's workshop aesthetic — every element has room to breathe, nothing is crowded.

| Token | Value (rem) | Pixels | Usage |
|-------|------------|--------|-------|
| space-xs | 0.25 | 4 | Inline element gaps, icon padding, tight label spacing |
| space-sm | 0.5 | 8 | Form element gaps, tight component groups |
| space-md | 1 | 16 | Default component padding, list item gaps |
| space-lg | 1.5 | 24 | Card internal padding, related element groups |
| space-xl | 2.5 | 40 | Section element spacing, card gaps in grids |
| space-2xl | 4 | 64 | Major section breaks, domain section separators |
| space-3xl | 6 | 96 | Page section spacing, hero to content gap |

## Component Tokens

| Token | Value | Reasoning |
|-------|-------|-----------|
| Border Radius (small) | 2px | Precision. Star maps and cartographic elements use clean lines. Just enough softening to not feel harsh. |
| Border Radius (medium) | 4px | Cards and containers — present but restrained. Pattern cards should feel like printed reference cards. |
| Border Radius (large) | 6px | Modals, large panels — noticeable but not bubbly. Maintains the sharp, crafted feel. |
| Shadow (subtle) | 0 1px 3px hsla(36, 20%, 10%, 0.06) | Warm-tinted micro-shadow. Cards feel placed on the surface, like reference cards on a desk. |
| Shadow (medium) | 0 4px 12px hsla(36, 20%, 10%, 0.1) | Pattern cards, dropdowns — clearly elevated but not dramatic. Warm shadow tone. |
| Shadow (elevated) | 0 12px 32px hsla(36, 20%, 10%, 0.14) | Modals, overlays — floating with intention. The warm tint keeps shadows from feeling cold. |
| Transition Speed (fast) | 150ms | Hover state color shifts, icon rotations |
| Transition Speed (normal) | 280ms | Panel reveals, card hover lift, color transitions |
| Transition Speed (slow) | 420ms | Page transitions, skill tree node reveals, constellation line draws |
| Transition Easing | cubic-bezier(0.25, 0.05, 0.25, 1) | Slightly faster ease-in, gentle ease-out — deliberate and weighted, like precision machinery |

## Voice & Tone

- **Brand voice**: Knowledgeable, precise, generous. Speaks like a senior architect mentoring a colleague — technically exact but never condescending. Sentences are clear and direct. Complexity is explained, never hidden behind jargon or over-simplified into uselessness.
- **Headline style**: Clear and authoritative. "Design patterns for real-world architecture." Not "Unlock your architecture potential with powerful patterns!" No hype, no exclamation marks, no empty superlatives.
- **Body copy style**: Active voice, concrete examples. Explain what patterns do and when to use them, not what they theoretically represent. "Hexagonal Architecture isolates your domain logic from infrastructure concerns" not "Hexagonal Architecture is an architectural pattern that provides abstraction layers."
- **CTA style**: Specific and action-oriented. "Explore Backend Patterns" not "Learn More." "View Case Study" not "Click Here." The reader always knows what they'll get.
- **Words to use**: architecture, pattern, domain, craft, approach, structure, proven, systematic, progression, fundamentals
- **Words to avoid**: guru, ninja, rockstar, synergy, leverage, disrupt, cutting-edge, revolutionary, simple (dismissive), just (minimizing)
