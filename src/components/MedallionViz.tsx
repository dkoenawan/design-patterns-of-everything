import { useRef, useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const W = 560;
const H = 300;

const BRONZE = '#c08850';
const SILVER = '#b8c4cf';
const GOLD   = '#e8c870';
const REJECT = '#c46a55';

// Lane x centres for each stage
const LANES = {
  bronze: W * 0.17,
  silver: W * 0.50,
  gold:   W * 0.83,
};

// Lane widths — tighten at each stage (spread → focused)
const LANE_SPREADS = { bronze: 60, silver: 36, gold: 18 };

// Quality bar heights (proportion) per stage
const BAR_HEIGHTS = { bronze: 0.35, silver: 0.65, gold: 1.0 };

const TOTAL_PARTICLES = 28;
const REJECT_RATE = 0.10;

// Seeded PRNG so layout is deterministic
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Particle types ────────────────────────────────────────────────────────────

type Stage = 'bronze' | 'silver' | 'gold';

interface Particle {
  id: number;
  stage: Stage;
  x: number;
  y: number;
  vy: number;          // vertical velocity (downward)
  laneOffset: number;  // horizontal offset within lane
  rejected: boolean;
  rejectAlpha: number; // fades to 0 on rejection
  rejectTimer: number; // countdown before removal
  alpha: number;
}

const rng = mulberry32(0xdeadbeef);

function makeParticle(id: number): Particle {
  const stage: Stage = 'bronze';
  const laneOffset = (rng() - 0.5) * LANE_SPREADS.bronze;
  return {
    id,
    stage,
    x: LANES.bronze + laneOffset,
    y: H * 0.08 + rng() * H * 0.08, // stagger entry
    vy: 0.5 + rng() * 0.4,
    laneOffset,
    rejected: false,
    rejectAlpha: 0,
    rejectTimer: 0,
    alpha: 0.85 + rng() * 0.15,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MedallionViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{
    particles: Particle[];
    nextId: number;
    raf: number;
    lastTime: number;
  }>({ particles: [], nextId: 0, raf: 0, lastTime: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Seed initial particles staggered across the canvas
    const initial: Particle[] = [];
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const p = makeParticle(i);
      // Spread Y across the full height so screen isn't empty at start
      p.y = (i / TOTAL_PARTICLES) * H;
      // Advance stage to match Y position
      if (p.y > H * 0.65) {
        p.stage = 'gold';
        p.x = LANES.gold + (rng() - 0.5) * LANE_SPREADS.gold;
      } else if (p.y > H * 0.33) {
        p.stage = 'silver';
        p.x = LANES.silver + (rng() - 0.5) * LANE_SPREADS.silver;
      }
      initial.push(p);
    }
    stateRef.current.particles = initial;
    stateRef.current.nextId = TOTAL_PARTICLES;

    function stageColor(stage: Stage) {
      if (stage === 'bronze') return BRONZE;
      if (stage === 'silver') return SILVER;
      return GOLD;
    }

    // Transition y thresholds
    const Y_TO_SILVER = H * 0.36;
    const Y_TO_GOLD   = H * 0.68;

    function draw(ts: number) {
      const dt = Math.min(ts - (stateRef.current.lastTime || ts), 50);
      stateRef.current.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      const sx = (x: number) => x * (cw / W);
      const sy = (y: number) => y * (ch / H);

      // ── Stage column headers ──────────────────────────────────

      const stages: { id: Stage; label: string; color: string }[] = [
        { id: 'bronze', label: 'Bronze', color: BRONZE },
        { id: 'silver', label: 'Silver', color: SILVER },
        { id: 'gold',   label: 'Gold',   color: GOLD   },
      ];

      for (const s of stages) {
        const lx = sx(LANES[s.id]);
        const spread = LANE_SPREADS[s.id] * (cw / W);

        // Lane boundary lines
        ctx.beginPath();
        ctx.moveTo(lx - spread, 0);
        ctx.lineTo(lx - spread, ch);
        ctx.strokeStyle = `${s.color}18`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(lx + spread, 0);
        ctx.lineTo(lx + spread, ch);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stage label
        ctx.font = `400 italic 10px 'Cormorant Garamond', serif`;
        ctx.fillStyle = s.color;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.6;
        ctx.fillText(s.label.toUpperCase(), lx, sy(12));
        ctx.globalAlpha = 1;
      }

      // ── Horizontal transition markers ─────────────────────────

      for (const y of [Y_TO_SILVER, Y_TO_GOLD]) {
        ctx.beginPath();
        ctx.moveTo(0, sy(y));
        ctx.lineTo(cw, sy(y));
        ctx.strokeStyle = 'rgba(212,177,94,0.15)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Quality bars (bottom-anchored) ────────────────────────

      for (const s of stages) {
        const lx = sx(LANES[s.id]);
        const barW = 6;
        const maxBarH = ch * 0.18;
        const barH = maxBarH * BAR_HEIGHTS[s.id];
        const barY = ch - barH - 4;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.22;
        ctx.fillRect(lx - barW / 2, barY, barW, barH);
        ctx.globalAlpha = 0.55;
        ctx.fillRect(lx - barW / 2, barY, barW, 1);
        ctx.globalAlpha = 1;

        ctx.font = `normal 8px 'JetBrains Mono', monospace`;
        ctx.fillStyle = s.color;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.45;
        ctx.fillText(`${Math.round(BAR_HEIGHTS[s.id] * 100)}%`, lx, barY - 4);
        ctx.globalAlpha = 1;
      }

      // ── Update and draw particles ─────────────────────────────

      const dtS = dt / 1000;
      const toRemove = new Set<number>();
      const toAdd: Particle[] = [];

      for (const p of stateRef.current.particles) {
        if (p.rejected) {
          p.rejectAlpha -= dtS * 1.5;
          p.x += (rng() - 0.5) * 40 * dtS;
          p.y += p.vy * dtS * 60;
          if (p.rejectAlpha <= 0) { toRemove.add(p.id); continue; }

          // Draw × symbol
          const px = sx(p.x);
          const py = sy(p.y);
          ctx.globalAlpha = Math.max(0, p.rejectAlpha);
          ctx.strokeStyle = REJECT;
          ctx.lineWidth = 1.2;
          const s2 = 4;
          ctx.beginPath(); ctx.moveTo(px - s2, py - s2); ctx.lineTo(px + s2, py + s2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px + s2, py - s2); ctx.lineTo(px - s2, py + s2); ctx.stroke();
          ctx.globalAlpha = 1;
          continue;
        }

        // Advance vertically
        p.y += p.vy * dtS * 60;

        // Stage transitions
        if (p.stage === 'bronze' && p.y >= Y_TO_SILVER) {
          if (rng() < REJECT_RATE) {
            p.rejected = true;
            p.rejectAlpha = 1.0;
            continue;
          }
          p.stage = 'silver';
          p.laneOffset = (rng() - 0.5) * LANE_SPREADS.silver;
        } else if (p.stage === 'silver' && p.y >= Y_TO_GOLD) {
          if (rng() < REJECT_RATE) {
            p.rejected = true;
            p.rejectAlpha = 1.0;
            continue;
          }
          p.stage = 'gold';
          p.laneOffset = (rng() - 0.5) * LANE_SPREADS.gold;
        }

        // Lerp x toward target
        const targetX = LANES[p.stage] + p.laneOffset;
        p.x += (targetX - p.x) * Math.min(1, 3 * dtS);

        // Recycle at bottom
        if (p.y > H) {
          const fresh = makeParticle(stateRef.current.nextId++);
          toAdd.push(fresh);
          toRemove.add(p.id);
          continue;
        }

        // Draw mote
        const col = stageColor(p.stage);
        const px = sx(p.x);
        const py = sy(p.y);
        const r = 2.5;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3.5);
        grad.addColorStop(0, `${col}44`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Apply removals + additions
      stateRef.current.particles = [
        ...stateRef.current.particles.filter((p) => !toRemove.has(p.id)),
        ...toAdd,
      ];

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '560 / 300' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
