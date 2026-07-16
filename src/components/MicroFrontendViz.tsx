import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const TINT_SHELL   = '#7aa3d4'; // frontend blue (shell host)
const TINT_REMOTE  = '#c8a4d4'; // purple (remote modules)
const TINT_MOTE    = '#d4b15e'; // gold (federation tokens)
const INK_DIM      = 'rgba(232,220,184,0.45)';
const BOX_BG       = 'rgba(14,20,42,0.82)';

// Shell host app — centre
const SHELL_X  = W * 0.48;
const SHELL_Y  = H * 0.50;
const SHELL_HW = 62;
const SHELL_HH = 22;

// Remote modules — arranged left & right of centre
const REMOTES = [
  { label: 'Nav',     x: W * 0.12, y: H * 0.22 },
  { label: 'Catalog', x: W * 0.12, y: H * 0.50 },
  { label: 'Cart',    x: W * 0.12, y: H * 0.78 },
  { label: 'Profile', x: W * 0.84, y: H * 0.35 },
  { label: 'Search',  x: W * 0.84, y: H * 0.65 },
];

const REM_HW = 38;
const REM_HH = 14;

// ── Types ───────────────────────────────────────────────────────────────────────

interface Mote {
  id: number;
  remoteIdx: number;
  // phase 0: remote → shell;  phase 1: shell → remote (acknowledgement)
  phase: number;
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function makeMote(remoteIdx: number): Mote {
  const rem = REMOTES[remoteIdx];
  return {
    id: nextId++,
    remoteIdx,
    phase: 0,
    x: rem.x,
    y: rem.y,
    tx: SHELL_X,
    ty: SHELL_Y,
    color: TINT_MOTE,
    alpha: 0.92,
    size: 3,
    speed: 75 + Math.random() * 25,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function MicroFrontendViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    rings: [] as Ring[],
    nextRingId: 0,
    nextSpawn: 0.6,
    spawnIdx: 0,
    elapsed: 0,
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

      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = tint;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toUpperCase(), bx, by);
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
      ctx.setLineDash([3, 6]);
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

      // Guide rails: remote → shell
      for (const rem of REMOTES) {
        const edgeX = rem.x < SHELL_X ? rem.x + REM_HW : rem.x - REM_HW;
        const shellEdgeX = rem.x < SHELL_X ? SHELL_X - SHELL_HW : SHELL_X + SHELL_HW;
        drawDashedLine(
          edgeX, rem.y,
          shellEdgeX, SHELL_Y,
          `${TINT_REMOTE}1e`, cw, ch,
        );
      }

      // Remote module boxes
      for (const rem of REMOTES) {
        drawBox(rem.x, rem.y, REM_HW, REM_HH, rem.label, TINT_REMOTE, cw, ch);
      }

      // Shell host box (drawn after so it sits on top at guide-rail intersections)
      drawBox(SHELL_X, SHELL_Y, SHELL_HW, SHELL_HH, 'Shell Host', TINT_SHELL, cw, ch);

      // "expose" label on left cluster
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.45;
      ctx.fillText(
        'expose()',
        sx(lerp(REMOTES[1].x + REM_HW, SHELL_X - SHELL_HW, 0.5), cw),
        sy(H * 0.10, ch),
      );

      // "consume" label on right cluster
      ctx.fillText(
        'consume()',
        sx(lerp(SHELL_X + SHELL_HW, REMOTES[3].x - REM_HW, 0.5), cw),
        sy(H * 0.10, ch),
      );
      ctx.globalAlpha = 1;

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.20;
      ctx.fillText('Plate i · Micro-Frontend Architecture · Frontend Domain', sx(W / 2, cw), sy(H - 9, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ───────────────────────────────────────────────

      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push(makeMote(s.spawnIdx % REMOTES.length));
        s.spawnIdx++;
        s.nextSpawn = 0.85 + Math.random() * 0.55;
      }

      // ── Update rings ──────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 48;
        ring.alpha = Math.max(0, ring.alpha - dt * 1.6);
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

          if (m.phase === 0) {
            // Arrived at Shell — ring pulse, send acknowledgement back
            s.rings.push({
              id: s.nextRingId++,
              cx: SHELL_X,
              cy: SHELL_Y,
              r: SHELL_HW,
              alpha: 0.75,
              color: TINT_SHELL,
            });
            const rem = REMOTES[m.remoteIdx];
            m.tx = rem.x;
            m.ty = rem.y;
            m.color = TINT_SHELL;
            m.size = 2.5;
            m.phase = 1;
          } else {
            // Returned to remote — small ring pulse, mote done
            const rem = REMOTES[m.remoteIdx];
            s.rings.push({
              id: s.nextRingId++,
              cx: rem.x,
              cy: rem.y,
              r: REM_HW,
              alpha: 0.55,
              color: TINT_REMOTE,
            });
            toRemove.add(m.id);
          }
        }

        if (toRemove.has(m.id)) continue;

        // Glow halo
        const mx = sx(m.x, cw);
        const my = sy(m.y, ch);
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, m.size * 5);
        glow.addColorStop(0, `${m.color}40`);
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 320' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
