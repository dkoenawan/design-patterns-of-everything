export interface StarNode {
  id: string;
  label: string;
  x: number; // 0–100 % of SVG viewport
  y: number; // 0–100 % of SVG viewport
  magnitude: 1 | 2 | 3;
  href?: string;
}

export interface ConstellationDomain {
  domain: string;
  name: string;
  shortName: string;
  cssClass: string;
  stars: StarNode[];
  edges: Array<{ from: string; to: string }>;
}

export const CONSTELLATIONS: ConstellationDomain[] = [
  {
    domain: 'frontend',
    name: 'Frontend Architecture',
    shortName: 'FRONTEND',
    cssClass: 'domain-frontend',
    stars: [
      { id: 'component-patterns',   label: 'Component Patterns',   x: 45, y: 22, magnitude: 3 },
      { id: 'state-management',     label: 'State Management',     x: 28, y: 38, magnitude: 2 },
      { id: 'design-systems',       label: 'Design Systems',       x: 22, y: 58, magnitude: 2 },
      { id: 'rendering-strategies', label: 'Rendering Strategies', x: 48, y: 62, magnitude: 3 },
      { id: 'micro-frontends',      label: 'Micro-Frontends',      x: 68, y: 30, magnitude: 2 },
      { id: 'performance-patterns', label: 'Performance Patterns', x: 72, y: 55, magnitude: 1 },
    ],
    edges: [
      { from: 'component-patterns',   to: 'state-management' },
      { from: 'component-patterns',   to: 'micro-frontends' },
      { from: 'state-management',     to: 'design-systems' },
      { from: 'design-systems',       to: 'rendering-strategies' },
      { from: 'rendering-strategies', to: 'performance-patterns' },
      { from: 'micro-frontends',      to: 'rendering-strategies' },
    ],
  },
  {
    domain: 'backend',
    name: 'Backend Architecture',
    shortName: 'BACKEND',
    cssClass: 'domain-backend',
    stars: [
      { id: 'clean-architecture',    label: 'Clean Architecture',    x: 50, y: 18, magnitude: 3 },
      { id: 'hexagonal',             label: 'Hexagonal',             x: 30, y: 35, magnitude: 2 },
      { id: 'cqrs',                  label: 'CQRS',                  x: 68, y: 32, magnitude: 2 },
      { id: 'event-sourcing',        label: 'Event Sourcing',        x: 22, y: 60, magnitude: 2 },
      { id: 'api-design',            label: 'API Design',            x: 72, y: 58, magnitude: 2 },
      { id: 'dependency-injection',  label: 'Dependency Injection',  x: 48, y: 72, magnitude: 3 },
    ],
    edges: [
      { from: 'clean-architecture',   to: 'hexagonal' },
      { from: 'clean-architecture',   to: 'cqrs' },
      { from: 'hexagonal',            to: 'event-sourcing' },
      { from: 'cqrs',                 to: 'api-design' },
      { from: 'event-sourcing',       to: 'dependency-injection' },
      { from: 'api-design',           to: 'dependency-injection' },
    ],
  },
  {
    domain: 'infra',
    name: 'Infrastructure',
    shortName: 'INFRA',
    cssClass: 'domain-infra',
    stars: [
      { id: 'container-orchestration', label: 'Container Orchestration', x: 55, y: 15, magnitude: 3 },
      { id: 'iac',                      label: 'IaC',                     x: 38, y: 30, magnitude: 2 },
      { id: 'service-mesh',             label: 'Service Mesh',            x: 62, y: 32, magnitude: 2 },
      { id: 'load-balancing',           label: 'Load Balancing',          x: 48, y: 52, magnitude: 3 },
      { id: 'port-mapping',             label: 'Port Mapping',            x: 28, y: 68, magnitude: 1 },
      { id: 'secrets-management',       label: 'Secrets Management',      x: 65, y: 70, magnitude: 2 },
    ],
    edges: [
      { from: 'container-orchestration', to: 'iac' },
      { from: 'container-orchestration', to: 'service-mesh' },
      { from: 'iac',                     to: 'load-balancing' },
      { from: 'service-mesh',            to: 'load-balancing' },
      { from: 'load-balancing',          to: 'port-mapping' },
      { from: 'load-balancing',          to: 'secrets-management' },
    ],
  },
  {
    domain: 'devops',
    name: 'DevOps',
    shortName: 'DEVOPS',
    cssClass: 'domain-devops',
    stars: [
      { id: 'cicd-pipelines',      label: 'CI/CD Pipelines',     x: 22, y: 25, magnitude: 3 },
      { id: 'gitops',              label: 'GitOps',              x: 35, y: 42, magnitude: 2 },
      { id: 'feature-flags',       label: 'Feature Flags',       x: 50, y: 35, magnitude: 2 },
      { id: 'blue-green-deploys',  label: 'Blue-Green Deploys',  x: 62, y: 55, magnitude: 2 },
      { id: 'observability',       label: 'Observability',       x: 72, y: 38, magnitude: 3 },
      { id: 'rollback-strategies', label: 'Rollback Strategies', x: 78, y: 65, magnitude: 1 },
    ],
    edges: [
      { from: 'cicd-pipelines',     to: 'gitops' },
      { from: 'gitops',             to: 'feature-flags' },
      { from: 'feature-flags',      to: 'blue-green-deploys' },
      { from: 'blue-green-deploys', to: 'observability' },
      { from: 'observability',      to: 'rollback-strategies' },
    ],
  },
  {
    domain: 'network',
    name: 'Network Patterns',
    shortName: 'NETWORK',
    cssClass: 'domain-network',
    stars: [
      { id: 'api-gateway',        label: 'API Gateway',        x: 50, y: 18, magnitude: 3 },
      { id: 'service-discovery',  label: 'Service Discovery',  x: 28, y: 38, magnitude: 2 },
      { id: 'circuit-breaker',    label: 'Circuit Breaker',    x: 72, y: 38, magnitude: 2 },
      { id: 'rate-limiting',      label: 'Rate Limiting',      x: 50, y: 52, magnitude: 2 },
      { id: 'mtls',               label: 'mTLS',               x: 30, y: 68, magnitude: 2 },
      { id: 'dns-patterns',       label: 'DNS Patterns',       x: 68, y: 68, magnitude: 2 },
    ],
    edges: [
      { from: 'api-gateway',       to: 'service-discovery' },
      { from: 'api-gateway',       to: 'circuit-breaker' },
      { from: 'service-discovery', to: 'rate-limiting' },
      { from: 'circuit-breaker',   to: 'rate-limiting' },
      { from: 'rate-limiting',     to: 'mtls' },
      { from: 'rate-limiting',     to: 'dns-patterns' },
    ],
  },
  {
    domain: 'security',
    name: 'Security Architecture',
    shortName: 'SECURITY',
    cssClass: 'domain-security',
    stars: [
      { id: 'threat-modeling',        label: 'Threat Modeling',        x: 50, y: 15, magnitude: 3 },
      { id: 'zero-trust',             label: 'Zero Trust',             x: 28, y: 30, magnitude: 3 },
      { id: 'rbac',                   label: 'RBAC',                   x: 72, y: 30, magnitude: 2 },
      { id: 'secrets-rotation',       label: 'Secrets Rotation',       x: 35, y: 52, magnitude: 2 },
      { id: 'audit-logging',          label: 'Audit Logging',          x: 65, y: 52, magnitude: 2 },
      { id: 'supply-chain-security',  label: 'Supply Chain Security',  x: 50, y: 72, magnitude: 2 },
    ],
    edges: [
      { from: 'threat-modeling',       to: 'zero-trust' },
      { from: 'threat-modeling',       to: 'rbac' },
      { from: 'zero-trust',            to: 'secrets-rotation' },
      { from: 'rbac',                  to: 'audit-logging' },
      { from: 'secrets-rotation',      to: 'supply-chain-security' },
      { from: 'audit-logging',         to: 'supply-chain-security' },
    ],
  },
  {
    domain: 'ai',
    name: 'AI Architecture',
    shortName: 'AI',
    cssClass: 'domain-ai',
    stars: [
      { id: 'rag',               label: 'RAG',               x: 50, y: 42, magnitude: 3 },
      { id: 'prompt-engineering', label: 'Prompt Engineering', x: 35, y: 25, magnitude: 2 },
      { id: 'agent-patterns',    label: 'Agent Patterns',    x: 65, y: 25, magnitude: 2 },
      { id: 'model-evaluation',  label: 'Model Evaluation',  x: 72, y: 52, magnitude: 2 },
      { id: 'fine-tuning',       label: 'Fine-Tuning',       x: 28, y: 55, magnitude: 2 },
      { id: 'ai-observability',  label: 'Observability',     x: 50, y: 68, magnitude: 1 },
    ],
    edges: [
      { from: 'rag',               to: 'prompt-engineering' },
      { from: 'rag',               to: 'agent-patterns' },
      { from: 'prompt-engineering', to: 'agent-patterns' },
      { from: 'agent-patterns',    to: 'model-evaluation' },
      { from: 'prompt-engineering', to: 'fine-tuning' },
      { from: 'rag',               to: 'ai-observability' },
    ],
  },
  {
    domain: 'data',
    name: 'Data Architecture',
    shortName: 'DATA',
    cssClass: 'domain-data',
    stars: [
      { id: 'data-governance',      label: 'Data Governance',       x: 50, y: 15, magnitude: 3 },
      { id: 'data-platform',        label: 'Data Platform',         x: 28, y: 28, magnitude: 2 },
      { id: 'pipelines',            label: 'Pipelines',             x: 72, y: 28, magnitude: 2 },
      { id: 'medallion-architecture', label: 'Medallion Architecture', x: 48, y: 48, magnitude: 3 },
      { id: 'schema-validation',    label: 'Schema Validation',     x: 28, y: 65, magnitude: 2 },
      { id: 'pure-functions',       label: 'Pure Functions',        x: 68, y: 65, magnitude: 1 },
    ],
    edges: [
      { from: 'data-governance',        to: 'data-platform' },
      { from: 'data-governance',        to: 'pipelines' },
      { from: 'data-platform',          to: 'medallion-architecture' },
      { from: 'pipelines',              to: 'medallion-architecture' },
      { from: 'medallion-architecture', to: 'schema-validation' },
      { from: 'medallion-architecture', to: 'pure-functions' },
    ],
  },
];
