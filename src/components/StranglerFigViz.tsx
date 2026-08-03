import { useRef, useEffect } from 'react';

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const LEGACY_TINT  = '#d49a7a'; // backend orange-warm (old monolith)
const CORE_TINT    = '#9ec48a'; // green (new hexagonal core)
const GATEWAY_TINT = 'var(--gold)';
const INK_DIM       = 'rgba(232,220,184,0.45)';
const INK_FAINT     = 'rgba(232,220,184,0.14)';
const BOX_BG        = 'rgba(14,20,42,0.80)';

const X_CLIENT  = W * 0.08;
const X_GATEWAY = W * 0.34;
const X_LEGACY  = W * 0.68;
const X_CORE    = W * 0.68;

const Y_GATEWAY = H * 0.5;
const Y_LEGACY  = H * 0.24;
const Y_CORE    = H * 0.76;

const BOX_HW = 48;
const BOX_HH = 17;

// Migration progress: fraction of traffic routed to the new core, rising over 14 (simulated) weeks.
const CYCLE_SECONDS = 22; // full strangler-fig sweep, then loops

interface Mote {
  id: number;
  x: number;
  y: number;
  toLegacy: boolean;
  color: string;
  size: number;
  speed: number;
  phase: 0 | 1; // 0 = client→gateway, 1 = gateway→target
}

let nextId = 0;

export default function StranglerFigViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    nextSpawn: 0.6,
    elapsed: 0,
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

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== cw * dpr || canvas!.height !== ch * dpr) {
        canvas!.width = cw * dpr;
        canvas!.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, cw, ch);

      // Migration progress: 0 → 1 over CYCLE_SECONDS, then hold briefly before looping
      const cyclePos = (s.elapsed % (CYCLE_SECONDS + 4)) / CYCLE_SECONDS;
      const progress = Math.min(1, Math.max(0, cyclePos));
      const coreShare = progress; // fraction of new motes routed to the hexagonal core

      // ── Static structure ──────────────────────────────────────

      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = INK_DIM;
      ctx.globalAlpha = 0.6;
      ctx.fillText('STRANGLER FIG MIGRATION', sx(X_CLIENT, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      // Progress readout
      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillStyle = CORE_TINT;
      ctx.globalAlpha = 0.75;
      ctx.fillText(`${Math.round(coreShare * 100)}% ROUTED TO HEXAGONAL CORE`, sx(W - 12, cw), sy(24, ch));
      ctx.globalAlpha = 1;

      // Connector lines
      const lines: [number, number, number, number, string][] = [
        [X_CLIENT + BOX_HW, Y_GATEWAY, X_GATEWAY - BOX_HW, Y_GATEWAY, INK_FAINT],
        [X_GATEWAY + BOX_HW, Y_GATEWAY, X_LEGACY - BOX_HW, Y_LEGACY, `${LEGACY_TINT}35`],
        [X_GATEWAY + BOX_HW, Y_GATEWAY, X_CORE - BOX_HW, Y_CORE, `${CORE_TINT}35`],
      ];
      for (const [x1, y1, x2, y2, col] of lines) {
        ctx.beginPath();
        ctx.moveTo(sx(x1, cw), sy(y1, ch));
        ctx.lineTo(sx(x2, cw), sy(y2, ch));
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      drawBox(X_CLIENT, Y_GATEWAY, 'Client', '94 integrations', INK_DIM, cw, ch);
      drawBox(X_GATEWAY, Y_GATEWAY, 'API Gateway', 'feature-flag routing', GATEWAY_TINT, cw, ch);
      drawBox(X_LEGACY, Y_LEGACY, 'Legacy Monolith', 'shrinking', LEGACY_TINT, cw, ch);
      drawBox(X_CORE, Y_CORE, 'Hexagonal Core', 'growing', CORE_TINT, cw, ch);

      // Legacy footprint bar (shrinks as progress rises)
      const barX = sx(X_LEGACY - BOX_HW, cw);
      const barY = sy(Y_LEGACY + BOX_HH + 10, ch);
      const barW = sx(BOX_HW * 2, cw);
      ctx.fillStyle = INK_FAINT;
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = LEGACY_TINT;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(barX, barY, barW * (1 - coreShare), 3);
      ctx.globalAlpha = 1;

      // Core footprint bar (grows)
      const barY2 = sy(Y_CORE + BOX_HH + 10, ch);
      ctx.fillStyle = INK_FAINT;
      ctx.fillRect(barX, barY2, barW, 3);
      ctx.fillStyle = CORE_TINT;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(barX, barY2, barW * coreShare, 3);
      ctx.globalAlpha = 1;

      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.22;
      ctx.fillText('Plate iii-A · Strangler Fig · Case Study BE-01', sx(W / 2, cw), sy(H - 8, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ─────────────────────────────────────────────

      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        const toLegacy = Math.random() > coreShare;
        s.motes.push({
          id: nextId++,
          x: X_CLIENT,
          y: Y_GATEWAY,
          toLegacy,
          color: toLegacy ? LEGACY_TINT : CORE_TINT,
          size: 3,
          speed: 130 + Math.random() * 40,
          phase: 0,
        });
        s.nextSpawn = 0.45 + Math.random() * 0.35;
      }

      // ── Update & draw motes ────────────────────────────────────

      const toRemove = new Set<number>();
      for (const m of s.motes) {
        const speed = m.speed * dt;
        const targetX = m.phase === 0 ? X_GATEWAY : (m.toLegacy ? X_LEGACY : X_CORE);
        const targetY = m.phase === 0 ? Y_GATEWAY : (m.toLegacy ? Y_LEGACY : Y_CORE);

        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const dist = Math.hypot(dx, dy);

        if (dist < speed) {
          m.x = targetX;
          m.y = targetY;
          if (m.phase === 0) {
            m.phase = 1;
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
