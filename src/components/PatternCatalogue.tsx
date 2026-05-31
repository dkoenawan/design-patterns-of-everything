import { useState } from 'react';
import { connections, type Pattern, type DomainId } from '../lib/atlas-data';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const DOMAIN_TINTS: Record<DomainId, string> = {
  frontend: '#7aa3d4',
  backend:  '#d49a7a',
  data:     '#9ec48a',
  infra:    '#c8a4d4',
};

const DOMAIN_PREFIXES: Record<DomainId, string> = {
  frontend: 'FE',
  backend:  'BE',
  data:     'DP',
  infra:    'IN',
};

function typeGlyph(type: string) {
  if (type === 'principle') return '✦';
  if (type === 'anti') return '✗';
  return '●';
}

function typeLabel(type: string) {
  if (type === 'principle') return 'Principle';
  if (type === 'anti') return 'Anti-pattern';
  return 'Pattern';
}

function complexityDiamonds(n: number) {
  return Array.from({ length: 5 }, (_, i) => (i < n ? '◆' : '◇')).join('');
}

interface Props {
  domain: DomainId;
  patterns: Pattern[];
}

interface EntryProps {
  pattern: Pattern;
  index: number;
  domain: DomainId;
}

function CatalogueEntry({ pattern, index, domain }: EntryProps) {
  const [expanded, setExpanded] = useState(false);

  const prefix = DOMAIN_PREFIXES[domain];
  const catalogueNum = `${prefix}.${String(index + 1).padStart(3, '0')}`;
  const tint = DOMAIN_TINTS[domain];

  // Adjacent star names (within all connections)
  const adjacent = connections
    .filter((c) => c.from === pattern.id || c.to === pattern.id)
    .map((c) => (c.from === pattern.id ? c.to : c.from));

  const hasHref = Boolean(pattern.href);

  return (
    <div
      style={{
        borderTop: '0.5px solid rgba(212,177,94,0.20)',
        paddingTop: 28,
        paddingBottom: 28,
      }}
    >
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Metadata rail — 180px */}
        <div
          style={{
            width: 180,
            flexShrink: 0,
            paddingRight: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {/* Type */}
          <div style={{
            fontSize: 13,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            color: pattern.type === 'principle' ? '#f1d98a' :
                   pattern.type === 'anti' ? '#c46a55' : tint,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 11 }}>{typeGlyph(pattern.type)}</span>
            {typeLabel(pattern.type)}
          </div>

          {/* Complexity */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#a39570',
            letterSpacing: '1.5px',
          }}>
            {complexityDiamonds(pattern.complexity)}
          </div>

          {/* Catalogue number */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#5a4f33',
            letterSpacing: '1.5px',
            marginTop: 4,
          }}>
            {catalogueNum}
          </div>
        </div>

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Pattern name */}
          <div style={{
            fontSize: 38,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#e8dcb8',
            lineHeight: 1.05,
            marginBottom: 14,
          }}>
            {pattern.name}
          </div>

          {/* Summary / note */}
          <p style={{
            fontSize: 17,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            color: '#a39570',
            lineHeight: 1.55,
            marginBottom: 18,
          }}>
            {pattern.note}
          </p>

          {/* Toggle / link */}
          {hasHref ? (
            <a
              href={`${BASE}${pattern.href}`}
              style={{
                fontSize: 14,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                color: '#d4b15e',
                letterSpacing: '0.3px',
              }}
            >
              Open detail chart →
            </a>
          ) : (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 14,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                color: '#d4b15e',
                cursor: 'pointer',
                letterSpacing: '0.3px',
              }}
            >
              {expanded ? 'Fold the chart ↑' : 'Unfold the chart ↓'}
            </button>
          )}

          {/* Expanded state */}
          {expanded && (
            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px 32px',
              }}
            >
              {[
                { label: 'Intent', content: pattern.note },
                { label: 'When to reach for it', content: `Complexity level ${pattern.complexity} — reach for this ${pattern.type} when a system boundary demands it.` },
                { label: 'Smells before it', content: 'Tangled responsibilities, repeated conditionals, difficulty testing in isolation.' },
                {
                  label: 'Adjacent stars',
                  content: adjacent.length
                    ? adjacent.map((id) => `→ ${id.replace(/-/g, ' ')}`).join('\n')
                    : 'No direct connections charted.',
                },
              ].map(({ label, content }) => (
                <div key={label}>
                  <div style={{
                    fontSize: 10,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#5a4f33',
                    marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 15,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    color: '#a39570',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatternCatalogue({ domain, patterns }: Props) {
  return (
    <div>
      {patterns.map((p, i) => (
        <CatalogueEntry key={p.id} pattern={p} index={i} domain={domain} />
      ))}
    </div>
  );
}
