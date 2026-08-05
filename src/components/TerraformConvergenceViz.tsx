import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const GOLD_TINT   = 'var(--gold)';
const PURPLE_TINT = '#c8a4d4';
const GREEN_TINT  = '#9ec48a';
const DRIFT_TINT  = '#c46a55';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.14)';
const BOX_BG      = 'rgba(14,20,42,0.80)';

const X_REPO    = W * 0.12;
const X_PLAN    = W * 0.34;
const X_CLUSTER = W * 0.62;
const X_DRIFT   = W * 0.86;

const Y_MAIN = H * 0.40;
const Y_LOOP = H * 0.78;

const BOX_HW = 50;
const BOX_HH = 18;

const DRIFT_RATE = 0.22; // fraction of nodes found drifted on reconciliation pass

interface Mote {
  id: number;
  x: number;
  y: number;
  drifted: boolean;
  color: string;
  size: number;
  speed: number;
  stage: 0 | 1 | 2 | 3; // 0 repo→plan, 1 plan→cluster, 2 cluster→drift-check, 3 drift→return loop
}

let nextId = 0;

export default function TerraformConvergenceViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextSpawn: 0.5,
    elapsed: 0,
    converged: 0,
    reconciled: 0,
    checkPulse: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawBox(
      x: number, y: number, label: string, sub: string, tint: string, cw: number, ch: number,
    ) {
      const bx = sx(x, cw);
      const by = sy(y, ch);
      const hw = sx(BOX_HW, cw);
      const hh = sy(BOX_HH, ch);

      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = tint;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.rect(bx - hw, by - hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by - sy(4, ch));

      if (sub) {
        ctx.font = `normal 6.5px 'JetBrains Mono', monospace`;
        ctx.globalAlpha = 0.55;
        ctx.fillText(sub, bx, by + sy(8, ch));
        ctx.globalAlpha = 1;
      }
    }

    function draw(ts: number) {
      const s = stateRef.current;
      const dt = Math.min(ts - (s.lastTime || ts), 50) / 1000;
      s.lastTime = ts;
      s.elapsed += dt;
      s.checkPulse = Math.max(0, s.checkPulse - dt * 2.2);

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // ── Header ──────────────────────────────────────────────
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = INK_DIM;
      ctx.globalAlpha = 0.6;
      ctx.fillText('IAC CONVERGENCE — GIT REPO → TERRAFORM PLAN → CLUSTER', sx(X_REPO, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      const total = s.converged + s.reconciled;
      const convergedPct = total > 0 ? Math.round((s.converged / total) * 100) : 100;
      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillStyle = GREEN_TINT;
      ctx.globalAlpha = 0.75;
      ctx.fillText(`${convergedPct}% CONVERGED · ${s.reconciled} RECONCILED`, sx(W - 12, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      // ── Connector lines ────────────────────────────────────
      const lines: [number, number, number, number, string][] = [
        [X_REPO + BOX_HW, Y_MAIN, X_PLAN - BOX_HW, Y_MAIN, INK_FAINT],
        [X_PLAN + BOX_HW, Y_MAIN, X_CLUSTER - BOX_HW, Y_MAIN, `${PURPLE_TINT}35`],
        [X_CLUSTER + BOX_HW, Y_MAIN, X_DRIFT - BOX_HW, Y_MAIN, `${GOLD_TINT}35`],
        [X_DRIFT, Y_MAIN + BOX_HH, X_DRIFT, Y_LOOP - BOX_HH, `${DRIFT_TINT}35`],
      ];
      for (const [x1, y1, x2, y2, col] of lines) {
        ctx.beginPath();
        ctx.moveTo(sx(x1, cw), sy(y1, ch));
        ctx.lineTo(sx(x2, cw), sy(y2, ch));
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Return loop: drift check → back to repo (U-turn along bottom)
      ctx.beginPath();
      ctx.moveTo(sx(X_DRIFT, cw), sy(Y_LOOP, ch));
      ctx.lineTo(sx(X_REPO, cw), sy(Y_LOOP, ch));
      ctx.strokeStyle = `${DRIFT_TINT}35`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx(X_REPO, cw), sy(Y_LOOP, ch));
      ctx.lineTo(sx(X_REPO, cw), sy(Y_MAIN + BOX_HH, ch));
      ctx.strokeStyle = `${DRIFT_TINT}35`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      drawBox(X_REPO, Y_MAIN, 'Git Repo', 'declared state', INK_DIM, cw, ch);
      drawBox(X_PLAN, Y_MAIN, 'TF Plan', 'diff & apply', PURPLE_TINT, cw, ch);
      drawBox(X_CLUSTER, Y_MAIN, 'Cluster', 'live pods', GOLD_TINT, cw, ch);
      drawBox(X_DRIFT, Y_LOOP, 'Drift Check', 'actual vs desired', DRIFT_TINT, cw, ch);

      // Drift check node (pulses on evaluation) — positioned at X_DRIFT, Y_MAIN as the gate
      const gx = sx(X_DRIFT, cw);
      const gy = sy(Y_MAIN, ch);
      const pulseR = sx(BOX_HW * 0.55, cw) * (1 + s.checkPulse * 0.9);
      if (s.checkPulse > 0) {
        ctx.beginPath();
        ctx.arc(gx, gy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = GREEN_TINT;
        ctx.globalAlpha = s.checkPulse * 0.6;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(gx, gy, sx(BOX_HW * 0.4, cw), 0, Math.PI * 2);
      ctx.fillStyle = BOX_BG;
      ctx.strokeStyle = GOLD_TINT;
      ctx.lineWidth = 0.7;
      ctx.fill();
      ctx.stroke();
      ctx.font = `normal 6px 'JetBrains Mono', monospace`;
      ctx.fillStyle = GOLD_TINT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.85;
      ctx.fillText('SYNC', gx, gy);
      ctx.globalAlpha = 1;

      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate v-A · IaC Convergence · Case Study INFRA-01', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push({
          id: nextId++,
          x: X_REPO,
          y: Y_MAIN,
          drifted: false,
          color: PURPLE_TINT,
          size: 3,
          speed: 130 + Math.random() * 40,
          stage: 0,
        });
        s.nextSpawn = 0.4 + Math.random() * 0.3;
      }

      // ── Update & draw motes ────────────────────────────────
      const toRemove = new Set<number>();
      for (const m of s.motes) {
        const speed = m.speed * dt;
        let targetX = X_REPO, targetY = Y_MAIN;
        if (m.stage === 0) { targetX = X_PLAN; targetY = Y_MAIN; }
        else if (m.stage === 1) { targetX = X_CLUSTER; targetY = Y_MAIN; }
        else if (m.stage === 2) { targetX = X_DRIFT; targetY = Y_MAIN; }
        else {
          // stage 3: reconciliation loop back to repo, or converged (removed at cluster)
          targetX = X_DRIFT;
          targetY = Y_LOOP;
        }

        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const dist = Math.hypot(dx, dy);

        if (dist < speed) {
          m.x = targetX;
          m.y = targetY;
          if (m.stage === 0) {
            m.stage = 1;
            m.color = GOLD_TINT;
          } else if (m.stage === 1) {
            m.stage = 2;
          } else if (m.stage === 2) {
            m.drifted = Math.random() < DRIFT_RATE;
            s.checkPulse = 1;
            if (m.drifted) {
              m.color = DRIFT_TINT;
              m.stage = 3;
              s.reconciled++;
            } else {
              m.color = GREEN_TINT;
              s.converged++;
              toRemove.add(m.id);
            }
          } else {
            // reached the loop-back point at Y_LOOP; route back toward repo along bottom then up
            if (Math.abs(m.y - Y_LOOP) < 1 && m.x > X_REPO + 1) {
              m.x -= speed;
            } else if (Math.abs(m.x - X_REPO) < speed) {
              toRemove.add(m.id);
            } else {
              m.y -= speed;
            }
          }
        } else {
          m.x += (dx / dist) * speed;
          m.y += (dy / dist) * speed;
        }

        if (toRemove.has(m.id)) continue;

        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 4);
        glow.addColorStop(0, `${m.color}50`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
      }
      s.motes = s.motes.filter((m) => !toRemove.has(m.id));

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 320' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
