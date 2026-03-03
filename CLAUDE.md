# Solution Architect Career Portfolio

## Project Overview

This is a **Solution Architect portfolio site** built with Astro + MDX, showcasing design patterns, architecture experience, case studies, and certifications. Deployed to GitHub Pages with a stellar cartography-inspired dark aesthetic.

**Repository Name**: `design-patterns-of-everything` (public repo)
**Deployment**: GitHub Pages (active)
**Current Phase**: Session 4+ - Content Expansion & Interactive Components

## Target Audience

- **Recruiters**: Evaluating technical leadership and architecture expertise
- **Potential Clients**: Assessing real-world problem-solving capabilities
- **Aspiring Architects**: Seeking mentorship and learning from career progression

## Design Philosophy

**Stellar Cartography Aesthetic** — The night sky as metaphor for knowledge, discovery, and connection
- **Emotional arc**: Awe-struck → Quiet reverence → Inspired confidence
- **Visual identity**: Dark-only mode (no light variant), cosmic indigo primary, stellar amber accents, nebula white text
- **Typography**: Cormorant Garamond (serif headings, light/400 weights), Inter (body), JetBrains Mono (code)
- **Career-domain structure** — organized into 4 architecture domains: Frontend, Backend, Data Pipeline, Infrastructure
- **All text professional** — no gaming terminology visible; pure architecture and design pattern language
- **Skill progression visualization** — driven by certifications AND career experience
- **Self-contained** — no links to external repos, client projects anonymized
- **Iterative development** — expand session-by-session

## Tech Stack

- **Astro** — Modern static site generator, zero-JS by default
- **MDX** — Rich content with embedded components
- **React** — Interactive islands (skill trees, visualizations)
- **Mermaid** — Architecture diagrams
- **Sandpack** — Live code playgrounds (later phase)

## Architecture Domains

1. **Frontend Architecture** — Component patterns, state management, micro-frontends
2. **Backend Architecture** — Clean architecture, CQRS, hexagonal architecture, API design
3. **Data Pipeline Architecture** — Medallion architecture, schema-driven validation, pure functions
4. **Infrastructure & Platform** — Microservices, container orchestration, IaC, CI/CD

## Key Features

1. **Skill Trees** (Flagship) — Interactive progression visualization per domain
2. **Pattern Cards** — Structured cards for each design pattern with complexity, scope, and examples
3. **Interactive Resume** — Professional resume with domain proficiency bars and certification badges
4. **Anti-Pattern Catalog** — Common pitfalls with severity ratings and solutions
5. **Case Studies** — Self-contained project narratives with architecture diagrams

## Visual Theme

**Stellar Cartography Implementation:**

- **Primary palette**:
  - Cosmic Indigo `hsl(238 37% 16%)` — primary backgrounds, trust
  - Stellar Amber `hsl(38 63% 47%)` — sparingly used accents, precious highlights
  - Nebula White `hsl(234 47% 93%)` — primary text, readability
  - Void Black `hsl(237 44% 7%)` — deepest backgrounds
- **Card-based layouts**: Information presented as constellation-like groupings
- **Glassmorphism & starfield effects**: Subtle animations, premium feel
- **Domain accent colors**: Each domain has distinct professional color within cosmic palette
- **Dark-only**: No light mode; focused on premium, focused experience

**Critical**: Premium professional aesthetic — celestial theme provides visual metaphor without compromising technical credibility. Think "luxury observatory dashboard" not "gaming interface."

## Development Roadmap

### ✅ Session 1: Landing Page
- ✅ Astro project initialized with React & MDX
- ✅ Stellar cartography aesthetic applied
- ✅ Landing page with Hero and DomainCard components
- ✅ Deployed to GitHub Pages

### ✅ Session 2: Foundation & Structure
- ✅ CSS theme system established (dark-only, cosmic palette)
- ✅ Brand identity documented in `brand/` directory
- ✅ Component structure in place (Hero, DomainCard, Starfield)
- ✅ Navigation ready

### ✅ Session 3: Seed Content
- ✅ 8 design patterns created (Backend, Data Pipeline, Cross-Domain, Infrastructure)
- ✅ Pattern library in `docs/patterns/` (MDX)
- ✅ Docker port mapping & database orchestration patterns added
- ✅ Playwright tests for landing page verification

