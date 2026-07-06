# Daily Build Progress Ledger

Last updated: 2026-07-06 by automated agent

## Completed Increments
| Date | Increment | Commit |
|------|-----------|--------|
| 2026-05-14 | Backend domain overview page — src/pages/backend.astro | e1465aa |
| 2026-05-15 | Data Pipeline domain overview page — src/pages/data.astro | 64e86b2 |
| 2026-05-15 | Infrastructure domain overview page — src/pages/infra.astro | 66f168c |
| 2026-05-18 | Frontend domain overview page — src/pages/frontend.astro | 90ea061 |
| 2026-05-19 | Frontend pattern: Component Composition — docs/patterns/frontend/component-composition.mdx | fe367d2 |
| 2026-05-20 | Frontend pattern: State Management — docs/patterns/frontend/state-management-patterns.mdx | 333f6c5 |
| 2026-05-21 | Frontend pattern: Micro-Frontend Architecture — docs/patterns/frontend/micro-frontend-architecture.mdx | 4c25323 |
| 2026-05-22 | Backend pattern: CQRS — docs/patterns/backend/cqrs.mdx | 703f104 |
| 2026-05-25 | Infrastructure pattern: Infrastructure as Code — docs/patterns/infrastructure/infrastructure-as-code.mdx | 0a9bd3c |
| 2026-05-26 | Data Pipeline pattern: Batch vs Streaming — docs/patterns/data-pipeline/batch-vs-streaming.mdx | 1cde59e |
| 2026-05-27 | Wire DomainCard links to domain pages — fix BASE_URL trailing slash in src/components/DomainCard.astro | d8df2aa |
| 2026-05-28 | Add navigation bar to BaseLayout — SiteNav.astro with sticky cartouche nav, domain links, active-page state | 0d691e2 |
| 2026-06-01 | Add footer to BaseLayout — SiteFooter.astro with domain nav, tagline, coordinates strip, and copyright | 3f76fcf |
| 2026-06-02 | PatternCard component — src/components/PatternCard.astro | 6ca5ac2 |
| 2026-06-03 | Retrofit domain pages to use PatternCard — all 4 domain pages | e7b9119 |
| 2026-06-04 | About page skeleton — src/pages/about.astro + About link in SiteNav | bf140b6 |
| 2026-06-05 | ProfileSheet React island (proficiency bars) — src/components/ProfileSheet.tsx | 20a4f2e |
| 2026-06-08 | Anti-pattern catalog page (3 initial entries) — src/pages/anti-patterns.astro | f3b326f |
| 2026-06-09 | SkillTree React island (static data, interactive) — src/components/SkillTree.tsx | 7c871a0 |
| 2026-06-10 | Integrate SkillTree into domain pages — all 4 domain pages | 9b9272f |
| 2026-06-11 | Case study 1: Backend API Redesign — src/pages/case-studies/backend-api-redesign.astro | e2ad54b |
| 2026-06-12 | Case study 2: Data Pipeline Migration — src/pages/case-studies/data-pipeline-migration.astro | 3c5bf5e |
| 2026-06-22 | Content cross-linking pass — 25 new cross-links across all 14 MDX patterns | 12797a6 |
| 2026-06-23 | Playwright smoke tests for all 9 site pages — tests/pages.spec.ts | 694667b |
| 2026-06-24 | Sandpack live code playground for Dependency Injection pattern — src/components/SandpackPlayground.tsx + docs/patterns/backend/dependency-injection.mdx | fd5573f |
| 2026-06-25 | SEO maintenance — Open Graph, Twitter Card, and canonical URL meta tags in BaseLayout.astro | f8bb5e4 |

## Maintenance Mode
All 25 queue items complete. Running SEO, cross-linking, and content enrichment improvements.

## Maintenance Log
| Date | Improvement |
|------|-------------|
| 2026-06-25 | Open Graph + Twitter Card + canonical URL meta tags in BaseLayout.astro |
| 2026-06-26 | Add Snowflake Server (Infra, sev 4) and Prop Drilling (Frontend, sev 3) anti-patterns — completes all 4 domain coverage | 2a60ae6 |
| 2026-06-29 | Case study 3: Infrastructure Platform Migration (INFRA-01) — Kubernetes + IaC, before/after SVG diagram, cross-links from infra domain page and data pipeline case study | d1ac8f2 |
| 2026-06-30 | Case study 4: Frontend Micro-Frontend Migration (FE-01) — Module Federation + Component Composition, before/after SVG diagram, cross-links from frontend domain page and infra case study chain | f664c86 |
| 2026-07-01 | Case Studies index page — /case-studies/ listing all 4 studies with cartouche register layout + "Case Studies" nav link in SiteNav | 332afa8 |
| 2026-07-02 | Backend domain hexagonal architecture SVG diagram — replaces viz placeholder with three-layer concentric hexagon (Core/Ports/Adapters), six adapter labels, dependency arrows, legend | d926aa0 |
| 2026-07-03 | Infrastructure domain Kubernetes orchestration SVG diagram — replaces viz placeholder with Control Plane, two Worker Nodes, Pod grids, Service/Ingress layer, and Terraform/Helm IaC annotation | 05d048e |
| 2026-07-06 | BatchStreamViz animated canvas on data pipeline page — two-lane canvas: batch lane accumulates and flushes fixed windows; stream lane emits continuous glowing motes per-event. Illustrates the Batch vs Streaming trade-off. | 3a595bf |

## Current Queue
1. [x] Backend domain overview page — src/pages/backend.astro
2. [x] Data Pipeline domain overview page — src/pages/data-pipeline.astro
3. [x] Infrastructure domain overview page — src/pages/infra.astro
4. [x] Frontend domain overview page — src/pages/frontend.astro
5. [x] Frontend pattern: Component Composition — docs/patterns/frontend/component-composition.mdx
6. [x] Frontend pattern: State Management — docs/patterns/frontend/state-management-patterns.mdx
7. [x] Frontend pattern: Micro-Frontend Architecture — docs/patterns/frontend/micro-frontend-architecture.mdx
8. [x] Backend pattern: CQRS — docs/patterns/backend/cqrs.mdx
9. [x] Infrastructure pattern: Infrastructure as Code — docs/patterns/infrastructure/infrastructure-as-code.mdx
10. [x] Data Pipeline pattern: Batch vs Streaming — docs/patterns/data-pipeline/batch-vs-streaming.mdx
11. [x] Wire DomainCard links to domain pages — src/components/DomainCard.astro
12. [x] Add navigation bar to BaseLayout — src/layouts/BaseLayout.astro
13. [x] Add footer to BaseLayout — src/layouts/BaseLayout.astro
14. [x] PatternCard component — src/components/PatternCard.astro
15. [x] Retrofit domain pages to use PatternCard — all 4 domain pages
16. [x] About page skeleton — src/pages/about.astro
17. [x] ProfileSheet React island (proficiency bars) — src/components/ProfileSheet.tsx
18. [x] Anti-pattern catalog page (3 initial entries) — src/pages/anti-patterns.astro
19. [x] SkillTree React island (static data, interactive) — src/components/SkillTree.tsx
20. [x] Integrate SkillTree into domain pages — all 4 domain pages
21. [x] Case study 1: Backend (Mermaid diagram) — src/pages/case-studies/backend-api-redesign.astro
22. [x] Case study 2: Data Pipeline — src/pages/case-studies/data-pipeline-migration.astro
23. [x] Content cross-linking pass — all 10 existing MDX patterns
24. [x] Playwright smoke tests for new pages — tests/pages.spec.ts
25. [x] Sandpack live code playground for one pattern — one backend MDX file
