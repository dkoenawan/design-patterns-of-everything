import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 700;
const H = 260;

const INFRA_TINT  = '#c8a4d4'; // infra purple — pipeline flow
const FAIL_TINT   = '#d49a7a'; // warm orange — failed stage
const HEALTH_TINT = '#9ec48a'; // green — successful deploy
const RETRY_TINT  = '#d4b15e'; // gold — retry token
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.10)';
const BOX_BG      = 'rgba(14,20,42,0.84)';

const PIPELINE_Y = H * 0.44;
const RETRY_Y    = H * 0.74; // retry return lane

// Six pipeline stages
const STAGES = [
  { x: W * 0.06, label: 'Source'  },
  { x: W * 0.24, label: 'Build'   },
  { x: W * 0.42, label: 'Test'    },
  { x: W * 0.58, label: 'Scan'    },
  { x: W * 0.74, label: 'Deploy'  },
  { x: W * 0.92, label: 'Health'  },
];

const BOX_HW = 38;
const BOX_HH = 14;

// ── Types ─────────────────────────────────────────────────────────────────────

type MoteMode = 'forward' | 'fail-bounce' | 'retry';

interface Mote {
  id: number;
  x: number;
  y: number;
  phase: number;      // next STAGES index to reach
  color: string;
  alpha: number;
  size: number;
  speed: number;
  mode: MoteMode;
  failAt: number;     // stage index where failure triggers (-1 = no failure)
  bounced: boolean;   // already bounced once
}

interface RingPulse {
  id: number;
  x: number;
  y: number;
  color: string;
  alpha: number;
  radius: number;
}

let _id = 0;
function nextId() { return _id++; }

// ── Mote factory ──────────────────────────────────────────────────────────────

