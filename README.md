# Design Patterns of Everything

A Solution Architect portfolio site showcasing design patterns, architecture expertise, and career progression. Built with Astro + MDX + React and deployed to GitHub Pages.

**Live site**: https://dkoenawan.github.io/design-patterns-of-everything/

## 🌌 Brand Identity

**Stellar cartography aesthetic** — The night sky as metaphor for knowledge and discovery.

- **Dark-only mode** — Cosmic indigo primary, stellar amber accents, nebula white text
- **Fonts**: Cormorant Garamond (headings), Inter (body), JetBrains Mono (code)
- **Emotional arc**: Awe-struck → Quiet reverence → Inspired confidence
- **Philosophy**: Premium, focused experience for recruiters and potential clients

See `brand/brand-guideline.md` for complete design system documentation.

## 📚 Content Organization

Portfolio organized into **4 architecture domains** + cross-domain patterns:

1. **Frontend Architecture** — Component patterns, state management, micro-frontends
2. **Backend Architecture** — Clean architecture, CQRS, hexagonal architecture, API design
3. **Data Pipeline Architecture** — Medallion, schema-driven validation, pure functions
4. **Infrastructure & Platform** — Microservices, orchestration, IaC, CI/CD

**Current patterns**: 10 seeded patterns across all domains (see `CLAUDE.md` for full list)

Patterns located in `docs/patterns/{domain}/` as MDX files.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Site Generator | Astro 5.17.1 |
| Content | MDX 4.3.13 |
| Interactivity | React 19.2.4 |
| Styling | CSS (custom theme) |
| Testing | Playwright 1.58.2 |
| Hosting | GitHub Pages |

## 🚀 Commands

```bash
npm run dev          # Start development server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm test             # Run Playwright tests
npm run test:screenshot  # Run landing page screenshot tests
```

## 📁 Project Structure

```
src/
  pages/
    index.astro           # Landing page
  components/
    Hero.astro            # Hero section
    DomainCard.astro      # Domain showcase cards
    Starfield.tsx         # React starfield canvas
  layouts/
  styles/
  lib/

docs/
  patterns/
    backend/              # Backend domain patterns
    data-pipeline/        # Data pipeline patterns
    cross-domain/         # Cross-domain patterns (SRP, Composition, etc.)
    infrastructure/       # Infrastructure patterns
    frontend/             # [Patterns to be added]

brand/
  brand-guideline.md      # Brand identity documentation
  brand-theme.css         # Cosmic palette CSS variables
  brand-effects.css       # Stellar effects & animations
  brand-showcase.html     # Component showcase & examples
  tailwind.brand.js       # Tailwind config mapping

tests/
  landing-page.spec.ts    # Playwright E2E tests

.github/workflows/
  deploy.yml              # GitHub Pages deployment
```

## 🎨 Component Examples

### Hero Section
```astro
<Hero />
```
Main landing section with animated starfield and tagline.

### Domain Card
```astro
<DomainCard
  domain="Backend"
  description="Clean architecture, CQRS, API design..."
/>
```
Card showcasing a domain with accent color and patterns.

### Starfield Canvas
```tsx
<Starfield />
```
React component rendering animated star field background.

## 🧑‍💼 Content Development

### Adding a New Pattern

1. Create file in `docs/patterns/{domain}/{pattern-name}.mdx`
2. Use template from `docs/patterns/_template.mdx`
3. Include: overview, complexity rating, key concepts, code examples
4. Link from domain overview page when created

### Adding a New Page

1. Create `.astro` file in `src/pages/`
2. Use brand theme: import CSS from `brand/brand-theme.css`
3. Reference component patterns: `Hero.astro`, `DomainCard.astro`
4. Build responsive with Astro layouts

## 🧪 Testing

**Playwright E2E tests** verify landing page:

```bash
npm run test                 # Run all tests
npm run test:screenshot      # Landing page screenshot tests
```

Tests located in `tests/landing-page.spec.ts`.

## 📖 Brand System Reference

**When creating new components:**

1. Check `brand/brand-showcase.html` for component examples
2. Reference `brand/brand-theme.css` for CSS variables (colors, typography)
3. Follow `brand/brand-guideline.md` for design principles
4. Use Cormorant Garamond for headings, Inter for body text

**Key CSS Variables:**
- `--color-cosmic-indigo` — Primary backgrounds
- `--color-stellar-amber` — Precious accents (use sparingly)
- `--color-nebula-white` — Primary text
- `--color-void-black` — Deep backgrounds

## 📝 Important Notes

- **All text professional** — No gaming terminology; pure architecture language
- **Dark-only** — No light mode variant
- **Self-contained** — No external repo links; projects anonymized
- **MDX for patterns** — Rich content with embedded React components
- **Astro zero-JS default** — Interactive components only as React islands

## 🔗 Related Files

- **Project instructions**: `CLAUDE.md` (architecture, roadmap, development guidelines)
- **Brand documentation**: `brand/brand-guideline.md` (full design system)
- **Pattern template**: `docs/patterns/_template.mdx` (new pattern guide)
- **Playwright tests**: `tests/landing-page.spec.ts` (E2E test examples)

## 📅 Development Roadmap

**Sessions 1-3**: ✅ Completed (landing page, brand system, 10 patterns seeded)

**Sessions 4+**:
- [ ] Domain overview pages
- [ ] Interactive resume
- [ ] Case studies with diagrams
- [ ] Anti-pattern catalog
- [ ] Skill tree visualizations
- [ ] Frontend patterns
- [ ] Live code playgrounds

## 🤝 Contributing

When adding content or components:

1. Follow brand guidelines (see `brand/brand-guideline.md`)
2. Use professional terminology only
3. Add Playwright tests for new pages
4. Reference existing component patterns
5. Keep styles in `src/styles/` or inline with Astro components

---

**Built with Astro • Styled with stellar cartography • Deployed on GitHub Pages**
