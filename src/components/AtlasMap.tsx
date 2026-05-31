import { useRef, useState, useEffect, useCallback } from 'react';
import { domains, patterns, connections, type Pattern, type DomainId } from '../lib/atlas-data';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// ── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_TINTS: Record<DomainId, string> = {
  frontend: '#7aa3d4',
  backend:  '#d49a7a',
  data:     '#9ec48a',
  infra:    '#c8a4d4',
};

const DOMAIN_HATCH_ANGLE: Record<DomainId, number> = {
  frontend: 45,
  backend:  135,
  data:     60,
  infra:    120,
};

const CHART_NUMS: Record<DomainId, string> = {
  frontend: 'i',
  backend:  'ii',
  data:     'iii',
  infra:    'iv',
};

const COMPLEXITY_CHARS = ['◇', '◇', '◇', '◇', '◇'];

function complexityDiamonds(n: number) {
  return COMPLEXITY_CHARS.map((_, i) => (i < n ? '◆' : '◇')).join('');
}

// ── Seeded PRNG (for grid labels & ecliptic) ──────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── PatternById lookup ────────────────────────────────────────────────────────

const patternById = new Map(patterns.map((p) => [p.id, p]));

// ── Star geometry helpers ─────────────────────────────────────────────────────

// Canonical: brighter = larger. Bumped slightly above the spec's 1.6 + mag*2.2
// so pattern stars clearly outrank the dense backdrop field.
function starRadius(mag: number) {
  return 2.0 + mag * 2.8;
}

// Core colour — pattern stars use gold-bright so they outshine the backdrop's
// flat --gold field. Principles already bright; anti-patterns terracotta.
function starColor(p: Pattern) {
  if (p.type === 'anti') return '#c46a55';
  return '#f1d98a';
}

// Glow colour — warm gold halo around the core.
function glowColor(p: Pattern) {
  if (p.type === 'anti') return '#c46a55';
  return '#d4b15e';
}

interface StarGroupProps {
  p: Pattern;
  selected: boolean;
  scale: number;
  onClick: (id: string) => void;
}