function makeMote(): Mote {
  const failRoll = Math.random();
  // ~20% chance of a test-stage failure (stage 2)
  const failAt = failRoll < 0.20 ? 2 : -1;
  return {
    id: nextId(),
    x: STAGES[0].x,
    y: PIPELINE_Y,
    phase: 1,
    color: INFRA_TINT,
    alpha: 0.92,
    size: 3,
    speed: 80 + Math.random() * 30,
    mode: 'forward',
    failAt,
    bounced: false,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CICDPipelineViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    pulses: [] as RingPulse[],
    nextSpawn: 1.0,
    nextPulseId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(x: number, y: number, label: string, tint: string, cw: number, ch: number) {
      const bx = sx(x, cw), by = sy(y, ch);
      const hw = sx(BOX_HW, cw), hh = sy(BOX_HH, ch);
      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - hw, by - hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by);
    }

    function drawGuide(x1: number, y: number, x2: number, color: string, cw: number, ch: number) {
      ctx.beginPath();
      ctx.moveTo(sx(x1, cw), sy(y, ch));
      ctx.lineTo(sx(x2, cw), sy(y, ch));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    function spawnPulse(x: number, y: number, color: string) {
      stateRef.current.pulses.push({
        id: stateRef.current.nextPulseId++,
        x, y, color, alpha: 1.0, radius: 0,
      });
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width  = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Stage gate tick marks (vertical lines between stage boxes) ──
      for (let i = 0; i < STAGES.length - 1; i++) {
        const gx = (STAGES[i].x + STAGES[i + 1].x) / 2;
        ctx.beginPath();
        ctx.moveTo(sx(gx, cw), sy(PIPELINE_Y - BOX_HH - 4, ch));
        ctx.lineTo(sx(gx, cw), sy(PIPELINE_Y + BOX_HH + 4, ch));
        ctx.strokeStyle = INK_FAINT;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Guide rail — forward lane ─────────────────────────────────
      for (let i = 0; i < STAGES.length - 1; i++) {
        drawGuide(
          STAGES[i].x + BOX_HW, PIPELINE_Y,
          STAGES[i + 1].x - BOX_HW,
          `${INFRA_TINT}22`, cw, ch,
        );
      }

      // ── Guide rail — retry return lane ────────────────────────────
      // Goes from Test (stage 2) back to Build (stage 1)
      const testX  = STAGES[2].x;
      const buildX = STAGES[1].x;
      drawGuide(testX - BOX_HW, RETRY_Y, buildX + BOX_HW, `${RETRY_TINT}22`, cw, ch);

      // Vertical connectors: test box down to retry lane
      ctx.beginPath();
      ctx.moveTo(sx(testX, cw),  sy(PIPELINE_Y + BOX_HH, ch));
      ctx.lineTo(sx(testX, cw),  sy(RETRY_Y, ch));
      ctx.strokeStyle = `${FAIL_TINT}22`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      // build box up from retry lane
      ctx.beginPath();
      ctx.moveTo(sx(buildX, cw), sy(RETRY_Y, ch));
      ctx.lineTo(sx(buildX, cw), sy(PIPELINE_Y + BOX_HH, ch));
      ctx.strokeStyle = `${RETRY_TINT}22`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // ── Retry lane label ──────────────────────────────────────────
      ctx.font = `400 italic 8px 'Cormorant Garamond', serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = RETRY_TINT;
      ctx.globalAlpha = 0.45;
      ctx.fillText(
        'RETRY · TEST FAILURE',
        sx(buildX + BOX_HW + 6, cw),
        sy(RETRY_Y + 10, ch),
      );
      ctx.globalAlpha = 1;

      // ── Stage nodes ───────────────────────────────────────────────
      for (let i = 0; i < STAGES.length; i++) {
        const st = STAGES[i];
        const isHealth = i === STAGES.length - 1;
        const tint = isHealth ? HEALTH_TINT : INFRA_TINT;
        drawBox(st.x, PIPELINE_Y, st.label, tint, cw, ch);
      }
      // Retry label under Test node
      ctx.font = `normal 6.5px 'JetBrains Mono', monospace`;
      ctx.fillStyle = FAIL_TINT;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.55;
      ctx.fillText('GATE', sx(STAGES[2].x, cw), sy(PIPELINE_Y + BOX_HH + 8, ch));
      ctx.globalAlpha = 1;

      // ── Plate reference ───────────────────────────────────────────
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.2;
      ctx.fillText(
        'Plate iv · CI/CD Delivery Pipeline · Infrastructure Domain',
        sx(W / 2, cw),
        sy(H - 8, ch),
      );
      ctx.globalAlpha = 1;

      // ── Ring pulses ────────────────────────────────────────────────
      s.pulses = s.pulses.filter((p) => {
        p.alpha -= dt * 1.4;
        p.radius += dt * sx(BOX_HH * 5, cw);
        if (p.alpha <= 0) return false;
        ctx.beginPath();
        ctx.arc(sx(p.x, cw), sy(p.y, ch), p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      // ── Spawn motes ────────────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push(makeMote());
        s.nextSpawn = 1.6 + Math.random() * 1.2;
      }

      // ── Update & draw motes ────────────────────────────────────────
      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const speed = m.speed * dt;

        if (m.mode === 'forward') {
          const targetX = STAGES[m.phase].x;
          if (m.x < targetX - speed) {
            m.x += speed;
          } else {
            m.x = targetX;
            const stageIdx = m.phase;

            // Failure at Test gate
            if (m.failAt === stageIdx && !m.bounced) {
              spawnPulse(targetX, PIPELINE_Y, FAIL_TINT);
              m.color = FAIL_TINT;
              m.mode = 'fail-bounce';
              m.y = PIPELINE_Y;
              m.bounced = true;
            } else if (m.phase === STAGES.length - 1) {
              // Reached Health — success
              spawnPulse(targetX, PIPELINE_Y, HEALTH_TINT);
              toRemove.add(m.id);
              continue;
            } else {
              spawnPulse(targetX, PIPELINE_Y, INFRA_TINT);
              m.phase++;
            }
          }
        } else if (m.mode === 'fail-bounce') {
          // Drop down to retry lane
          const targetY = RETRY_Y;
          if (m.y < targetY - speed) {
            m.y += speed;
          } else {
            m.y = targetY;
            m.mode = 'retry';
            m.color = RETRY_TINT;
          }
        } else if (m.mode === 'retry') {
          // Travel left along retry lane back to Build
          const targetX = STAGES[1].x;
          if (m.x > targetX + speed) {
            m.x -= speed;
          } else {
            m.x = targetX;
            // Rise back up to pipeline lane
            m.y = PIPELINE_Y;
            m.mode = 'forward';
            m.color = INFRA_TINT;
            m.phase = 2; // re-enter at Test gate
          }
        }

        if (toRemove.has(m.id)) continue;

        // Glow halo
        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
        const r  = m.size * 4.5;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        grad.addColorStop(0, `${m.color}55`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '700 / 260' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
