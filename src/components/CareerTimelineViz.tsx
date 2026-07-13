import { useRef, useEffect } from 'react';

const W = 640;
const H = 220;

const GOLD        = '#d4b15e';
const GOLD_BRIGHT = '#f1d98a';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.12)';
const SKY         = 'rgba(10,14,26,0.0)';

const TIMELINE_Y  = H * 0.58;
const LEFT_X      = W * 0.06;
const RIGHT_X     = W * 0.94;

interface Milestone {
  year: number;
  label: string;
  sublabel: string;
  tint: string;
}

const MILESTONES: Milestone[] = [
  { year: 2015, label: 'Junior Engineer',     sublabel: 'Full-stack foundations',    tint: '#7aa3d4' },
  { year: 2017, label: 'Senior Engineer',      sublabel: 'Backend & distributed sys', tint: '#d49a7a' },
  { year: 2019, label: 'Lead Engineer',        sublabel: 'Data pipeline architecture', tint: '#9ec48a' },
  { year: 2021, label: 'Staff Architect',      sublabel: 'Platform & infrastructure',  tint: '#c8a4d4' },
  { year: 2023, label: 'AWS SAA + CKA',        sublabel: 'Cloud certifications',       tint: GOLD },
  { year: 2024, label: 'Principal Architect',  sublabel: 'AWS SAP + GCP PCA',         tint: GOLD_BRIGHT },
];

const YEAR_START = 2015;
const YEAR_END   = 2025;

function yearToX(year: number): number {
  return LEFT_X + ((year - YEAR_START) / (YEAR_END - YEAR_START)) * (RIGHT_X - LEFT_X);
}

interface NodePulse {
  idx: number;
  alpha: number;
  radius: number;
}

