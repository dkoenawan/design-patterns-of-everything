import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 300;

const INFRA_TINT  = '#c8a4d4'; // infra purple
const DRIFT_TINT  = '#d49a7a'; // drift/reconcile warm orange
const HEALTH_TINT = '#9ec48a'; // health-check green
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.12)';
const BOX_BG      = 'rgba(14,20,42,0.82)';

// Y lanes
const DEPLOY_Y = H * 0.32;
const DRIFT_Y  = H * 0.68;

// X positions for pipeline stages
const X_GIT      = W * 0.07;
const X_CI       = W * 0.27;
const X_REGISTRY = W * 0.47;
const X_APPLY    = W * 0.67;
const X_HEALTH   = W * 0.87;

// Drift lane: right-to-left (detect divergence → reconcile)
const X_ACTUAL   = W * 0.87; // "Actual State" node
const X_DESIRED  = W * 0.07; // "Desired State" node

const BOX_HW = 42;
const BOX_HH = 15;

// ── Mote types ────────────────────────────────────────────────────────────────

type Lane = 'deploy' | 'drift';

interface Mote {
  id: number;
  lane: Lane;
  x: number;
  phase: number;
  color: string;
  alpha: number;
  size: number;
  speed: number;
}

// Health pulse — brief flash at the Health node when a deploy mote arrives
interface HealthPulse {
  id: number;
  alpha: number;
}

let _nextId = 0;
function nextId() { return _nextId++; }

const DEPLOY_TARGETS = [X_CI, X_REGISTRY, X_APPLY, X_HEALTH];
const DRIFT_TARGETS  = [X_APPLY, X_REGISTRY, X_CI, X_DESIRED];

