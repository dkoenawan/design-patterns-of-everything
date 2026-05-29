export type PatternType = 'pattern' | 'principle' | 'anti';
export type DomainId = 'frontend' | 'backend' | 'data' | 'infra';

export interface Domain {
  id: DomainId;
  name: string;
  subtitle: string;
  english: string;
  blurb: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tint: string;
  href: string;
}

export interface Pattern {
  id: string;
  domain: DomainId;
  name: string;
  x: number;
  y: number;
  mag: number;
  type: PatternType;
  complexity: 1 | 2 | 3 | 4 | 5;
  note: string;
  href?: string;
}

export interface Connection {
  from: string;
  to: string;
  cross?: boolean;
}

// ── Domains ──────────────────────────────────────────────────────────────────

export const domains: Domain[] = [
  {
    id: 'frontend',
    name: 'Frontalia',
    subtitle: 'the Frontend Reach',
    english: 'Frontend Architecture',
    blurb:
      'Component patterns, state management strategies, micro-frontends, and scalable UI systems for complex applications.',
    cx: -780,
    cy: -420,
    rx: 360,
    ry: 280,
    tint: '#7aa3d4',
    href: '/frontend',
  },
  {
    id: 'backend',
    name: 'Backendis Major',
    subtitle: 'the Backend Expanse',
    english: 'Backend Architecture',
    blurb:
      'Clean architecture, CQRS, hexagonal patterns, and API design principles for maintainable server-side systems.',
    cx: 780,
    cy: -420,
    rx: 360,
    ry: 280,
    tint: '#d49a7a',
    href: '/backend',
  },
  {
    id: 'data',
    name: 'Pipea Vallis',
    subtitle: 'the Data Confluence',
    english: 'Data Pipeline Architecture',
    blurb:
      'Medallion architecture, schema-driven validation, pure functional pipelines, and reliable data transformation patterns.',
    cx: 780,
    cy: 420,
    rx: 360,
    ry: 280,
    tint: '#9ec48a',
    href: '/data',
  },
  {
    id: 'infra',
    name: 'Infrastructura',
    subtitle: 'the Platform Frontier',
    english: 'Infrastructure & Platform',
    blurb:
      'Microservices orchestration, container platforms, infrastructure as code, and CI/CD pipeline design for resilient production systems.',
    cx: -780,
    cy: 420,
    rx: 360,
    ry: 280,
    tint: '#c8a4d4',
    href: '/infra',
  },
];

// ── Patterns ─────────────────────────────────────────────────────────────────

