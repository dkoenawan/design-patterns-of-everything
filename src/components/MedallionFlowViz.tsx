import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const BRONZE_TINT = '#c49c5a';
const SILVER_TINT = '#a0afc8';
const GOLD_TINT   = 'var(--gold)';
const REJECT_TINT = '#c46a55';
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.14)';
const BOX_BG      = 'rgba(14,20,42,0.80)';

const X_SOURCE = W * 0.08;
const X_BRONZE = W * 0.30;
const X_GATE   = W * 0.50;
const X_SILVER = W * 0.70;
const X_GOLD   = W * 0.92;
const X_REJECT = W * 0.50;

const Y_MAIN   = H * 0.42;
const Y_REJECT = H * 0.82;

const BOX_HW = 46;
const BOX_HH = 17;

const REJECT_RATE = 0.16; // fraction of batches quarantined at the schema gate

interface Mote {
  id: number;
  x: number;
  y: number;
  rejected: boolean;
  color: string;
  size: number;
  speed: number;
  stage: 0 | 1 | 2 | 3; // 0 source→bronze, 1 bronze→gate, 2 gate→silver/reject, 3 silver→gold
}

let nextId = 0;

export default function MedallionFlowViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextSpawn: 0.5,
    elapsed: 0,
    passed: 0,
    quarantined: 0,
    gatePulse: 0,
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
      s.gatePulse = Math.max(0, s.gatePulse - dt * 2.2);

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
      ctx.fillText('MEDALLION PIPELINE — BRONZE → SILVER → GOLD', sx(X_SOURCE, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      const total = s.passed + s.quarantined;
      const passRate = total > 0 ? Math.round((s.passed / total) * 100) : 100;
      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillStyle = SILVER_TINT;
      ctx.globalAlpha = 0.75;
      ctx.fillText(`${passRate}% PASS RATE · ${s.quarantined} QUARANTINED`, sx(W - 12, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      // ── Connector lines ────────────────────────────────────
      const lines: [number, number, number, number, string][] = [
        [X_SOURCE + BOX_HW, Y_MAIN, X_BRONZE - BOX_HW, Y_MAIN, INK_FAINT],
        [X_BRONZE + BOX_HW, Y_MAIN, X_GATE - BOX_HW, Y_MAIN, `${BRONZE_TINT}35`],
        [X_GATE + BOX_HW, Y_MAIN, X_SILVER - BOX_HW, Y_MAIN, `${SILVER_TINT}35`],
        [X_SILVER + BOX_HW, Y_MAIN, X_GOLD - BOX_HW, Y_MAIN, `${GOLD_TINT}35`],
        [X_GATE, Y_MAIN + BOX_HH, X_REJECT, Y_REJECT - BOX_HH, `${REJECT_TINT}35`],
      ];
      for (const [x1, y1, x2, y2, col] of lines) {
        ctx.beginPath();
        ctx.moveTo(sx(x1, cw), sy(y1, ch));
        ctx.lineTo(sx(x2, cw), sy(y2, ch));
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      drawBox(X_SOURCE, Y_MAIN, 'Sources', '40+ upstream', INK_DIM, cw, ch);
      drawBox(X_BRONZE, Y_MAIN, 'Bronze', 'raw landing', BRONZE_TINT, cw, ch);
      drawBox(X_SILVER, Y_MAIN, 'Silver', 'typed, deduped', SILVER_TINT, cw, ch);
      drawBox(X_GOLD, Y_MAIN, 'Gold', 'consumer-ready', GOLD_TINT, cw, ch);
      drawBox(X_REJECT, Y_REJECT, 'Quarantine', 'schema violation', REJECT_TINT, cw, ch);

      // Schema gate node (pulses on evaluation)
      const gx = sx(X_GATE, cw);
      const gy = sy(Y_MAIN, ch);
      const pulseR = sx(BOX_HW * 0.55, cw) * (1 + s.gatePulse * 0.9);
      if (s.gatePulse > 0) {
        ctx.beginPath();
        ctx.arc(gx, gy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD_TINT;
        ctx.globalAlpha = s.gatePulse * 0.6;
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
      ctx.fillText('GATE', gx, gy);
      ctx.globalAlpha = 1;

      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate iv-B · Medallion Flow · Case Study DP-01', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push({
          id: nextId++,
          x: X_SOURCE,
          y: Y_MAIN,
          rejected: false,
          color: BRONZE_TINT,
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
        let targetX = X_SOURCE, targetY = Y_MAIN;
        if (m.stage === 0) { targetX = X_BRONZE; targetY = Y_MAIN; }
        else if (m.stage === 1) { targetX = X_GATE; targetY = Y_MAIN; }
        else if (m.stage === 2) {
          targetX = m.rejected ? X_REJECT : X_SILVER;
          targetY = m.rejected ? Y_REJECT : Y_MAIN;
        } else { targetX = X_GOLD; targetY = Y_MAIN; }

        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const dist = Math.hypot(dx, dy);

        if (dist < speed) {
          m.x = targetX;
          m.y = targetY;
          if (m.stage === 0) {
            m.stage = 1;
          } else if (m.stage === 1) {
            m.rejected = Math.random() < REJECT_RATE;
            m.color = m.rejected ? REJECT_TINT : SILVER_TINT;
            m.stage = 2;
            s.gatePulse = 1;
            if (m.rejected) s.quarantined++; else s.passed++;
          } else if (m.stage === 2) {
            if (m.rejected) {
              toRemove.add(m.id);
            } else {
              m.color = GOLD_TINT;
              m.stage = 3;
            }
          } else {
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
