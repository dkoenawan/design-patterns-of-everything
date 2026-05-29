import { useMemo } from 'react';

// Mulberry32 PRNG — deterministic, no external deps
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  sparkle: boolean;
}

function buildStars(): Star[] {
  const rand = mulberry32(0xa7145042);
  const stars: Star[] = [];
  for (let i = 0; i < 800; i++) {
    const x = rand() * 100;
    const y = rand() * 100;
    // magnitude distribution: mostly faint (mag 4-6), some mid (2-4), few bright (0-2)
    const magRoll = rand();
    let r: number;
    let opacity: number;
    if (magRoll < 0.05) {
      // bright — mag 0–1
      r = 1.6 + rand() * 0.6;
      opacity = 0.88 + rand() * 0.12;
    } else if (magRoll < 0.20) {
      // mid — mag 1–3
      r = 0.9 + rand() * 0.7;
      opacity = 0.55 + rand() * 0.30;
    } else {
      // faint — mag 3–6
      r = 0.3 + rand() * 0.55;
      opacity = 0.18 + rand() * 0.35;
    }
    stars.push({ x, y, r, opacity, sparkle: r >= 1.6 });
  }
  return stars;
}

// Build once at module level — same array every render
const STARS = buildStars();

// Sparkle cross for bright stars
function Sparkle({ x, y, r, opacity }: { x: number; y: number; r: number; opacity: number }) {
  const arm = r * 4.5;
  return (
    <g opacity={opacity} style={{ transformOrigin: `${x}% ${y}%` }}>
      <line
        x1={`${x}%`} y1={`${y - arm / 16}%`}
        x2={`${x}%`} y2={`${y + arm / 16}%`}
        stroke="#f1d98a" strokeWidth={r * 0.7}
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
      <line
        x1={`${x - arm / 16}%`} y1={`${y}%`}
        x2={`${x + arm / 16}%`} y2={`${y}%`}
        stroke="#f1d98a" strokeWidth={r * 0.35}
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
    </g>
  );
}

export default function AtlasBackdrop() {
  const stars = useMemo(() => STARS, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0a0e1a',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Paper grain turbulence filter */}
          <filter id="atlas-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72 0.58"
              numOctaves="4"
              seed="8"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grayNoise"
            />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
            <feComponentTransfer in="blended">
              <feFuncA type="linear" slope="0.045" />
            </feComponentTransfer>
          </filter>

          {/* Milky Way soft glow gradient — diagonal band */}
          <linearGradient id="milky-way" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3a4a7a" stopOpacity="0" />
            <stop offset="28%"  stopColor="#4a5a90" stopOpacity="0.10" />
            <stop offset="44%"  stopColor="#5a6aa0" stopOpacity="0.17" />
            <stop offset="50%"  stopColor="#6a7ab4" stopOpacity="0.22" />
            <stop offset="56%"  stopColor="#5a6aa0" stopOpacity="0.17" />
            <stop offset="72%"  stopColor="#4a5a90" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#3a4a7a" stopOpacity="0" />
          </linearGradient>

          {/* Radial vignette — darkens edges */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#0a0e1a" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0.65" />
          </radialGradient>
        </defs>

        {/* Milky Way diagonal band */}
        <rect x="0" y="0" width="100" height="100" fill="url(#milky-way)" />

        {/* Stars */}
        {stars.map((s, i) =>
          s.sparkle ? (
            <Sparkle key={i} x={s.x} y={s.y} r={s.r} opacity={s.opacity} />
          ) : (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r * 0.18}
              fill="#e8dcb8"
              opacity={s.opacity}
            />
          )
        )}

        {/* Vignette overlay */}
        <rect x="0" y="0" width="100" height="100" fill="url(#vignette)" />

        {/* Paper grain overlay */}
        <rect x="0" y="0" width="100%" height="100%" fill="#e8dcb8" filter="url(#atlas-grain)" />
      </svg>
    </div>
  );
}
