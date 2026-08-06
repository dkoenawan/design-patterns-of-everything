import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const BLUE_TINT   = '#7aa3d4'; // shell / MFE
const ORANGE_TINT = '#c46a55'; // monolith (legacy, being strangled)
const GOLD_TINT   = 'var(--gold)';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.14)';
const BOX_BG      = 'rgba(14,20,42,0.80)';

const X_CLIENT = W * 0.10;
const X_ROUTER = W * 0.36;
const X_TARGET = W * 0.78;

const Y_MAIN     = H * 0.50;
const Y_MONOLITH = H * 0.78;
const Y_MFE      = H * 0.22;

const BOX_HW = 52;
const BOX_HH = 18;

const CUTOVER_DURATION = 24; // seconds for one full 5% → 100% sweep, then loop

interface Mote {
  id: number;
  x: number;
  y: number;
  targetMfe: boolean;
  color: string;
  size: number;
  speed: number;
  stage: 0 | 1; // 0 client→router, 1 router→target
}

let nextId = 0;

export default function TrafficCutoverViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextSpawn: 0.4,
    elapsed: 0,
    mfeCount: 0,
    monolithCount: 0,
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

    // weight ramps 5% → 100% over CUTOVER_DURATION seconds, then holds briefly, then resets
    function mfeWeight(elapsed: number): number {
      const cycle = elapsed % (CUTOVER_DURATION + 4);
      if (cycle > CUTOVER_DURATION) return 1; // hold at 100%
      const t = cycle / CUTOVER_DURATION;
      return 0.05 + t * 0.95;
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
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      const weight = mfeWeight(s.elapsed);
      const weightPct = Math.round(weight * 100);

      // ── Header ──────────────────────────────────────────────
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = INK_DIM;
      ctx.globalAlpha = 0.6;
      ctx.fillText('PROGRESSIVE CUTOVER — WEIGHTED DNS ROUTING BY DOMAIN', sx(X_CLIENT, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillStyle = BLUE_TINT;
      ctx.globalAlpha = 0.8;
      ctx.fillText(`MFE ${weightPct}% · MONOLITH ${100 - weightPct}%`, sx(W - 12, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      // ── Connector lines ────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(sx(X_CLIENT + BOX_HW, cw), sy(Y_MAIN, ch));
      ctx.lineTo(sx(X_ROUTER - BOX_HW, cw), sy(Y_MAIN, ch));
      ctx.strokeStyle = INK_FAINT;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx(X_ROUTER, cw), sy(Y_MAIN - BOX_HH, ch));
      ctx.lineTo(sx(X_ROUTER, cw), sy(Y_MFE + BOX_HH, ch));
      ctx.lineTo(sx(X_TARGET - BOX_HW, cw), sy(Y_MFE, ch));
      ctx.strokeStyle = `${BLUE_TINT}40`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx(X_ROUTER, cw), sy(Y_MAIN + BOX_HH, ch));
      ctx.lineTo(sx(X_ROUTER, cw), sy(Y_MONOLITH - BOX_HH, ch));
      ctx.lineTo(sx(X_TARGET - BOX_HW, cw), sy(Y_MONOLITH, ch));
      ctx.strokeStyle = `${ORANGE_TINT}40`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      drawBox(X_CLIENT, Y_MAIN, 'Client', 'browser request', INK_DIM, cw, ch);
      drawBox(X_ROUTER, Y_MAIN, 'DNS Weight', 'shell routing gate', GOLD_TINT, cw, ch);
      drawBox(X_TARGET, Y_MFE, 'Payments MFE', 'independent deploy', BLUE_TINT, cw, ch);
      drawBox(X_TARGET, Y_MONOLITH, 'Monolith', 'legacy release cycle', ORANGE_TINT, cw, ch);

      // weight bar under router
      const barW = sx(BOX_HW * 2, cw);
      const barX = sx(X_ROUTER, cw) - barW / 2;
      const barY = sy(Y_MAIN + BOX_HH + 10, ch);
      ctx.fillStyle = `${ORANGE_TINT}30`;
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = BLUE_TINT;
      ctx.fillRect(barX, barY, barW * weight, 3);

      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate ii-A · Progressive Traffic Cutover · Case Study FE-01', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push({
          id: nextId++,
          x: X_CLIENT,
          y: Y_MAIN,
          targetMfe: Math.random() < weight,
          color: INK_DIM,
          size: 3,
          speed: 150 + Math.random() * 40,
          stage: 0,
        });
        s.nextSpawn = 0.22 + Math.random() * 0.18;
      }

      // ── Update & draw motes ────────────────────────────────
      const toRemove = new Set<number>();
      for (const m of s.motes) {
        const speed = m.speed * dt;
        let targetX = X_ROUTER, targetY = Y_MAIN;
        if (m.stage === 0) {
          targetX = X_ROUTER;
          targetY = Y_MAIN;
        } else {
          targetX = X_TARGET;
          targetY = m.targetMfe ? Y_MFE : Y_MONOLITH;
        }

        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const dist = Math.hypot(dx, dy);

        if (dist < speed) {
          m.x = targetX;
          m.y = targetY;
          if (m.stage === 0) {
            m.stage = 1;
            m.color = m.targetMfe ? BLUE_TINT : ORANGE_TINT;
          } else {
            if (m.targetMfe) s.mfeCount++; else s.monolithCount++;
            toRemove.add(m.id);
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
