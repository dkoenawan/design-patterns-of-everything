import { useEffect, useRef, useState } from 'react';

interface Domain {
  id: string;
  label: string;
  tint: string;
  years: number;
  level: number;
}

interface ProfileSheetProps {
  domains: Domain[];
  base?: string;
}

// Animated proficiency bar row — fills when first visible via IntersectionObserver.
function ProfBar({ domain, base, delay }: { domain: Domain; base: string; delay: number }) {
  const [filled, setFilled] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger per-row fill
          const t = setTimeout(() => setFilled(true), delay);
          obs.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={rowRef}
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 40px',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <a
        href={`${base}/${domain.id}`}
        style={{
          fontSize: '15px',
          color: 'var(--ink)',
          textDecoration: 'none',
          fontStyle: 'italic',
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--gold-bright)')}
        onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--ink)')}
      >
        {domain.label}
      </a>

      <div
        role="meter"
        aria-valuenow={domain.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${domain.label} proficiency ${domain.level}%`}
        style={{
          height: '4px',
          background: 'var(--line-faint)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: filled ? `${domain.level}%` : '0%',
            background: domain.tint,
            opacity: 0.72,
            transition: filled ? `width 900ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontStyle: 'normal',
          fontSize: '10px',
          letterSpacing: '1px',
          color: 'var(--ink-faint)',
          textAlign: 'right',
        }}
      >
        {domain.years} yr
      </span>
    </div>
  );
}

export default function ProfileSheet({ domains, base = '' }: ProfileSheetProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {domains.map((d, i) => (
        <ProfBar key={d.id} domain={d} base={base} delay={i * 120} />
      ))}
    </div>
  );
}
