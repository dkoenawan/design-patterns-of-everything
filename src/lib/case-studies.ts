// Which atlas patterns each case study applies. Pattern pages read this to
// link back to the studies that use them; the ids mirror each study's
// "Patterns applied" sidebar (tests/pages.spec.ts checks they stay in step).

export interface CaseStudyLink {
  /** Page file name under src/pages/case-studies/ */
  slug: string;
  /** Catalogue reference shown on the page, e.g. BE-01 */
  ref: string;
  title: string;
  subtitle: string;
  /** atlas-data pattern ids listed under "Patterns applied" */
  patterns: string[];
}

export const caseStudies: CaseStudyLink[] = [
  {
    slug: 'backend-api-redesign',
    ref: 'BE-01',
    title: 'Backend API Redesign',
    subtitle: 'Hexagonal Architecture & CQRS at Scale',
    patterns: ['hexagonal-architecture', 'cqrs', 'dependency-injection', 'strategy-pattern'],
  },
  {
    slug: 'data-pipeline-migration',
    ref: 'DP-01',
    title: 'Data Pipeline Migration',
    subtitle: 'Medallion Architecture & Schema-Driven Validation at Scale',
    patterns: ['medallion-architecture', 'schema-driven-validation', 'pure-functions', 'batch-vs-streaming'],
  },
  {
    slug: 'infra-platform-migration',
    ref: 'INFRA-01',
    title: 'Infrastructure Platform Migration',
    subtitle: 'Infrastructure as Code & Container Orchestration at Scale',
    patterns: ['infrastructure-as-code', 'docker-port-mapping', 'multi-database-orchestration'],
  },
  {
    slug: 'frontend-micro-frontend-migration',
    ref: 'FE-01',
    title: 'Micro-Frontend Migration',
    subtitle: 'Component Composition & Module Federation at Scale',
    patterns: ['micro-frontend-architecture', 'component-composition', 'state-management-patterns'],
  },
];

export function caseStudiesApplying(patternId: string): CaseStudyLink[] {
  return caseStudies.filter((s) => s.patterns.includes(patternId));
}