export const patterns: Pattern[] = [
  // Frontend — Frontalia (cx:-780, cy:-420, r:360×280)
  {
    id: 'component-composition',
    domain: 'frontend',
    name: 'Component Composition',
    x: -820,
    y: -460,
    mag: 1.4,
    type: 'pattern',
    complexity: 1,
    note: 'Build complex UI from small, focused components that compose cleanly rather than inheriting behaviour.',
  },
  {
    id: 'state-management-patterns',
    domain: 'frontend',
    name: 'State Management Patterns',
    x: -740,
    y: -380,
    mag: 1.2,
    type: 'pattern',
    complexity: 2,
    note: 'Manage application state through well-defined flows — local, shared, and server state each handled at the right layer.',
  },
  {
    id: 'micro-frontend-architecture',
    domain: 'frontend',
    name: 'Micro-Frontend Architecture',
    x: -680,
    y: -520,
    mag: 0.9,
    type: 'pattern',
    complexity: 4,
    note: 'Decompose large frontend applications into independently deployable units owned by separate teams.',
  },

  // Backend — Backendis Major (cx:780, cy:-420, r:360×280)
  {
    id: 'hexagonal-architecture',
    domain: 'backend',
    name: 'Hexagonal Architecture',
    x: 820,
    y: -460,
    mag: 1.5,
    type: 'pattern',
    complexity: 4,
    note: 'Isolate application core logic from external dependencies using ports and adapters.',
  },
  {
    id: 'dependency-injection',
    domain: 'backend',
    name: 'Dependency Injection',
    x: 730,
    y: -380,
    mag: 1.3,
    type: 'pattern',
    complexity: 2,
    note: 'Provide dependencies to a component from the outside rather than constructing them internally.',
  },
  {
    id: 'strategy-pattern',
    domain: 'backend',
    name: 'Strategy Pattern',
    x: 860,
    y: -340,
    mag: 1.1,
    type: 'pattern',
    complexity: 2,
    note: 'Define a family of algorithms behind a common interface and make them interchangeable at runtime.',
  },
  {
    id: 'cqrs',
    domain: 'backend',
    name: 'CQRS',
    x: 740,
    y: -510,
    mag: 1.0,
    type: 'pattern',
    complexity: 4,
    note: 'Separate read and write models to optimise each path independently and reduce contention.',
  },

  // Data Pipeline — Pipea Vallis (cx:780, cy:420, r:360×280)
  {
    id: 'medallion-architecture',
    domain: 'data',
    name: 'Medallion Architecture',
    x: 820,
    y: 460,
    mag: 1.6,
    type: 'pattern',
    complexity: 5,
    note: 'Progressively refine raw ingested data through Bronze, Silver, and Gold layers, each adding quality and semantic richness.',
  },
  {
    id: 'schema-driven-validation',
    domain: 'data',
    name: 'Schema-Driven Validation',
    x: 730,
    y: 380,
    mag: 1.2,
    type: 'pattern',
    complexity: 2,
    note: 'Define and enforce data contracts at pipeline boundaries to catch structural violations before they propagate downstream.',
  },
  {
    id: 'pure-functions',
    domain: 'data',
    name: 'Pure Functions',
    x: 880,
    y: 360,
    mag: 1.1,
    type: 'principle',
    complexity: 1,
    note: 'Build transformation logic from functions that depend only on their inputs, enabling deterministic testing and safe composition.',
  },
  {
    id: 'batch-vs-streaming',
    domain: 'data',
    name: 'Batch vs Streaming',
    x: 760,
    y: 530,
    mag: 1.0,
    type: 'pattern',
    complexity: 3,
    note: 'Choose between bounded batch processing and unbounded stream processing based on latency, throughput, and consistency requirements.',
  },

  // Infrastructure — Infrastructura (cx:-780, cy:420, r:360×280)
  {
    id: 'docker-port-mapping',
    domain: 'infra',
    name: 'Docker Port Mapping',
    x: -820,
    y: 380,
    mag: 1.0,
    type: 'pattern',
    complexity: 1,
    note: 'Map container ports to host ports to expose services while maintaining network isolation between containers.',
  },
  {
    id: 'multi-database-orchestration',
    domain: 'infra',
    name: 'Multi-Database Orchestration',
    x: -730,
    y: 500,
    mag: 1.2,
    type: 'pattern',
    complexity: 4,
    note: 'Coordinate multiple purpose-fit databases within a single system, routing reads and writes to the appropriate store.',
  },
  {
    id: 'infrastructure-as-code',
    domain: 'infra',
    name: 'Infrastructure as Code',
    x: -860,
    y: 460,
    mag: 1.3,
    type: 'principle',
    complexity: 2,
    note: 'Define and provision infrastructure declaratively through versioned configuration, enabling reproducible environments.',
  },

  // Cross-domain — placed at domain boundaries
  {
    id: 'single-responsibility',
    domain: 'backend',
    name: 'Single Responsibility',
    x: 620,
    y: -440,
    mag: 1.3,
    type: 'principle',
    complexity: 1,
    note: 'Every module, class, or function should have one reason to change — separating concerns produces systems that are easier to reason about.',
  },
  {
    id: 'composition-over-inheritance',
    domain: 'frontend',
    name: 'Composition Over Inheritance',
    x: -620,
    y: -440,
    mag: 1.1,
    type: 'principle',
    complexity: 2,
    note: 'Favour assembling behaviour from composable units rather than deep inheritance chains that couple consumers to implementation details.',
  },
];

// ── Connections ───────────────────────────────────────────────────────────────

export const connections: Connection[] = [
  // Frontend cluster
  { from: 'component-composition', to: 'state-management-patterns' },
  { from: 'component-composition', to: 'composition-over-inheritance' },
  { from: 'composition-over-inheritance', to: 'micro-frontend-architecture' },

  // Backend cluster
  { from: 'hexagonal-architecture', to: 'dependency-injection' },
  { from: 'hexagonal-architecture', to: 'cqrs' },
  { from: 'dependency-injection', to: 'strategy-pattern' },
  { from: 'single-responsibility', to: 'hexagonal-architecture' },

  // Data cluster
  { from: 'medallion-architecture', to: 'schema-driven-validation' },
  { from: 'medallion-architecture', to: 'pure-functions' },
  { from: 'schema-driven-validation', to: 'batch-vs-streaming' },

  // Infra cluster
  { from: 'infrastructure-as-code', to: 'docker-port-mapping' },
  { from: 'docker-port-mapping', to: 'multi-database-orchestration' },

  // Cross-domain connections
  { from: 'single-responsibility', to: 'component-composition', cross: true },
  { from: 'single-responsibility', to: 'pure-functions', cross: true },
  { from: 'dependency-injection', to: 'composition-over-inheritance', cross: true },
  { from: 'infrastructure-as-code', to: 'medallion-architecture', cross: true },
  { from: 'hexagonal-architecture', to: 'multi-database-orchestration', cross: true },
];