### Sessions 4+: Content Expansion & Interactive Features
- [ ] Domain overview pages (Frontend, Backend, Data Pipeline, Infrastructure)
- [ ] Interactive pattern cards with examples
- [ ] About Me / Interactive resume page
- [ ] Case studies with architecture diagrams
- [ ] Anti-pattern catalog
- [ ] Skill tree visualizations
- [ ] Live code playgrounds (Sandpack integration)

## Directory Structure (Current)

```
design-patterns-of-everything/
  astro.config.mjs
  package.json
  brand/                                # Brand identity system
    brand-guideline.md                  # Full brand documentation
    brand-theme.css                     # Cosmic palette CSS variables
    brand-effects.css                   # Stellar animations & effects
    brand-showcase.html                 # Component showcase
    tailwind.brand.js                   # Tailwind theme mapping
  src/
    pages/
      index.astro                       # Landing page (hero + domain cards)
    components/
      Hero.astro                        # Landing hero section
      DomainCard.astro                  # Domain showcase card
      Starfield.tsx                     # React starfield canvas
      StarfieldCanvas.css               # Starfield styles
    layouts/
      [layout components]
    styles/
      [shared styles]
    lib/
      [utilities]
  docs/
    patterns/
      _template.mdx                     # Pattern template
      backend/
        dependency-injection.mdx
        strategy-pattern.mdx
        hexagonal-architecture.mdx
      data-pipeline/
        medallion-architecture.mdx
        schema-driven-validation.mdx
        pure-functions.mdx
      cross-domain/
        single-responsibility.mdx
        composition-over-inheritance.mdx
      infrastructure/
        docker-port-mapping.mdx
        multi-database-orchestration.mdx
      frontend/                         # [Patterns to be added]
  tests/
    landing-page.spec.ts                # Playwright E2E tests
  .github/workflows/
    deploy.yml                          # GitHub Pages deployment
```

## Content Status

**Patterns Currently Seeded:**

| Pattern | Domain | Complexity | Status |
|---|---|---|---|
| Medallion Architecture | Data Pipeline | Expert | ✅ Complete |
| Hexagonal Architecture | Backend | Advanced | ✅ Complete |
| Pure Functions | Data Pipeline | Core | ✅ Complete |
| Schema-Driven Validation | Data Pipeline | Core | ✅ Complete |
| Dependency Injection | Backend | Core | ✅ Complete |
| Single Responsibility | Cross-Domain | Fundamentals | ✅ Complete |
| Composition Over Inheritance | Cross-Domain | Core | ✅ Complete |
| Strategy Pattern | Backend | Core | ✅ Complete |
| Docker Port Mapping | Infrastructure | Core | ✅ Complete |
| Multi-Database Orchestration | Infrastructure | Advanced | ✅ Complete |

**Planned Content:**
- Domain overview pages (4 pages)
- Interactive resume / About Me
- Case studies (2-3)
- Anti-pattern catalog
- Skill tree visualizations
- Frontend domain patterns (2-3)

## Important Notes

- **Brand identity**: Stellar cartography aesthetic (dark-only, cosmic indigo + stellar amber)
- **Repository status**: Public, GitHub Pages deployment active
- **All text professional**: No gaming terminology, pure architecture language
- **Pattern organization**: Domain-driven (Frontend, Backend, Data Pipeline, Infrastructure) + Cross-Domain patterns
- **Content format**: MDX in `docs/patterns/`, components in `src/components/` and `src/pages/`
- **Testing**: Playwright E2E tests for landing page; expand as new pages added
- **Brand files**: Complete system in `brand/` directory — use as reference for new components

## Commands

Once project is initialized:
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- Deploy via GitHub Actions on push to main

## Next Steps (Session 4+)

1. **Domain overview pages** — Create `/frontend`, `/backend`, `/data-pipeline`, `/infrastructure` pages with pattern catalogs
2. **Interactive resume** — Build `/about` with skills matrix, certifications, and career progression
3. **Case studies** — Add 2-3 self-contained narratives with architecture diagrams
4. **Anti-pattern catalog** — Create catalog with severity ratings and mitigation strategies
5. **Skill tree visualization** — Implement React component for interactive progression per domain
6. **Frontend patterns** — Add 2-3 patterns for Frontend Architecture domain
7. **Live code playgrounds** — Integrate Sandpack for pattern examples
8. **Content linking** — Connect patterns to case studies and domain pages

**Development approach**: Use brand system from `brand/` for all new components; refer to `Hero.astro` and `DomainCard.astro` for component patterns.
