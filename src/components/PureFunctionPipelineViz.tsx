import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────────

const W = 640;
const H = 260;

const TINT_INPUT  = '#e8dcb8'; // raw record
const TINT_PARSE  = '#7aa3d4'; // parsed (frontend blue — structured)
const TINT_VALID  = '#9ec48a'; // validated (data green)
const TINT_NORM   = '#c8a4d4'; // normalized (purple)
const TINT_ENRICH = '#d49a7a'; // enriched (warm)
const TINT_AGG    = '#d4b15e'; // aggregated (gold — curated output)
const TINT_REJECT = '#c46a55'; // rejected
const TINT_PULSE  = '#d4b15e'; // ring pulse
const INK_DIM     = 'rgba(232,220,184,0.40)';
const BOX_BG      = 'rgba(14,20,42,0.82)';

// Five pipeline stages laid out left→right
const STAGE_Y   = H * 0.40;
const STAGE_HW  = 42;
const STAGE_HH  = 18;

const STAGES = [
  { label: 'Parse',     x: W * 0.15, outTint: TINT_PARSE  },
  { label: 'Validate',  x: W * 0.32, outTint: TINT_VALID  },
  { label: 'Normalize', x: W * 0.50, outTint: TINT_NORM   },
  { label: 'Enrich',    x: W * 0.68, outTint: TINT_ENRICH },
  { label: 'Aggregate', x: W * 0.86, outTint: TINT_AGG    },
];

// Reject bin below the Validate stage
const REJECT_X = STAGES[1].x;
const REJECT_Y = H * 0.82;
const REJECT_HW = 36;
const REJECT_HH = 14;

// Input source on the far left
const SOURCE_X = W * 0.04;
const SOURCE_Y = STAGE_Y;

// ── Types ───────────────────────────────────────────────────────────────────────

interface Mote {
  id: number;
  stageIdx: number;  // next stage to reach (-1 = going to first stage)
  rejected: boolean;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  alpha: number;
  size: number;
  speed: number;
}

interface Ring {
  id: number;
  cx: number;
  cy: number;
  r: number;
  alpha: number;
  color: string;
}

