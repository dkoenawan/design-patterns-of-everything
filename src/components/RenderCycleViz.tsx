import { useRef, useEffect } from 'react';

// ── Layout constants ────────────────────────────────────────────────────────────

const W = 640;
const H = 320;

// Brand palette
const TINT_MOUNT   = '#9ec48a'; // data green — mount phase
const TINT_UPDATE  = '#7aa3d4'; // frontend blue — update / reconcile phase
const TINT_UNMOUNT = '#d49a7a'; // backend orange — unmount / cleanup phase
const TINT_GOLD    = '#d4b15e'; // gold — lifecycle tick
const INK_DIM      = 'rgba(232,220,184,0.45)';
const BOX_BG       = 'rgba(14,20,42,0.82)';
const LINE_FAINT   = 'rgba(232,220,184,0.08)';

// ── Phase pipeline nodes ────────────────────────────────────────────────────────
// Rendered as a horizontal pipeline: Render → Commit → Mount → (loop) Update → Unmount
const NODES = [
  { id: 'render',  label: 'Render',  x: W * 0.10, y: H * 0.50, color: TINT_UPDATE  },
  { id: 'commit',  label: 'Commit',  x: W * 0.30, y: H * 0.50, color: TINT_GOLD    },
  { id: 'mount',   label: 'Mount',   x: W * 0.50, y: H * 0.50, color: TINT_MOUNT   },
  { id: 'update',  label: 'Update',  x: W * 0.70, y: H * 0.50, color: TINT_UPDATE  },
  { id: 'unmount', label: 'Unmount', x: W * 0.90, y: H * 0.50, color: TINT_UNMOUNT },
] as const;

// Update loop arc apex (above the pipeline)
const LOOP_APEX_Y = H * 0.18;

// Edges: forward pipeline + update-loop back to render
const EDGES = [
  { from: 0, to: 1 }, // Render → Commit
  { from: 1, to: 2 }, // Commit → Mount
  { from: 2, to: 3 }, // Mount → Update
  { from: 3, to: 4 }, // Update → Unmount
];

const NODE_R = 22;

// ── Types ───────────────────────────────────────────────────────────────────────

type Phase = 'forward' | 'loop-out' | 'loop-back' | 'dead';

interface Mote {
  id: number;
  nodeFrom: number;
  nodeTo: number;
  phase: Phase;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  alpha: number;
  size: number;
  speed: number;
  // For loop-out arc: parametric t [0,1]
  arcT: number;
  arcSpeed: number;
}

interface Ring {
  id: number;
  cx: number;
  cy: number;
  r: number;
  alpha: number;
  color: string;
}

let _nextId = 0;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

// Quadratic bezier for the update-loop arc (Update → Render arc via apex)
function arcPoint(t: number): [number, number] {
  const p0x = NODES[3].x; const p0y = NODES[3].y; // Update
  const p1x = W * 0.30;   const p1y = LOOP_APEX_Y; // control
  const p2x = NODES[0].x; const p2y = NODES[0].y; // Render
  const x = (1 - t) ** 2 * p0x + 2 * (1 - t) * t * p1x + t ** 2 * p2x;
  const y = (1 - t) ** 2 * p0y + 2 * (1 - t) * t * p1y + t ** 2 * p2y;
  return [x, y];
}

