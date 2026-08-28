import { useRef, useEffect } from 'react';

const W = 620;
const H = 380;

const ANTI        = '#c46a55';
const INK_FAINT   = 'rgba(232,220,184,0.10)';
const INK_DIM     = 'rgba(232,220,184,0.35)';

interface Hazard {
  label: string;
  domainLabel: string;
  tint: string;
  severity: number; // 1–5
}

// Severity 5 sits nearest the blast core; 1 sits at the outer edge.
const HAZARDS: Hazard[] = [
  { label: 'God Object',            domainLabel: 'Backend',       tint: '#d49a7a', severity: 5 },
  { label: 'Unbounded Fan-out',     domainLabel: 'Data Pipeline', tint: '#9ec48a', severity: 4 },
  { label: 'Snowflake Server',      domainLabel: 'Infrastructure', tint: '#c8a4d4', severity: 4 },
  { label: 'Premature Generalisation', domainLabel: 'Cross-Domain', tint: '#d4b15e', severity: 3 },
  { label: 'Prop Drilling',         domainLabel: 'Frontend',      tint: '#7aa3d4', severity: 3 },
  { label: 'Anemic Domain Model',   domainLabel: 'Backend',       tint: '#d49a7a', severity: 3 },
  { label: 'Unmemoized Re-render Cascade', domainLabel: 'Frontend', tint: '#7aa3d4', severity: 2 },
];

const N = HAZARDS.length;

function axisAngle(i: number): number {
  return -Math.PI / 2 + (i / N) * Math.PI * 2;
}

// Severity 5 -> radius fraction ~0.18 (near core); severity 1 -> ~1.0 (outer edge).
function severityRadiusFrac(sev: number): number {
  return 1 - (sev - 1) * 0.205;
}

export default function BlastRadiusViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    raf: number;
    lastTime: number;
    fillProgress: number;
    shockT: number; // 0–1, resets to loop the shockwave ring
    glowPulse: number;
  }>({
    raf: 0,
    lastTime: 0,
    fillProgress: 0,
    shockT: 0,
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

      if (s.fillProgress < 1) s.fillProgress = Math.min(1, s.fillProgress + dtSec * 0.5);
      s.shockT = (s.shockT + dtSec * 0.28) % 1;
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
      const cy = ch / 2;
      const maxR = Math.min(cw, ch) * 0.36;

      // ── Severity rings (5 = innermost / core, 1 = outer edge) ──
      for (let sev = 1; sev <= 5; sev++) {
        const frac = severityRadiusFrac(sev);
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
        ctx.strokeStyle = sev === 5 ? 'rgba(196,106,85,0.30)' : INK_FAINT;
        ctx.lineWidth = sev === 5 ? 0.8 : 0.5;
        ctx.stroke();

        ctx.font = `400 normal 8px 'JetBrains Mono', monospace`;
        ctx.fillStyle = 'rgba(232,220,184,0.18)';
        ctx.textAlign = 'left';
        ctx.fillText(`S${sev}`, cx + 4 * scaleX, cy - maxR * frac - 3 * scaleY);
      }

      // ── Blast core ──
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.16);
      coreGrad.addColorStop(0, 'rgba(196,106,85,0.35)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── Outward shockwave pulse ──
      const shockR = maxR * 1.05 * s.shockT;
      const shockAlpha = (1 - s.shockT) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, shockR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196,106,85,${shockAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ── Axis spokes ──
      for (let i = 0; i < N; i++) {
        const a = axisAngle(i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
        ctx.strokeStyle = 'rgba(212,177,94,0.12)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Hazard nodes ──
      const fp = s.fillProgress;
      const glowAlpha = 0.4 + 0.3 * Math.sin(s.glowPulse * Math.PI * 2);

      for (let i = 0; i < N; i++) {
        const a = axisAngle(i);
        const frac = severityRadiusFrac(HAZARDS[i].severity) * fp;
        const r = maxR * frac;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        const color = HAZARDS[i].tint;
        const nodeR = 4 + HAZARDS[i].severity * 0.6;

        // Connector from core to node
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${color}33`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Outer glow scaled by severity (bigger blast = bigger glow)
        const ng = ctx.createRadialGradient(px, py, 0, px, py, nodeR * 3);
        ng.addColorStop(0, `${color}55`);
        ng.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, nodeR * 3, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.globalAlpha = glowAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Core node
        ctx.beginPath();
        ctx.arc(px, py, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, nodeR, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Label
        const labelOffset = nodeR + 14 * scaleX;
        const lx = cx + (r + labelOffset) * Math.cos(a);
        const ly = cy + (r + labelOffset) * Math.sin(a);
        ctx.font = `400 italic ${Math.round(11 * scaleX)}px 'Cormorant Garamond', serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(HAZARDS[i].label, lx, ly - 6 * scaleY);

        ctx.font = `400 normal ${Math.round(8 * scaleX)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = INK_DIM;
        ctx.fillText(HAZARDS[i].domainLabel, lx, ly + 7 * scaleY);
      }

      // ── Centre crosshair ──
      const chSize = 5 * Math.max(scaleX, scaleY);
      ctx.beginPath();
      ctx.moveTo(cx - chSize, cy);
      ctx.lineTo(cx + chSize, cy);
      ctx.moveTo(cx, cy - chSize);
      ctx.lineTo(cx, cy + chSize);
      ctx.strokeStyle = `rgba(196,106,85,0.5)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ── Plate reference ──
      ctx.font = `400 normal ${Math.round(7.5 * scaleX)}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = 'rgba(232,220,184,0.15)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Blast radius · severity by proximity to core · observer', cx, ch - 8 * scaleY);

      s.raf = requestAnimationFrame(draw);
    }

    const s = stateRef.current;
    s.raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '620 / 380' }}>
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
