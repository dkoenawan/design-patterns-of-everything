import { useRef, useMemo } from 'react';
import { useMousePosition } from '../contexts/MouseContext';
import type { StarNode, ConstellationDomain } from '../data/constellations';

const FULL_GLOW = 120; // px — full brightness
const FADE_END  = 320; // px — fully dim

const MAG_RADIUS: Record<1 | 2 | 3, number> = { 1: 3, 2: 5, 3: 7 };

interface StarWithProximity extends StarNode {
  proximity: number;
}

interface ConstellationPanelProps extends ConstellationDomain {
  panelIndex: number;
}

export const ConstellationPanel = ({
  domain,
  name,
  shortName,
  cssClass,
  stars,
  edges,
}: ConstellationPanelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { clientX, clientY } = useMousePosition();

  const starsWithProximity = useMemo<StarWithProximity[]>(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return stars.map(s => ({ ...s, proximity: 0 }));

    return stars.map(star => {
      const px = rect.left + (star.x / 100) * rect.width;
      const py = rect.top  + (star.y / 100) * rect.height;
      const dist = Math.hypot(clientX - px, clientY - py);
      const proximity =
        dist <= FULL_GLOW ? 1
        : dist >= FADE_END ? 0
        : 1 - (dist - FULL_GLOW) / (FADE_END - FULL_GLOW);
      return { ...star, proximity };
    });
  }, [stars, clientX, clientY]);

  const proximityById = useMemo(() => {
    const map: Record<string, number> = {};
    starsWithProximity.forEach(s => { map[s.id] = s.proximity; });
    return map;
  }, [starsWithProximity]);

  return (
    <div className={`constellation-panel ${cssClass}`}>
      {/* Domain name watermark */}
      <div className="constellation-panel__label" aria-hidden="true">
        {name}
      </div>

      <svg
        ref={svgRef}
        className="constellation-panel__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${name} constellation`}
        role="img"
      >
        {/* Background watermark text */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          dominantBaseline="middle"
          className="constellation-panel__watermark"
          aria-hidden="true"
        >
          {shortName}
        </text>

        {/* Edges */}
        {edges.map(edge => {
          const fromStar = starsWithProximity.find(s => s.id === edge.from);
          const toStar   = starsWithProximity.find(s => s.id === edge.to);
          if (!fromStar || !toStar) return null;
          const avgProximity = (fromStar.proximity + toStar.proximity) / 2;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromStar.x}
              y1={fromStar.y}
              x2={toStar.x}
              y2={toStar.y}
              className="constellation-panel__edge"
              style={{ opacity: Math.max(0.08, avgProximity * 0.6) }}
            />
          );
        })}

        {/* Stars */}
        {starsWithProximity.map(star => {
          const baseRadius = MAG_RADIUS[star.magnitude];
          const glowRadius = baseRadius * 4 + star.proximity * 8;
          const starOpacity = 0.2 + star.proximity * 0.8;
          const glowOpacity = star.proximity * 0.35;
          const showLabel   = star.proximity > 0.5;

          return (
            <g key={star.id}>
              {/* Glow halo */}
              <circle
                cx={star.x}
                cy={star.y}
                r={glowRadius}
                className="constellation-panel__glow"
                style={{ opacity: glowOpacity }}
              />
              {/* Star body */}
              <circle
                cx={star.x}
                cy={star.y}
                r={baseRadius}
                className="constellation-panel__star"
                style={{ opacity: starOpacity }}
              />
              {/* Label */}
              <text
                x={star.x}
                y={star.y - baseRadius - 2}
                textAnchor="middle"
                dominantBaseline="auto"
                className="constellation-panel__star-label"
                style={{
                  opacity: showLabel ? star.proximity : 0,
                  transition: 'opacity 200ms ease',
                }}
              >
                {star.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ConstellationPanel;