export default function CareerTimelineViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const state = {
      raf: 0,
      lastTime: 0,
      elapsed: 0,
      cometX: LEFT_X,
      cometDir: 1 as 1 | -1,
      pulses: [] as NodePulse[],
      triggeredAt: new Set<number>(),
    };

    const COMET_SPEED = 56; // px/s in W-space

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawStar(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      r: number,
      color: string,
      alpha: number,
      cw: number, ch: number,
    ) {
      const bx = sx(cx, cw);
      const by = sy(cy, ch);
      const br = sx(r, cw);

      // Glow halo
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br * 5);
      g.addColorStop(0, color + '55');
      g.addColorStop(1, 'transparent');
      ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath();
      ctx.arc(bx, by, br * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Core dot
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function draw(ts: number) {
      const dt = Math.min(ts - (state.lastTime || ts), 50) / 1000;
      state.lastTime = ts;
      state.elapsed += dt;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Timeline rail ────────────────────────────────────────────

      ctx.beginPath();
      ctx.moveTo(sx(LEFT_X, cw), sy(TIMELINE_Y, ch));
      ctx.lineTo(sx(RIGHT_X, cw), sy(TIMELINE_Y, ch));
      ctx.strokeStyle = INK_FAINT;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Year tick marks
      for (let y = YEAR_START; y <= YEAR_END; y++) {
        const tx = yearToX(y);
        const isMain = y % 2 === 1;
        ctx.beginPath();
        ctx.moveTo(sx(tx, cw), sy(TIMELINE_Y - (isMain ? 5 : 3), ch));
        ctx.lineTo(sx(tx, cw), sy(TIMELINE_Y + (isMain ? 5 : 3), ch));
        ctx.strokeStyle = isMain ? INK_DIM : INK_FAINT;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        if (y % 2 === 0) {
          ctx.font = `normal 7px 'JetBrains Mono', monospace`;
          ctx.fillStyle = INK_DIM;
          ctx.textAlign = 'center';
          ctx.fillText(String(y), sx(tx, cw), sy(TIMELINE_Y + 13, ch));
        }
      }

      // ── Milestone nodes ──────────────────────────────────────────

      for (let i = 0; i < MILESTONES.length; i++) {
        const m = MILESTONES[i];
        const mx = yearToX(m.year);
        const above = i % 2 === 0;

        // Connector tick
        ctx.beginPath();
        ctx.moveTo(sx(mx, cw), sy(TIMELINE_Y - 3, ch));
        ctx.lineTo(sx(mx, cw), sy(TIMELINE_Y + 3, ch));
        ctx.strokeStyle = m.tint + '80';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Star
        drawStar(ctx, mx, TIMELINE_Y, 3.5, m.tint, 0.85, cw, ch);

        // Label above or below
        const labelY = above ? TIMELINE_Y - 28 : TIMELINE_Y + 32;
        const subY   = above ? TIMELINE_Y - 16 : TIMELINE_Y + 44;

        ctx.font = `400 italic 9.5px 'Cormorant Garamond', serif`;
        ctx.fillStyle = m.tint;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.9;
        ctx.fillText(m.label, sx(mx, cw), sy(labelY, ch));

        ctx.font = `normal 7px 'JetBrains Mono', monospace`;
        ctx.fillStyle = INK_DIM;
        ctx.globalAlpha = 0.55;
        ctx.fillText(m.sublabel, sx(mx, cw), sy(subY, ch));
        ctx.globalAlpha = 1;
      }

      // ── Node pulse rings (triggered by comet) ────────────────────

      state.pulses = state.pulses.filter((p) => {
        p.radius += dt * 22;
        p.alpha  = Math.max(0, p.alpha - dt * 1.8);
        if (p.alpha <= 0) return false;

        const m = MILESTONES[p.idx];
        const mx = sx(yearToX(m.year), cw);
        const my = sy(TIMELINE_Y, ch);
        const r  = sx(p.radius, cw);

        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.strokeStyle = m.tint;
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Comet ────────────────────────────────────────────────────

      const cometDx = COMET_SPEED * dt * state.cometDir;
      state.cometX += cometDx;

      // Bounce at ends
      if (state.cometX >= RIGHT_X) {
        state.cometX = RIGHT_X;
        state.cometDir = -1;
        state.triggeredAt.clear();
      } else if (state.cometX <= LEFT_X) {
        state.cometX = LEFT_X;
        state.cometDir = 1;
        state.triggeredAt.clear();
      }

      // Check milestone crossings
      for (let i = 0; i < MILESTONES.length; i++) {
        const mx = yearToX(MILESTONES[i].year);
        const dist = Math.abs(state.cometX - mx);
        if (dist < 4 && !state.triggeredAt.has(i)) {
          state.triggeredAt.add(i);
          state.pulses.push({ idx: i, alpha: 1.0, radius: 5 });
        }
      }

      // Comet tail (series of fading dots behind comet)
      const tailLen = 5;
      const tailStep = 7 * state.cometDir;
      for (let t = tailLen; t >= 1; t--) {
        const tx = state.cometX - tailStep * t;
        const ta = (1 - t / (tailLen + 1)) * 0.35;
        ctx.beginPath();
        ctx.arc(sx(tx, cw), sy(TIMELINE_Y, ch), sx(2.5, cw), 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.globalAlpha = ta;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Comet head glow
      const cx2 = sx(state.cometX, cw);
      const cy2 = sy(TIMELINE_Y, ch);
      const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, sx(12, cw));
      cg.addColorStop(0, GOLD_BRIGHT + 'cc');
      cg.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx2, cy2, sx(12, cw), 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();

      // Comet head core
      ctx.beginPath();
      ctx.arc(cx2, cy2, sx(3, cw), 0, Math.PI * 2);
      ctx.fillStyle = GOLD_BRIGHT;
      ctx.fill();

      // ── Plate label ──────────────────────────────────────────────

      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.2;
      ctx.fillText('Plate vi · Career Trajectory · Observer Chart', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      state.raf = requestAnimationFrame(draw);
    }

    state.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(state.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 220' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
