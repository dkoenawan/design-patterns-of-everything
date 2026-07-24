import { useRef, useEffect } from 'react';

const W = 540;
const H = 340;

const GOLD        = '#d4b15e';
const GOLD_BRIGHT = '#f1d98a';
const INK_FAINT   = 'rgba(232,220,184,0.10)';
const INK_DIM     = 'rgba(232,220,184,0.35)';

interface Domain {
  label: string;
  tint: string;
  level: number;  // 0–1
  subLabel: string;
}

const DOMAINS: Domain[] = [
  { label: 'Backend',      tint: '#d49a7a', level: 0.88, subLabel: '8 yrs' },
  { label: 'Infrastructure', tint: '#c8a4d4', level: 0.82, subLabel: '7 yrs' },
  { label: 'Data Pipeline',  tint: '#9ec48a', level: 0.80, subLabel: '6 yrs' },
  { label: 'Frontend',       tint: '#7aa3d4', level: 0.72, subLabel: '5 yrs' },
];

const N = DOMAINS.length;

// Angle for each axis: start at top (−π/2), clockwise
function axisAngle(i: number): number {
  return -Math.PI / 2 + (i / N) * Math.PI * 2;
}

// Point on a given axis at radius r
function axisPoint(cx: number, cy: number, r: number, i: number) {
  const a = axisAngle(i);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Interpolated polygon point at level t (0–1) along axis i
function levelPoint(cx: number, cy: number, maxR: number, i: number, t: number) {
  return axisPoint(cx, cy, maxR * t, i);
}

export default function DomainRadarViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    raf: number;
    lastTime: number;
    fillProgress: number;   // 0–1: how far the fill has drawn in
    sweepAngle: number;     // radians: current scanner angle
    glowPulse: number;      // 0–1: oscillates for node glow
  }>({
    raf: 0,
    lastTime: 0,
    fillProgress: 0,
    sweepAngle: -Math.PI / 2,
    glowPulse: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50);
      s.lastTime = ts;
      const dtSec = dt / 1000;

      // Advance state
      if (s.fillProgress < 1) s.fillProgress = Math.min(1, s.fillProgress + dtSec * 0.4);
      s.sweepAngle += dtSec * 0.6;  // ~1 revolution per ~10 s
      s.glowPulse = (s.glowPulse + dtSec * 0.9) % 1;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, cw, ch);

      const scaleX = cw / W;
      const scaleY = ch / H;
      const cx = cw / 2;
      const cy = (ch / 2) + 10 * scaleY;
      const maxR = Math.min(cw, ch) * 0.34;

      // ── Grid rings (3 rings at 33%, 66%, 100%) ──
      for (const frac of [0.33, 0.66, 1.0]) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = axisPoint(cx, cy, maxR * frac, i % N);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = frac === 1.0
          ? `rgba(212,177,94,0.22)`
          : INK_FAINT;
        ctx.lineWidth = frac === 1.0 ? 0.8 : 0.5;
        ctx.stroke();

        // Ring label
        if (frac < 1.0) {
          const lp = axisPoint(cx, cy, maxR * frac, 0);
          ctx.font = `400 normal 8px 'JetBrains Mono', monospace`;
          ctx.fillStyle = 'rgba(232,220,184,0.18)';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(frac * 100)}%`, lp.x + 14 * scaleX, lp.y - 3 * scaleY);
        }
      }

      // ── Axis spokes ──
      for (let i = 0; i < N; i++) {
        const p = axisPoint(cx, cy, maxR, i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(212,177,94,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Filled radar polygon (animated draw-in) ──
      const fp = s.fillProgress;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const idx = i % N;
        const p = levelPoint(cx, cy, maxR, idx, DOMAINS[idx].level * fp);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      // Gradient fill from center
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, 'rgba(212,177,94,0.22)');
      grad.addColorStop(0.6, 'rgba(212,177,94,0.12)');
      grad.addColorStop(1, 'rgba(212,177,94,0.03)');
      ctx.fillStyle = grad;
      ctx.fill();
      // Outline
      ctx.strokeStyle = `rgba(212,177,94,0.55)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Scanner sweep ──
      const sweepA = s.sweepAngle % (Math.PI * 2);
      const sweepGrad = ctx.createConicalGradient
        ? undefined  // only available in some envs
        : null;
      // Draw sweep as a thin arc + fading sector
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR * 1.05, sweepA - 0.45, sweepA, false);
      ctx.closePath();
      ctx.fillStyle = `rgba(212,177,94,0.06)`;
      ctx.fill();
      // Leading edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + maxR * 1.05 * Math.cos(sweepA),
        cy + maxR * 1.05 * Math.sin(sweepA),
      );
      ctx.strokeStyle = `rgba(241,217,138,0.45)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── Domain vertex nodes ──
      const glowAlpha = 0.4 + 0.3 * Math.sin(s.glowPulse * Math.PI * 2);
      for (let i = 0; i < N; i++) {
        const p = levelPoint(cx, cy, maxR, i, DOMAINS[i].level * fp);
        const color = DOMAINS[i].tint;
        const r = 4.5;

        // Outer glow
        const ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        ng.addColorStop(0, `${color}50`);
        ng.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.globalAlpha = glowAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Core node
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // ── Axis labels ──
      for (let i = 0; i < N; i++) {
        const tip = axisPoint(cx, cy, maxR, i);
        const angle = axisAngle(i);
        const labelOffset = 22 * Math.max(scaleX, scaleY);

        const lx = cx + (maxR + labelOffset) * Math.cos(angle);
        const ly = cy + (maxR + labelOffset) * Math.sin(angle);

        // Domain name
        ctx.font = `400 italic ${Math.round(11 * scaleX)}px 'Cormorant Garamond', serif`;
        ctx.fillStyle = DOMAINS[i].tint;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(DOMAINS[i].label, lx, ly - 7 * scaleY);

        // Years sub-label
        ctx.font = `400 normal ${Math.round(8 * scaleX)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = INK_DIM;
        ctx.fillText(DOMAINS[i].subLabel, lx, ly + 7 * scaleY);

        // Percentage
        const pct = Math.round(DOMAINS[i].level * 100 * fp);
        ctx.font = `400 normal ${Math.round(7 * scaleX)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = 'rgba(212,177,94,0.55)';
        ctx.fillText(`${pct}%`, lx, ly + 16 * scaleY);
      }

      // ── Centre crosshair ──
      const chSize = 5 * Math.max(scaleX, scaleY);
      ctx.beginPath();
      ctx.moveTo(cx - chSize, cy);
      ctx.lineTo(cx + chSize, cy);
      ctx.moveTo(cx, cy - chSize);
      ctx.lineTo(cx, cy + chSize);
      ctx.strokeStyle = `rgba(241,217,138,0.35)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ── Plate reference ──
      ctx.font = `400 normal ${Math.round(7.5 * scaleX)}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = 'rgba(232,220,184,0.15)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Domain proficiency · radar chart · observer', cx, ch - 8 * scaleY);

      s.raf = requestAnimationFrame(draw);
    }

    const s = stateRef.current;
    s.raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '540 / 340' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