let nextId = 0;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function makeMote(): Mote {
  return {
    id: nextId++,
    stageIdx: 0,
    rejected: false,
    x: SOURCE_X,
    y: SOURCE_Y,
    tx: STAGES[0].x,
    ty: STAGE_Y,
    color: TINT_INPUT,
    alpha: 0.92,
    size: 3,
    speed: 90 + Math.random() * 30,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function PureFunctionPipelineViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    rings: [] as Ring[],
    nextRingId: 0,
    nextSpawn: 0.6,
    elapsed: 0,
    rejectCounter: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      cx: number, cy: number,
      hw: number, hh: number,
      label: string, tint: string,
      cw: number, ch: number,
      sublabel?: string,
    ) {
      const bx = sx(cx, cw);
      const by = sy(cy, ch);
      const bw = sx(hw * 2, cw);
      const bh = sy(hh * 2, ch);

      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - bw / 2, by - bh / 2, bw, bh);
      ctx.fill();
      ctx.stroke();

      if (sublabel) {
        ctx.font = `normal 7px 'JetBrains Mono', monospace`;
        ctx.fillStyle = tint;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.toUpperCase(), bx, by - 3);
        ctx.font = `400 italic 7px 'Cormorant Garamond', serif`;
        ctx.fillStyle = tint;
        ctx.globalAlpha = 0.6;
        ctx.fillText(sublabel, bx, by + 6);
        ctx.globalAlpha = 1;
      } else {
        ctx.font = `normal 7px 'JetBrains Mono', monospace`;
        ctx.fillStyle = tint;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.toUpperCase(), bx, by);
      }
    }

    function drawDashedLine(
      x1: number, y1: number, x2: number, y2: number,
      color: string, cw: number, ch: number,
    ) {
      ctx.beginPath();
      ctx.moveTo(sx(x1, cw), sy(y1, ch));
      ctx.lineTo(sx(x2, cw), sy(y2, ch));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawRing(r: Ring, cw: number, ch: number) {
      ctx.beginPath();
      ctx.arc(sx(r.cx, cw), sy(r.cy, ch), r.r * (cw / W), 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = r.alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;
      s.elapsed += dt;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Static structure ──────────────────────────────────────────

      // Source → first stage rail
      drawDashedLine(
        SOURCE_X, SOURCE_Y,
        STAGES[0].x - STAGE_HW, STAGE_Y,
        `${TINT_INPUT}28`, cw, ch,
      );

      // Inter-stage rails
      for (let i = 0; i < STAGES.length - 1; i++) {
        const from = STAGES[i];
        const to   = STAGES[i + 1];
        drawDashedLine(
          from.x + STAGE_HW, STAGE_Y,
          to.x - STAGE_HW,   STAGE_Y,
          `${to.outTint}22`, cw, ch,
        );
      }

      // Reject rail — downward from Validate
      drawDashedLine(
        STAGES[1].x, STAGE_Y + STAGE_HH,
        REJECT_X,    REJECT_Y - REJECT_HH,
        `${TINT_REJECT}28`, cw, ch,
      );

      // Source node (diamond-ish — just a small square)
      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = `${TINT_INPUT}88`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      const srcX = sx(SOURCE_X, cw);
      const srcY = sy(SOURCE_Y, cw);
      const sr = sx(8, cw);
      ctx.moveTo(srcX, srcY - sr);
      ctx.lineTo(srcX + sr, srcY);
      ctx.lineTo(srcX, srcY + sr);
      ctx.lineTo(srcX - sr, srcY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stage boxes
      for (const stage of STAGES) {
        drawBox(stage.x, STAGE_Y, STAGE_HW, STAGE_HH,
          stage.label, stage.outTint, cw, ch, 'f(x)→y');
      }

      // Reject bin
      drawBox(REJECT_X, REJECT_Y, REJECT_HW, REJECT_HH,
        '✗ reject', TINT_REJECT, cw, ch);

      // f(input) = output label
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.38;
      ctx.fillText('f(input) = output · no side effects', sx(W * 0.50, cw), sy(H * 0.10, ch));
      ctx.globalAlpha = 1;

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.20;
      ctx.fillText('Plate iii · Pure Function Pipeline · Data Pipeline Domain', sx(W / 2, cw), sy(H - 7, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ───────────────────────────────────────────────

      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push(makeMote());
        s.nextSpawn = 1.2 + Math.random() * 0.8;
      }

      // ── Update rings ──────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 50;
        ring.alpha = Math.max(0, ring.alpha - dt * 1.8);
        if (ring.alpha <= 0) return false;
        drawRing(ring, cw, ch);
        return true;
      });

      // ── Update & draw motes ───────────────────────────────────────

      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const d = dist(m.x, m.y, m.tx, m.ty);
        const step = m.speed * dt;

        if (d > step) {
          const angle = Math.atan2(m.ty - m.y, m.tx - m.x);
          m.x += Math.cos(angle) * step;
          m.y += Math.sin(angle) * step;
        } else {
          m.x = m.tx;
          m.y = m.ty;

          if (m.rejected) {
            // Arrived at reject bin — ring pulse and done
            s.rings.push({
              id: s.nextRingId++,
              cx: REJECT_X,
              cy: REJECT_Y,
              r: REJECT_HW,
              alpha: 0.65,
              color: TINT_REJECT,
            });
            toRemove.add(m.id);
          } else {
            const stage = STAGES[m.stageIdx];

            // Ring pulse on arriving stage
            s.rings.push({
              id: s.nextRingId++,
              cx: stage.x,
              cy: STAGE_Y,
              r: STAGE_HW,
              alpha: 0.70,
              color: TINT_PULSE,
            });

            // Every 4th mote is rejected at Validate (stage index 1)
            const shouldReject = m.stageIdx === 1 && (s.rejectCounter % 4 === 0);
            if (m.stageIdx === 1) s.rejectCounter++;

            if (shouldReject) {
              m.rejected = true;
              m.tx = REJECT_X;
              m.ty = REJECT_Y;
              m.color = TINT_REJECT;
              m.size = 2.5;
            } else {
              // Advance to next stage or complete
              m.stageIdx++;
              if (m.stageIdx < STAGES.length) {
                const nextStage = STAGES[m.stageIdx];
                m.tx = nextStage.x;
                m.ty = STAGE_Y;
                m.color = stage.outTint;
                m.size = 2.8;
              } else {
                // Completed all stages — fade out at aggregate
                toRemove.add(m.id);
              }
            }
          }
        }

        if (toRemove.has(m.id)) continue;

        // Glow halo
        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 5);
        glow.addColorStop(0, `${m.color}45`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = m.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      s.motes = s.motes.filter((m) => !toRemove.has(m.id));
      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 260' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
