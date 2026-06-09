import { useState } from 'react';
import type { DomainId } from '../lib/atlas-data';

// ── Static skill tree data ────────────────────────────────────────────────────

interface SkillNode {
  id: string;
  label: string;
  tier: 1 | 2 | 3;   // 1=foundation, 2=proficient, 3=advanced
  acquired: boolean;
  x: number;          // 0–100 grid units
  y: number;
  deps: string[];     // prerequisite node ids
  note: string;
}

interface SkillTreeData {
  domain: DomainId;
  tint: string;
  nodes: SkillNode[];
}

const TREES: SkillTreeData[] = [
  {
    domain: 'backend',
    tint: '#d49a7a',
    nodes: [
      { id: 'b-srp',  label: 'Single Responsibility', tier: 1, acquired: true,  x: 50, y: 10, deps: [], note: 'Foundation of all clean design. Every module has exactly one reason to change.' },
      { id: 'b-di',   label: 'Dependency Injection',  tier: 1, acquired: true,  x: 25, y: 30, deps: ['b-srp'], note: 'Externalise dependencies; the component declares what it needs, not how to get it.' },
      { id: 'b-str',  label: 'Strategy Pattern',      tier: 2, acquired: true,  x: 70, y: 30, deps: ['b-srp'], note: 'Algorithms behind a common interface — swap at runtime without changing callers.' },
      { id: 'b-hex',  label: 'Hexagonal Architecture',tier: 2, acquired: true,  x: 25, y: 55, deps: ['b-di'], note: 'Ports & adapters. The domain core depends on nothing outside itself.' },
      { id: 'b-cqrs', label: 'CQRS',                  tier: 2, acquired: true,  x: 70, y: 55, deps: ['b-str', 'b-hex'], note: 'Separate read and write models. Each path can be optimised and scaled independently.' },
      { id: 'b-es',   label: 'Event Sourcing',         tier: 3, acquired: false, x: 50, y: 80, deps: ['b-cqrs'], note: 'State is a sequence of events, not a snapshot. Full audit trail; time-travel debugging.' },
    ],
  },
  {
    domain: 'data',
    tint: '#9ec48a',
    nodes: [
      { id: 'd-pf',  label: 'Pure Functions',          tier: 1, acquired: true,  x: 50, y: 10, deps: [], note: 'Output depends only on input. Deterministic, composable, trivially testable.' },
      { id: 'd-sdv', label: 'Schema-Driven Validation', tier: 1, acquired: true,  x: 25, y: 30, deps: ['d-pf'], note: 'Contracts at pipeline boundaries. Catch structural violations before they propagate.' },
      { id: 'd-bvs', label: 'Batch vs Streaming',      tier: 2, acquired: true,  x: 70, y: 30, deps: ['d-pf'], note: 'Latency, throughput, consistency trade-offs. Choose the processing model deliberately.' },
      { id: 'd-med', label: 'Medallion Architecture',   tier: 2, acquired: true,  x: 25, y: 55, deps: ['d-sdv', 'd-bvs'], note: 'Bronze → Silver → Gold layers progressively add quality and semantic richness.' },
      { id: 'd-cdc', label: 'Change Data Capture',      tier: 3, acquired: false, x: 70, y: 55, deps: ['d-bvs'], note: 'Capture database mutations as events. Low-latency replication without polling.' },
      { id: 'd-lkh', label: 'Lakehouse Pattern',        tier: 3, acquired: false, x: 50, y: 80, deps: ['d-med', 'd-cdc'], note: 'Merge data lake storage with warehouse query semantics. ACID on open table formats.' },
    ],
  },
  {
    domain: 'infra',
    tint: '#c8a4d4',
    nodes: [
      { id: 'i-iac',  label: 'Infrastructure as Code',    tier: 1, acquired: true,  x: 50, y: 10, deps: [], note: 'Declarative, version-controlled infra. Reproducible across environments.' },
      { id: 'i-dpm',  label: 'Port Mapping & Isolation',  tier: 1, acquired: true,  x: 25, y: 30, deps: ['i-iac'], note: 'Expose only what must be exposed. Controlled network surfaces.' },
      { id: 'i-mdb',  label: 'Multi-Database Orchestration', tier: 2, acquired: true,  x: 70, y: 30, deps: ['i-dpm'], note: 'Purpose-fit stores routed correctly. Polyglot persistence without chaos.' },
      { id: 'i-cicd', label: 'CI/CD Pipelines',            tier: 2, acquired: true,  x: 25, y: 55, deps: ['i-iac'], note: 'Automated test, build, and deploy. Ship confidently at any pace.' },
      { id: 'i-svc',  label: 'Service Mesh',               tier: 3, acquired: false, x: 70, y: 55, deps: ['i-mdb', 'i-cicd'], note: 'mTLS, observability, and traffic management pushed to the infrastructure layer.' },
      { id: 'i-gitops', label: 'GitOps',                   tier: 3, acquired: false, x: 50, y: 80, deps: ['i-svc', 'i-cicd'], note: 'Git as the single source of truth for cluster state. Reconciliation loops ensure convergence.' },
    ],
  },
  {
    domain: 'frontend',
    tint: '#7aa3d4',
    nodes: [
      { id: 'f-coi',  label: 'Composition over Inheritance', tier: 1, acquired: true,  x: 50, y: 10, deps: [], note: 'Assemble behaviour from small composable units. Deep inheritance creates rigid coupling.' },
      { id: 'f-cc',   label: 'Component Composition',       tier: 1, acquired: true,  x: 25, y: 30, deps: ['f-coi'], note: 'Complex UI from focused, testable primitives that compose without shared state.' },
      { id: 'f-sm',   label: 'State Management Patterns',   tier: 2, acquired: true,  x: 70, y: 30, deps: ['f-coi'], note: 'Local, shared, and server state handled at the right layer.' },
      { id: 'f-mfe',  label: 'Micro-Frontend Architecture', tier: 2, acquired: true,  x: 25, y: 55, deps: ['f-cc', 'f-sm'], note: 'Independently deployable frontend units. Team autonomy at scale.' },
      { id: 'f-ssr',  label: 'Server-Side Rendering',       tier: 3, acquired: false, x: 70, y: 55, deps: ['f-sm'], note: 'Render on the server for first-paint performance and SEO. Hydrate selectively.' },
      { id: 'f-isl',  label: 'Island Architecture',         tier: 3, acquired: false, x: 50, y: 80, deps: ['f-mfe', 'f-ssr'], note: 'Ship mostly static HTML with isolated interactive islands. Minimal JS by default.' },
    ],
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────

const TIER_LABELS = ['Foundation', 'Proficient', 'Advanced'];

function edgeKey(a: string, b: string) {
  return `${a}->${b}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SkillTreeProps {
  domain: DomainId;
}

export default function SkillTree({ domain }: SkillTreeProps) {
  const tree = TREES.find((t) => t.domain === domain);
  if (!tree) return null;

  const [active, setActive] = useState<string | null>(null);
  const { tint, nodes } = tree;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const activeNode = active ? nodeById.get(active) ?? null : null;

  // Collect all edges
  const edges: Array<{ from: SkillNode; to: SkillNode }> = [];
  for (const node of nodes) {
    for (const dep of node.deps) {
      const from = nodeById.get(dep);
      if (from) edges.push({ from, to: node });
    }
  }

  // Count acquired
  const acquiredCount = nodes.filter((n) => n.acquired).length;
  const totalCount = nodes.length;

  // Which nodes are unlockable (all deps acquired, not yet acquired)
  const unlockable = new Set(
    nodes
      .filter((n) => !n.acquired && n.deps.every((d) => nodeById.get(d)?.acquired))
      .map((n) => n.id)
  );

  function nodeColor(n: SkillNode): string {
    if (n.id === active) return '#f1d98a';
    if (n.acquired) return tint;
    if (unlockable.has(n.id)) return 'rgba(212,177,94,0.45)';
    return 'rgba(90,80,60,0.5)';
  }

  function nodeStroke(n: SkillNode): string {
    if (n.id === active) return '#f1d98a';
    if (n.acquired) return tint;
    return 'rgba(212,177,94,0.25)';
  }

  function edgeOpacity(e: { from: SkillNode; to: SkillNode }): number {
    if (e.from.acquired && e.to.acquired) return 0.45;
    return 0.15;
  }

  const svgW = 340;
  const svgH = 280;

  function toSvg(pct: number, dim: number) {
    return (pct / 100) * dim;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Progress header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            fontStyle: 'normal',
          }}
        >
          Skill progression
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '1.5px',
            fontStyle: 'normal',
            color: tint,
          }}
        >
          {acquiredCount} / {totalCount}
        </span>
      </div>

      {/* SVG graph */}
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', overflow: 'visible', cursor: 'default' }}
        aria-label="Skill tree visualisation"
        role="img"
      >
        <defs>
          <marker
            id={`arrow-${domain}`}
            markerWidth="5"
            markerHeight="5"
            refX="3"
            refY="2.5"
            orient="auto"
          >
            <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(212,177,94,0.3)" />
          </marker>
        </defs>

        {/* Tier bands — subtle horizontal stripes */}
        {[0, 1, 2].map((tier) => {
          const yStart = tier * (svgH / 3);
          return (
            <g key={tier}>
              <rect
                x={0}
                y={yStart}
                width={svgW}
                height={svgH / 3}
                fill={tier % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent'}
              />
              <text
                x={6}
                y={yStart + 12}
                fontSize={8}
                fontFamily="'JetBrains Mono', monospace"
                fill="rgba(212,177,94,0.18)"
                style={{ userSelect: 'none' }}
              >
                {TIER_LABELS[tier].toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Edges */}
        {edges.map((e) => (
          <line
            key={edgeKey(e.from.id, e.to.id)}
            x1={toSvg(e.from.x, svgW)}
            y1={toSvg(e.from.y, svgH) + 18}
            x2={toSvg(e.to.x, svgW)}
            y2={toSvg(e.to.y, svgH) - 18}
            stroke="rgba(212,177,94,0.3)"
            strokeWidth={1}
            opacity={edgeOpacity(e)}
            markerEnd={`url(#arrow-${domain})`}
          />
        ))}

        {/* Nodes */}
        {nodes.map((n) => {
          const cx = toSvg(n.x, svgW);
          const cy = toSvg(n.y, svgH);
          const isActive = n.id === active;
          const r = 18;

          return (
            <g
              key={n.id}
              onClick={() => setActive(isActive ? null : n.id)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`${n.label} — ${n.acquired ? 'acquired' : 'not yet acquired'}`}
              aria-pressed={isActive}
            >
              {/* Outer glow for acquired */}
              {n.acquired && (
                <circle cx={cx} cy={cy} r={r + 8} fill={tint} opacity={0.07} />
              )}

              {/* Active ring */}
              {isActive && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 5}
                  fill="none"
                  stroke="#f1d98a"
                  strokeWidth={0.8}
                  opacity={0.6}
                />
              )}

              {/* Main circle */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={n.acquired ? `${nodeColor(n)}22` : 'rgba(10,14,26,0.6)'}
                stroke={nodeStroke(n)}
                strokeWidth={n.acquired ? 1 : 0.5}
                strokeDasharray={n.acquired ? undefined : '4 3'}
              />

              {/* Check mark / tier indicator */}
              {n.acquired ? (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={13}
                  fill={nodeColor(n)}
                  style={{ userSelect: 'none' }}
                >
                  ✦
                </text>
              ) : (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill="rgba(212,177,94,0.3)"
                  style={{ userSelect: 'none' }}
                >
                  ○
                </text>
              )}

              {/* Label below node */}
              <text
                x={cx}
                y={cy + r + 13}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="'Cormorant Garamond', serif"
                fontStyle="italic"
                fill={n.acquired ? 'rgba(232,220,184,0.85)' : 'rgba(90,79,51,0.8)'}
                style={{ userSelect: 'none' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Detail panel — shown when a node is selected */}
      <div
        aria-live="polite"
        style={{
          minHeight: '70px',
          marginTop: '16px',
          padding: '14px 18px',
          background: 'rgba(20,25,40,0.55)',
          border: `0.5px solid ${activeNode ? (activeNode.acquired ? tint + '55' : 'rgba(212,177,94,0.2)') : 'rgba(212,177,94,0.12)'}`,
          transition: 'border-color 250ms',
        }}
      >
        {activeNode ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '8px',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: activeNode.acquired ? '#f1d98a' : 'var(--ink-dim)',
                }}
              >
                {activeNode.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontStyle: 'normal',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: activeNode.acquired ? tint : 'rgba(212,177,94,0.3)',
                  flexShrink: 0,
                }}
              >
                {activeNode.acquired ? 'Acquired' : unlockable.has(activeNode.id) ? 'Unlockable' : 'Locked'}
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--ink-dim)',
                lineHeight: 1.5,
              }}
            >
              {activeNode.note}
            </p>
          </>
        ) : (
          <p
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              fontStyle: 'normal',
              fontSize: '9px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(212,177,94,0.2)',
            }}
          >
            Select a skill to inspect
          </p>
        )}
      </div>
    </div>
  );
}
