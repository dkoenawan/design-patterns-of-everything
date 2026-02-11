# Solution Architect Career Portfolio

## Project Overview

This is a **Solution Architect portfolio site** built with Astro + MDX, showcasing design patterns, architecture experience, case studies, and certifications. Deployed on GitHub Pages.

**Repository Name**: `design-patterns-of-everything` (to be created as public repo)
**Deployment**: GitHub Pages
**Current Phase**: Session 1 - Landing Page Development

## Target Audience

- **Recruiters**: Evaluating technical leadership and architecture expertise
- **Potential Clients**: Assessing real-world problem-solving capabilities
- **Aspiring Architects**: Seeking mentorship and learning from career progression

## Design Philosophy

- **Visual-only D&D-inspired aesthetic** — RPG sourcebook visual style (parchment palette, styled cards, progression visuals) but ALL text uses plain professional language
- **No gaming terminology visible on site** — just professional terms like "Design Patterns," "Case Studies," and "Anti-Patterns"
- **Career-domain structure** — organized into 4 architecture domains: Frontend, Backend, Data Pipeline, Infrastructure
- **Skill progression visualization** — driven by certifications AND career experience
- **Self-contained** — no links to external repos, client projects anonymized
- **Iterative development** — start with landing page, expand session-by-session

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

**RPG sourcebook-inspired aesthetic with professional readability:**

- **Palette**: Warm golds, deep browns, parchment tones (aged paper aesthetic)
- **Typography**: Serif headings (Crimson Pro), JetBrains Mono for code
- **Domain accent colors**: Each domain has distinct professional color
- **Card-based layouts**: Well-organized information presentation
- **Dark mode**: Deep, rich tones — readable and professional
- **Subtle embellishments**: Tasteful borders, section dividers

**Critical**: Must pass professional scrutiny — think "executive presentation with personality" not "D&D campaign notes"

## Development Roadmap

### Session 1: Landing Page ⭐ CURRENT
- Initialize Astro project in new `design-patterns-of-everything` repo
- Apply parchment-inspired aesthetic
- Build landing page sections (Hero, About, Expertise, Approach, Contact)
- Deploy to GitHub Pages
- **Success Criteria**: Professional appearance, mobile responsive, fast loading, clear value prop

### Session 2: Foundation & Structure
- Configure content collection schemas
- Refine CSS theme
- Build `<PatternCard>` component
- Create navigation structure

### Session 3: Seed Content
- Migrate 8 existing patterns into domains
- Create 4 domain overview pages
- Create About Me page
- Write 1 case study

### Sessions 4+: Interactive components, anti-patterns, diagrams, live code, expansion

## Directory Structure (Target)

```
career-portfolio/
  astro.config.mjs
  package.json
  src/
    content/
      config.ts                         # Typed content schemas
      docs/
        index.mdx                       # Home / landing
        about.mdx                       # Interactive resume
        frontend/                       # Frontend domain
        backend/                        # Backend domain
        data-pipeline/                  # Data pipeline domain
        infrastructure/                 # Infrastructure domain
        cross-domain/patterns/          # SRP, Composition, etc.
        anti-patterns/                  # Anti-pattern catalog
        toolkit/                        # Decision frameworks
    components/
      PatternCard.astro
      SkillTree.tsx
      ProfileSheet.tsx
      [other custom components]
    styles/
      custom.css                        # RPG sourcebook theme
      domains.css                       # Domain accent colors
  public/
    fonts/
    images/
  .github/workflows/deploy.yml         # GitHub Pages deployment
```

## Content Migration Map

Existing patterns to be migrated:

| Pattern | Domain | Complexity |
|---|---|---|
| Medallion Architecture | Data Pipeline | Expert |
| Hexagonal Architecture | Backend | Advanced |
| Pure Functions | Data Pipeline | Core |
| Schema-Driven Validation | Data Pipeline | Core |
| Dependency Injection | Backend | Core |
| Single Responsibility | Cross-Domain | Fundamentals |
| Composition Over Inheritance | Cross-Domain | Core |
| Strategy Pattern | Backend | Core |

## Important Notes

- **Internal name**: "Architect's Grimoire" is for development only
- **Public-facing name**: "Solution Architect Portfolio" or similar professional branding
- All visible text must use professional terminology
- Repository must be **public** for GitHub Pages to work
- Start minimal and iterate — landing page first, then expand
- Each session should have clear deliverables and verification steps

## Commands

Once project is initialized:
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- Deploy via GitHub Actions on push to main

## Next Steps

1. Create public GitHub repository named `career-portfolio`
2. Clone to `/home/su-sentinel/private/career-portfolio`
3. Initialize Astro project with React and MDX integrations
4. Build Session 1 landing page
5. Configure GitHub Pages deployment
