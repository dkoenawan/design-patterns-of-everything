import { useMemo } from 'react';

// Canonical backdrop per DESIGN_SYSTEM.md §2a — three stacked layers:
//   1. flat sky (no gradient)
//   2. paper grain (feTurbulence)
//   3. single diagonal gold milky band (blurred polygon)
//   + dense deterministic star field (600–900 stars, magnitude-skewed)
//
// Ported from design_handoff_patterns_atlas/atlas-backdrop.jsx.

interface Tone {
  sky: string;
  gold: string;
  grainOp: number;
  milkyOp: number;
}

const TONES: Record<string, Tone> = {
  midnight: { sky: '#0a0e1a', gold: '#d4b15e', grainOp: 0.05, milkyOp: 0.04 },
  sepia:    { sky: '#15100a', gold: '#e8a850', grainOp: 0.07, milkyOp: 0.04 },
};

interface Star {
  x: number;
  y: number;
  r: number;
  op: number;
  sparkle: boolean;
  bright: boolean;
}

// Deterministic dense star field — seeded LCG so the field is stable across renders.
function buildStars(): Star[] {
  let s = 4242;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const arr: Star[] = [];
  for (let i = 0; i < 700; i++) {
    const m = Math.pow(rand(), 2.4); // magnitude skewed toward dim
    arr.push({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.15 + m * 1.6,
      sparkle: m > 0.93,
      bright: m > 0.98,
      op: 0.25 + m * 0.55,
    });
  }
  return arr;
}

const STARS = buildStars();

interface Props {
  tone?: 'midnight' | 'sepia';
}

export default function AtlasBackdrop({ tone = 'midnight' }: Props) {
  const t = TONES[tone] ?? TONES.midnight;
  const stars = useMemo(() => STARS, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: t.sky,
        overflow: 'hidden',
      }}
    >
      {/* Layer 2: Paper grain */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen' }}
      >
        <defs>
          <filter id="bd-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.75  0 0 0 0 0.5  0 0 0 0.8 0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#bd-grain)" opacity={t.grainOp} />
      </svg>

      {/* Layer 3: Single diagonal milky band — gold, very low opacity, blurred */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="bd-milky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={t.gold} stopOpacity="0" />
            <stop offset="45%"  stopColor={t.gold} stopOpacity={t.milkyOp * 2.4} />
            <stop offset="55%"  stopColor={t.gold} stopOpacity={t.milkyOp * 2.4} />
            <stop offset="100%" stopColor={t.gold} stopOpacity="0" />
          </linearGradient>
          <filter id="bd-blur"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <polygon points="-10,25 110,75 110,90 -10,40" fill="url(#bd-milky)" filter="url(#bd-blur)" />
      </svg>

      {/* Layer 4: Dense star field */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {stars.map((st, i) => (
          <g key={i}>
            {st.bright && (
              <>
                <circle cx={st.x} cy={st.y} r={st.r * 4 * 0.07} fill={t.gold} opacity={st.op * 0.12} />
                <line
                  x1={st.x - st.r * 4 * 0.07} y1={st.y} x2={st.x + st.r * 4 * 0.07} y2={st.y}
                  stroke={t.gold} strokeWidth="0.04" opacity={st.op * 0.5}
                />
                <line
                  x1={st.x} y1={st.y - st.r * 4 * 0.07} x2={st.x} y2={st.y + st.r * 4 * 0.07}
                  stroke={t.gold} strokeWidth="0.04" opacity={st.op * 0.5}
                />
              </>
            )}
            {st.sparkle && !st.bright && (
              <>
                <line
                  x1={st.x - st.r * 0.18} y1={st.y} x2={st.x + st.r * 0.18} y2={st.y}
                  stroke={t.gold} strokeWidth="0.03" opacity={st.op * 0.4}
                />
                <line
                  x1={st.x} y1={st.y - st.r * 0.18} x2={st.x} y2={st.y + st.r * 0.18}
                  stroke={t.gold} strokeWidth="0.03" opacity={st.op * 0.4}
                />
              </>
            )}
            <circle cx={st.x} cy={st.y} r={st.r * 0.1} fill={t.gold} opacity={st.op} />
          </g>
        ))}
      </svg>
    </div>
  );
}