function makeMote(fromIdx: number): Mote {
  const from = NODES[fromIdx];
  const toIdx = fromIdx + 1;
  const to = NODES[Math.min(toIdx, NODES.length - 1)];
  return {
    id: _nextId++,
    nodeFrom: fromIdx,
    nodeTo: toIdx,
    phase: 'forward',
    x: from.x,
    y: from.y,
    tx: to.x,
    ty: to.y,
    color: from.color,
    alpha: 0.92,
    size: 3,
    speed: 70 + Math.random() * 30,
    arcT: 0,
    arcSpeed: 0.28 + Math.random() * 0.12,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function RenderCycleViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    raf: 0,
    lastTime: 0,
    motes: [] as Mote[],
    rings: [] as Ring[],
    nextRingId: 0,
    // Spawn timer: queue which pipeline stage the next mote starts from
    nextSpawn: 0.5,
    spawnStage: 0, // cycles 0..3 (Render through Update)
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function sx(x: number, cw: number) { return x * (cw / W); }
    function sy(y: number, ch: number) { return y * (ch / H); }

    function drawNode(
      node: typeof NODES[number],
      cw: number, ch: number,
    ) {
      const cx = sx(node.x, cw);
      const cy = sy(node.y, ch);
      const r  = sx(NODE_R, cw);

      // Background disc
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = BOX_BG;
      ctx.fill();

      // Border ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = 0.65;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Label
      ctx.font = `normal 8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = node.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.toUpperCase(), cx, cy);
    }

    function drawEdge(
      fromIdx: number, toIdx: number,
      cw: number, ch: number,
    ) {
      const a = NODES[fromIdx];
      const b = NODES[toIdx];
      ctx.beginPath();
      ctx.moveTo(sx(a.x + NODE_R, cw), sy(a.y, ch));
      ctx.lineTo(sx(b.x - NODE_R, cw), sy(b.y, ch));
      ctx.strokeStyle = LINE_FAINT;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawLoopArcGuide(cw: number, ch: number) {
      // Bezier arc from Update (node 3) back to Render (node 0)
      ctx.beginPath();
      ctx.moveTo(sx(NODES[3].x, cw), sy(NODES[3].y - NODE_R, ch));
      ctx.quadraticCurveTo(
        sx(W * 0.30, cw), sy(LOOP_APEX_Y, ch),
        sx(NODES[0].x, cw), sy(NODES[0].y - NODE_R, ch),
      );
      ctx.strokeStyle = LINE_FAINT;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawRing(ring: Ring, cw: number, ch: number) {
      ctx.beginPath();
      ctx.arc(sx(ring.cx, cw), sy(ring.cy, ch), ring.r * (cw / W), 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = ring.alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function drawMote(m: Mote, cw: number, ch: number) {
      const mx = sx(m.x, cw);
      const my = sy(m.y, ch);

      // Glow halo
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

      // ── Static structure ──────────────────────────────────────────

      // Forward pipeline edges
      for (const e of EDGES) drawEdge(e.from, e.to, cw, ch);

      // Update → Render arc guide
      drawLoopArcGuide(cw, ch);

      // "re-render on state change" arc label
      ctx.font = `400 italic 9px 'Cormorant Garamond', serif`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.45;
      ctx.fillText('re-render on state change', sx(W * 0.35, cw), sy(LOOP_APEX_Y - 12, ch));
      ctx.globalAlpha = 1;

      // Phase label below each node
      const phaseLabels = ['virtual DOM', 'DOM patch', 'effects', 'diff', 'teardown'];
      for (let i = 0; i < NODES.length; i++) {
        ctx.font = `normal 7px 'JetBrains Mono', monospace`;
        ctx.fillStyle = INK_DIM;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.40;
        ctx.fillText(phaseLabels[i], sx(NODES[i].x, cw), sy(NODES[i].y + NODE_R + 14, ch));
        ctx.globalAlpha = 1;
      }

      // Plate reference
      ctx.font = `normal 7px 'JetBrains Mono', monospace`;
      ctx.fillStyle = INK_DIM;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.20;
      ctx.fillText('Plate i · Render Lifecycle · Frontend Domain', sx(W / 2, cw), sy(H - 9, ch));
      ctx.globalAlpha = 1;

      // Nodes drawn on top of edges
      for (const node of NODES) drawNode(node, cw, ch);

      // ── Rings ──────────────────────────────────────────────────────

      s.rings = s.rings.filter((ring) => {
        ring.r += dt * 44;
        ring.alpha = Math.max(0, ring.alpha - dt * 1.6);
        if (ring.alpha <= 0) return false;
        drawRing(ring, cw, ch);
        return true;
      });

      // ── Spawn motes ───────────────────────────────────────────────

      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        // Start from Render (0), cycling through Update (3) as a re-render pulse
        const startIdx = s.spawnStage === 0 ? 0 : 3;
        s.motes.push(makeMote(startIdx));
        s.spawnStage = (s.spawnStage + 1) % 4; // 1-in-4 chance is a re-render loop
        s.nextSpawn = 0.9 + Math.random() * 0.7;
      }

      // ── Update motes ──────────────────────────────────────────────

      const toRemove = new Set<number>();

      for (const m of s.motes) {
        if (m.phase === 'forward') {
          const d = dist(m.x, m.y, m.tx, m.ty);
          const step = m.speed * dt;

          if (d > step) {
            const angle = Math.atan2(m.ty - m.y, m.tx - m.x);
            m.x += Math.cos(angle) * step;
            m.y += Math.sin(angle) * step;
          } else {
            // Arrived at target node
            m.x = m.tx;
            m.y = m.ty;

            const arrivedAt = m.nodeTo;
            const node = NODES[arrivedAt];

            // Pulse on arrival
            s.rings.push({
              id: s.nextRingId++,
              cx: node.x,
              cy: node.y,
              r: NODE_R,
              alpha: 0.7,
              color: node.color,
            });

            if (arrivedAt === 3 && Math.random() < 0.45) {
              // From Update node — sometimes loop back to Render
              m.phase = 'loop-out';
              m.arcT = 0;
              m.color = TINT_GOLD;
              m.size = 2.5;
            } else if (arrivedAt >= NODES.length - 1) {
              // Reached Unmount — done
              toRemove.add(m.id);
            } else {
              // Advance to next node
              const nextIdx = arrivedAt + 1;
              m.nodeFrom = arrivedAt;
              m.nodeTo = nextIdx;
              m.tx = NODES[nextIdx].x;
              m.ty = NODES[nextIdx].y;
              m.color = NODES[nextIdx].color;
            }
          }
        } else if (m.phase === 'loop-out') {
          // Travel along the bezier arc back to Render
          m.arcT = Math.min(1, m.arcT + m.arcSpeed * dt);
          const [ax, ay] = arcPoint(m.arcT);
          m.x = ax;
          m.y = ay;

          if (m.arcT >= 1) {
            // Back at Render — restart the forward pipeline from node 0
            m.phase = 'forward';
            m.nodeFrom = 0;
            m.nodeTo = 1;
            m.tx = NODES[1].x;
            m.ty = NODES[1].y;
            m.color = NODES[0].color;
            m.size = 3;
          }
        }

        if (toRemove.has(m.id)) continue;
        drawMote(m, cw, ch);
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