function StarGroup({ p, selected, scale, onClick }: StarGroupProps) {
  const r = starRadius(p.mag);
  const col = starColor(p);
  const glow = glowColor(p);
  const showLabel = scale > 0.7;
  const showDots = scale > 1.1;

  return (
    <g
      onClick={() => onClick(p.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Layer 0: sky halo — softly dims the dense backdrop behind the star so it reads as foreground */}
      <circle cx={p.x} cy={p.y} r={r * 3.2} fill="#0a0e1a" opacity={selected ? 0.55 : 0.40} />
      {/* Layer 1: outer glow */}
      <circle cx={p.x} cy={p.y} r={r * 3.0} fill={glow} opacity={selected ? 0.22 : 0.14} />
      {/* Layer 2: inner glow */}
      <circle cx={p.x} cy={p.y} r={r * 1.8} fill={glow} opacity={selected ? 0.42 : 0.28} />
      {/* Layer 3: core */}
      <circle cx={p.x} cy={p.y} r={r} fill={col} opacity={1} />

      {/* Layer 4: principle sparkle cross */}
      {p.type === 'principle' && (
        <g stroke={col} strokeWidth={1} opacity={0.7}>
          <line x1={p.x} y1={p.y - r * 2.5} x2={p.x} y2={p.y + r * 2.5} />
          <line x1={p.x - r * 2.5} y1={p.y} x2={p.x + r * 2.5} y2={p.y} />
        </g>
      )}

      {/* Layer 5: anti-pattern dashed outline */}
      {p.type === 'anti' && (
        <circle
          cx={p.x} cy={p.y} r={r + 3}
          fill="none"
          stroke="#c46a55"
          strokeWidth={0.8}
          strokeDasharray="1 2"
          opacity={0.7}
        />
      )}

      {/* Selected ring */}
      {selected && (
        <circle
          cx={p.x} cy={p.y} r={r + 6}
          fill="none"
          stroke="#f1d98a"
          strokeWidth={1.0}
          opacity={0.85}
        />
      )}

      {/* Label — only when zoomed in enough */}
      {showLabel && (
        <text
          x={p.x}
          y={p.y + r * 2.5 + 14}
          textAnchor="middle"
          fontSize={14}
          fontFamily="'Cormorant Garamond', serif"
          fontStyle="italic"
          fill="#e8dcb8"
          opacity={0.82}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {p.name}
        </text>
      )}

      {/* Complexity dots — only when very zoomed in */}
      {showDots && (
        <text
          x={p.x}
          y={p.y + r * 2.5 + 32}
          textAnchor="middle"
          fontSize={10}
          fontFamily="'JetBrains Mono', monospace"
          fill="#a39570"
          opacity={0.7}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {complexityDiamonds(p.complexity)}
        </text>
      )}
    </g>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

interface DrawerProps {
  pattern: Pattern | null;
  onClose: () => void;
}

function Drawer({ pattern, onClose }: DrawerProps) {
  const visible = pattern !== null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 52,
        right: 0,
        bottom: 0,
        width: 420,
        background: 'rgba(20,25,40,0.94)',
        borderLeft: '0.5px solid rgba(212,177,94,0.35)',
        backdropFilter: 'blur(12px) saturate(110%)',
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 350ms ease-out, opacity 350ms ease-out',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 28px 48px',
        overflow: 'auto',
      }}
    >
      {pattern && (
        <>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              alignSelf: 'flex-end',
              background: 'none',
              border: 'none',
              color: '#a39570',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              letterSpacing: '1.5px',
              marginBottom: 32,
              padding: 0,
            }}
          >
            ← CLOSE
          </button>

          {/* Type eyebrow */}
          <div style={{
            fontSize: 10,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#a39570',
            marginBottom: 14,
          }}>
            {pattern.type === 'pattern' ? '✦  Pattern  ✦' :
             pattern.type === 'principle' ? '✦  Principle  ✦' :
             '✦  Anti-pattern  ✦'}
          </div>

          {/* Pattern name */}
          <div style={{
            fontSize: 42,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#e8dcb8',
            lineHeight: 1.05,
            marginBottom: 18,
          }}>
            {pattern.name}
          </div>

          {/* Complexity */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#a39570',
            letterSpacing: '1.5px',
            marginBottom: 8,
          }}>
            {complexityDiamonds(pattern.complexity)}
          </div>

          {/* Domain */}
          <div style={{
            fontSize: 13,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            color: DOMAIN_TINTS[pattern.domain],
            letterSpacing: '0.5px',
            marginBottom: 28,
          }}>
            {domains.find((d) => d.id === pattern.domain)?.name}
          </div>

          {/* Hairline separator */}
          <div style={{ borderTop: '0.5px solid rgba(212,177,94,0.20)', marginBottom: 24 }} />

          {/* Note */}
          <p style={{
            fontSize: 17,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            color: '#e8dcb8',
            lineHeight: 1.55,
            marginBottom: 32,
            textWrap: 'pretty' as never,
          }}>
            {pattern.note}
          </p>

          {/* Adjacent stars */}
          {(() => {
            const adjacent = connections
              .filter((c) => c.from === pattern.id || c.to === pattern.id)
              .map((c) => {
                const otherId = c.from === pattern.id ? c.to : c.from;
                return patternById.get(otherId);
              })
              .filter(Boolean) as Pattern[];

            if (!adjacent.length) return null;
            return (
              <div>
                <div style={{
                  fontSize: 10,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#a39570',
                  marginBottom: 12,
                }}>
                  Adjacent stars
                </div>
                {adjacent.map((adj) => (
                  <div key={adj.id} style={{
                    fontSize: 15,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    color: '#d4b15e',
                    marginBottom: 6,
                  }}>
                    → {adj.name}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Open detail chart link */}
          {pattern.href && (
            <a
              href={`${BASE}${pattern.href}`}
              style={{
                display: 'block',
                marginTop: 32,
                fontSize: 15,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                color: '#d4b15e',
                borderTop: '0.5px solid rgba(212,177,94,0.20)',
                paddingTop: 24,
              }}
            >
              Open detail chart →
            </a>
          )}
        </>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AtlasMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const transform = useRef({ x: 0, y: 0, scale: 0.55 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.55);

  const selectedPattern = selectedId ? (patternById.get(selectedId) ?? null) : null;

  const applyTransform = useCallback(() => {
    if (!worldRef.current) return;
    const { x, y, scale: s } = transform.current;
    worldRef.current.setAttribute('transform', `translate(${x},${y}) scale(${s})`);
  }, []);

  // Centre the map initially on mount
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    transform.current.x = w / 2;
    transform.current.y = h / 2;
    applyTransform();
  }, [applyTransform]);

  // Pan events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on the SVG background (not on a star click target)
    if ((e.target as Element).closest('g[data-star]')) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    transform.current.x += dx;
    transform.current.y += dy;
    lastPos.current = { x: e.clientX, y: e.clientY };
    applyTransform();
  }, [applyTransform]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Zoom on wheel
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const { x, y, scale: s } = transform.current;
    const newScale = Math.min(3, Math.max(0.25, s * (1 + e.deltaY * -0.001)));
    const ratio = newScale / s;

    // Zoom centred on cursor world position
    transform.current = {
      x: cx - (cx - x) * ratio,
      y: cy - (cy - y) * ratio,
      scale: newScale,
    };
    applyTransform();
    setScale(newScale);
  }, [applyTransform]);

  const onStarClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const zoomIn = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y, scale: s } = transform.current;
    const cx = svg.clientWidth / 2;
    const cy = svg.clientHeight / 2;
    const newScale = Math.min(3, s * 1.25);
    const ratio = newScale / s;
    transform.current = {
      x: cx - (cx - x) * ratio,
      y: cy - (cy - y) * ratio,
      scale: newScale,
    };
    applyTransform();
    setScale(newScale);
  }, [applyTransform]);

  const zoomOut = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y, scale: s } = transform.current;
    const cx = svg.clientWidth / 2;
    const cy = svg.clientHeight / 2;
    const newScale = Math.max(0.25, s / 1.25);
    const ratio = newScale / s;
    transform.current = {
      x: cx - (cx - x) * ratio,
      y: cy - (cy - y) * ratio,
      scale: newScale,
    };
    applyTransform();
    setScale(newScale);
  }, [applyTransform]);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    transform.current = { x: svg.clientWidth / 2, y: svg.clientHeight / 2, scale: 0.55 };
    applyTransform();
    setScale(0.55);
  }, [applyTransform]);

  const showConstellationNames = scale < 1.1;

  // RA/Dec grid: lines every 200 world units from -1200 to 1200
  const gridLines: React.ReactNode[] = [];
  for (let v = -1200; v <= 1200; v += 200) {
    // vertical (RA)
    gridLines.push(
      <line
        key={`ra-${v}`}
        x1={v} y1={-900} x2={v} y2={900}
        stroke="rgba(212,177,94,0.07)"
        strokeWidth={0.5}
      />
    );
    // horizontal (Dec)
    gridLines.push(
      <line
        key={`dec-${v}`}
        x1={-1200} y1={v} x2={1200} y2={v}
        stroke="rgba(212,177,94,0.07)"
        strokeWidth={0.5}
      />
    );
    // Coordinate labels (JetBrains Mono)
    if (v !== 0) {
      gridLines.push(
        <text
          key={`ra-label-${v}`}
          x={v} y={-880}
          textAnchor="middle"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
          fill="rgba(212,177,94,0.30)"
          style={{ userSelect: 'none' }}
        >
          {v > 0 ? `+${v}` : `${v}`}
        </text>
      );
    }
  }

  // Ecliptic — gentle wavy diagonal dashed path
  const eclipticPath = (() => {
    const pts: string[] = [];
    for (let x = -1200; x <= 1200; x += 80) {
      const y = Math.sin((x / 600) * Math.PI) * 120;
      pts.push(`${x},${y}`);
    }
    return 'M ' + pts.join(' L ');
  })();

  return (
    <>
      {/* Full-bleed SVG canvas */}
      <svg
        ref={svgRef}
        style={{
          position: 'fixed',
          top: 52,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: 'calc(100vh - 52px)',
          cursor: dragging.current ? 'grabbing' : 'grab',
          zIndex: 10,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        {/* SVG defs: hatch patterns + radial masks */}
        <defs>
          {domains.map((d) => {
            const angle = DOMAIN_HATCH_ANGLE[d.id];
            const rad = (angle * Math.PI) / 180;
            const cos = Math.cos(rad).toFixed(4);
            const sin = Math.sin(rad).toFixed(4);
            return (
              <pattern
                key={`hatch-${d.id}`}
                id={`hatch-${d.id}`}
                patternUnits="userSpaceOnUse"
                width={16}
                height={16}
                patternTransform={`rotate(${angle})`}
              >
                <line
                  x1="0" y1="0" x2="0" y2="16"
                  stroke={d.tint}
                  strokeWidth={0.6}
                  opacity={0.22}
                />
              </pattern>
            );
          })}
          {domains.map((d) => (
            <radialGradient
              key={`mask-${d.id}`}
              id={`mask-${d.id}`}
              cx="50%" cy="50%" r="50%"
            >
              <stop offset="0%"   stopColor="white" stopOpacity="0.55" />
              <stop offset="60%"  stopColor="white" stopOpacity="0.30" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          ))}
          {domains.map((d) => (
            <mask key={`ellmask-${d.id}`} id={`ellmask-${d.id}`}>
              <ellipse
                cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry}
                fill={`url(#mask-${d.id})`}
              />
            </mask>
          ))}
        </defs>

        {/* World group — all panning/zooming applied here */}
        <g ref={worldRef}>

          {/* RA/Dec grid */}
          <g opacity={1}>{gridLines}</g>

          {/* Ecliptic */}
          <path
            d={eclipticPath}
            fill="none"
            stroke="rgba(212,177,94,0.15)"
            strokeWidth={0.8}
            strokeDasharray="6 4"
          />

          {/* Domain hatched ellipses */}
          {domains.map((d) => (
            <g key={`domain-${d.id}`}>
              {/* Hatch fill with radial mask */}
              <ellipse
                cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry}
                fill={`url(#hatch-${d.id})`}
                mask={`url(#ellmask-${d.id})`}
              />
              {/* Outline */}
              <ellipse
                cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry}
                fill="none"
                stroke={d.tint}
                strokeWidth={0.6}
                opacity={0.4}
              />
              {/* Constellation name — fades when zoomed in */}
              {showConstellationNames && (
                <text
                  x={d.cx}
                  y={d.cy - d.ry - 24}
                  textAnchor="middle"
                  fontSize={22}
                  fontFamily="'Cormorant Garamond', serif"
                  fontStyle="italic"
                  fill={d.tint}
                  opacity={0.6}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {d.name}
                </text>
              )}
              {showConstellationNames && (
                <text
                  x={d.cx}
                  y={d.cy - d.ry - 6}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="'Cormorant Garamond', serif"
                  fontStyle="italic"
                  fill={d.tint}
                  opacity={0.4}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  — {d.subtitle} —
                </text>
              )}
            </g>
          ))}

          {/* Connection lines */}
          {connections.map((c, i) => {
            const from = patternById.get(c.from);
            const to = patternById.get(c.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={c.cross ? 'rgba(212,177,94,0.10)' : 'rgba(212,177,94,0.28)'}
                strokeWidth={0.8}
                strokeDasharray={c.cross ? '4 4' : undefined}
              />
            );
          })}

          {/* Pattern stars */}
          {patterns.map((p) => (
            <g key={p.id} data-star="true">
              <StarGroup
                p={p}
                selected={selectedId === p.id}
                scale={scale}
                onClick={onStarClick}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* ── Floating cartouches ─────────────────────────────────────────────── */}

      {/* Top-left: Atlas title */}
      <div style={{
        position: 'fixed',
        top: 76,
        left: 24,
        zIndex: 20,
        background: 'rgba(20,25,40,0.84)',
        border: '0.5px solid rgba(212,177,94,0.35)',
        backdropFilter: 'blur(8px) saturate(110%)',
        padding: '18px 26px',
        pointerEvents: 'none',
        maxWidth: 320,
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#a39570',
          marginBottom: 10,
        }}>
          ✦ a celestial atlas of ✦
        </div>
        <div style={{
          fontSize: 22,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 400,
          color: '#e8dcb8',
          lineHeight: 1.05,
          marginBottom: 6,
        }}>
          Design Patterns of Everything
        </div>
        <div style={{
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#a39570',
          letterSpacing: '1.5px',
        }}>
          Edition iii · scale variable
        </div>
      </div>

      {/* Top-right: Search placeholder */}
      <div style={{
        position: 'fixed',
        top: 76,
        right: selectedPattern ? 444 : 24,
        zIndex: 20,
        background: 'rgba(20,25,40,0.84)',
        border: '0.5px solid rgba(212,177,94,0.35)',
        backdropFilter: 'blur(8px) saturate(110%)',
        padding: '14px 20px',
        transition: 'right 350ms ease-out',
        opacity: 0.5,
        pointerEvents: 'none',
        width: 220,
      }}>
        <div style={{
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#a39570',
          letterSpacing: '1.5px',
        }}>
          SEARCH — deferred
        </div>
      </div>

      {/* Bottom-left: Legend */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 20,
        background: 'rgba(20,25,40,0.84)',
        border: '0.5px solid rgba(212,177,94,0.35)',
        backdropFilter: 'blur(8px) saturate(110%)',
        padding: '18px 26px',
        pointerEvents: 'none',
      }}>
        {/* Compass rose — simple text cross */}
        <div style={{
          textAlign: 'center',
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#5a4f33',
          marginBottom: 14,
          letterSpacing: '1px',
        }}>
          ✦
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { glyph: '●', label: 'Pattern', color: '#d4b15e' },
            { glyph: '✦', label: 'Principle', color: '#f1d98a' },
            { glyph: '◌', label: 'Anti-pattern', color: '#c46a55' },
          ].map(({ glyph, label, color }) => (
            <div key={label} style={{
              fontSize: 13,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: '#a39570',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}>
              <span style={{ color, fontSize: 11 }}>{glyph}</span>
              {label}
            </div>
          ))}
          <div style={{
            marginTop: 8,
            borderTop: '0.5px solid rgba(212,177,94,0.15)',
            paddingTop: 8,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#5a4f33',
            letterSpacing: '1px',
          }}>
            ◆ Complexity
          </div>
        </div>
      </div>

      {/* Bottom-right: Domain list + zoom controls */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: selectedPattern ? 444 : 24,
        zIndex: 20,
        background: 'rgba(20,25,40,0.84)',
        border: '0.5px solid rgba(212,177,94,0.35)',
        backdropFilter: 'blur(8px) saturate(110%)',
        padding: '18px 26px',
        transition: 'right 350ms ease-out',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minWidth: 200,
      }}>
        {/* Domain links */}
        <div style={{
          fontSize: 10,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#a39570',
          marginBottom: 12,
        }}>
          Constellations
        </div>
        {domains.map((d) => (
          <a
            key={d.id}
            href={`${BASE}${d.href}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 15,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: d.tint,
              paddingBottom: 6,
              textDecoration: 'none',
              transition: 'color 150ms',
            }}
          >
            <span style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#5a4f33',
              letterSpacing: '1px',
              minWidth: 18,
            }}>
              {CHART_NUMS[d.id]}
            </span>
            {d.name}
          </a>
        ))}

        {/* Zoom controls */}
        <div style={{
          marginTop: 16,
          borderTop: '0.5px solid rgba(212,177,94,0.15)',
          paddingTop: 14,
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
        }}>
          {[
            { label: '+', fn: zoomIn },
            { label: '◯', fn: resetZoom },
            { label: '−', fn: zoomOut },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              style={{
                background: 'none',
                border: '0.5px solid rgba(212,177,94,0.35)',
                color: '#d4b15e',
                width: 32,
                height: 32,
                fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 150ms',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Side drawer */}
      <Drawer
        pattern={selectedPattern}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
