import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────────

const W = 640;
const H = 320;

const TINT_MAIN   = '#d49a7a'; // backend orange-warm (container / service)
const TINT_DEP    = '#7aa3d4'; // backend blue (dependency nodes)
const TINT_PULSE  = '#d4b15e'; // gold (injection pulse)
const INK_DIM     = 'rgba(232,220,184,0.45)';
const INK_FAINT   = 'rgba(232,220,184,0.12)';
const BOX_BG      = 'rgba(14,20,42,0.82)';

// IoC container — occupies the left third
const CONTAINER_X  = W * 0.15;
const CONTAINER_Y  = H * 0.50;
const CONTAINER_HW = 52;
const CONTAINER_HH = 20;

// Central Service node — assembles the injected deps
const SERVICE_X = W * 0.52;
const SERVICE_Y = H * 0.50;
const SERVICE_HW = 48;
const SERVICE_HH = 20;

// Dependency nodes (top-right cluster)
const DEPS = [
  { label: 'Repo',    x: W * 0.82, y: H * 0.22, tint: TINT_DEP },
  { label: 'Logger',  x: W * 0.82, y: H * 0.50, tint: TINT_DEP },
  { label: 'Cache',   x: W * 0.82, y: H * 0.78, tint: TINT_DEP },
];

const DEP_HW = 36;
const DEP_HH = 14;

// ── Mote type ───────────────────────────────────────────────────────────────────

interface Mote {
  id: number;
  // 0 = container → service, 1 = service → dep, 2 = dep → service (return)
  phase: number;
  depIdx: number;   // which dep this mote targets
  x: number;
  y: number;
  tx: number;       // target x for current phase
  ty: number;       // target y for current phase
  color: string;
  alpha: number;
  size: number;
  speed: number;
}

// Ring pulse on a node after injection arrives
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

function makeMote(depIdx: number): Mote {
  return {
    id: nextId++,
    phase: 0,
    depIdx,
    x: CONTAINER_X,
    y: CONTAINER_Y,
    tx: SERVICE_X,
    ty: SERVICE_Y,
    color: TINT_PULSE,
    alpha: 0.95,
    size: 3,
    speed: 80 + Math.random() * 30,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function DependencyInjectionViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    rings: [] as Ring[],
    nextRingId: 0,
    nextSpawn: 0.8,
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
      ctx.setLineDash([4, 6]);
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

      // Container → Service guide rail
      drawDashedLine(
        CONTAINER_X + CONTAINER_HW, CONTAINER_Y,
        SERVICE_X - SERVICE_HW, SERVICE_Y,
        `${TINT_MAIN}28`, cw, ch,
      );

      // Service → each dep guide rails
      for (const dep of DEPS) {
        drawDashedLine(
          SERVICE_X + SERVICE_HW, SERVICE_Y,
          dep.x - DEP_HW, dep.y,
          `${TINT_DEP}22`, cw, ch,
        );
      }

      // Container box
      drawBox(CONTAINER_X, CONTAINER_Y, CONTAINER_HW, CONTAINER_HH,
        'IoC Container', TINT_MAIN, cw, ch);

      // "resolves" label between container and service
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5;
      ctx.fillText(
        'resolves',
        sx(lerp(CONTAINER_X + CONTAINER_HW, SERVICE_X - SERVICE_HW, 0.5), cw),
        sy(SERVICE_Y - 18, ch),
      );
      ctx.globalAlpha = 1;

      // Service box
      drawBox(SERVICE_X, SERVICE_Y, SERVICE_HW, SERVICE_HH,
        'OrderService', TINT_MAIN, cw, ch);

      // Dep boxes
      for (const dep of DEPS) {
        drawBox(dep.x, dep.y, DEP_HW, DEP_HH, dep.label, dep.tint, cw, ch);
      }

      // Dep label header
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.45;
      ctx.fillText('injects', sx(lerp(SERVICE_X + SERVICE_HW, DEPS[0].x - DEP_HW, 0.5), cw), sy(H * 0.10, ch));
      ctx.globalAlpha = 1;

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.20;
      ctx.fillText('Plate ii · Dependency Injection · Backend Domain', sx(W / 2, cw), sy(H - 9, ch));
      ctx.globalAlpha = 1;

      // ── Spawn motes ───────────────────────────────────────────────

      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.motes.push(makeMote(s.spawnIdx % DEPS.length));
        s.spawnIdx++;
        s.nextSpawn = 1.0 + Math.random() * 0.7;
      }

      // ── Update rings ──────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 55;
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
          // Move toward target
          const angle = Math.atan2(m.ty - m.y, m.tx - m.x);
          m.x += Math.cos(angle) * step;
          m.y += Math.sin(angle) * step;
        } else {
          // Arrived at target
          m.x = m.tx;
          m.y = m.ty;

          if (m.phase === 0) {
            // Arrived at Service — ring pulse, then route to dep
            s.rings.push({
              id: s.nextRingId++,
              cx: SERVICE_X,
              cy: SERVICE_Y,
              r: SERVICE_HW,
              alpha: 0.7,
              color: TINT_PULSE,
            });
            const dep = DEPS[m.depIdx];
            m.tx = dep.x;
            m.ty = dep.y;
            m.color = TINT_DEP;
            m.phase = 1;
          } else if (m.phase === 1) {
            // Arrived at dep node — ring pulse, then return to service
            const dep = DEPS[m.depIdx];
            s.rings.push({
              id: s.nextRingId++,
              cx: dep.x,
              cy: dep.y,
              r: DEP_HW,
              alpha: 0.7,
              color: TINT_DEP,
            });
            m.tx = SERVICE_X;
            m.ty = SERVICE_Y;
            m.color = TINT_PULSE;
            m.size = 2.5;
            m.phase = 2;
          } else {
            // Returned to service — done
            toRemove.add(m.id);
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640 / 320' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