function makeMote(lane: Lane): Mote {
  if (lane === 'deploy') {
    return {
      id: nextId(), lane,
      x: X_GIT,
      phase: 0,
      color: INFRA_TINT,
      alpha: 0.92,
      size: 3,
      speed: 75 + Math.random() * 25,
    };
  }
  return {
    id: nextId(), lane,
    x: X_ACTUAL,
    phase: 0,
    color: DRIFT_TINT,
    alpha: 0.85,
    size: 2.5,
    speed: 55 + Math.random() * 20,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IaCPipelineViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    healthPulses: [] as HealthPulse[],
    nextDeploy: 0.6,
    nextDrift: 2.2,
    nextPulseId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      x: number, y: number, label: string, tint: string,
      cw: number, ch: number,
    ) {
      const bx = sx(x, cw), by = sy(y, ch);
      const hw = sx(BOX_HW, cw), hh = sy(BOX_HH, ch);
      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - hw, by - hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `normal 7.5px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by);
    }

    function drawGuide(
      x1: number, y1: number, x2: number, y2: number,
      color: string, cw: number, ch: number,
    ) {
      ctx.beginPath();
      ctx.moveTo(sx(x1, cw), sy(y1, ch));
      ctx.lineTo(sx(x2, cw), sy(y2, ch));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.7;
      ctx.stroke();
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

      // ── Lane labels ──────────────────────────────────────────────

      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.textBaseline = 'middle';

      ctx.fillStyle = INFRA_TINT;
      ctx.textAlign = 'left';
      ctx.globalAlpha = 0.55;
      ctx.fillText('DEPLOY PIPELINE', sx(X_GIT + BOX_HW + 6, cw), sy(DEPLOY_Y - BOX_HH - 12, ch));

      ctx.fillStyle = DRIFT_TINT;
      ctx.fillText('DRIFT DETECTION · RECONCILIATION', sx(X_DESIRED + BOX_HW + 6, cw), sy(DRIFT_Y + BOX_HH + 13, ch));
      ctx.globalAlpha = 1;

      // Lane divider
      ctx.beginPath();
      ctx.moveTo(sx(X_GIT - 6, cw), sy(H * 0.5, ch));
      ctx.lineTo(sx(X_HEALTH + BOX_HW + 4, cw), sy(H * 0.5, ch));
      ctx.strokeStyle = INK_FAINT;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Guide rails — deploy lane ─────────────────────────────────
      const deployGuides: [number, number, number, number][] = [
        [X_GIT + BOX_HW,      DEPLOY_Y, X_CI       - BOX_HW, DEPLOY_Y],
        [X_CI  + BOX_HW,      DEPLOY_Y, X_REGISTRY - BOX_HW, DEPLOY_Y],
        [X_REGISTRY + BOX_HW, DEPLOY_Y, X_APPLY    - BOX_HW, DEPLOY_Y],
        [X_APPLY + BOX_HW,    DEPLOY_Y, X_HEALTH   - BOX_HW, DEPLOY_Y],
      ];
      for (const [x1, y1, x2, y2] of deployGuides) {
        drawGuide(x1, y1, x2, y2, `${INFRA_TINT}28`, cw, ch);
      }

      // ── Guide rails — drift lane (right→left) ─────────────────────
      const driftGuides: [number, number, number, number][] = [
        [X_ACTUAL   - BOX_HW, DRIFT_Y, X_APPLY    + BOX_HW, DRIFT_Y],
        [X_APPLY    - BOX_HW, DRIFT_Y, X_REGISTRY + BOX_HW, DRIFT_Y],
        [X_REGISTRY - BOX_HW, DRIFT_Y, X_CI       + BOX_HW, DRIFT_Y],
        [X_CI       - BOX_HW, DRIFT_Y, X_DESIRED  + BOX_HW, DRIFT_Y],
      ];
      for (const [x1, y1, x2, y2] of driftGuides) {
        drawGuide(x1, y1, x2, y2, `${DRIFT_TINT}25`, cw, ch);
      }

      // ── Nodes — deploy lane ───────────────────────────────────────
      drawBox(X_GIT,      DEPLOY_Y, 'Git Commit',  INK_DIM,     cw, ch);
      drawBox(X_CI,       DEPLOY_Y, 'CI Build',    INFRA_TINT,  cw, ch);
      drawBox(X_REGISTRY, DEPLOY_Y, 'Registry',    INFRA_TINT,  cw, ch);
      drawBox(X_APPLY,    DEPLOY_Y, 'K8s Apply',   INFRA_TINT,  cw, ch);
      drawBox(X_HEALTH,   DEPLOY_Y, 'Health ✓',    HEALTH_TINT, cw, ch);

      // ── Nodes — drift lane ────────────────────────────────────────
      drawBox(X_ACTUAL,  DRIFT_Y, 'Actual State',   DRIFT_TINT, cw, ch);
      drawBox(X_APPLY,   DRIFT_Y, 'Reconcile',      DRIFT_TINT, cw, ch);
      drawBox(X_DESIRED, DRIFT_Y, 'Desired State',  INK_DIM,    cw, ch);

      // ── Health pulses ─────────────────────────────────────────────
      s.healthPulses = s.healthPulses.filter((hp) => {
        hp.alpha -= dt * 1.8;
        if (hp.alpha <= 0) return false;
        const hx = sx(X_HEALTH, cw);
        const hy = sy(DEPLOY_Y, ch);
        const r = sy(BOX_HH * 2.5, ch) * (1 - hp.alpha * 0.5);
        const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
        grad.addColorStop(0, `${HEALTH_TINT}00`);
        grad.addColorStop(0.5, `${HEALTH_TINT}${Math.round(hp.alpha * 40).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(hx, hy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        return true;
      });

      // ── Plate reference ────────────────────────────────────────────
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate iv · GitOps Pipeline · Infrastructure Domain', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ────────────────────────────────────────────────
      s.nextDeploy -= dt;
      if (s.nextDeploy <= 0) {
        s.motes.push(makeMote('deploy'));
        s.nextDeploy = 1.8 + Math.random() * 1.0;
      }
      s.nextDrift -= dt;
      if (s.nextDrift <= 0) {
        s.motes.push(makeMote('drift'));
        s.nextDrift = 2.8 + Math.random() * 1.4;
      }

      // ── Update & draw motes ────────────────────────────────────────
      const toRemove = new Set<number>();

      for (const m of s.motes) {
        const laneY = m.lane === 'deploy' ? DEPLOY_Y : DRIFT_Y;
        const speed = m.speed * dt;
        const targets = m.lane === 'deploy' ? DEPLOY_TARGETS : DRIFT_TARGETS;

        if (m.phase < targets.length) {
          const tx = targets[m.phase];
          if (m.lane === 'deploy') {
            // moves right
            if (m.x < tx - speed) {
              m.x += speed;
            } else {
              m.x = tx;
              m.phase++;
              // health pulse on final node arrival
              if (m.phase === targets.length) {
                s.healthPulses.push({ id: s.nextPulseId++, alpha: 1.0 });
                toRemove.add(m.id);
                continue;
              }
            }
          } else {
            // drift lane moves left
            if (m.x > tx + speed) {
              m.x -= speed;
            } else {
              m.x = tx;
              m.phase++;
              if (m.phase === targets.length) {
                toRemove.add(m.id);
                continue;
              }
            }
          }
        } else {
          toRemove.add(m.id);
        }

        if (toRemove.has(m.id)) continue;

        // Glow halo
        const mx = sx(m.x, cw);
        const my = sy(laneY, ch);
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 4.5);
        grad.addColorStop(0, `${m.color}55`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core mote
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 300' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
