# Solution Architect Career Portfolio — Master Plan

## Context

A Solution Architect portfolio that showcases design patterns, architecture experience, case studies, and certifications in an innovative, memorable way. Deployed on GitHub Pages.

**Target Audience**:
- **Recruiters**: Evaluating technical leadership and architecture expertise
- **Potential Clients**: Assessing real-world problem-solving capabilities
- **Aspiring Architects**: Seeking mentorship and learning from career progression

**Design Philosophy**:
- **Visual-only D&D-inspired aesthetic** — RPG sourcebook visual style (parchment palette, styled cards, progression visuals) but ALL text uses plain professional language. No "Grimoire," "spells," "quests," or "bestiary" visible on site — just "Design Patterns," "Case Studies," and "Anti-Patterns." Must pass professional scrutiny.
- **Career-domain structure** — organized into 4 architecture domains: Frontend, Backend, Data Pipeline, Infrastructure
- **Skill progression visualization** — driven by certifications AND career experience, expandable over time
- **Self-contained** — no links to external repos, client projects anonymized, code examples standalone
- **Iterative development** — start with landing page, expand session-by-session

---

## Repository Setup

**GitHub Repository**: `career-portfolio`

Create as public repo with no template — we'll build from scratch.

Steps:
1. Go to GitHub → New Repository
2. Name: `career-portfolio`
3. Public (required for GitHub Pages)
4. No README, no .gitignore, no license (we'll add these)
5. Clone it locally to `/home/su-sentinel/private/career-portfolio`

**Note**: "Architect's Grimoire" is the internal development name only. The actual site uses professional terminology throughout.

---

## Tech Stack

**Astro + MDX** deployed on GitHub Pages.

Why: Zero-JS by default (fast, SEO-friendly), typed content collections (Schema-Driven Validation pattern in action), MDX for interactive components, islands architecture for selective interactivity. Zero hosting cost.

```
astro                            # Modern static site generator
@astrojs/mdx                     # Rich content with components
@astrojs/react                   # Interactive islands (skill trees, visualizations)
sandpack                         # Live code playgrounds (later phase)
mermaid                          # Architecture diagrams
```

**Phased Approach**:
- **Phase 1**: Landing page (clean Astro, no Starlight - custom design)
- **Phase 2**: Add content structure (consider Starlight if documentation-heavy, or stay custom)
- **Phase 3**: Interactive components (skill trees, visualizations)
- **Phase 4**: Full pattern library and case studies

---

## Site Structure (Full Vision)

```
Home (Landing Page) ⭐ START HERE
├── About Me (interactive career overview with skill proficiency visualization)
│
├── Frontend Architecture
│   ├── Skills & Experience (visual progression: certifications + projects)
│   ├── Design Patterns
│   │   ├── Component Composition
│   │   ├── State Management Patterns
│   │   ├── Micro-Frontend Architecture
│   │   └── ...
│   └── Case Studies
│
├── Backend Architecture
│   ├── Skills & Experience
│   ├── Design Patterns
│   │   ├── Clean Architecture
│   │   ├── CQRS
│   │   ├── Hexagonal Architecture
│   │   ├── API Design Patterns
│   │   ├── Strategy Pattern
│   │   ├── Dependency Injection
│   │   └── ...
│   └── Case Studies
│
├── Data Pipeline Architecture
│   ├── Skills & Experience
│   ├── Design Patterns
│   │   ├── Medallion Architecture
│   │   ├── Schema-Driven Validation
│   │   ├── Pure Functions
│   │   ├── Batch vs Streaming
│   │   └── ...
│   └── Case Studies
│
├── Infrastructure & Platform
│   ├── Skills & Experience
│   ├── Design Patterns
│   │   ├── Monolith to Microservices
│   │   ├── Container Orchestration
│   │   ├── Infrastructure as Code
│   │   ├── CI/CD Architecture
│   │   └── ...
│   └── Case Studies
│
├── Anti-Patterns (common pitfalls with severity ratings and solutions)
│
├── Cross-Domain Patterns (SRP, Composition, patterns that apply across multiple domains)
│
└── Resources (decision frameworks, architecture kickoff guide, review checklists)
```

**Development Priority**: Start with landing page, then expand domain-by-domain as content is ready.

---

## Key Features

### 1. Skill Trees (Flagship Feature)

Each domain has an interactive skill tree showing progression:
- **Nodes** = skills, certifications, technologies, completed projects
- **Tiers**: Fundamentals → Core → Advanced → Expert
- **Visual**: unlocked/locked states, certification badges, links to relevant patterns and case studies
- Click a node → navigate to the content that demonstrates that skill
- Add new nodes as you earn certs or complete projects

### 2. Pattern Cards

Each design pattern gets a structured card (RPG sourcebook styling, professional content):

```
┌─────────────────────────────────────────────┐
│  HEXAGONAL ARCHITECTURE                     │
│  Domain: Backend Architecture               │
│  Complexity: Advanced                       │
│─────────────────────────────────────────────│
│  Setup Effort:  2–3 sprints                 │
│  Scope:         Service-level               │
│  Requires:      Port interfaces, Adapter    │
│                 implementations, DI container│
│─────────────────────────────────────────────│
│  What It Does:                              │
│    Isolates domain logic from external      │
│    concerns via ports & adapters            │
│                                             │
│  Problems It Solves:                        │
│    Tight Coupling, Framework Lock-in        │
│                                             │
│  Applied In:                                │
│    Data pipeline service — decoupled        │
│    business logic from storage layer        │
│                                             │
│  [▶ Live Code Example]                      │
│  [📊 Architecture Diagram]                  │
└─────────────────────────────────────────────┘
```

### 3. Interactive Resume

Professional resume styled with RPG sourcebook visual treatment:
- **Domain proficiency bars** (Frontend, Backend, Data, Infra)
- **Certifications** displayed as earned badges
- **Skill tree links** per domain
- **Key metrics**: patterns documented, case studies, years of experience

### 4. Anti-Pattern Catalog

Common pitfalls with severity ratings:
- Severity (Critical / High / Medium / Low)
- Where you typically find it (monoliths, fast-growing startups, legacy code)
- What damage it causes (tech debt, coupling, performance)
- Which patterns fix it (links to pattern pages)
- Real-world encounter story (anonymized)

### 5. Case Studies

Self-contained narratives for each project:
- **Business Problem**: What needed solving
- **Technical Landscape**: Existing systems, constraints
- **Approach**: Patterns applied, decisions made
- **Architecture Diagram**: Mermaid diagram
- **Outcomes**: Metrics, before/after, lessons learned

---

## Leveling System

### Overall Level

| Level | Title | Meaning |
|---|---|---|
| 1–4 | Junior | Learning fundamentals, first projects |
| 5–8 | Mid-Level | Applying patterns independently |
| 9–12 | Senior | Designing systems end-to-end, mentoring |
| 13–16 | Lead / Principal | Cross-domain expertise, defining standards |
| 17–20 | Solution Architect | Organization-wide architecture, thought leadership |

### Per-Domain Tiers

Each domain's skill tree has 4 tiers:
- **Fundamentals** — core concepts everyone should know
- **Core** — patterns you apply regularly
- **Advanced** — complex patterns requiring significant experience
- **Expert** — system-level patterns, architecture at scale

Certifications attach to specific nodes in the tree. Career experience (demonstrated by case studies) also unlocks nodes. Both are first-class.

---

## Content Migration

Existing patterns → their career domains:

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

---

## Custom Components

| Component | Type | Purpose |
|---|---|---|
| `<PatternCard>` | Astro | Structured pattern display with domain colors |
| `<SkillTree>` | React island | Interactive skill tree per domain — **flagship** |
| `<ProfileSheet>` | React island | Interactive resume with proficiency bars |
| `<AntiPatternCard>` | Astro | Anti-pattern with severity and fixes |
| `<ArchDiagram>` | Astro | Parchment-styled Mermaid diagram wrapper |
| `<TechCard>` | Astro | Technology/tool card with proficiency level |
| `<LiveCode>` | React island | Sandpack wrapper for runnable examples |
| `<CertBadge>` | Astro | Certification display |

---

## Visual Theme

RPG sourcebook-inspired aesthetic with professional readability:

**Core Principles**:
- Must pass professional scrutiny (recruiter/client first impression)
- Memorable without being gimmicky
- All visible text is professional (no gaming terminology)
- Visual interest through layout, color, and typography

**Design Elements**:
- **Palette**: Warm golds, deep browns, parchment tones (think aged paper, not fantasy game)
- **Typography**: Serif for headings (Crimson Pro or similar), JetBrains Mono for code
- **Domain accent colors**: Each of the 4 domains gets a distinct professional color
- **Card-based layouts**: Information presented in well-organized cards
- **Dark mode**: Deep, rich tones — readable and professional
- **Subtle embellishments**: Tasteful borders, section dividers (not overly ornate)

**What to Avoid**:
- ❌ Fantasy game terminology visible to users
- ❌ Overly decorative fonts that hurt readability
- ❌ Childish or unprofessional color schemes
- ❌ Cluttered layouts
- ✅ Think "executive presentation with personality" not "D&D campaign notes"

---

## Directory Structure

```
architects-grimoire/
  astro.config.mjs
  package.json
  src/
    content/
      config.ts                         # Typed content schemas
      docs/
        index.mdx                       # Home / welcome
        about.mdx                       # Interactive resume
        frontend/
          index.mdx                     # Domain overview + skill tree
          patterns/                     # Frontend design patterns
          case-studies/                 # Frontend case studies
        backend/
          index.mdx
          patterns/
          case-studies/
        data-pipeline/
          index.mdx
          patterns/
          case-studies/
        infrastructure/
          index.mdx
          patterns/
          case-studies/
        cross-domain/
          patterns/                     # SRP, Composition, etc.
        anti-patterns/                  # Anti-pattern catalog
        toolkit/                        # Decision frameworks, guides
    components/
      PatternCard.astro
      SkillTree.tsx
      ProfileSheet.tsx
      AntiPatternCard.astro
      ArchDiagram.astro
      TechCard.astro
      LiveCode.tsx
      CertBadge.astro
    styles/
      custom.css                        # RPG sourcebook theme
      domains.css                       # Per-domain accent colors
  public/
    fonts/
    images/
  .github/workflows/deploy.yml         # GitHub Pages deployment
```

---

## Development Roadmap

### Session 1: Landing Page ⭐ START HERE
**Goal**: Create compelling landing page that demonstrates the innovative approach

- Initialize Astro project in `career-portfolio` repo
- Apply parchment-inspired aesthetic (warm tones, card layouts, professional typography)
- Build landing page sections:
  - Hero: Value proposition + who this is for
  - About: Brief introduction
  - Expertise Areas: 4 architecture domains preview
  - Approach: How problems are solved
  - Contact/Connect: Professional links
- Deploy to GitHub Pages
- **Success Criteria**: Professional appearance, works on mobile, fast loading, clear value prop

### Session 2: Foundation & Structure
- Decide: Stay custom or adopt Starlight for documentation structure
- Configure content collection schemas (`config.ts`)
- Refine RPG sourcebook CSS theme (parchment palette, typography, domain colors)
- Build `<PatternCard>` component
- Create navigation structure

### Session 3: Seed Content
- Migrate 8 existing patterns from DESIGN_PATTERNS.md into their domains
- Create 4 domain overview pages
- Create About Me page (career overview)
- Write 1 case study narrative

### Session 4: Interactive Components
- Build skill/experience progression visualization (React island)
- Build proficiency bars for domain expertise
- Add certification badges

### Session 5: Anti-Patterns & Diagrams
- Build `<AntiPatternCard>` component + 4–6 initial entries
- Build `<ArchDiagram>` Mermaid wrapper with parchment styling
- Add architecture diagrams to case studies

### Session 6: Live Code & Polish
- Add `<LiveCode>` Sandpack for select patterns
- Polish theme (dark mode, responsive, ornamental dividers)
- Open Graph images for social sharing
- Lighthouse performance audit

### Session 7+: Expand
- More patterns, case studies, anti-patterns
- Add certifications as earned
- Resources section (decision frameworks, guides)
- Consider: blog for architecture thoughts/lessons learned

---

## Verification (Per Session)

### Session 1 (Landing Page):
1. `npm run dev` — landing page renders with parchment-inspired design
2. Hero section clearly communicates value proposition
3. All sections visible and well-formatted
4. Mobile responsive (test on phone viewport)
5. `npm run build` — zero errors
6. GitHub Actions deploys to Pages successfully
7. Site loads fast (Lighthouse performance 90+)

### Future Sessions:
- Pattern cards display with domain-colored accents
- Interactive components respond to user actions
- Mermaid diagrams render in styled wrapper
- Code examples run correctly
- Dark mode works properly
- All internal links navigate correctly
- SEO meta tags present
- Lighthouse scores 90+ across all metrics
