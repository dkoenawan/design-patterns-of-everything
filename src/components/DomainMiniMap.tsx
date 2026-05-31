import { domains, patterns, connections, type DomainId } from '../lib/atlas-data';

const DOMAIN_TINTS: Record<DomainId, string> = {
  frontend: '#7aa3d4',
  backend:  '#d49a7a',
  data:     '#9ec48a',
  infra:    '#c8a4d4',
};

const PLATE_NUMS: Record<DomainId, string> = {
  frontend: 'i',
  backend:  'ii',
  data:     'iii',
  infra:    'iv',
};

interface Props {
  domain: DomainId;
}

export default function DomainMiniMap({ domain }: Props) {
  const domainData = domains.find((d) => d.id === domain)!;
  const domainPatterns = patterns.filter((p) => p.domain === domain);
  const patternIds = new Set(domainPatterns.map((p) => p.id));
  const patternById = new Map(domainPatterns.map((p) => [p.id, p]));

  const domainConnections = connections.filter(
    (c) => patternIds.has(c.from) && patternIds.has(c.to)
  );

  // Static SVG: 400×300 viewBox centred on domain cx,cy
  const vw = 800;
  const vh = 600;
  const { cx, cy, rx, ry, tint } = domainData;

  // Scale to fit the domain ellipse comfortably in the viewBox
  const viewMinX = cx - rx * 1.5;
  const viewMinY = cy - ry * 1.5;
  const viewW = rx * 3;
  const viewH = ry * 3;

  function starR(mag: number) {
    return 3 + mag * 7;
  }

  function starColor(type: string) {
    if (type === 'principle') return '#f1d98a';
    if (type === 'anti') return '#c46a55';
    return tint;
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${viewMinX} ${viewMinY} ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <defs>
        <pattern
          id={`mini-hatch-${domain}`}
          patternUnits="userSpaceOnUse"
          width={20}
          height={20}
          patternTransform="rotate(45)"
        >
          <line
            x1="0" y1="0" x2="0" y2="20"
            stroke={tint}
            strokeWidth={0.8}
            opacity={0.3}
          />
        </pattern>
        <radialGradient id={`mini-mask-${domain}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.5" />
          <stop offset="70%"  stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`mini-ellmask-${domain}`}>
          <ellipse
            cx={cx} cy={cy} rx={rx} ry={ry}
            fill={`url(#mini-mask-${domain})`}
          />
        </mask>
      </defs>

      {/* Domain ellipse */}
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill={`url(#mini-hatch-${domain})`}
        mask={`url(#mini-ellmask-${domain})`}
      />
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill="none"
        stroke={tint}
        strokeWidth={1}
        opacity={0.4}
      />

      {/* Connections */}
      {domainConnections.map((c, i) => {
        const from = patternById.get(c.from);
        const to = patternById.get(c.to);
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke="rgba(212,177,94,0.28)"
            strokeWidth={1.2}
          />
        );
      })}

      {/* Stars */}
      {domainPatterns.map((p) => {
        const r = starR(p.mag);
        const col = starColor(p.type);
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={r * 3} fill={col} opacity={0.08} />
            <circle cx={p.x} cy={p.y} r={r * 1.8} fill={col} opacity={0.15} />
            <circle cx={p.x} cy={p.y} r={r} fill={col} opacity={0.90} />
            {p.type === 'principle' && (
              <g stroke={col} strokeWidth={1.2} opacity={0.6}>
                <line x1={p.x} y1={p.y - r * 2} x2={p.x} y2={p.y + r * 2} />
                <line x1={p.x - r * 2} y1={p.y} x2={p.x + r * 2} y2={p.y} />
              </g>
            )}
            <text
              x={p.x}
              y={p.y + r + 14}
              textAnchor="middle"
              fontSize={13}
              fontFamily="'Cormorant Garamond', serif"
              fontStyle="italic"
              fill="#e8dcb8"
              opacity={0.75}
              style={{ userSelect: 'none' }}
            >
              {p.name}
            </text>
          </g>
        );
      })}

      {/* Plate label — bottom-left corner of viewBox */}
      <text
        x={viewMinX + 12}
        y={viewMinY + viewH - 12}
        fontSize={11}
        fontFamily="'JetBrains Mono', monospace"
        fill="rgba(212,177,94,0.35)"
        style={{ userSelect: 'none' }}
      >
        ✦ Plate {PLATE_NUMS[domain]} ✦
      </text>
    </svg>
  );
}
